import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { canvasDB, moduleDB, versionDB } from '../db';
import { generateModulePlan, generateModuleContent, planNewModule } from '../planner';
import { 
  CreateCanvasRequest, 
  EditModuleRequest, 
  ExpandCanvasRequest,
  NewCanvasRequest,
  CanvasResponse 
} from '../types';

const router = Router();

/**
 * POST /canvases
 * 创建一个新的 Canvas + 生成 2-3 个初始模块
 */
router.post('/', async (req, res) => {
  try {
    const { topic, domain } = req.body as CreateCanvasRequest;

    if (!topic || !domain) {
      return res.status(400).json({ error: 'topic 和 domain 是必需的' });
    }

    // 1. 创建 Canvas
    const canvasId = uuidv4();
    canvasDB.create(canvasId, topic, domain);

    // 2. 使用假 Planner 生成模块计划
    const modulePlan = generateModulePlan(topic, domain);

    // 3. 为每个计划创建 Module 和初始 Version
    for (let i = 0; i < modulePlan.length; i++) {
      const plan = modulePlan[i];
      const moduleId = uuidv4();

      // 创建 Module
      moduleDB.create(moduleId, canvasId, plan.type, i);

      // 生成内容
      const content = generateModuleContent(topic, domain, plan.type);

      // 创建 ModuleVersion
      const versionId = uuidv4();
      versionDB.create(
        versionId,
        moduleId,
        `初始生成: ${plan.title}`,
        JSON.stringify(content)
      );

      // 更新 Module 状态为 ready
      moduleDB.updateStatus(moduleId, 'ready');
    }

    // 4. 返回完整的 Canvas 数据
    const canvasData = buildCanvasResponse(canvasId);
    res.json(canvasData);

  } catch (error) {
    console.error('创建 Canvas 错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /canvases/:id
 * 获取 Canvas 及其所有模块的当前版本
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const canvasData = buildCanvasResponse(id);

    if (!canvasData) {
      return res.status(404).json({ error: 'Canvas 未找到' });
    }

    res.json(canvasData);
  } catch (error) {
    console.error('获取 Canvas 错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /canvases
 * 获取所有 Canvas 列表
 */
router.get('/', (req, res) => {
  try {
    const canvases = canvasDB.findAll();
    res.json(canvases);
  } catch (error) {
    console.error('获取 Canvas 列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /canvases/:id/expand
 * 为 Canvas 新增一个模块
 */
router.post('/:id/expand', async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body as ExpandCanvasRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt 是必需的' });
    }

    const canvas = canvasDB.findById(id);
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas 未找到' });
    }

    // 获取当前模块数量，决定新模块的 order_index
    const existingModules = moduleDB.findByCanvasId(id) as any[];
    const newOrderIndex = existingModules.length;

    // 使用 Planner 决定添加什么类型的模块
    const plan = planNewModule(prompt, (canvas as any).domain);

    // 创建新模块
    const moduleId = uuidv4();
    moduleDB.create(moduleId, id, plan.type, newOrderIndex);

    // 生成内容
    const content = generateModuleContent(
      (canvas as any).title,
      (canvas as any).domain,
      plan.type,
      prompt
    );

    // 创建版本
    const versionId = uuidv4();
    versionDB.create(versionId, moduleId, prompt, JSON.stringify(content));

    // 更新状态
    moduleDB.updateStatus(moduleId, 'ready');

    // 返回更新后的 Canvas
    const canvasData = buildCanvasResponse(id);
    res.json(canvasData);

  } catch (error) {
    console.error('扩展 Canvas 错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /canvases/:id/new
 * 归档当前 Canvas，创建新的 Canvas
 */
router.post('/:id/new', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_topic } = req.body as NewCanvasRequest;

    if (!new_topic) {
      return res.status(400).json({ error: 'new_topic 是必需的' });
    }

    const oldCanvas = canvasDB.findById(id);
    if (!oldCanvas) {
      return res.status(404).json({ error: 'Canvas 未找到' });
    }

    // 归档旧 Canvas
    canvasDB.archive(id);

    // 创建新 Canvas（使用相同的 domain）
    const newCanvasId = uuidv4();
    const domain = (oldCanvas as any).domain;
    canvasDB.create(newCanvasId, new_topic, domain);

    // 生成新模块
    const modulePlan = generateModulePlan(new_topic, domain);

    for (let i = 0; i < modulePlan.length; i++) {
      const plan = modulePlan[i];
      const moduleId = uuidv4();

      moduleDB.create(moduleId, newCanvasId, plan.type, i);

      const content = generateModuleContent(new_topic, domain, plan.type);

      const versionId = uuidv4();
      versionDB.create(
        versionId,
        moduleId,
        `初始生成: ${plan.title}`,
        JSON.stringify(content)
      );

      moduleDB.updateStatus(moduleId, 'ready');
    }

    // 返回新 Canvas
    const canvasData = buildCanvasResponse(newCanvasId);
    res.json(canvasData);

  } catch (error) {
    console.error('创建新 Canvas 错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * 辅助函数：构建完整的 Canvas 响应
 */
function buildCanvasResponse(canvasId: string): CanvasResponse | null {
  const canvas = canvasDB.findById(canvasId);
  if (!canvas) return null;

  const modules = moduleDB.findByCanvasId(canvasId) as any[];
  const modulesWithVersions = modules.map((module) => {
    const latestVersion = versionDB.findLatestByModuleId(module.id) as any;
    return {
      module,
      current_version: {
        ...latestVersion,
        content_json: JSON.parse(latestVersion.content_json)
      }
    };
  });

  return {
    canvas: canvas as any,
    modules: modulesWithVersions
  };
}

export default router;


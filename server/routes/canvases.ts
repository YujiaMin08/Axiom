import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { canvasDB, moduleDB, versionDB } from '../db';
// 导入简化版协调器
import { 
  generateModulePlan, 
  generateModuleContent as generateContentWithAI, 
  planNewModule 
} from '../content-generator-orchestrator-simple.js';
import { 
  CreateCanvasRequest, 
  EditModuleRequest, 
  ExpandCanvasRequest,
  NewCanvasRequest,
  CanvasResponse 
} from '../types';

const router = Router();

/**
 * POST /canvases/test
 * 创建测试 Canvas（只包含单个模块）
 * 注意：必须在 /:id 路由之前定义
 */
router.post('/test', async (req, res) => {
  try {
    const { topic, domain, moduleType } = req.body;

    if (!topic || !domain || !moduleType) {
      return res.status(400).json({ 
        error: '缺少必要参数',
        required: ['topic', 'domain', 'moduleType']
      });
    }

    console.log(`🧪 创建测试 Canvas: ${moduleType} | 主题: ${topic}`);

    // 1. 创建 Canvas
    const canvasId = uuidv4();
    const canvasTitle = `[TEST] ${topic} - ${moduleType}`;
    canvasDB.create(canvasId, canvasTitle, domain);

    // 2. 创建单个模块
    const moduleId = uuidv4();
    moduleDB.create(moduleId, canvasId, moduleType, 0);

    try {
      console.log(`  🎨 生成模块内容...`);
      
      // 生成内容（支持异步媒体）
      const content = await generateContentWithAI({
        topic,
        domain,
        moduleType,
        moduleId  // 传递 moduleId 支持异步生成
      });

      // 创建 ModuleVersion
      const versionId = uuidv4();
      versionDB.create(versionId, moduleId, `测试: ${moduleType}`, JSON.stringify(content));

      // 更新模块状态为 ready
      moduleDB.updateStatus(moduleId, 'ready');
      
      console.log(`  ✅ 测试模块创建成功`);

    } catch (error) {
      console.error(`  ❌ 模块生成失败:`, error);
      
      // 创建错误内容
      const errorContent = {
        type: 'text',
        title: '生成失败',
        body: `模块生成遇到错误：\n\n${(error as Error).message}\n\n请重试或检查参数。`
      };
      
      const versionId = uuidv4();
      versionDB.create(versionId, moduleId, '生成失败', JSON.stringify(errorContent));
      moduleDB.updateStatus(moduleId, 'ready');
    }

    // 3. 返回 Canvas 响应（与正常 Canvas 格式一致）
    const canvas = canvasDB.findById(canvasId);
    const module = moduleDB.findById(moduleId);
    const version = versionDB.findLatestByModuleId(moduleId);

    res.json({
      canvas,
      modules: [
        {
          module,
          current_version: {
            ...version,
            content_json: JSON.parse((version as any).content_json)
          }
        }
      ]
    });

  } catch (error) {
    console.error('❌ 创建测试 Canvas 失败:', error);
    res.status(500).json({ 
      error: '创建失败',
      details: (error as Error).message 
    });
  }
});

/**
 * POST /canvases
 * 创建一个新的 Canvas + 生成 2-3 个初始模块
 */
router.post('/', async (req, res) => {
  try {
    const { topic, domain, language } = req.body as CreateCanvasRequest & { language?: 'en' | 'zh' };

    if (!topic || !domain) {
      return res.status(400).json({ error: 'topic 和 domain 是必需的' });
    }

    // 默认语言为英文，Language Arts 使用中文（双语）
    const contentLanguage = language || 'en';
    console.log(`🌐 内容语言: ${contentLanguage}`);

    // 1. 创建 Canvas
    const canvasId = uuidv4();
    canvasDB.create(canvasId, topic, domain);

    // 2. 使用真实的 Gemini Planner 生成模块计划
    console.log(`🚀 开始生成 Canvas: "${topic}" (${domain})`);
    let modulePlan;
    try {
      modulePlan = await generateModulePlan(topic, domain, contentLanguage);
      console.log(`📋 Planner 返回了 ${modulePlan.length} 个模块`);
    } catch (error) {
      console.error('❌ Planner 生成失败:', error);
      return res.status(500).json({ 
        error: '模块规划失败', 
        details: (error as Error).message 
      });
    }

    // 3. 为每个计划创建 Module 和初始 Version（并行生成以提高速度）
    const modulePromises = modulePlan.map(async (plan, i) => {
      const moduleId = uuidv4();

      // 创建 Module（状态：generating）
      moduleDB.create(moduleId, canvasId, plan.type, i);

      try {
        console.log(`  🎨 [${i + 1}/${modulePlan.length}] 生成 ${plan.type}: ${plan.title}`);
        
        // 使用 AI 生成内容（传递 moduleId 以支持异步生成）
        const content = await generateContentWithAI({
          topic,
          domain,
          moduleType: plan.type,
          moduleId,  // 传递 moduleId，用于异步更新
          language: contentLanguage  // 传递语言设置
        });

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
        console.log(`  ✅ [${i + 1}/${modulePlan.length}] ${plan.type} 生成完成`);

      } catch (error) {
        console.error(`  ❌ [${i + 1}/${modulePlan.length}] ${plan.type} 生成失败:`, error);
        
        // 生成失败，创建错误提示内容
        const errorContent = {
          type: 'text',
          title: plan.title,
          body: `内容生成失败，请稍后重试。\n\nError: ${(error as Error).message}`
        };
        
        const versionId = uuidv4();
        versionDB.create(
          versionId,
          moduleId,
          `生成失败: ${plan.title}`,
          JSON.stringify(errorContent)
        );
        
        moduleDB.updateStatus(moduleId, 'ready'); // 仍标记为 ready，但内容是错误提示
      }
    });

    // 等待所有模块生成完成
    await Promise.all(modulePromises);
    console.log(`✅ Canvas "${topic}" 生成完成！`)

    // 4. 返回完整的 Canvas 数据
    try {
      const canvasData = buildCanvasResponse(canvasId);
      res.json(canvasData);
    } catch (error) {
      console.error('❌ 构建响应失败:', error);
      return res.status(500).json({ 
        error: '构建响应失败', 
        details: (error as Error).message 
      });
    }

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
 * 获取所有 Canvas 列表 (仅返回当前用户的)
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
    const { prompt, language } = req.body as ExpandCanvasRequest & { language?: 'en' | 'zh' };

    if (!prompt) {
      return res.status(400).json({ error: 'prompt 是必需的' });
    }

    const canvas = canvasDB.findById(id);
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas 未找到' });
    }


    // 确定语言设置（如果没有传递，根据 domain 判断）
    const contentLanguage = language || ((canvas as any).domain === 'LANGUAGE' ? 'zh' : 'en');
    console.log(`🌐 扩展模块语言: ${contentLanguage}`);

    // 获取当前模块数量，决定新模块的 order_index
    const existingModules = moduleDB.findByCanvasId(id) as any[];
    const newOrderIndex = existingModules.length;

    // 使用 Planner 决定添加什么类型的模块
    const plan = planNewModule(prompt, (canvas as any).domain);
    console.log(`🚀 扩展 Canvas: 添加 ${plan.type} 模块`);

    // 创建新模块
    const moduleId = uuidv4();
    moduleDB.create(moduleId, id, plan.type, newOrderIndex);

    try {
      // 使用 AI 生成内容（如果是 Quiz，传入之前的模块作为上下文）
      const content = await generateContentWithAI({
        topic: (canvas as any).title,
        domain: (canvas as any).domain,
        moduleType: plan.type,
        userPrompt: prompt,
        previousModules: plan.type.includes('quiz') ? existingModules : undefined,
        moduleId,  // 传递 moduleId，用于异步更新
        language: contentLanguage  // 传递语言设置
      });

      // 创建版本
      const versionId = uuidv4();
      versionDB.create(versionId, moduleId, prompt, JSON.stringify(content));

      // 更新状态
      moduleDB.updateStatus(moduleId, 'ready');
      console.log(`✅ ${plan.type} 模块生成完成`);

    } catch (error) {
      console.error(`❌ ${plan.type} 模块生成失败:`, error);
      
      // 降级：创建错误提示
      const errorContent = {
        type: 'text',
        title: plan.title,
        body: `内容生成失败，请稍后重试。`
      };
      
      const versionId = uuidv4();
      versionDB.create(versionId, moduleId, prompt, JSON.stringify(errorContent));
      moduleDB.updateStatus(moduleId, 'ready');
    }

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

    // 创建新 Canvas（使用相同的 domain，继承 user_id）
    const newCanvasId = uuidv4();
    const domain = (oldCanvas as any).domain;
    canvasDB.create(newCanvasId, new_topic, domain);

    // 生成新模块
    console.log(`🚀 创建新 Canvas: "${new_topic}"`);
    const modulePlan = await generateModulePlan(new_topic, domain);

    // 并行生成所有模块
    const modulePromises = modulePlan.map(async (plan, i) => {
      const moduleId = uuidv4();
      moduleDB.create(moduleId, newCanvasId, plan.type, i);

      try {
        const content = await generateContentWithAI({
          topic: new_topic,
          domain,
          moduleType: plan.type,
          moduleId  // 传递 moduleId，用于异步更新
        });

        const versionId = uuidv4();
        versionDB.create(
          versionId,
          moduleId,
          `初始生成: ${plan.title}`,
          JSON.stringify(content)
        );

        moduleDB.updateStatus(moduleId, 'ready');
      } catch (error) {
        console.error(`❌ 模块生成失败:`, error);
        
        const errorContent = {
          type: 'text',
          title: plan.title,
          body: '内容生成失败'
        };
        
        const versionId = uuidv4();
        versionDB.create(versionId, moduleId, `初始生成: ${plan.title}`, JSON.stringify(errorContent));
        moduleDB.updateStatus(moduleId, 'ready');
      }
    });

    await Promise.all(modulePromises);
    console.log(`✅ 新 Canvas 生成完成`)

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


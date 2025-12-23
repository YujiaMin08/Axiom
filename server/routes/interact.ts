import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { canvasDB, moduleDB, versionDB } from '../db';
// 导入简化版协调器
import { 
  generateModulePlan, 
  generateModuleContent as generateContentWithAI 
} from '../content-generator-orchestrator-simple.js';
// 使用 Gemini AI 意图分析
import { analyzeIntentWithAI } from '../gemini-intent-analyzer.js';
import { CanvasResponse } from '../types';

const router = Router();

/**
 * POST /api/interact
 * 统一的交互接口：根据用户输入自动判断是新建还是扩展
 */
router.post('/', async (req, res) => {
  try {
    const { canvas_id, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    // 1. 获取当前 Canvas 信息
    const currentCanvas = canvas_id ? canvasDB.findById(canvas_id) as any : null;
    const currentTopic = currentCanvas ? currentCanvas.title : '';
    const currentDomain = currentCanvas ? currentCanvas.domain : 'LIBERAL_ARTS'; // 默认领域

    // 2. 使用 Gemini AI 分析意图
    console.log(`🤖 Analyzing intent with AI: "${prompt}"`);
    const analysis = await analyzeIntentWithAI(prompt, currentTopic, currentDomain);
    console.log(`✨ Intent detected: ${analysis.action}`, analysis.reasoning);

    // 3. 执行相应操作
    if (analysis.action === 'NEW_CANVAS') {
      // --- 意图：新建 Canvas ---
      
      // 归档旧 Canvas (如果存在)
      if (canvas_id) {
        canvasDB.archive(canvas_id);
      }

      // 创建新 Canvas
      const newCanvasId = uuidv4();
      const topic = analysis.topic || prompt;
      // 暂时沿用当前领域，或者默认为 LIBERAL_ARTS
      // 理想情况下应该由 AI 分析主题所属领域
      canvasDB.create(newCanvasId, topic, currentDomain);

      // 生成模块计划
      const modulePlan = await generateModulePlan(topic, currentDomain);

      // 并行生成模块
      const modulePromises = modulePlan.map(async (plan, i) => {
        const moduleId = uuidv4();
        moduleDB.create(moduleId, newCanvasId, plan.type, i);
        
        try {
        const content = await generateContentWithAI({
          topic,
          domain: currentDomain,
          moduleType: plan.type,
          moduleId  // 传递 moduleId，用于异步更新
        });
          
          const versionId = uuidv4();
          versionDB.create(versionId, moduleId, `Initial: ${plan.title}`, JSON.stringify(content));
          moduleDB.updateStatus(moduleId, 'ready');
        } catch (error) {
          const errorContent = { type: 'text', title: plan.title, body: '生成失败' };
          const versionId = uuidv4();
          versionDB.create(versionId, moduleId, `Initial: ${plan.title}`, JSON.stringify(errorContent));
          moduleDB.updateStatus(moduleId, 'ready');
        }
      });

      await Promise.all(modulePromises);

      const responseData = buildCanvasResponse(newCanvasId);
      return res.json({
        action: 'NEW_CANVAS',
        data: responseData
      });

    } else {
      // --- 意图：扩展 Canvas ---

      if (!canvas_id) {
        return res.status(400).json({ error: 'No active canvas to expand' });
      }

      // 决定添加什么模块
      const moduleType = analysis.moduleType || 'explanation';
      
      // 获取当前模块数量作为 order_index
      const existingModules = moduleDB.findByCanvasId(canvas_id) as any[];
      const newOrderIndex = existingModules.length;

      // 创建新模块
      const moduleId = uuidv4();
      moduleDB.create(moduleId, canvas_id, moduleType, newOrderIndex);

      // 确定语言设置（如果没有传递，根据 domain 判断）
      const contentLanguage = currentDomain === 'LANGUAGE' ? 'zh' : 'en';
      console.log(`🌐 扩展模块语言: ${contentLanguage}`);

      // 生成内容
      try {
        const content = await generateContentWithAI({
          topic: currentTopic,
          domain: currentDomain,
          moduleType,
          userPrompt: prompt,
          previousModules: existingModules,
          moduleId,  // 传递 moduleId，用于异步更新
          language: contentLanguage  // 传递语言设置
        });

        const versionId = uuidv4();
        versionDB.create(versionId, moduleId, prompt, JSON.stringify(content));
        moduleDB.updateStatus(moduleId, 'ready');
      } catch (error) {
        const errorContent = { type: 'text', title: 'Error', body: '生成失败' };
        const versionId = uuidv4();
        versionDB.create(versionId, moduleId, prompt, JSON.stringify(errorContent));
        moduleDB.updateStatus(moduleId, 'ready');
      }

      const responseData = buildCanvasResponse(canvas_id);
      return res.json({
        action: 'EXPAND_CANVAS',
        data: responseData
      });
    }

  } catch (error) {
    console.error('Interact API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 辅助函数：构建完整的 Canvas 响应
 * (复用自 canvases.ts，后续应提取到公共工具类)
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


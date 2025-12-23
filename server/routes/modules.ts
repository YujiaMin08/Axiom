import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { moduleDB, versionDB, canvasDB } from '../db';
// 导入简化版协调器
import { generateModuleContent as generateContentWithAI } from '../content-generator-orchestrator-simple.js';
import { EditModuleRequest } from '../types';

const router = Router();

/**
 * POST /modules/:id/edit
 * 编辑单个模块 - 只重新生成该模块（新建 module_version）
 */
router.post('/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, language } = req.body as EditModuleRequest & { language?: 'en' | 'zh' };

    if (!prompt) {
      return res.status(400).json({ error: 'prompt 是必需的' });
    }

    // 1. 获取模块信息
    const module = moduleDB.findById(id) as any;
    if (!module) {
      return res.status(404).json({ error: '模块未找到' });
    }

    // 2. 获取 Canvas 信息（需要知道 domain 和 topic）
    const canvas = canvasDB.findById(module.canvas_id) as any;
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas 未找到' });
    }

    // 3. 确定语言设置（如果没有传递，根据 domain 判断）
    const contentLanguage = language || (canvas.domain === 'LANGUAGE' ? 'zh' : 'en');
    console.log(`🌐 编辑模块语言: ${contentLanguage}`);

    // 4. 更新模块状态为 generating
    moduleDB.updateStatus(id, 'generating');

    // 5. 使用 AI 生成新内容
    try {
      console.log(`🔄 编辑模块: ${module.type}`);
      
      const content = await generateContentWithAI({
        topic: canvas.title,
        domain: canvas.domain,
        moduleType: module.type,
        userPrompt: prompt,
        moduleId: id,  // 传递 moduleId，用于异步更新
        language: contentLanguage  // 传递语言设置
      });

      // 5. 创建新的 ModuleVersion
      const versionId = uuidv4();
      versionDB.create(versionId, id, prompt, JSON.stringify(content));

      // 6. 更新模块状态为 ready
      moduleDB.updateStatus(id, 'ready');
      console.log(`✅ 模块编辑完成`);
      
    } catch (error) {
      console.error(`❌ 模块编辑失败:`, error);
      
      // 创建错误内容
      const errorContent = {
        type: 'text',
        title: 'Error',
        body: '内容生成失败，请稍后重试'
      };
      
      const versionId = uuidv4();
      versionDB.create(versionId, id, prompt, JSON.stringify(errorContent));
      moduleDB.updateStatus(id, 'ready');
    }

    // 7. 返回新版本
    const newVersion = versionDB.findLatestByModuleId(id) as any;
    res.json({
      module,
      current_version: {
        ...newVersion,
        content_json: JSON.parse(newVersion.content_json)
      }
    });

  } catch (error) {
    console.error('编辑模块错误:', error);
    
    // 如果出错，将模块状态设为 error
    try {
      moduleDB.updateStatus(req.params.id, 'error');
    } catch (e) {
      // 忽略状态更新错误
    }

    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /modules/:id/versions
 * 获取模块的所有版本历史
 */
router.get('/:id/versions', (req, res) => {
  try {
    const { id } = req.params;

    const module = moduleDB.findById(id);
    if (!module) {
      return res.status(404).json({ error: '模块未找到' });
    }

    const versions = versionDB.findAllByModuleId(id) as any[];
    const parsedVersions = versions.map(v => ({
      ...v,
      content_json: JSON.parse(v.content_json)
    }));

    res.json(parsedVersions);

  } catch (error) {
    console.error('获取模块版本错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /modules/:id
 * 删除模块
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const module = moduleDB.findById(id);
    if (!module) {
      return res.status(404).json({ error: '模块未找到' });
    }

    moduleDB.delete(id);
    res.json({ success: true, message: '模块已删除' });

  } catch (error) {
    console.error('删除模块错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /modules/reorder
 * 更新模块顺序
 */
router.put('/reorder', (req, res) => {
  try {
    const { module_orders } = req.body as { module_orders: Array<{ id: string; order_index: number }> };

    if (!module_orders || !Array.isArray(module_orders)) {
      return res.status(400).json({ error: 'module_orders 是必需的数组' });
    }

    // 批量更新顺序
    for (const item of module_orders) {
      moduleDB.updateOrderIndex(item.id, item.order_index);
    }

    res.json({ success: true, message: '模块顺序已更新' });

  } catch (error) {
    console.error('更新模块顺序错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /modules/:id/size
 * 更新模块尺寸
 */
router.put('/:id/size', (req, res) => {
  try {
    const { id } = req.params;
    const { width, height } = req.body;

    if (!width || !height) {
      return res.status(400).json({ error: 'width 和 height 是必需的' });
    }

    moduleDB.updateSize(id, width, height);
    res.json({ success: true, message: '尺寸已更新' });
  } catch (error) {
    console.error('更新尺寸错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;


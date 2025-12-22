// API 服务 - 与后端通信

// 确保 API_BASE 始终以 /api 结尾
const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';
  
  // 如果环境变量没有 /api 后缀，自动添加
  if (envBase && !envBase.endsWith('/api')) {
    // 移除末尾的斜杠（如果有）
    const cleanBase = envBase.replace(/\/$/, '');
    return `${cleanBase}/api`;
  }
  
  return envBase;
};

const API_BASE = getApiBase();

// 打印 API_BASE 用于调试（生产环境也需要）
console.log('🔗 API_BASE:', API_BASE);
console.log('🔗 VITE_API_BASE (raw):', import.meta.env.VITE_API_BASE);

// 检查 API_BASE 是否正确
if (!API_BASE.includes('/api')) {
  console.error('❌ 警告: API_BASE 不包含 /api，可能导致请求失败！');
  console.error('请检查 Vercel 环境变量 VITE_API_BASE 是否正确设置');
}

export interface Canvas {
  id: string;
  title: string;
  domain: 'LANGUAGE' | 'SCIENCE' | 'LIBERAL_ARTS';
  status: 'active' | 'archived';
  created_at: number;
}

export interface Module {
  id: string;
  canvas_id: string;
  type: string;
  status: 'generating' | 'ready' | 'error';
  order_index: number;
  width: number;
  height: number;
}

export interface ModuleVersion {
  id: string;
  module_id: string;
  prompt: string;
  content_json: ContentJSON;
  created_at: number;
}

export type ContentJSON = 
  | TextContent
  | VideoContent
  | ImageContent
  | HtmlAnimationContent
  | InteractiveAppContent
  | QuizContent;

export interface TextContent {
  type: 'text';
  title: string;
  body: string;
  subtitle?: string;
}

export interface VideoContent {
  type: 'video';
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
}

export interface ImageContent {
  type: 'image';
  title: string;
  image_url?: string;
  image_data?: string; // Base64 data URL
  description?: string;
}

export interface HtmlAnimationContent {
  type: 'html_animation';
  title: string;
  html_content: string;
  description?: string;
}

export interface InteractiveAppContent {
  type: 'interactive_app';
  title: string;
  app_data?: any;
  html_content?: string; // 完整的 HTML 应用代码
  description?: string;
}

export interface QuizContent {
  type: 'quiz';
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    answer_index: number;
    explanation?: string;
  }>;
}

export interface CanvasResponse {
  canvas: Canvas;
  modules: Array<{
    module: Module;
    current_version: ModuleVersion;
  }>;
}

export interface InteractResponse {
  action: 'NEW_CANVAS' | 'EXPAND_CANVAS';
  data: CanvasResponse;
}

/**
 * 统一交互接口
 */
export async function interact(canvasId: string, prompt: string): Promise<InteractResponse> {
  const response = await fetch(`${API_BASE}/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ canvas_id: canvasId, prompt })
  });

  if (!response.ok) {
    throw new Error('Failed to interact');
  }

  return response.json();
}

/**
 * 创建新的 Canvas
 */
export async function createCanvas(topic: string, domain: string, language?: 'en' | 'zh'): Promise<CanvasResponse> {
  const response = await fetch(`${API_BASE}/canvases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, domain, language })
  });

  if (!response.ok) {
    throw new Error('Failed to create canvas');
  }

  return response.json();
}

/**
 * 获取 Canvas 详情
 */
export async function getCanvas(id: string): Promise<CanvasResponse> {
  const response = await fetch(`${API_BASE}/canvases/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch canvas');
  }

  return response.json();
}

/**
 * 获取所有 Canvas
 */
export async function getAllCanvases(): Promise<Canvas[]> {
  const response = await fetch(`${API_BASE}/canvases`);

  if (!response.ok) {
    throw new Error('Failed to fetch canvases');
  }

  return response.json();
}

/**
 * 编辑模块
 */
export async function editModule(moduleId: string, prompt: string): Promise<{
  module: Module;
  current_version: ModuleVersion;
}> {
  const response = await fetch(`${API_BASE}/modules/${moduleId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('Failed to edit module');
  }

  return response.json();
}

/**
 * 扩展 Canvas（添加新模块）
 */
export async function expandCanvas(canvasId: string, prompt: string): Promise<CanvasResponse> {
  const response = await fetch(`${API_BASE}/canvases/${canvasId}/expand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('Failed to expand canvas');
  }

  return response.json();
}

/**
 * 创建新 Canvas（归档旧的）
 */
export async function createNewCanvas(oldCanvasId: string, newTopic: string): Promise<CanvasResponse> {
  const response = await fetch(`${API_BASE}/canvases/${oldCanvasId}/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_topic: newTopic })
  });

  if (!response.ok) {
    throw new Error('Failed to create new canvas');
  }

  return response.json();
}

/**
 * 获取模块的版本历史
 */
export async function getModuleVersions(moduleId: string): Promise<ModuleVersion[]> {
  const response = await fetch(`${API_BASE}/modules/${moduleId}/versions`);

  if (!response.ok) {
    throw new Error('Failed to fetch module versions');
  }

  return response.json();
}

/**
 * 更新模块顺序
 */
export async function reorderModules(moduleOrders: Array<{ id: string; order_index: number }>): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/modules/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module_orders: moduleOrders })
  });

  if (!response.ok) {
    throw new Error('Failed to reorder modules');
  }

  return response.json();
}

/**
 * 更新模块尺寸
 */
export async function updateModuleSize(id: string, width: number, height: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/modules/${id}/size`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ width, height })
  });

  if (!response.ok) {
    throw new Error('Failed to update size');
  }

  return response.json();
}

/**
 * 删除模块
 */
export async function deleteModule(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/modules/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete module');
  }

  return response.json();
}

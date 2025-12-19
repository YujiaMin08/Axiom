// 核心数据结构定义

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
  type: string;  // 例如: "definition", "example", "quiz", "story", "experiment"
  status: 'generating' | 'ready' | 'error';
  order_index: number;
  width: number;
  height: number;
}

export interface ModuleVersion {
  id: string;
  module_id: string;
  prompt: string;  // 用户输入的编辑提示或生成提示
  content_json: ContentJSON;
  created_at: number;
}

// 统一的 content_json 协议
export type ContentJSON = 
  | TextContent
  | VideoContent
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

export interface HtmlAnimationContent {
  type: 'html_animation';
  title: string;
  html_content: string;
  description?: string;
}

export interface InteractiveAppContent {
  type: 'interactive_app';
  title: string;
  app_data: any;  // 后续扩展具体的交互应用数据结构
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

// API 请求/响应类型
export interface CreateCanvasRequest {
  topic: string;
  domain: 'LANGUAGE' | 'SCIENCE' | 'LIBERAL_ARTS';
}

export interface EditModuleRequest {
  prompt: string;  // 用户输入的编辑指令
}

export interface ExpandCanvasRequest {
  prompt: string;  // 用户想要添加什么样的模块
}

export interface NewCanvasRequest {
  new_topic: string;
}

// 完整的Canvas响应（包含所有模块的最新版本）
export interface CanvasResponse {
  canvas: Canvas;
  modules: Array<{
    module: Module;
    current_version: ModuleVersion;
  }>;
}


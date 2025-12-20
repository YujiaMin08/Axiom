# Axiom 项目状态报告

> **最后更新**: 2024-12-19  
> **项目阶段**: 基础框架完成，等待 AI 集成

---

## 📋 目录

- [已完成功能](#已完成功能)
- [待实现功能](#待实现功能)
- [技术架构](#技术架构)
- [下一步计划](#下一步计划)

---

## ✅ 已完成功能

### 🏗️ 核心架构

#### 1. **数据库设计**
- ✅ **Canvas 表**: 存储学习空间（id, title, domain, status, created_at）
- ✅ **Module 表**: 存储模块（id, canvas_id, type, status, order_index, width, height）
- ✅ **ModuleVersion 表**: 存储模块版本历史（id, module_id, prompt, content_json, created_at）
- ✅ 外键约束和索引优化
- ✅ SQLite 数据库持久化

#### 2. **后端 API 系统**
- ✅ **Express 服务器** (端口 3001)
- ✅ **统一内容协议** (Content JSON): 支持 text, quiz, video, html_animation, interactive_app
- ✅ **核心 API 端点**:
  - `POST /api/canvases` - 创建 Canvas + 生成初始模块
  - `GET /api/canvases/:id` - 获取 Canvas 详情
  - `POST /api/modules/:id/edit` - 编辑单个模块（创建新版本）
  - `POST /api/canvases/:id/expand` - 扩展 Canvas（添加模块）
  - `POST /api/canvases/:id/new` - 归档旧 Canvas，创建新的
  - `POST /api/interact` - **统一智能交互接口**（AI 判断意图）
  - `PUT /api/modules/reorder` - 更新模块顺序
  - `PUT /api/modules/:id/size` - 更新模块尺寸

#### 3. **Planner 系统** ✅ 已完成升级！
- ✅ **假 Planner（规则引擎）**: 
  - generateModulePlan(): 固定模板（已被替代）
  - generateModuleContent(): 生成假数据（仍在使用）
  - analyzeIntent(): 简单关键词匹配（仍在使用）
  
- ✅ **真正的 Gemini Planner（独立测试完成）**:
  - generateModulePlanWithGemini(): 使用 Gemini 3 Flash + Medium Thinking
  - 支持 27+ 种模块类型（包括跨学科视角）
  - 动态模块数量（3-7 个）
  - 通过 20 条验证测试（100% 通过率）
  - 生成创意标题和详细描述
  - **状态**: ⏳ 已测试验证，等待接入主系统

### 🎨 前端功能

#### 4. **Canvas 页面系统**
- ✅ **CanvasPage 组件**: 完整的 Canvas 展示页面
- ✅ **ModuleCard 组件**: 模块卡片，支持多种内容类型渲染
- ✅ **笔记本风格背景**: 格子纸效果（仅 Canvas 页面）
- ✅ **笔记手稿式标题**: 左对齐，大标题 + 导语段落

#### 5. **交互功能**
- ✅ **模块拖拽排序**: 使用 @dnd-kit，支持键盘导航
- ✅ **模块自由缩放**: 使用 re-resizable，右下角拖拽调整大小
- ✅ **极简编辑体验**:
  - 点击标题或左下角铅笔图标进入编辑
  - 底部输入框展开，支持 Enter 提交、Esc 退出
  - 局部刷新（只更新该模块）
- ✅ **统一智能输入框**: 底部悬浮，AI 自动判断是扩展还是新建

#### 6. **UI/UX 优化**
- ✅ **极简导航栏**: 左上角品牌标志，右上角"Start New Exploration"
- ✅ **删除冗余功能**: 移除了 SocraticMentor（问号按钮）
- ✅ **视觉层次优化**: 标题、导语、模块卡片形成清晰的阅读流
- ✅ **响应式设计**: 支持不同屏幕尺寸

### 🔧 开发工具

#### 7. **开发环境**
- ✅ **前后端分离**: Vite (前端) + Express (后端)
- ✅ **热重载**: 前后端都支持自动刷新
- ✅ **TypeScript**: 端到端类型安全
- ✅ **API 测试脚本**: `test-api.sh`

---

## ❌ 待实现功能

### 🤖 AI 集成（最高优先级）

#### 1. **真正的 Gemini Planner** ✅ 已完成！
- ✅ 实现了 `generateModulePlanWithGemini()` 函数
- ✅ 使用 Gemini 3 Flash + Medium Thinking
- ✅ 支持跨学科模块类型（27+ 种）
- ✅ 动态模块数量（3-6 个）
- ✅ 通过 20 条验证测试（100% 通过率）
- ⏳ 待接入：替换 `server/planner.ts` 中的假函数

#### 2. **内容生成 API 矩阵**（Planner 的执行层）

Planner 会分配不同类型的模块，每种都需要对应的内容生成 API：

##### 2.1 基础文本内容生成 API ✅ 已完成测试！
**用于模块类型**：definition, intuition, overview, examples
- ✅ 实现 `generateTextContent(topic, domain, moduleType, modulePlan)`
- ✅ 使用 Gemini 2.5 Flash（速度快，质量高）
- ✅ 输出：title, body (markdown), key_points[], difficulty_level, reading_time
- ✅ 支持中英文混合
- ✅ 已测试验证（photosynthesis / intuition）
- ✅ 质量评估：开场引人入胜，双语自然，结构清晰
- ⏳ 待接入：集成到主系统
- **优先级**：🔴 最高（最常用）

##### 2.2 故事叙事生成 API ✅ 已完成测试！
**用于模块类型**：story
- ✅ 实现 `generateStoryContent(topic, domain, modulePlan, context)`
- ✅ 实现 `generateMultiWordFusionStory()` - 专门用于多词汇融合（PRD 场景3）
- ✅ 使用 Gemini 2.5 Flash（创意写作质量出色）
- ✅ 输出：narrative_text, key_sentence, illustration_prompts[], word_highlights, moral
- ✅ 支持 4 种叙事风格（educational, allegory, historical, scenario）
- ✅ 智能长度控制：
  - 单词故事：50-120 词（简短有力）
  - 多词融合：100-200 词（PRD 场景3）
  - 场景学习：100-150 词（PRD 场景2）
  - 科学/通识：150-300 词
- ✅ 已测试验证：
  - 单词故事 (apple) - 80词，文化深度
  - 多词融合 (apple, telescope, jealousy, refund) - 200词，连贯流畅
  - 场景学习 (咖啡店点咖啡) - 100词，真实对话
  - 科学寓言 (光合作用碳原子旅程) - 280词，拟人化精彩
- ✅ 提供专业的插图提示（2-4个场景描述）
- ⏳ 待接入：集成到主系统
- **优先级**：🟡 中等

##### 2.3 交互实验生成 API ⭐ ✅ 已完成测试！
**用于模块类型**：experiment, manipulation
- ✅ 实现 `generateSimpleInteractiveApp()` - 两步生成（Spec + HTML）
- ✅ 使用 Gemini 3 Flash（结构化能力强）
- ✅ 输出完整的自包含 HTML 文件（inline CSS/JS）
- ✅ 支持 Predict → Manipulate → Observe → Explain 交互循环
- ✅ 已测试验证（4个不同领域）：
  - 🧪 光合作用气泡实验室（生物）- 调节光/CO2/温度
  - 🚀 牛顿第一定律冰球模拟（物理）- 调节摩擦力/力度
  - 📐 数学函数探索器（数学）- 4种函数类型可视化
  - 🏠 3D物体观察工具（几何）- 空间想象力训练
- ✅ 设计特点：
  - 明亮白色背景（#FDFCF5）
  - 无quiz干扰，纯粹探索
  - 200-400行代码
  - 移动端响应式
  - 使用现代Web技术（Canvas/Chart.js/SVG）
- ⏳ 待接入：集成到主系统
- **优先级**：🔴 最高（PRD 核心特性）

##### 2.4 数学公式生成 API ✅ 已完成测试！
**用于模块类型**：formula, perspective_mathematics
- ✅ 实现 `generateFormulaContent(topic, domain, modulePlan, context)`
- ✅ 使用 Gemini 2.5 Flash
- ✅ 输出：
  - LaTeX 公式
  - 中文解释（100-200字）
  - 完整符号对应表
  - 渐进式推导步骤（3-5步）
  - 实际应用示例（带详细求解）
  - 关键洞察
- ✅ 支持可调推导级别（simple/detailed/rigorous）
- ✅ 双语支持（LaTeX英文，解释中文）
- ✅ 已测试验证：
  - 勾股定理（a² + b² = c²）- 3步推导，电视支架应用
- ⚠️ 已知限制：复杂推导（>7步）可能被截断
- 💡 渐进策略：用户追问详细步骤时再补充生成
- ⏳ 待接入：集成到主系统
- **优先级**：🟡 中等

###### 2.5 测验生成 API ✅ 已完成测试！
**用于模块类型**：quiz, challenge
- ✅ 实现 `generateQuizContent(topic, domain, modulePlan, context)`
- ✅ **智能上下文感知**：基于已生成的其他模块内容出题
- ✅ 使用 Gemini 3 Flash + Medium Thinking
- ✅ 输出：
  ```typescript
  {
    title: string,
    questions: [{
      question: string,
      question_type: 'multiple_choice' | 'true_false' | 'scenario_based',
      options: string[],
      answer_index: number,
      explanation: string,
      difficulty: 'easy' | 'medium' | 'hard',
      source_module: string  // 标注问题来源
    }],
    quiz_strategy: string  // AI解释问题设计思路
  }
  ```
- ✅ 智能适配不同内容组合：
  - 有 Story → 测试故事细节和词汇应用
  - 有 Experiment → 测试实验发现和参数关系
  - 有 Formula → 测试公式应用和概念
  - 只有 Text → 测试概念理解和场景应用
- ✅ 已测试验证：
  - 语言学习（基于故事）- 5个问题，引用故事细节
  - 知识学习（基于实验）- 5个问题，测试实验发现
  - 知识学习（无实验）- 5个问题，基于文本+公式
- ✅ 问题质量：测试理解而非记忆，包含场景应用
- ⏳ 待接入：集成到主系统
- **优先级**：🟡 中等

##### 2.6 跨学科视角生成 API ⭐ ✅ 已完成测试！
**用于模块类型**：perspective_physics, perspective_chemistry, perspective_biology, etc.
- ✅ 实现 `generatePerspectiveContent(topic, domain, modulePlan, context)`
- ✅ 实现 `generateMultiplePerspectives()` - 批量生成多个视角
- ✅ 使用 Gemini 3 Flash + Medium Thinking（质量出色）
- ✅ 支持 9 种学科视角：
  - Physics, Chemistry, Biology, Mathematics
  - History, Culture, Philosophy
  - Economics, Sociology
- ✅ 输出：
  - lens_description: 该学科揭示了什么（1句话）
  - main_explanation: 学科特定解释（200-300词）
  - key_concepts: 3-5个学科关键概念
  - visual_elements: 1个核心可视化建议（成本优化）
  - connection_to_other_perspectives: 跨视角连接
  - discipline_specific_questions: 2-3个学科思考问题
- ✅ 已测试验证：
  - 单视角（切洋葱-chemistry）- 专业深度达大学水平
  - 多视角（切洋葱-chemistry+physics+biology）- 完美互补
  - 完整Canvas（舔金属-6个模块含3个视角）- 符合PRD
- ✅ 成本优化：配图建议从3-4个降至1个/模块（成本-75%）
- ⏳ 待接入：集成到主系统
- **优先级**：🔴 最高（PRD 独特卖点）

##### 2.7 游戏化内容生成 API
**用于模块类型**：game
- 💡 **替代方案**：使用交互应用生成器（已支持游戏化设计）
- **优先级**：🟢 普通 → 可用现有生成器覆盖

##### 2.8 场景/情境生成 API ✅ 已完成测试！
**用于模块类型**：scenario
- ✅ 实现 `generateScenarioContent(topic, modulePlan, context)`
- ✅ 使用 Gemini 3 Flash + Medium Thinking
- ✅ 专门用于互动式语言学习场景
- ✅ 输出结构：
  - setting: 场景设定（地点、角色、情境）
  - dialogue_sequence: 互动对话步骤（3-5步）
  - 每步包含：3-4个回应选项+反馈+词汇高亮
  - key_vocabulary: 关键词汇表
  - cultural_notes: 文化提示
- ✅ 与故事的区别：
  - 故事：第三人称叙述，被动阅读
  - 场景：第二人称互动，主动选择
- ✅ 已测试验证：
  - 咖啡店点咖啡场景（beginner）
  - 3步对话，每步3-4个选项
  - 语气差异教学（polite/casual/blunt）
  - 文化提示（小费、问候习惯）
- ⏳ 待接入：集成到主系统
- **优先级**：🟡 中等

##### 2.9 对比分析生成 API
**用于模块类型**：comparison
- 💡 **替代方案**：使用文本生成器（可生成对比内容）
- **优先级**：🟢 普通 → 可用现有生成器覆盖

##### 2.10 时间线生成 API ❌ 决定不实现
**用于模块类型**：timeline
- ❌ 不单独实现时间线生成器
- 💡 **替代方案**：使用文本生成器（已足够）
- **原因**：
  - 文本生成器可以自动生成时间线格式的内容
  - 不需要单独的前端组件
  - 优先级低，投入产出比不高
- **状态**：已测试并决定不实现

##### 2.11 视频生成 API（第三方集成）
**用于模块类型**：video
- ❌ 集成 Runway / Pika / Veo 等视频生成服务
- ❌ 输入：script, visual_description, duration
- ❌ 输出：video_url, thumbnail_url, subtitles
- **优先级**：🟡 中等（后续阶段）

##### 2.12 图像生成 API
**用于模块类型**：所有类型的配图
- ❌ 集成 Imagen / DALL-E / Stable Diffusion
- ❌ 输入：description, style, size
- ❌ 输出：image_url
- **优先级**：🟡 中等

#### 3. **智能意图分析**
- ❌ 替换 `analyzeIntent()` 函数
- ❌ 使用 Gemini 更准确地判断用户是想扩展还是新建
- ❌ 从用户输入中提取新主题和领域

---

### 🏗️ 内容生成架构设计

#### 完整工作流程图

```
用户输入："photosynthesis" + 选择领域 "SCIENCE"
         ↓
┌────────────────────────────────────────┐
│   Gemini Planner (✅ 已完成测试)       │
│   - 使用 Gemini 3 Flash                │
│   - Medium Thinking 级别               │
│   决定：生成哪些模块？                  │
└────────────────────────────────────────┘
         ↓
输出模块计划 (5-6个模块):
[
  { type: "intuition", title: "Solar Powered Life", description: "..." },
  { type: "experiment", title: "The Bubble Factory", description: "..." },
  { type: "formula", title: "The Molecular Kitchen", description: "..." },
  { type: "perspective_chemistry", title: "Chemical Reactions in Cells", description: "..." },
  { type: "quiz", title: "The Botanist's Challenge", description: "..." }
]
         ↓
根据 type 分发给不同的内容生成器：
         ↓
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  文本生成器   │  实验生成器   │  公式生成器   │  视角生成器   │  测验生成器   │
│     API      │     API      │     API      │     API      │     API      │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ ✅ 已测试    │ ❌ 待实现    │ ❌ 待实现    │ ❌ 待实现    │ ❌ 待实现    │
│              │              │              │              │              │
│• intuition   │• experiment  │• formula     │• perspective_│• quiz        │
│• definition  │• manipulation│              │  chemistry   │• challenge   │
│• overview    │• game        │              │• perspective_│              │
│• examples    │              │              │  physics     │              │
│              │              │              │• perspective_│              │
│              │              │              │  biology     │              │
│              │              │              │• perspective_│              │
│              │              │              │  mathematics │              │
│              │              │              │• perspective_│              │
│              │              │              │  history     │              │
│              │              │              │  ...etc      │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
         ↓
为每个模块生成具体内容 (content_json):
{
  "type": "text",
  "title": "Solar Powered Life: How Plants Make Their Own Food",
  "body": "# Solar Powered Life...(完整 Markdown 内容)",
  "key_points": ["要点1", "要点2", ...]
}
         ↓
存储到数据库 (ModuleVersion 表)
         ↓
前端 ModuleCard 组件渲染
```

#### 架构说明

**第一层：Planner（规划器）**
- 输入：topic + domain
- 输出：模块计划列表
- 职责：决定"要生成哪些类型的模块"
- 状态：✅ 已完成测试（Gemini 3 Flash）

**第二层：Content Generators（内容生成器矩阵）**
- 输入：topic + domain + modulePlan
- 输出：content_json
- 职责：根据模块类型生成具体内容
- 状态：
  - ✅ 文本生成器（已测试）
  - ❌ 其他生成器（待实现）

**第三层：存储和渲染**
- 将生成的内容保存到数据库
- 前端根据 content_json.type 渲染不同组件

#### 关键理解：一对多的关系

**1 个 Planner → 多个 Content Generators**

- Planner 是"总指挥"，决定整体学习路径
- 每个 Content Generator 是"专家"，负责生成特定类型的内容

**举例说明**：

用户搜索 "photosynthesis"
→ Planner 决定：需要 5 个模块
  - intuition → 调用**文本生成器**
  - experiment → 调用**实验生成器**
  - formula → 调用**公式生成器**
  - perspective_chemistry → 调用**视角生成器**
  - quiz → 调用**测验生成器**

每个生成器都是独立的，有自己的 prompt 工程和输出格式。

---

#### API 优先级建议

**Phase 1 - 核心三件套**（MVP）
1. 🔴 基础文本内容生成 API
2. 🔴 交互实验生成 API  
3. 🔴 跨学科视角生成 API

完成这三个，就能支撑 80% 的模块类型。

**Phase 2 - 验证增强**
4. 🟡 测验生成 API
5. 🟡 故事生成 API
6. 🟡 公式推导生成 API

**Phase 3 - 多模态扩展**
7. 🟢 视频生成 API
8. 🟢 游戏化内容生成 API
9. 🟢 图像生成 API

---

### 🎬 内容类型扩展

#### 4. **视频生成**
- ❌ 集成视频生成 API（如 Runway、Pika 等）
- ❌ 实现 `VideoContent` 的真实渲染
- ❌ 视频缩略图和播放控制

#### 5. **HTML 动画**
- ❌ 实现交互式 HTML 动画组件
- ❌ 科学实验可视化（如化学反应、物理模拟）
- ❌ 数据可视化图表

#### 6. **交互式应用**
- ❌ 实现真正的交互式实验界面
- ❌ 参数调节和实时反馈
- ❌ 3D 模型展示（如分子结构、几何体）

### 📚 功能增强

#### 7. **版本历史管理**
- ❌ 前端 UI 显示模块版本历史
- ❌ 版本对比功能
- ❌ 版本回滚功能

#### 8. **Canvas 管理**
- ❌ Canvas 归档列表查看
- ❌ 恢复归档的 Canvas
- ❌ Canvas 搜索和筛选

#### 9. **用户系统**
- ❌ 用户认证（登录/注册）
- ❌ 多用户支持
- ❌ 个人学习历史
- ❌ 收藏和分享功能

### 🎯 用户体验优化

#### 10. **性能优化**
- ❌ 模块懒加载
- ❌ 虚拟滚动（大量模块时）
- ❌ API 响应缓存
- ❌ 图片和视频 CDN 优化

#### 11. **可访问性**
- ❌ 完整的键盘导航支持
- ❌ 屏幕阅读器支持
- ❌ 高对比度模式
- ❌ 多语言界面

#### 12. **移动端适配**
- ❌ 响应式布局优化
- ❌ 触摸手势支持（拖拽、缩放）
- ❌ 移动端专用交互模式

---

## 🎯 当前最紧急的任务：内容生成 API

Planner 已完成，现在最紧急的是实现**内容生成 API**，让 Planner 分配的模块能够真正生成内容。

### 📋 推荐实施顺序

#### 第一周：核心三件套（MVP）

##### 1️⃣ 基础文本内容生成 API
```typescript
generateTextContent(
  topic: string,
  domain: string, 
  moduleType: string,
  moduleDescription: string
) → { title, body, key_points[] }
```
- **覆盖模块类型**: definition, intuition, overview, examples
- **使用模型**: Gemini 1.5 Pro
- **输出格式**: Markdown 文本
- **预计工作量**: 2-3 天

##### 2️⃣ 交互实验生成 API ⭐
```typescript
generateExperimentContent(
  topic: string,
  experimentDescription: string
) → {
  variables: Variable[],
  visualization_config: any,
  formula: string,
  explanation: string
}
```
- **覆盖模块类型**: experiment, manipulation
- **使用模型**: Gemini 3 Flash（结构化输出）
- **输出格式**: JSON（变量定义 + 可视化配置）
- **预计工作量**: 3-4 天
- **关键挑战**: 定义统一的交互协议

##### 3️⃣ 跨学科视角生成 API ⭐
```typescript
generatePerspectiveContent(
  topic: string,
  discipline: string,  // physics, chemistry, biology, etc.
  mainContext: string
) → {
  title: string,
  discipline_explanation: string,
  key_concepts: string[],
  connection_to_other_perspectives?: string
}
```
- **覆盖模块类型**: perspective_physics, perspective_chemistry, etc.
- **使用模型**: Gemini 1.5 Pro
- **输出格式**: Structured text
- **预计工作量**: 2-3 天
- **关键特性**: 展示同一现象的不同学科解释

#### 第二周：验证和叙事

##### 4️⃣ 测验生成 API
```typescript
generateQuizContent(
  topic: string,
  difficulty: string,
  moduleContext: string
) → { questions: Question[] }
```
- **覆盖模块类型**: quiz, challenge
- **使用模型**: Gemini 3 Flash
- **预计工作量**: 1-2 天

##### 5️⃣ 故事生成 API
```typescript
generateStoryContent(
  topic: string,
  story_type: string,
  constraints: any
) → { narrative_text, illustration_prompts[] }
```
- **覆盖模块类型**: story
- **使用模型**: Gemini 1.5 Pro
- **预计工作量**: 2-3 天

#### 第三周：辅助功能

##### 6️⃣ 其他模块类型
- 公式推导 API
- 对比分析 API
- 时间线 API
- 场景 API

---

## 🏛️ 技术架构

### 后端技术栈
```
Express 4.18
├── SQLite (better-sqlite3)
├── TypeScript
├── tsx (热重载)
└── UUID (ID 生成)
```

### 前端技术栈
```
React 19.2
├── TypeScript
├── Vite 6.2
├── @dnd-kit (拖拽)
├── re-resizable (缩放)
└── Tailwind CSS (样式)
```

### 数据库结构
```
canvases (画布)
  └── modules (模块)
      └── module_versions (版本)
```

---

## 🚀 下一步计划

### Phase 1: AI 集成（1-2 周）
1. **接入 Gemini 3 Flash**
   - 实现真正的 Planner
   - 实现内容生成
   - 实现意图分析

2. **测试和优化**
   - 测试不同领域的生成效果
   - 优化 prompt 工程
   - 处理错误和边界情况

### Phase 2: 内容扩展（2-3 周）
1. **视频生成集成**
2. **交互式实验组件**
3. **HTML 动画系统**

### Phase 3: 功能完善（2-3 周）
1. **版本历史 UI**
2. **Canvas 管理**
3. **用户系统**

### Phase 4: 优化和发布（1-2 周）
1. **性能优化**
2. **移动端适配**
3. **文档完善**
4. **部署上线**

---

## 📊 当前代码统计

- **总文件数**: ~30 个
- **代码行数**: ~8,000+ 行
- **API 端点**: 8 个
- **React 组件**: 7 个
- **数据库表**: 3 个

---

## 🎯 核心成就

✅ **完整的模块化架构** - Canvas → Module → Version 三层结构  
✅ **版本控制系统** - 每次编辑创建新版本，不覆盖历史  
✅ **局部刷新机制** - 编辑模块时只更新该模块，不影响其他  
✅ **自由排版系统** - 拖拽排序 + 自由缩放，支持并排布局  
✅ **统一交互协议** - AI 自动判断用户意图，无需手动选择  
✅ **优雅的 UI 设计** - 笔记本风格，极简交互，高级感十足  
✅ **Gemini 3 Flash Planner** - 智能模块规划，支持 27+ 种模块类型，100% 测试通过率  
✅ **Gemini 2.5 Flash 文本生成器** - 基础文本内容生成，双语支持，质量出色  
✅ **Gemini 2.5 Flash 故事生成器** - 4种故事类型，智能长度控制，拟人化叙事精彩  
✅ **Gemini 3 Flash 交互应用生成器** - 完整HTML生成，4个领域验证通过，Predict→Manipulate→Observe循环  
✅ **Gemini 2.5 Flash 公式生成器** - LaTeX公式、渐进式推导、符号表、应用示例，支持渐进披露  
✅ **Gemini 3 Flash Quiz生成器** - 智能上下文感知，基于已生成内容出题，自动适配不同内容组合  
✅ **Gemini 3 Flash 跨学科视角生成器** - 9种学科视角，完美互补，PRD核心特性，成本优化  
✅ **Gemini 3 Flash 场景生成器** - 互动式语言练习，对话选择+即时反馈，区别于叙事故事  

---

## 💡 技术亮点

1. **假数据策略**: 先用 hardcode 跑通流程，后续一次性替换成 AI
2. **乐观更新**: 拖拽和编辑立即看到结果，不等待服务器
3. **类型安全**: TypeScript 端到端，API 契约保证
4. **模块化设计**: 每个功能都是独立模块，易于扩展

---

## 📝 注意事项

⚠️ **当前使用假数据**: 所有内容都带有 `【注：这是假数据】` 标记  
⚠️ **数据库文件**: `data/axiom.db` 已添加到 `.gitignore`，不会提交到 Git  
⚠️ **环境变量**: 需要配置 `GEMINI_API_KEY`（目前未使用）  
⚠️ **端口配置**: 前端 5173，后端 3001  

---

## 🔗 相关文档

- **快速启动**: 查看 `README.md`（如果存在）
- **API 文档**: 查看 `server/index.ts` 中的注释
- **数据库结构**: 查看 `server/db.ts`

---

**项目状态**: 🟢 基础框架完成，等待 AI 集成  
**下一步**: 接入 Gemini 3 Flash，实现真正的智能生成


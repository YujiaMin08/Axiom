# 🚀 Axiom Canvas 快速启动指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：启动服务

### 方式一：同时启动前后端（推荐）

```bash
npm run dev:all
```

这会同时启动：
- **前端** (Vite): http://localhost:5173
- **后端** (Express): http://localhost:3001

### 方式二：分别启动

```bash
# 终端 1 - 启动后端
npm run dev:server

# 终端 2 - 启动前端
npm run dev
```

## 第三步：使用应用

1. 打开浏览器访问 http://localhost:5173
2. 输入一个学习主题，例如：`apple`
3. 选择领域：Language / Science / Liberal Arts
4. 点击搜索，系统会创建一个 Canvas 并生成多个模块
5. 尝试编辑模块：鼠标悬停在模块卡片上，点击"编辑此模块"
6. 尝试添加模块：点击底部的"添加模块"按钮

## 第四步：测试 API（可选）

在后端启动的情况下，运行测试脚本：

```bash
./test-api.sh
```

这会测试所有 API 端点并显示结果。

## 文件结构

```
Axiom-new/
├── server/              # 后端代码
│   ├── index.ts        # API 服务器
│   ├── db.ts           # 数据库操作
│   ├── planner.ts      # 模块规划器（假数据）
│   └── routes/         # API 路由
├── components/          # React 组件
│   ├── CanvasPage.tsx  # Canvas 主页面
│   └── ModuleCard.tsx  # 模块卡片
├── data/               # 数据库文件（自动创建）
│   └── axiom.db       # SQLite 数据库
└── App.tsx            # 应用入口
```

## 核心功能演示

### 1. 创建 Canvas

- 输入主题（如 "photosynthesis"）
- 选择领域（Science）
- 系统自动生成 4 个模块：
  - 概念直觉
  - 交互式实验
  - 数学表达
  - 应用场景

### 2. 编辑模块（局部刷新）

- 点击任意模块的"编辑"按钮
- 输入编辑指令，例如：
  - "make it shorter"
  - "add more examples"
  - "explain like I'm 10 years old"
- 只有该模块会重新生成，其他模块不变

### 3. 扩展 Canvas

- 点击底部"添加模块"
- 输入想要添加的内容，例如：
  - "添加一个测验"
  - "添加实验演示"
  - "添加历史背景"
- 系统会智能判断模块类型并生成

### 4. 新建 Canvas

- 点击底部"新建 Canvas"
- 输入新主题
- 旧 Canvas 会被归档，创建新的学习空间

## 当前状态

### ✅ 已实现

- [x] 完整的后端 API（Canvas + Module + Version）
- [x] SQLite 数据库持久化
- [x] 前端 Canvas 页面
- [x] 模块卡片组件
- [x] 模块编辑（局部刷新）
- [x] Canvas 扩展（添加模块）
- [x] 新建 Canvas
- [x] 底部 Chat 交互区域
- [x] 版本控制系统

### ⚠️ 使用假数据

当前所有内容都是 **假数据**（hardcode），因为：
1. 先把流程跑通
2. 后续再接入真正的 Gemini API

所有假数据都带有标记：`【注：这是假数据】`

### 🔄 下一步

1. 接入 Gemini 3 Flash 作为 Planner
2. 接入 Gemini 生成真实内容
3. 实现视频生成
4. 实现交互式实验组件

## 常见问题

### Q: 启动后看不到内容？

**A:** 检查：
1. 后端是否启动（http://localhost:3001/api/health）
2. 前端是否启动（http://localhost:5173）
3. 浏览器控制台是否有错误

### Q: 编辑模块没反应？

**A:** 检查：
1. 后端 API 是否正常（看终端日志）
2. 浏览器控制台是否有网络错误
3. 数据库文件是否正常创建（data/axiom.db）

### Q: 如何清空数据？

**A:** 删除数据库文件：
```bash
rm data/axiom.db
```
重启后端会自动创建新的空数据库。

### Q: 为什么内容都是假数据？

**A:** 这是设计好的！目的是：
1. 先把 Canvas 模块化架构跑通
2. 验证编辑、扩展等核心流程
3. 确保数据库和版本控制正常工作
4. 后续再一次性接入真正的 AI 生成

## 开发技巧

### 查看数据库

```bash
sqlite3 data/axiom.db

# 查看所有 Canvas
SELECT * FROM canvases;

# 查看所有 Module
SELECT * FROM modules;

# 查看所有版本
SELECT * FROM module_versions;
```

### 监控 API 请求

打开浏览器开发者工具（F12），切换到 Network 标签，可以看到所有 API 请求。

### 查看后端日志

后端终端会显示所有 API 请求和数据库操作。

## 需要帮助？

查看详细文档：
- `CANVAS_SETUP.md` - 完整开发指南
- `README.md` - 项目概述
- PRD 文档 - 产品需求文档

## 🎉 开始探索吧！

访问 http://localhost:5173，创建你的第一个 Canvas！


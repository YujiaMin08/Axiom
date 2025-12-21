# Axiom - Where Understanding Takes Form

<div align="center">

**A GenUI-Powered Educational Learning Platform**

*Transform the way students explore knowledge through AI-generated, interactive learning experiences*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-orange)](https://ai.google.dev/)

English | [简体中文](README_CN.md)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [User Guide](#user-guide)
- [Module Types](#module-types)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🌟 Overview

Axiom is an innovative educational platform designed for students aged 12-18 (Grades 7-12) that transforms traditional learning into an engaging, interactive experience. Using advanced AI technology (Google Gemini 2.0 Flash), Axiom dynamically generates personalized learning content across three domains:

- **Language Arts** - Vocabulary, grammar, linguistics, etymology
- **Natural Sciences** - Physics, chemistry, biology, mathematics
- **Liberal Arts** - History, literature, philosophy, cross-disciplinary exploration

### Philosophy

Traditional learning materials are static and one-size-fits-all. Axiom believes that education should be:
- **Personalized**: Content adapts to individual needs
- **Interactive**: Students engage with material, not just consume it
- **Visual**: Multiple formats (text, video, animation, interactive apps)
- **Iterative**: Students can refine and expand their learning

---

## ✨ Core Features

### 1. **AI-Powered Content Generation**
- Intelligent content planner selects optimal module types for each topic
- 12+ specialized AI generators for different content formats
- Real-time generation with streaming updates

### 2. **Canvas-Based Learning**
- Each topic creates a "Canvas" - a collection of learning modules
- Drag-and-drop module organization
- Resizable cards for customizable layout
- Persistent storage of learning sessions

### 3. **Diverse Module Types**
- **Text Modules**: Definitions, explanations, examples
- **Interactive Apps**: Experiments, simulations, games
- **Visual Content**: Images, videos, HTML animations
- **Assessments**: Quizzes with instant feedback
- **Formulas**: Math equations with step-by-step derivations
- **Perspectives**: Multi-disciplinary viewpoints
- **Scenarios**: Real-time interactive dialogues
- **Comparisons**: Visual comparison tables

### 4. **Smart Interaction**
- **Global Input**: AI determines whether to create new Canvas or expand current
- **Module Editing**: Refine individual cards with natural language
- **Memory/Library**: Browse and revisit all learning sessions

### 5. **Bilingual Support**
- **Language Arts**: Always bilingual (English + Chinese)
- **Science/Liberal Arts**: User-selectable language preference
- Default: English with optional Chinese translations

### 6. **Elegant UX/UI**
- Minimal, paper-inspired aesthetic
- Smooth animations and transitions
- Responsive design for all screen sizes
- Glassmorphism and subtle textures

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   App.tsx   │  │  CanvasPage  │  │  ModuleCard      │  │
│  │             │  │              │  │  (12+ types)     │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                │                    │             │
│         └────────────────┴────────────────────┘             │
│                          │                                  │
│                    apiService.ts                            │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────┼──────────────────────────────────┐
│                Backend (Express + TypeScript)                │
├──────────────────────────┴──────────────────────────────────┤
│  Routes:                                                     │
│  ├─ /api/canvases      - Canvas CRUD                        │
│  ├─ /api/modules       - Module editing                     │
│  ├─ /api/interact      - Smart interaction                  │
│  └─ /api/scenario      - Real-time chat                     │
│                                                              │
│  AI Orchestration:                                           │
│  ├─ gemini-intent-analyzer    - Intent detection            │
│  ├─ gemini-planner            - Module planning             │
│  ├─ gemini-*-generator (12+)  - Content generation          │
│  └─ async-media-generator     - Image/video queue           │
│                                                              │
│  Database (SQLite):                                          │
│  ├─ canvases          - Learning sessions                   │
│  ├─ modules           - Content cards                       │
│  └─ module_versions   - Edit history                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                   External AI Services                       │
├──────────────────────────┴──────────────────────────────────┤
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  Google Gemini API  │  │  Juxin API (Image/Video)     │ │
│  │  2.0 Flash Exp      │  │  Media generation            │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tooling
- **@dnd-kit** - Drag-and-drop functionality
- **re-resizable** - Resizable components
- **MathJax** - LaTeX formula rendering

### Backend
- **Node.js 20+** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe server code
- **SQLite** - Lightweight database
- **tsx** - TypeScript execution with watch mode

### AI Services
- **Google Gemini 2.0 Flash** - Content generation
  - Text generation
  - Structured data extraction
  - Intent analysis
  - Multi-modal understanding
- **Juxin API** - Media generation
  - Image creation
  - Video synthesis

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Google Gemini API key
- Juxin API key (for media generation)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/axiom.git
cd axiom
```

2. **Install dependencies**

Frontend:
```bash
npm install
```

Backend:
```bash
cd server
npm install
cd ..
```

3. **Configure environment variables**

Create `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JUXIN_API_KEY=your_juxin_api_key_here
PORT=3001
```

4. **Initialize database**

The database will be automatically created when you first start the backend.

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

#### Production Build

```bash
# Build frontend
npm run build

# Serve frontend (requires a static server)
npx serve -s dist

# Start backend
cd server
npm start
```

---

## 📚 User Guide

### Creating Your First Canvas

1. **Choose a Learning Domain**
   - Language, Science, or Liberal Arts
   - Domain determines content types and approach

2. **Enter a Topic**
   - Short input: `"apple"`, `"gravity"` → Creates new Canvas
   - Descriptive: `"Learn about photosynthesis"` → AI extracts topic

3. **Explore Generated Content**
   - Multiple modules appear automatically
   - Scroll, drag, and resize cards
   - Each module offers different perspective

### Expanding Your Canvas

Use the bottom input bar to add more content:

```
"Add more examples"        → Generates examples module
"Show me a quiz"           → Adds quiz for assessment
"Explain with a formula"   → Generates math equations
"Create an animation"      → Adds visual animation
"Compare with X"           → Generates comparison table
```

### Editing Individual Modules

1. **Click the edit icon** (pencil) at bottom of any card
2. **Enter your refinement request**:
   - "Make this simpler"
   - "Add more details"
   - "Include phonics examples"
   - "Change animation speed"
3. **Press Enter** or click submit
4. **Card regenerates** with your modifications

### Managing Your Library

1. **Click hamburger menu** (top left)
2. **Browse all past Canvases** organized by domain
3. **Click any entry** to jump to that learning session
4. **Access settings** via user profile at bottom

### Deleting Modules

1. **Hover over any card** to reveal delete button (top right)
2. **Click X** to show confirmation
3. **Confirm or cancel** the deletion

---

## 🎨 Module Types

### Text-Based Modules
| Type | Description | Use Case |
|------|-------------|----------|
| `definition` | Precise definitions with pronunciation | Core vocabulary |
| `intuition` | Conceptual understanding in simple terms | Complex concepts |
| `overview` | Comprehensive introduction | Broad topics |
| `examples` | Real-world usage examples | Practical application |
| `story` | Narrative learning with bilingual text | Engagement |

### Interactive Modules
| Type | Description | Use Case |
|------|-------------|----------|
| `experiment` | Interactive simulations | Science concepts |
| `manipulation` | Parameter adjustment apps | Cause-effect learning |
| `game` | Educational games | Engagement |
| `scenario` | Real-time dialogue chat | Language practice |

### Visual Modules
| Type | Description | Use Case |
|------|-------------|----------|
| `image` | AI-generated illustrations | Visual learning |
| `video` | Landscape videos with subtitles | Demonstrations |
| `animation` | HTML/CSS/JS animations | Dynamic concepts |

### Assessment Modules
| Type | Description | Use Case |
|------|-------------|----------|
| `quiz` | Multiple-choice with explanations | Knowledge check |
| `challenge` | Advanced problem solving | Skill testing |

### Specialized Modules
| Type | Description | Use Case |
|------|-------------|----------|
| `formula` | LaTeX equations with derivations | Mathematics |
| `comparison` | Visual comparison tables | Analyzing differences |
| `perspective_*` | Cross-disciplinary viewpoints | Liberal Arts |

---

## 🔌 API Documentation

### Canvas APIs

#### `POST /api/canvases`
Create a new Canvas with AI-generated modules.

**Request:**
```json
{
  "topic": "photosynthesis",
  "domain": "SCIENCE",
  "language": "en"
}
```

**Response:**
```json
{
  "canvas": {
    "id": "uuid",
    "title": "photosynthesis",
    "domain": "SCIENCE",
    "status": "active"
  },
  "modules": [...]
}
```

#### `GET /api/canvases/:id`
Retrieve Canvas with all modules and current versions.

#### `GET /api/canvases`
List all Canvases (for Library).

#### `POST /api/canvases/test`
Create single-module test Canvas for development.

### Module APIs

#### `POST /api/modules/:id/edit`
Edit a specific module with user prompt.

**Request:**
```json
{
  "prompt": "Make this simpler and add more examples"
}
```

#### `DELETE /api/modules/:id`
Delete a module from Canvas.

#### `PUT /api/modules/:id/size`
Update module card dimensions.

### Interaction API

#### `POST /api/interact`
Smart interaction - AI determines intent.

**Request:**
```json
{
  "canvas_id": "uuid",
  "prompt": "add a quiz"
}
```

**Response:**
```json
{
  "action": "EXPAND_CANVAS",
  "data": {
    "canvas": {...},
    "modules": [...]
  }
}
```

### Scenario APIs

#### `POST /api/scenario/start`
Initialize interactive dialogue.

#### `POST /api/scenario/continue`
Continue dialogue with user choice.

---

## 👨‍💻 Development

### Project Structure

```
axiom/
├── components/          # React components
│   ├── CanvasPage.tsx          # Main Canvas view
│   ├── ModuleCard.tsx          # Universal card renderer
│   ├── NotebookSidebar.tsx     # Library sidebar
│   ├── SettingsModal.tsx       # User settings
│   ├── RealtimeScenarioChat.tsx # Interactive dialogue
│   ├── ComparisonTable.tsx     # Comparison view
│   └── DynamicBackground.tsx   # Animated background
├── server/             # Backend services
│   ├── routes/                 # API endpoints
│   ├── gemini-*.ts            # AI generators
│   ├── db.ts                  # Database layer
│   └── types.ts               # Shared types
├── utils/              # Utility functions
├── apiService.ts       # Frontend API client
├── types.ts           # Frontend types
├── App.tsx            # Main app component
└── index.html         # Entry point
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components
- **Imports**: Organized (React → libraries → local)
- **Comments**: JSDoc for functions, inline for complex logic

### Adding a New Module Type

1. **Create generator** in `server/gemini-{type}-generator.ts`
2. **Add case** in `server/content-generator-orchestrator-simple.ts`
3. **Update rendering** in `components/ModuleCard.tsx`
4. **Test** with `/api/canvases/test` endpoint

### Database Schema

```sql
-- Canvases: Learning sessions
CREATE TABLE canvases (
  id TEXT PRIMARY KEY,
  title TEXT,
  domain TEXT,
  status TEXT,
  created_at INTEGER
);

-- Modules: Content cards
CREATE TABLE modules (
  id TEXT PRIMARY KEY,
  canvas_id TEXT,
  type TEXT,
  status TEXT,
  order_index INTEGER,
  width INTEGER,
  height INTEGER
);

-- Module Versions: Edit history
CREATE TABLE module_versions (
  id TEXT PRIMARY KEY,
  module_id TEXT,
  prompt TEXT,
  content_json TEXT,
  created_at INTEGER
);
```

---

## 🧪 Testing

### Module Card Testing Tool

Use `test-module-card.html` for quick module testing:

1. Open `http://localhost:5173/test-module-card.html`
2. Select domain and module type
3. Enter test topic
4. Click "Generate Single Module"
5. View rendered card in real Canvas UI

**Example:**
```
Domain: Language
Module Type: story
Topic: apple
→ Generates and displays story module
```

### Manual Testing Checklist

- [ ] Create new Canvas for each domain
- [ ] Test all module types render correctly
- [ ] Edit modules with various prompts
- [ ] Delete modules and confirm removal
- [ ] Drag and resize modules
- [ ] Navigate between Canvases via Library
- [ ] Test AI intent detection (new vs expand)
- [ ] Verify bilingual content
- [ ] Check responsive design

---

## 🚢 Deployment

### Environment Requirements

**Production:**
- Node.js 20+ runtime
- 512MB RAM minimum
- Persistent file storage for SQLite
- HTTPS recommended

**Environment Variables:**
```env
NODE_ENV=production
GEMINI_API_KEY=your_production_key
JUXIN_API_KEY=your_juxin_key
PORT=3001
```

### Deployment Steps

1. **Build frontend**
```bash
npm run build
```

2. **Copy files to server**
```bash
dist/          # Frontend build
server/        # Backend code
package.json   # Dependencies
```

3. **Install production dependencies**
```bash
npm install --production
cd server
npm install --production
```

4. **Start services**

Use a process manager like PM2:
```bash
pm2 start server/index.ts --name axiom-backend
pm2 start "npx serve -s dist -l 5173" --name axiom-frontend
```

5. **Configure reverse proxy** (Nginx example)
```nginx
server {
  listen 80;
  server_name axiom.yourdomain.com;

  location / {
    proxy_pass http://localhost:5173;
  }

  location /api {
    proxy_pass http://localhost:3001;
  }
}
```

---

## 📋 Roadmap

### Upcoming Features

- [ ] **User Authentication** - Accounts and profiles
- [ ] **Collaborative Learning** - Share Canvases with peers
- [ ] **Advanced Analytics** - Track learning progress
- [ ] **Export Options** - PDF, Markdown, SCORM
- [ ] **Voice Input** - Speak your questions
- [ ] **Mobile Apps** - iOS and Android native
- [ ] **Offline Mode** - Learn without internet
- [ ] **API for Educators** - Integrate with LMS
- [ ] **Custom Themes** - Personalize appearance
- [ ] **Multi-language UI** - Support more languages

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - Powering our AI content generation
- **Juxin API** - Providing media generation
- **React Community** - Amazing libraries and tools
- **Tailwind CSS** - Beautiful utility-first CSS
- **All contributors** - Thank you for your support!

---

## 📞 Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Email**: support@axiom-learning.com
- **Community**: Discord Server (coming soon)

---

<div align="center">

**Built with ❤️ for the future of education**

*Axiom - Where Understanding Takes Form*

</div>


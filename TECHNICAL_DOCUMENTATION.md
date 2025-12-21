# Axiom - Technical Documentation

> Complete technical reference for developers working on Axiom

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Frontend Components](#frontend-components)
3. [Backend Services](#backend-services)
4. [AI Generators](#ai-generators)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Content Generation Pipeline](#content-generation-pipeline)
8. [Language System](#language-system)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)

---

## System Architecture

### High-Level Overview

Axiom follows a client-server architecture with AI-powered content generation:

```
User Input → Frontend (React)
           ↓
      apiService.ts (HTTP Client)
           ↓
      Backend Express Server
           ↓
      ┌────────┴────────┐
      ↓                 ↓
   SQLite DB      AI Services
                  (Gemini + Juxin)
```

### Data Flow

#### Canvas Creation Flow
```
1. User enters topic + domain
2. Frontend calls POST /api/canvases
3. Backend creates Canvas record
4. AI Planner generates module plan (2-6 modules)
5. Each module generated in parallel
6. Frontend receives complete Canvas
7. Modules rendered as draggable cards
```

#### Module Editing Flow
```
1. User clicks edit on module
2. Enters refinement prompt
3. Frontend calls POST /api/modules/:id/edit
4. Backend retrieves Canvas context
5. AI regenerates module with prompt
6. New version created in database
7. Frontend updates card content
```

#### Async Media Generation
```
1. Planner requests image/video module
2. Placeholder created immediately
3. Task queued for async processing
4. Juxin API called (10-30 seconds)
5. Module updated when ready
6. User clicks "Check status" to refresh
```

---

## Frontend Components

### Core Components

#### 1. **App.tsx**
Main application component managing routing and global state.

**Responsibilities:**
- Canvas mode vs landing state
- Category selection
- Sidebar toggle
- URL parameter handling

**Key State:**
```typescript
canvasId: string | null          // Current Canvas ID
canvasMode: boolean              // Canvas view active?
isSidebarOpen: boolean           // Library sidebar visible?
category: LearningCategory       // Selected domain
```

**Key Functions:**
- `handleSearch()` - Create new Canvas
- `reset()` - Return to landing page
- `getContentLanguage()` - Determine content language

---

#### 2. **CanvasPage.tsx**
Displays a Canvas with all its modules.

**Features:**
- Drag-and-drop module reordering (dnd-kit)
- Module CRUD operations
- Bottom input bar for expansion
- Silent refresh for async media

**Key State:**
```typescript
canvasData: CanvasResponse       // Full Canvas data
prompt: string                   // User input
isInteracting: boolean           // API call in progress
```

**Key Functions:**
- `loadCanvas(silent)` - Fetch Canvas data
- `handleEditModule()` - Edit single module
- `handleDeleteModule()` - Remove module
- `handleInteract()` - Smart expansion
- `handleDragEnd()` - Reorder modules

---

#### 3. **ModuleCard.tsx**
Universal renderer for all module types.

**Responsibilities:**
- Render content based on `type`
- Handle drag/resize
- Edit mode UI
- Delete confirmation
- MathJax triggering

**Content Rendering:**
```typescript
switch (content.type) {
  case 'text': return <MarkdownRenderer />
  case 'image': return <img />
  case 'video': return <video />
  case 'quiz': return <QuizInterface />
  case 'interactive_app': return <iframe />
  case 'html_animation': return <iframe />
  // ... 12+ types
}
```

**State Management:**
```typescript
isEditing: boolean               // Edit mode active?
editPrompt: string               // Edit instruction
isLoading: boolean               // Regenerating content?
quizIndex: number                // Current quiz question
selectedAnswer: number | null    // User's quiz answer
animationKey: number             // Force animation replay
showDeleteConfirm: boolean       // Delete dialog visible?
isRefreshing: boolean            // Checking async status?
```

---

#### 4. **NotebookSidebar.tsx**
Library sidebar for browsing past Canvases.

**Features:**
- Grouped by domain
- Sorted by creation date
- User menu at bottom
- Settings access

**Key Functions:**
- `loadHistory()` - Fetch all Canvases
- `groupedCanvases` - Group by domain
- `onSelectCanvas()` - Navigate to Canvas

---

#### 5. **SettingsModal.tsx**
User preferences and configuration.

**Settings:**
- Username and User ID
- Default learning domain
- Content language (en/zh)
- Animation toggle
- Version info

**Persistence:**
```typescript
localStorage.setItem('axiom_language', language);
```

---

#### 6. **RealtimeScenarioChat.tsx**
Interactive dialogue for scenario modules.

**Features:**
- Real-time AI conversation
- Multiple choice responses
- Chat history display
- Stone-themed minimalist UI

**Flow:**
```
Start → NPC message
     ↓
User chooses option
     ↓
Send to /api/scenario/continue
     ↓
AI responds with new message
     ↓
Repeat until conclusion
```

---

#### 7. **ComparisonTable.tsx**
Visual comparison renderer.

**Displays:**
- Comparison table (items × dimensions)
- Similarities list
- Differences list
- Key insights

---

### Utility Components

- **DynamicBackground.tsx** - Animated background based on domain
- **utils/languageSettings.ts** - Language preference management

---

## Backend Services

### Route Handlers

#### `/api/canvases` - Canvas Management
**File:** `server/routes/canvases.ts`

**Endpoints:**
- `POST /` - Create Canvas
- `GET /:id` - Get Canvas details
- `GET /` - List all Canvases
- `POST /test` - Create test Canvas

**Key Functions:**
- `buildCanvasResponse()` - Assemble Canvas with versions
- Parallel module generation
- Error handling with fallbacks

---

#### `/api/modules` - Module Operations
**File:** `server/routes/modules.ts`

**Endpoints:**
- `POST /:id/edit` - Edit module
- `GET /:id/versions` - Version history
- `DELETE /:id` - Delete module
- `PUT /:id/size` - Update dimensions
- `PUT /reorder` - Reorder modules

---

#### `/api/interact` - Smart Interaction
**File:** `server/routes/interact.ts`

**Responsibilities:**
- Receive user input
- Call AI intent analyzer
- Route to NEW_CANVAS or EXPAND_CANVAS
- Generate new content
- Return appropriate response

**Intent Analysis:**
```typescript
analyzeIntentWithAI(prompt, currentTopic, currentDomain)
  → { action, topic?, moduleType?, reasoning }
```

---

#### `/api/scenario` - Dialogue System
**File:** `server/routes/scenario-chat.ts`

**Endpoints:**
- `POST /start` - Initialize conversation
- `POST /continue` - User choice response

**Features:**
- Stateless (history passed each time)
- Dynamic response generation
- Natural conversation flow

---

### AI Generator Services

#### 1. **gemini-intent-analyzer.ts**
Analyzes user input to determine intent.

**Input:**
```typescript
userPrompt: string
currentTopic: string
currentDomain: string
```

**Output:**
```typescript
{
  action: 'NEW_CANVAS' | 'EXPAND_CANVAS',
  topic?: string,
  moduleType?: string,
  reasoning: string
}
```

**Intelligence:**
- Understands natural language
- Context-aware decisions
- Suggests appropriate module types
- Bilingual support

---

#### 2. **gemini-planner.ts**
Plans module structure for a Canvas.

**Input:**
- Topic
- Domain
- Language preference

**Output:**
```typescript
{
  topic_analysis: {
    main_topic: string,
    complexity_level: 'beginner' | 'intermediate' | 'advanced',
    key_concepts: string[]
  },
  module_plan: Array<{
    type: string,
    title: string,
    description?: string
  }>,
  learning_path_reasoning: string
}
```

**Domain-Specific Rules:**

**Language Arts:**
- MUST include: `image`, `video`
- FORBIDDEN: `perspective_*` modules
- Optional: `quiz`
- Focus: vocabulary, usage, stories

**Science:**
- MUST include: `interactive` (experiment), `animation`
- FORBIDDEN: `perspective_*` modules
- Optional: `quiz`
- Focus: concepts, experiments, formulas

**Liberal Arts:**
- MUST include: `animation`, 2-4 `perspective_*`
- Can mix: natural sciences + humanities
- Optional: `quiz`, `video`, `image`, `interactive`
- Focus: cross-disciplinary exploration

---

#### 3. **content-generator-orchestrator-simple.ts**
Routes requests to appropriate generators.

**Main Functions:**
- `generateModulePlan()` - Calls Planner
- `generateModuleContent()` - Routes to specific generator
- `planNewModule()` - Single module planning

**Generator Mapping:**
```typescript
'definition' | 'intuition' | 'overview' | 'examples'
  → gemini-content-generator.ts

'story'
  → gemini-story-generator.ts

'experiment' | 'manipulation' | 'game'
  → simple-interactive-generator.ts

'formula' | 'perspective_mathematics'
  → gemini-formula-generator.ts

'quiz'
  → gemini-quiz-generator.ts

'scenario'
  → gemini-scenario-generator.ts

'comparison'
  → gemini-comparison-generator.ts

'animation' | 'visualization'
  → gemini-animation-generator.ts

'video'
  → gemini-video-generator.ts + async-media-generator.ts

'image' | 'illustration'
  → gemini-image-generator.ts + async-media-generator.ts

'perspective_*'
  → gemini-perspective-generator.ts
```

---

#### 4. **async-media-generator.ts**
Handles asynchronous image and video generation.

**Features:**
- Task queue for media generation
- Placeholder creation
- Status checking
- Database update on completion

**Flow:**
```
1. Create placeholder module
2. Queue generation task
3. Call Juxin API (async)
4. Poll for completion
5. Download media
6. Update module with URL
7. User clicks "Check status" to see result
```

---

### Specialized Generators

#### **gemini-content-generator.ts**
General text content (definitions, examples, overviews).

**Output:**
```typescript
{
  title: string,
  body: string  // Markdown formatted
}
```

---

#### **gemini-story-generator.ts**
Narrative storytelling with bilingual output.

**Output:**
```typescript
{
  title: string,
  key_sentence: string,
  narrative_text: string,
  chinese_translation: string,
  word_highlights: string[],
  vocabulary_notes: Array<{word, meaning}>
}
```

---

#### **gemini-quiz-generator.ts**
Interactive assessments.

**Output:**
```typescript
{
  title: string,
  questions: Array<{
    question: string,
    options: string[],
    answer_index: number,
    explanation: string
  }>
}
```

---

#### **gemini-formula-generator.ts**
Mathematical equations with derivations.

**Output:**
```typescript
{
  title: string,
  main_formula: string,  // LaTeX
  formula_explanation: string,
  symbol_table: Array<{symbol, meaning, unit}>,
  derivation_steps: Array<{
    step_number: number,
    description: string,
    formula: string
  }>
}
```

---

#### **simple-interactive-generator.ts**
Interactive HTML apps.

**Output:**
```typescript
{
  title: string,
  html: string,  // Complete HTML document
  description: string
}
```

---

#### **gemini-animation-generator.ts**
HTML/CSS/JS animations.

**Output:**
```typescript
{
  title: string,
  html_content: string,  // Self-contained HTML
  description: string,
  key_concepts: string[]
}
```

---

#### **gemini-scenario-generator.ts**
Interactive dialogue scenarios.

**Output:**
```typescript
{
  title: string,
  scenario_description: string,
  initial_message: string,
  conversation_steps: Array<{
    step_id: string,
    npc_message: string,
    options: Array<{
      id: string,
      text: string,
      next_step?: string,
      feedback: string
    }>
  }>
}
```

---

#### **gemini-comparison-generator.ts**
Structured comparisons.

**Output:**
```typescript
{
  title: string,
  items_compared: string[],
  dimensions: string[],
  comparison_table: string[][],
  similarities: string[],
  differences: string[],
  key_insight: string
}
```

---

#### **gemini-video-generator.ts**
Video generation prompts (Juxin API).

**Output:**
```typescript
{
  title: string,
  prompt: string,
  duration: number,
  orientation: 'landscape',
  key_scenes: Array<{description, duration}>
}
```

---

#### **gemini-image-generator.ts**
Image generation prompts (Juxin API).

**Output:**
```typescript
{
  title: string,
  prompt: string,
  style: string,
  elements: string[],
  description: string
}
```

---

#### **gemini-perspective-generator.ts**
Multi-disciplinary viewpoints.

**Supported Perspectives:**
- `perspective_biology`
- `perspective_chemistry`
- `perspective_physics`
- `perspective_mathematics`
- `perspective_history`
- `perspective_literature`
- `perspective_philosophy`
- `perspective_sociology`

**Output:**
```typescript
{
  title: string,
  lens_description: string,
  main_explanation: string,
  key_concepts: string[],
  real_world_example: string
}
```

---

## Database Schema

### Tables

#### **canvases**
Stores learning sessions.

```sql
CREATE TABLE canvases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL
);
```

**Indexes:**
- Primary: `id`
- Composite: `status, created_at DESC`

---

#### **modules**
Content cards within a Canvas.

```sql
CREATE TABLE modules (
  id TEXT PRIMARY KEY,
  canvas_id TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  order_index INTEGER DEFAULT 0,
  width INTEGER DEFAULT 600,
  height INTEGER DEFAULT 400,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (canvas_id) REFERENCES canvases(id)
);
```

**Indexes:**
- Primary: `id`
- Foreign: `canvas_id`
- Composite: `canvas_id, order_index`

---

#### **module_versions**
Edit history for modules.

```sql
CREATE TABLE module_versions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  prompt TEXT DEFAULT '',
  content_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (module_id) REFERENCES modules(id)
);
```

**Indexes:**
- Primary: `id`
- Foreign: `module_id`
- Composite: `module_id, created_at DESC`

---

### Database Operations

#### **canvasDB** (server/db.ts)
```typescript
create(id, title, domain)
findById(id)
findAll()
archive(id)  // Set status to 'archived'
```

#### **moduleDB**
```typescript
create(id, canvasId, type, orderIndex)
findById(id)
findByCanvasId(canvasId)
updateStatus(id, status)
updateSize(id, width, height)
reorder(moduleOrders)
delete(id)
```

#### **versionDB**
```typescript
create(id, moduleId, prompt, contentJson)
findLatestByModuleId(moduleId)
findAllByModuleId(moduleId)
```

---

## API Reference

### Complete Endpoint List

#### Canvas Management
```
POST   /api/canvases              Create new Canvas
GET    /api/canvases/:id          Get Canvas details
GET    /api/canvases              List all Canvases
POST   /api/canvases/test         Create test Canvas (dev only)
```

#### Module Operations
```
POST   /api/modules/:id/edit      Edit module content
GET    /api/modules/:id/versions  Get version history
DELETE /api/modules/:id           Delete module
PUT    /api/modules/:id/size      Update card size
PUT    /api/modules/reorder       Reorder modules
```

#### Smart Interaction
```
POST   /api/interact              AI-powered interaction
```

#### Scenario Dialogues
```
POST   /api/scenario/start        Start conversation
POST   /api/scenario/continue     Continue with choice
```

#### Async Status
```
GET    /api/async/status          Check generation queue
```

---

### Request/Response Examples

#### Create Canvas

**Request:**
```http
POST /api/canvases
Content-Type: application/json

{
  "topic": "Newton's Laws",
  "domain": "SCIENCE",
  "language": "en"
}
```

**Response:**
```json
{
  "canvas": {
    "id": "abc-123",
    "title": "Newton's Laws",
    "domain": "SCIENCE",
    "status": "active",
    "created_at": 1703260800000
  },
  "modules": [
    {
      "module": {
        "id": "mod-1",
        "canvas_id": "abc-123",
        "type": "intuition",
        "status": "ready",
        "order_index": 0
      },
      "current_version": {
        "id": "ver-1",
        "module_id": "mod-1",
        "content_json": {
          "type": "text",
          "title": "Understanding Newton's Laws",
          "body": "..."
        },
        "created_at": 1703260801000
      }
    }
    // ... more modules
  ]
}
```

---

#### Edit Module

**Request:**
```http
POST /api/modules/mod-1/edit
Content-Type: application/json

{
  "prompt": "Make this explanation simpler for beginners"
}
```

**Response:**
```json
{
  "module": {
    "id": "mod-1",
    "type": "intuition",
    "status": "ready"
  },
  "current_version": {
    "id": "ver-2",
    "module_id": "mod-1",
    "prompt": "Make this explanation simpler for beginners",
    "content_json": {
      "type": "text",
      "title": "Understanding Newton's Laws (Simplified)",
      "body": "..."
    },
    "created_at": 1703260900000
  }
}
```

---

#### Smart Interact

**Request:**
```http
POST /api/interact
Content-Type: application/json

{
  "canvas_id": "abc-123",
  "prompt": "add a quiz"
}
```

**Response (EXPAND_CANVAS):**
```json
{
  "action": "EXPAND_CANVAS",
  "data": {
    "canvas": {...},
    "modules": [
      // ... existing modules
      {
        "module": {
          "id": "new-mod",
          "type": "quiz",
          "status": "ready"
        },
        "current_version": {
          "content_json": {
            "type": "quiz",
            "questions": [...]
          }
        }
      }
    ]
  }
}
```

**Response (NEW_CANVAS):**
```json
{
  "action": "NEW_CANVAS",
  "data": {
    "canvas": {
      "id": "new-canvas-id",
      "title": "New Topic",
      ...
    },
    "modules": [...]
  }
}
```

---

## Content Generation Pipeline

### Phase 1: Planning

```
User Input: "photosynthesis" (SCIENCE domain)
     ↓
Gemini Planner analyzes:
  - Topic complexity
  - Optimal learning path
  - Required module types
     ↓
Returns Module Plan:
  1. intuition (conceptual understanding)
  2. animation (visual process)
  3. interactive (experiment simulation)
  4. formula (chemical equation)
  5. video (real-world demonstration)
```

### Phase 2: Parallel Generation

```
Module 1 (intuition)     │  Module 2 (animation)    │  Module 3 (interactive)
      ↓                  │        ↓                 │         ↓
Gemini Generator         │  Gemini Generator        │  Gemini Generator
      ↓                  │        ↓                 │         ↓
Text Content             │  HTML/CSS/JS Code        │  Interactive HTML
      ↓                  │        ↓                 │         ↓
Save to DB               │  Save to DB              │  Save to DB
      ↓                  │        ↓                 │         ↓
  Status: ready          │  Status: ready           │  Status: ready
```

### Phase 3: Async Media

```
Module 4 (video)
      ↓
Create Placeholder
      ↓
Queue Juxin Task
      ↓
[Background Process]
  - Call Juxin API
  - Wait 10-30 seconds
  - Download video
  - Update module
      ↓
Status: ready
```

---

## Language System

### Language Preference Logic

```typescript
// User sets language in Settings
localStorage.setItem('axiom_language', 'en' | 'zh')

// When creating Canvas
const language = getContentLanguage(domain)

if (domain === 'LANGUAGE') {
  return 'zh'  // Always bilingual
} else {
  return localStorage.getItem('axiom_language') || 'en'
}
```

### Generator Behavior

**Language Arts (LANGUAGE):**
- Always generates bilingual content
- English vocabulary with Chinese explanations
- Stories include both languages

**Science/Liberal Arts:**
- Respects user's language preference
- `language='en'` → Full English content
- `language='zh'` → Full Chinese content
- Technical terms remain in English

### Implementation

**Planner:**
```typescript
generateModulePlanWithGemini(topic, domain, language)
```

**Generators:**
```typescript
generateTextContent(topic, domain, plan, {
  user_refinement?: string,
  // ... other context
})
```

System instruction includes:
```
CONTENT LANGUAGE SETTINGS:
${language === 'en' ? 'Generate in ENGLISH' : 'Generate in CHINESE'}
```

---

## Development Workflow

### Starting Development

1. **Install dependencies**
```bash
npm install
cd server && npm install && cd ..
```

2. **Start services**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

3. **Open browser**
```
http://localhost:5173
```

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Vite HMR (instant updates)
- **Backend**: tsx watch (restarts on file changes)

### Adding a New AI Generator

**Example: Adding a "Summary" generator**

1. **Create generator file**
```typescript
// server/gemini-summary-generator.ts
export async function generateSummaryContent(
  topic: string,
  domain: string,
  modulePlan: ModulePlan,
  context?: { user_refinement?: string }
): Promise<SummaryOutput> {
  // ... Gemini API call
}
```

2. **Add to orchestrator**
```typescript
// server/content-generator-orchestrator-simple.ts
case 'summary': {
  const { generateSummaryContent } = await import('./gemini-summary-generator.js');
  const result = await generateSummaryContent(topic, domain, plan, generatorContext);
  return { type: 'text', title: result.title, body: result.body };
}
```

3. **Update Planner**
```typescript
// server/gemini-planner.ts
// Add 'summary' to available module types in system instruction
```

4. **Test with test-module-card.html**
```
Domain: Science
Module Type: summary
Topic: Quantum Mechanics
```

### Debugging Tips

**Frontend:**
- React DevTools for component inspection
- Console logs in `ModuleCard.tsx` for rendering
- Network tab for API calls

**Backend:**
- Console logs show AI generation progress
- Check `axiom.db` for data persistence
- Use `/api/async/status` for queue monitoring

**Common Issues:**
- "FAILED TO FETCH" → Backend not running
- "Cannot POST /api/..." → Route not registered
- Empty modules → Check generator errors in console
- MathJax not rendering → Call `triggerMathJax()`

---

## Troubleshooting

### Issue: Images/Videos Not Showing

**Cause:** Async generation not complete

**Solution:**
1. Wait 10-30 seconds
2. Click "Check status" button
3. Module updates automatically when ready

---

### Issue: Formula Shows Raw LaTeX

**Cause:** MathJax not triggered after DOM change

**Solution:**
- Implemented in code: `triggerMathJax()` after:
  - Content update
  - Drag end
  - Resize end

---

### Issue: Intent Detection Wrong

**Cause:** AI misunderstood user input

**Solution:**
- Use clearer language
- Check console for AI reasoning
- Fallback to manual expansion via specific keywords

---

### Issue: Module Edit Not Working

**Checklist:**
1. Is `onEdit` prop passed to `ModuleCard`?
2. Is backend receiving the request?
3. Does generator support `user_refinement`?
4. Check console for error messages

---

### Issue: Sidebar Not Opening

**Cause:** Z-index conflicts or state not updating

**Solution:**
- Check `isSidebarOpen` state in App.tsx
- Verify z-index: Sidebar (z-[100]) > others
- Ensure backdrop click calls `onClose()`

---

## Performance Optimization

### Current Optimizations

1. **Parallel Generation**
   - All modules generated simultaneously
   - Faster Canvas creation

2. **Silent Refresh**
   - `loadCanvas(silent=true)` for status checks
   - No loading spinner for updates

3. **Lazy Imports**
   - Generators imported on-demand
   - Faster initial load

4. **Component Memoization**
   - Consider `React.memo()` for large Canvases
   - Prevent unnecessary re-renders

### Future Improvements

- [ ] Virtual scrolling for large module lists
- [ ] Web Workers for heavy computations
- [ ] Service Worker for offline capability
- [ ] IndexedDB for local caching
- [ ] Code splitting by route

---

## Security Considerations

### Current Implementation

1. **API Keys**
   - Stored in server environment variables
   - Never exposed to frontend
   - Frontend settings are UI-only (not functional yet)

2. **Input Validation**
   - Basic validation on backend
   - SQL injection prevented by using prepared statements

3. **CORS**
   - Configure allowed origins in production
   - Currently allows localhost for development

### Recommendations for Production

- [ ] Implement user authentication (JWT)
- [ ] Rate limiting on API endpoints
- [ ] Content sanitization (XSS prevention)
- [ ] HTTPS only
- [ ] API key rotation
- [ ] Input length limits
- [ ] Database backups

---

## Testing Strategy

### Unit Testing (TODO)

Recommended framework: **Vitest**

**Test Coverage:**
- Utility functions (languageSettings.ts)
- API service methods (apiService.ts)
- Individual generators (mock Gemini responses)

---

### Integration Testing

Use **test-module-card.html**:

1. Navigate to `http://localhost:5173/test-module-card.html`
2. Select domain + module type
3. Enter test topic
4. Generate and view result
5. Test in real ModuleCard component

---

### E2E Testing (TODO)

Recommended framework: **Playwright**

**Test Scenarios:**
- Create Canvas → Verify modules render
- Edit module → Check content updates
- Delete module → Confirm removal
- Navigate Library → Open past Canvas
- Language settings → Verify content changes

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Frontend built (`npm run build`)
- [ ] Backend tested in production mode
- [ ] CORS configured for production domain
- [ ] API keys secured
- [ ] Error logging set up

### Hosting Options

**Frontend:**
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Backend:**
- Railway (recommended for Node.js)
- Render
- AWS EC2
- DigitalOcean Droplets

**Database:**
- SQLite file (included with backend)
- Or migrate to PostgreSQL for scale

---

## Code Quality Standards

### TypeScript

- Strict mode enabled
- No `any` types (use proper interfaces)
- Explicit return types for functions
- Export interfaces for reusability

### React

- Functional components only
- Hooks for state management
- Props interfaces defined
- Meaningful component names

### CSS/Styling

- Tailwind utility classes
- Custom classes prefixed with domain
- Consistent spacing scale
- Responsive by default

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx`
- Utils: `camelCase.ts`
- Generators: `gemini-{type}-generator.ts`

**Variables:**
- State: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Components: `PascalCase`

---

## Contributing Guidelines

### Branch Strategy

```
main           Production-ready code
  ├── develop  Integration branch
  │    ├── feature/new-module-type
  │    ├── feature/user-auth
  │    └── bugfix/formula-rendering
  └── hotfix/  Critical production fixes
```

### Commit Messages

Follow conventional commits:
```
feat: Add voice input for queries
fix: Formula MathJax rendering after resize
docs: Update API documentation
style: Improve button hover states
refactor: Simplify intent analyzer logic
test: Add unit tests for languageSettings
```

### Pull Request Process

1. Create feature branch
2. Implement and test locally
3. Update documentation
4. Submit PR with description
5. Code review
6. Merge to develop
7. Deploy to staging
8. Merge to main

---

## Monitoring and Analytics (TODO)

### Metrics to Track

**User Behavior:**
- Canvases created per user
- Most popular domains
- Module edit frequency
- Average session duration

**System Performance:**
- API response times
- AI generation latency
- Error rates by endpoint
- Database query performance

**Content Quality:**
- Module regeneration rate
- User satisfaction (future feature)
- Content type popularity

### Tools

- **Logging**: Winston or Pino
- **Analytics**: PostHog or Mixpanel
- **Error Tracking**: Sentry
- **Monitoring**: Grafana + Prometheus

---

## Future Enhancements

### Short-Term (1-3 months)

- [ ] User authentication and profiles
- [ ] Save user preferences to backend
- [ ] Export Canvas as PDF
- [ ] Share Canvas via link
- [ ] Version history UI
- [ ] Module preview before generation

### Mid-Term (3-6 months)

- [ ] Collaborative Canvases
- [ ] Teacher dashboard
- [ ] Learning analytics
- [ ] Mobile app (React Native)
- [ ] Voice input/output
- [ ] Dark mode

### Long-Term (6+ months)

- [ ] AI tutor (conversational)
- [ ] Personalized learning paths
- [ ] Gamification (badges, progress)
- [ ] Integration with LMS (Canvas, Blackboard)
- [ ] Multi-user real-time editing
- [ ] AR/VR learning modules

---

## License

MIT License - see LICENSE file for details.

---

## Contact & Support

- **Technical Questions**: Open GitHub issue
- **Bug Reports**: Use issue template
- **Feature Requests**: Discussions tab
- **Email**: dev@axiom-learning.com

---

## Changelog

### v1.0.0 (2024-12-22)

**Initial Release**
- ✅ Canvas-based learning system
- ✅ 12+ module types with AI generation
- ✅ Drag-and-drop, resizable cards
- ✅ Module editing and deletion
- ✅ Library/Memory sidebar
- ✅ Settings modal
- ✅ Bilingual support
- ✅ Gemini AI intent detection
- ✅ Async media generation
- ✅ Real-time scenario dialogues
- ✅ Formula rendering with MathJax
- ✅ Interactive quizzes
- ✅ Comparison tables

---

<div align="center">

**🎓 Built for learners, by learners**

*Axiom - Transforming education through AI*

</div>


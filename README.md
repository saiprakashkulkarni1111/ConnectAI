# ConnectAI — The Intelligent Community Platform

> **Turn community conversations into reusable knowledge, connect people who can solve problems, and preserve verified solutions for future users.**  
> Built as a complete, local-first AI community intelligence platform for the **iQOO Hackathon**.

---

## 1. Core Product Concept & End-to-End Workflow

Unlike conventional social feeds where technical answers get buried, **ConnectAI** implements a structured community intelligence pipeline:

$$\text{Community Question} \longrightarrow \text{Knowledge Retrieval} \longrightarrow \text{AI Assistance} \longrightarrow \text{Collaborator Matching} \longrightarrow \text{Verified Solution} \longrightarrow \text{Community Memory}$$

### Key Differentiators

1. **Community Memory (`/memory`)**: Converts resolved technical discussions into structured, reusable knowledge entries with original problem context, accepted/verified solutions, technology tags, contributor attribution, duplicate prevention, and direct links back to the source workspace. Also auto-identifies candidate answered discussions ready to be preserved.
2. **Unified Problem-Solving Workspace (`/workspace/:postId`)**: A focused workspace for every technical question combining the original problem, lifecycle controls (`Open` → `Answered` → `Resolved` → `Verified`), Evidence-First Copilot synthesis, Problem-to-Person collaborator recommendations, and related Community Memory entries in one coherent view.
3. **Evidence-First Community Copilot (`/copilot`)**: Searches actual Community Memory entries, resolved questions, and collaborator profiles before generating an answer. Displays clickable source references to real records, surfaces matching saved solutions, and recommends a specific collaborator when appropriate. Never fabricates citations.
4. **Problem-to-Person Matching (`/matchmaking`)**: Recommends collaborators based on a specific technical problem and its required skills (`Find Someone to Help`), ranking mentors, teammates, technical experts, and study partners by direct skill match, relevant shipped projects, and domain overlap.
5. **Prioritized Global Search**: Ranks **Verified Solutions (Community Memory)** #1, followed by **Resolved Questions**, technical discussions, and collaborators, with explicit relevance explanations.

---

## 2. Realistic Technical Problem Dataset (Judge Demo Ready)

Pre-seeded with realistic discussions, answers, verified knowledge entries, and specialist profiles across 6 core engineering domains:

- **Python Dependency Conflicts**: Resolving `torch 2.4`, `onnxruntime-gpu`, and `numpy<2.0` ABI conflicts with `uv` / `Poetry`.
- **Deploying Machine Learning Models**: Fixing FastAPI + PyTorch container OOM kills and 18s cold starts via Int8 ONNX quantization and `lifespan` single-worker queues.
- **React Performance Problems**: Eliminating high-frequency token streaming frame drops using `requestAnimationFrame` buffering and leaf-node isolation.
- **Firebase Authentication Errors**: Fixing `auth/unauthorized-domain` and `Cross-Origin-Opener-Policy` popup errors in preview environments.
- **ESP32 Sensor Integration**: Resolving I2C bus lockups (SDA held low) and ADC2/Wi-Fi hardware conflicts on ESP32-S3.
- **RAG Implementation & Vector Search**: Preventing hallucinated citations and context fragmentation using Hybrid BM25 + AST parent-child chunking.

---

## 3. Verifiable AI Operating Modes & Privacy Architecture

ConnectAI displays its exact operating status in `/settings` and across AI views:

- **On-Device AI**: Only shown as active when a genuine local model runtime is loaded in browser memory.
- **Local Retrieval (Active)**: Searches locally cached Community Memory entries, posts, and profiles in `localStorage` (`connectai_hackathon_prototype_v2`) without sending data to external servers.
- **Demo Mode (Active)**: Uses transparent, deterministic keyword/metadata ranking and Problem-to-Person matching without requiring external API keys.
- **Human Verification Rule**: Solutions are never automatically marked as `Verified` solely because of AI output; verification requires explicit author or moderator confirmation.

---

## 4. Running & Building Locally

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Type-check and build production bundle
npm run lint
npm run build
```

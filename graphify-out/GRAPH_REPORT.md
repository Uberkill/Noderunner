# Graph Report - .  (2026-06-30)

## Corpus Check
- Corpus is ~10,791 words - fits in a single context window. You may not need a graph.

## Summary
- 118 nodes · 167 edges · 18 communities (10 shown, 8 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Audio Resonance Engine|Audio Resonance Engine]]
- [[_COMMUNITY_UI Overlays & VFX|UI Overlays & VFX]]
- [[_COMMUNITY_NPM Package Config|NPM Package Config]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Global State (Zustand)|Global State (Zustand)]]
- [[_COMMUNITY_Development Dependencies|Development Dependencies]]
- [[_COMMUNITY_Narrative Engine|Narrative Engine]]
- [[_COMMUNITY_Node Data Mapping|Node Data Mapping]]
- [[_COMMUNITY_WebGL Scene Graph|WebGL Scene Graph]]
- [[_COMMUNITY_App Initialization|App Initialization]]
- [[_COMMUNITY_Voice Synthesizer|Voice Synthesizer]]
- [[_COMMUNITY_Architecture Docs|Architecture Docs]]
- [[_COMMUNITY_Performance Docs|Performance Docs]]
- [[_COMMUNITY_Core Architecture|Core Architecture]]
- [[_COMMUNITY_Root Architecture|Root Architecture]]
- [[_COMMUNITY_Audio Documentation|Audio Documentation]]
- [[_COMMUNITY_CICD Pipeline|CI/CD Pipeline]]

## God Nodes (most connected - your core abstractions)
1. `AudioManager` - 24 edges
2. `useGameStore` - 15 edges
3. `App()` - 11 edges
4. `StoryGenerator` - 9 edges
5. `scripts` - 7 edges
6. `GameConfig` - 7 edges
7. `Scene` - 7 edges
8. `VoiceManager` - 6 edges
9. `ErrorBoundary` - 5 edges
10. `STORY_DATA` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Global State via Zustand` --references--> `useGameStore`  [INFERRED]
  .agent-instructions.md → src/core/store.js
- `State Management` --references--> `useGameStore`  [INFERRED]
  CONTRIBUTING.md → src/core/store.js
- `Domain-Driven Architecture` --semantically_similar_to--> `The WebGL / DOM Boundary`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → .agent-instructions.md
- `State Management` --semantically_similar_to--> `Global State via Zustand`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → .agent-instructions.md
- `Performance & Memory Management` --semantically_similar_to--> `Performance & Memory Strictness`  [INFERRED] [semantically similar]
  CONTRIBUTING.md → .agent-instructions.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **State Persistence System** — core_store_usegamestore, core_store_loadstate, core_store_savestate [EXTRACTED 1.00]
- **Audio & Voice Subsystem** — audio_audiomanager_audiomanager, src_voicemanager_voicemanager [INFERRED 0.85]
- **Story Generation Engine** — core_storygenerator_storygenerator, core_storydata_story_data, core_gameconfig_gameconfig [EXTRACTED 1.00]
- **Radial Stream Architecture Layers** — architecture_root_layer, architecture_engine_layer, architecture_ui_layer, architecture_core_managers [EXTRACTED 1.00]
- **Strict Domain Separation Rules** — contributing_domain_architecture, agent_instructions_webgl_dom_boundary, architecture_engine_layer, architecture_ui_layer [INFERRED 0.95]

## Communities (18 total, 8 thin omitted)

### Community 1 - "UI Overlays & VFX"
Cohesion: 0.20
Nodes (7): ScreenFX, App(), getPhosphorColor(), BOOT_SEQUENCE, BootScreen(), ManualOverlay, Overlay

### Community 2 - "NPM Package Config"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, deploy, dev, lint, predeploy (+3 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.18
Nodes (11): dependencies, framer-motion, postprocessing, react, react-dom, @react-three/drei, @react-three/fiber, @react-three/postprocessing (+3 more)

### Community 4 - "Global State (Zustand)"
Cohesion: 0.38
Nodes (6): Global State via Zustand, State Management, loadState(), saveState(), useGameStore, Assistant()

### Community 5 - "Development Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, gh-pages, @types/react, @types/react-dom (+2 more)

### Community 6 - "Narrative Engine"
Cohesion: 0.44
Nodes (4): STORY_DATA, StoryGenerator, DataDriveTracker(), handleReadLog

### Community 7 - "Node Data Mapping"
Cohesion: 0.36
Nodes (5): _localTarget, _pointOnRay, _targetScaleVec, _worldPos, GameConfig

### Community 8 - "WebGL Scene Graph"
Cohesion: 0.29
Nodes (6): DataCluster, DataPoint, CameraRig(), WebGL Retro Pipeline, Scene, Shard()

### Community 11 - "Architecture Docs"
Cohesion: 0.50
Nodes (4): The WebGL / DOM Boundary, 3D Engine Layer, 2D User Interface Layer, Domain-Driven Architecture

## Knowledge Gaps
- **46 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AudioManager` connect `Audio Resonance Engine` to `UI Overlays & VFX`, `Global State (Zustand)`, `Node Data Mapping`, `WebGL Scene Graph`, `Voice Synthesizer`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Why does `App()` connect `UI Overlays & VFX` to `WebGL Scene Graph`, `Audio Resonance Engine`, `Global State (Zustand)`, `Narrative Engine`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Global State (Zustand)` to `WebGL Scene Graph`, `UI Overlays & VFX`, `Narrative Engine`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useGameStore` (e.g. with `Global State via Zustand` and `State Management`) actually correct?**
  _`useGameStore` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
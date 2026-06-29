# Radial Stream (O-NET DIAG_MODE)

A highly immersive, story-driven 3D web experience built with React Three Fiber, Three.js, and Zustand. In **Radial Stream**, players act as system technicians navigating the corrupted architecture of "O-NET," attempting to rebuild shattered data fragments by tracing 3D node constellations across varying depths of the system.

## 🚀 Features

- **Immersive 3D Navigation:** Interactive 3D data clusters mapped in real-time. Physics-based cursor magnetism and dynamic edge generation.
- **Deep Narrative Lore:** Uncover the cryptic history of the INGRAM MAINFRAME through corrupted data logs and environmental storytelling.
- **Procedural Depth Generation:** Mathematically scaled difficulty, node density, and audio resonance as you traverse deeper into the system.
- **Audio Resonance Engine:** Bespoke Web Audio API synthesizer that layers algorithmic dissonance and harmony based on sector depth and interaction.
- **Retro-Futuristic Aesthetics:** Post-processing stack featuring volumetric bloom, chromatic aberration, and algorithmic glitch effects.

## 📂 Architecture

The codebase is built for scalability, strictly separating domains:

- `src/3d/`: WebGL, rendering logic, physical node states (`Scene.jsx`, `DataCluster.jsx`, `DataPoint.jsx`)
- `src/ui/`: DOM-based overlays, HUD elements, and menus (`Overlay.jsx`, `BootScreen.jsx`, `Assistant.jsx`)
- `src/audio/`: Synthesizer algorithms and the core audio context manager (`AudioManager.js`)
- `src/core/`: Global state management, narrative generation, and configuration (`store.js`, `GameConfig.js`, `StoryGenerator.js`)

## 🛠️ Installation & Setup

1. **Clone the repository** (if applicable) or navigate to the project directory.
2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: `--legacy-peer-deps` is required due to React Three Drei and Postprocessing dependency graphs.)*
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Build for production:**
   ```bash
   npm run build
   ```

## 🧠 State Management

Global state is handled seamlessly via **Zustand** (`src/core/store.js`). Components only subscribe to the specific slices of state they need, entirely eliminating prop-drilling and preventing unnecessary WebGL re-renders.

## 🤝 Contributing

If you wish to expand the lore, introduce new mechanics, or optimize the WebGL pipeline, please read our [CONTRIBUTING.md](./CONTRIBUTING.md) and the [.agent-instructions.md](./.agent-instructions.md) files to understand our design patterns and workflow requirements.

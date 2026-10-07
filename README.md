# Radial Stream (O-NET DIAG_MODE)

An interactive 3D web experience built with React Three Fiber, Three.js, Web Audio API, and Zustand. Players trace and reconstruct 3D node constellations across sector depths, uncovering system telemetry through environmental narrative logs.

---

## Technical Features

- **Interactive 3D Constellations:** Dynamic 3D data clusters rendered in WebGL with raycasted cursor interaction and procedural edge generation.
- **Procedural Depth Scaling:** Algorithmic calculation of node density, navigation thresholds, and visual complexity based on sector progression.
- **Procedural Web Audio Synthesis:** Custom Web Audio API synthesizer that layers interactive algorithmic audio cues based on sector depth and interaction states.
- **Post-Processing Pipeline:** Custom visual shaders featuring bloom, chromatic aberration, and noise passes via `@react-three/postprocessing`.
- **Domain-Driven Architecture:** Clean isolation between 3D canvas rendering (`src/3d/`), DOM HUD overlays (`src/ui/`), audio engine (`src/audio/`), and state management (`src/core/`).

---

## Architecture

- `src/3d/`: WebGL scenes, node clusters, shaders, and camera controllers (`Scene.jsx`, `DataCluster.jsx`, `DataPoint.jsx`)
- `src/ui/`: Monospace DOM overlays, HUD telemetry, and modal dialogues (`Overlay.jsx`, `BootScreen.jsx`, `Assistant.jsx`)
- `src/audio/`: Algorithmic audio context and node lifecycle managers (`AudioManager.js`)
- `src/core/`: Zustand state store, configuration parameters, and procedural log generators (`store.js`, `GameConfig.js`)

---

## Getting Started

### Installation
```bash
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` aligns React Three Fiber and Three.js peer dependency graphs.)*

### Development & Build
```bash
npm run dev      # Start Vite development server
npm run build    # Compile production bundle
```

---

## Contributing

Review [CONTRIBUTING.md](./CONTRIBUTING.md) for architectural boundaries, memory disposal practices, and rendering conventions.

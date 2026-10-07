# Contributing to Radial Stream

Guidelines for contributing to the Radial Stream codebase to maintain architectural integrity, performance, and consistent code style.

---

## Domain-Driven Architecture

Adhere strictly to the separation of concerns across directory boundaries:

- **`src/3d/`**: WebGL renderers, React Three Fiber scenes, Three.js shaders, and post-processing pipelines.
- **`src/ui/`**: DOM overlays, HUD elements, and interface components.
- **`src/audio/`**: Web Audio API synthesizers and procedural sound generators.
- **`src/core/`**: Zustand state stores, procedural generation algorithms, and game configuration.

Do not couple 3D canvas logic directly to DOM overlay code within single components; bridge all cross-domain communication via Zustand.

---

## State Management

Global state is managed via Zustand in `src/core/store.js`. Avoid React Context or multi-tier prop drilling. Select precise atomic properties in components using selectors to avoid unnecessary re-renders.

---

## Performance & WebGL Memory Management

1. **Resource Disposal:** Ensure any imperatively allocated `BufferGeometry` or `Material` instances are disposed of cleanly when unmounted.
2. **Audio Context Lifecycle:** Reuse the singleton `audioManager` rather than instantiating redundant `AudioContext` instances. Disconnect oscillator nodes when sector depth transitions complete.
3. **Render Loop Allocation (`useFrame`):** Never instantiate objects (e.g., `new THREE.Vector3()`) within the `useFrame` render loop. Pre-allocate vectors once outside the loop and mutate them imperatively using `.copy()` or `.lerp()`.

---

## Visual Design & Interaction

- Adhere to the defined monospace palette (Phosphor Green, Amber, Cyan, Magenta, Red).
- Use Framer Motion for state transitions on DOM overlays.
- Preserve consistent typography scale using the project's terminal theme classes.

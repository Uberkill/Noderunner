# Contributing to Radial Stream

We welcome contributions to Radial Stream! To ensure the project remains scalable, performant, and beautifully organized, please follow these guidelines.

## 🏗️ Domain-Driven Architecture

When adding new features or modifying existing code, adhere to our strict directory structure:

- **`src/3d/`**: Strictly for WebGL, `react-three-fiber` canvases, Drei helpers, and post-processing.
- **`src/ui/`**: Strictly for DOM elements, HTML overlays, and `framer-motion` UI components. 
- **`src/audio/`**: Strictly for Web Audio API logic and sound management.
- **`src/core/`**: Strictly for data stores (`zustand`), configurations, and pure algorithmic logic (like the `StoryGenerator`).

*Rule of thumb: Never mix 3D Canvas logic with DOM UI logic in the same file. Use `zustand` to bridge communication between them.*

## 💾 State Management (Zustand)

Do not use React Context or extensive prop-drilling. 
If a variable needs to be accessed across domains (e.g., a UI button triggers a 3D animation), use the global store in `src/core/store.js`.

- Only extract the specific variables you need from `useGameStore()` in your components to prevent unnecessary re-renders.

## 🎮 Performance & Memory Management (Crucial)

Radial Stream relies heavily on Three.js and WebGL. Memory leaks will crash the browser.

1. **Geometry/Material Disposal**: If you dynamically create `THREE.BufferGeometry` or `THREE.Material`, you MUST dispose of it, or preferably use declarative R3F components (`<bufferGeometry>`, `<meshStandardMaterial>`) which handle disposal automatically upon unmounting.
2. **Audio Context Limits**: Do not instantiate new `AudioContext` objects. Always use the singleton `audioManager`. Ensure any continuously running `OscillatorNode` is tracked and stopped when no longer needed (e.g., upon depth changes).
3. **`useFrame` optimization**: Do not instantiate new objects (e.g., `new THREE.Vector3()`) inside a `useFrame` loop. Pre-allocate vectors outside the loop and mutate them inside using `.copy()`, `.set()`, or `.lerp()`.

## 🎨 Aesthetic Guidelines

- **No generic colors**. Stick to the curated color palette (Phosphor Green, Amber, Cyan, Magenta, Red).
- Use `framer-motion` for smooth UI transitions. Never abruptly toggle UI components.
- Rely on the established `mono-text` font class for the retro terminal aesthetic.

## 🤖 AI Agents

If you are an AI Agent operating on this codebase, you MUST read `.agent-instructions.md` before making structural or logic changes.

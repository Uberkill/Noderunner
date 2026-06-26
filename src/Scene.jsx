import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Noise, Bloom, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import DataCluster from './DataCluster';
import { storyGenerator } from './StoryGenerator';
import { audioManager } from './AudioManager';



function CameraRig({ isWarping, targetPosRef, controlsRef }) {
    useFrame((state, delta) => {
        if (isWarping) {
            state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 2, delta * 2);
        } else {
            // Smoothly snap OrbitControls target to the selected node
            if (controlsRef.current && targetPosRef.current) {
                controlsRef.current.target.lerp(targetPosRef.current, delta * 4);
                controlsRef.current.update();
            }
        }
    });
    return null;
}

export default React.memo(function Scene({ onSelect, depth, phosphorColor, onComboEvent, onProgressUpdate }) {
    const [sector, setSector] = useState(null);
    const [isWarping, setIsWarping] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const controlsRef = useRef();
    const targetPosRef = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        if (depth > 0) { // Init or Warp
            setIsWarping(true);
            setIsTransitioning(false);
            setTimeout(() => {
                const newSector = storyGenerator.generateSector(depth);
                setSector(newSector);
                
                const startNode = newSector.nodes.find(n => n.type === 'start');
                if (startNode) {
                    targetPosRef.current.set(...startNode.position);
                }

                setIsWarping(false);
            }, 2000);
        }
    }, [depth]);

    const handleHover = (data) => {
        if (!sector) return;

        // Audio handled here on hover now
        const isKey = (data.id === sector.keyNodeId);
        audioManager.playDataClick(data.index, isKey);
    };

    const handleSelect = (data) => {
        if (!sector) return;

        audioManager.initialize();

        const isKey = (data.id === sector.keyNodeId);
        
        audioManager.playDataClick(data.index, isKey);

        if (isKey && !isTransitioning) {
            setIsTransitioning(true);
        }

        // Snap camera to the clicked node
        targetPosRef.current.set(...data.position);

        // Open the overlay for ANY node clicked so the user can read lore
        onSelect(data);
    };

    const keyNode = sector?.nodes.find(n => n.id === sector.keyNodeId);

    return (
        <Canvas 
            camera={{ position: [0, 0, 30], fov: 60 }}
            onPointerMissed={() => onSelect(null)}
        >
            <color attach="background" args={['#000308']} />

            <Stars
                radius={100} depth={50} count={5000} factor={isWarping ? 8 : 4} saturation={0} fade speed={isWarping ? 20 : 1}
            />

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />

            <group visible={!isWarping}>
                {/* 3D Content goes here */}
                {sector && <DataCluster key={sector.id} sectorData={sector} phosphorColor={phosphorColor} onSelect={handleSelect} onHover={handleHover} onComboEvent={onComboEvent} onProgressUpdate={onProgressUpdate} />}
            </group>

            <CameraRig isWarping={isWarping} targetPosRef={targetPosRef} controlsRef={controlsRef} />
            <OrbitControls ref={controlsRef} enablePan={false} enableZoom={!isWarping} autoRotate={!isWarping && !targetPosRef.current.lengthSq()} autoRotateSpeed={0.5} maxDistance={60} />

            {/* The WebGL Retro Pipeline */}
            <EffectComposer disableNormalPass>
                {/* 1. Core Light Bleed */}
                <Bloom 
                    luminanceThreshold={0.1} 
                    luminanceSmoothing={0.9} 
                    intensity={2.0} 
                />

                {/* 2. Surface Interference */}
                <Noise opacity={0.4} />
                <ChromaticAberration offset={[0.002, 0.002]} />
                <Glitch
                    delay={[0.1, 0.3]}
                    duration={[0.1, 0.4]}
                    strength={[0.1, 0.3]}
                    mode={GlitchMode.SPORADIC}
                    active={isWarping}
                />
            </EffectComposer>
        </Canvas>
    );
});

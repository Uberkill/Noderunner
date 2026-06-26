import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { audioManager } from './AudioManager';
import { GameConfig } from './GameConfig';

const _pointOnRay = new THREE.Vector3();
const _localTarget = new THREE.Vector3();
const _targetScaleVec = new THREE.Vector3();
const _worldPos = new THREE.Vector3();

export default React.memo(function DataPoint({ index, sharedPositions, position, data, onClick, onHover, isSelected, isCaptured, canConnect, phosphorColor }) {
    const localRef = useRef();
    const meshRef = localRef;
    const torusRef = useRef();
    // Internal state for hover
    const [hovered, setHover] = useState(false);

    // Physics State
    const initialPos = useRef(new THREE.Vector3(...position));
    const isMagnetized = useRef(false);
    const targetPos = useRef(new THREE.Vector3(...position));

    useFrame((state, delta) => {
        if (!meshRef?.current) return;
        const mesh = meshRef.current; // Convenience

        // --- 1. MAGNETIC FIELD CALCULATION ---
        const ray = state.raycaster.ray;

        // Calculate distance from this node's home to the "Cursor Beam"
        const dist = ray.distanceToPoint(initialPos.current);
        const magnetRadius = GameConfig.PHYSICS.MAGNET_RADIUS;

        // Magnetism works for all nodes
        if (dist < magnetRadius) {
            // --- ENTERING FIELD ---
            if (!isMagnetized.current) {
                isMagnetized.current = true;
                // Play Sound on Enter (The "Strum")
                if (!isCaptured) onClick(data, canConnect);
                if (onHover) onHover(data);
            }

            // Calculate "Magnetic Center" (Point on ray closest to node)
            ray.closestPointToPoint(initialPos.current, _pointOnRay);

            // Move towards it
            targetPos.current.lerp(_pointOnRay, GameConfig.PHYSICS.MAGNET_PULL_SPEED);
        } else {
            // --- EXITING FIELD ---
            isMagnetized.current = false;
            // Return home
            targetPos.current.copy(initialPos.current);
        }

        // --- 2. PHYSICS UPDATE (Smooth Movement) ---
        // Convert World Target to Local Coordinate (relative to Group's position)
        _localTarget.copy(targetPos.current).sub(initialPos.current);

        // Move current position towards target position (Soft Spring)
        mesh.position.lerp(_localTarget, GameConfig.PHYSICS.SPRING_SPEED);

        // --- 3. VISUALS ---
        
        // Pulse effect + Magnet Glow
        const isPulsing = canConnect;
        let targetScale = (hovered || isSelected || isMagnetized.current) ? 1.5 : (isCaptured ? 0.8 : (isPulsing ? 0.6 : 0.4));
        _targetScaleVec.set(targetScale, targetScale, targetScale);
        mesh.scale.lerp(_targetScaleVec, 0.1);

        // Rotate slightly if magnetized or pulsing
        if (isMagnetized.current || isPulsing) {
            mesh.rotation.x += delta * (isPulsing ? 0.5 : 2);
            mesh.rotation.y += delta * (isPulsing ? 0.5 : 2);
        }

        // Spin Torus constantly
        if (torusRef.current) {
            torusRef.current.rotation.x += delta * 2;
            torusRef.current.rotation.y += delta;
        }

        // Dynamically assign material color based on connection state
        if (mesh.material && phosphorColor) {
            const pColorHex = parseInt(phosphorColor.replace('#', ''), 16);
            let baseColorHex = 0xffffff; // Normal unlit = white
            
            if (data.type === 'start') {
                baseColorHex = pColorHex; // Start node uses the current stage's phosphor color
            } else if (data.type === 'hazard') {
                baseColorHex = 0xff0000; // Red for hazards
            } else if (data.isKey) {
                baseColorHex = 0xffffff; // White beacon for the Gateway Key
            }

            // If it's captured, override its color with phosphor color, 
            // unless it's a special node type.
            const displayColorHex = (isCaptured && !data.isStart && !data.isKey && data.type !== 'hazard') ? pColorHex : baseColorHex;

            mesh.material.color.setHex(displayColorHex);
            mesh.material.emissive.setHex(displayColorHex);
            
            if (isCaptured) {
                mesh.material.emissiveIntensity = 2.0; // Solid drawn path
                mesh.material.opacity = 1.0;
            } else if (canConnect) {
                // Pulsing
                mesh.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
            } else {
                // Blueprint state (Out of reach)
                mesh.material.emissiveIntensity = 0.1; 
                mesh.material.opacity = 0.3;
                mesh.material.transparent = true;
            }

            if (hovered || isSelected || isMagnetized.current) {
                mesh.material.emissiveIntensity = 5.0; // Highlight
                mesh.material.opacity = 1.0;
            }
        }

        // --- 4. SHARE WORLD POSITION FOR LINES ---
        mesh.getWorldPosition(_worldPos);
        sharedPositions[index * 3] = _worldPos.x;
        sharedPositions[index * 3 + 1] = _worldPos.y;
        sharedPositions[index * 3 + 2] = _worldPos.z;
    });

    return (
        <group position={position}>
            {/* We move the mesh itself, not the group, to keep 'position' prop as the "Home" anchor if needed, 
                but actually simplest is to let the mesh float inside the group, or just move the mesh.
                Let's move the mesh relative to group 0,0,0 if we passed position to group. 
                WAIT: position prop is passed to Group. So mesh is at 0,0,0 local. 
                So we need to do math relative to World or Local?
                
                Simplest: Ignore Group position prop for rendering, apply it to our internal Vector3 logic 
                and move the MESH to the absolute position. 
                
                OR: Keep Group at 'position', and mesh moves relative to it.
                Ray calc needs WORLD coordinates.
                Group is at World 'position'. 
                Mesh is at Local 0,0,0.
                
                Let's change logic: 
                Group stays at 'position' (Home). 
                Mesh moves relative to home.
                targetPos should be relative offset?
                
                Let's adjust:
                initialPos (World) = position.
                Ray calc (World).
                Result (World).
                Mesh Position (Local) = Result (World) - Group (World).
             */}

            {/* All nodes are fully interactable, but hovering out of reach nodes won't snap the camera */}
            <mesh
                ref={meshRef}
                position={[0, 0, 0]} // Starts at local center
                onPointerDown={(e) => {
                    e.stopPropagation();
                    if (canConnect || isCaptured) {
                        onClick(data, canConnect);
                    }
                }}
                onPointerOver={() => {
                    if (canConnect || isCaptured) {
                        document.body.style.cursor = 'pointer';
                        setHover(true);
                    }
                    
                    if (onHover) onHover(data); 
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                    setHover(false);
                }}
            >
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {data.isKey && (
                <mesh ref={torusRef} position={[0, 0, 0]}>
                    <torusGeometry args={[0.8, 0.05, 16, 100]} />
                    <meshBasicMaterial color="#ffffff" wireframe={true} />
                </mesh>
            )}

            {/* Label - Attach to Mesh visually? No, separate HTML */}
            {(hovered || isSelected) && (
                <Html distanceFactor={10} position={[0.5, 0, 0]}>
                    {/* ... label content ... */}
                    <div className="mono-text" style={{
                        color: 'var(--color-phosphor)',
                        fontSize: '12px',
                        textShadow: '0 0 5px var(--color-phosphor)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap'
                    }}>
                        {data.id} // {data.title}
                    </div>
                </Html>
            )}
        </group>
    );
});

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export default function Shard({ position, data, onClick, isSelected }) {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    // Rotate the shard slowly
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.2;
            mesh.current.rotation.y += delta * 0.1;

            // Pulse effect when hovered or selected
            const scaleTarget = hovered || isSelected ? 1.2 : 1;
            mesh.current.scale.lerp({ x: scaleTarget, y: scaleTarget, z: scaleTarget }, 0.1);
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={mesh}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(data);
                }}
                onPointerOver={() => {
                    document.body.style.cursor = 'pointer';
                    setHover(true);
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                    setHover(false);
                }}
            >
                <octahedronGeometry args={[0.5, 0]} />
                <meshPhysicalMaterial
                    color={hovered || isSelected ? "#00f0ff" : "#ffffff"}
                    transmission={0.6}
                    opacity={0.5}
                    metalness={0.1}
                    roughness={0}
                    ior={1.5}
                    thickness={1}
                    emissive={hovered || isSelected ? "#00f0ff" : "#000000"}
                    emissiveIntensity={hovered || isSelected ? 2 : 0}
                    transparent
                />
            </mesh>

            {/* Label on hover */}
            {(hovered || isSelected) && (
                <Html distanceFactor={10}>
                    <div style={{
                        color: '#00f0ff',
                        fontFamily: 'monospace',
                        textShadow: '0 0 5px #00f0ff',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        fontSize: '14px',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '4px 8px',
                        border: '1px solid #00f0ff'
                    }}>
                        {data.title}
                    </div>
                </Html>
            )}
        </group>
    );
}

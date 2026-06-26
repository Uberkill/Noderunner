import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DataPoint from './DataPoint';
import { Line } from '@react-three/drei';
import { audioManager } from './AudioManager';

export default React.memo(function DataCluster({ sectorData, onSelect, onHover, phosphorColor, onComboEvent, onProgressUpdate }) {
    const [selectedId, setSelectedId] = useState(null);
    const [capturedNodes, setCapturedNodes] = useState(new Set([sectorData.startNodeId]));
    const [activeEdges, setActiveEdges] = useState([]); // array of {sIdx, eIdx}
    const MAX_CONNECT_DIST_SQ = 60; // Increased to 60 to prevent dead ends, but still prevent cross-map jumps

    const points = sectorData.nodes;
    
    const totalSafeNodes = useMemo(() => {
        return points.filter(p => p.type !== 'hazard').length;
    }, [points]);

    useEffect(() => {
        if (onProgressUpdate) {
            onProgressUpdate(capturedNodes.size, totalSafeNodes);
        }
    }, [capturedNodes.size, totalSafeNodes, onProgressUpdate]);
    
    // We keep nodePositions for local use if needed, though with Drei Line we can just use points
    const nodePositions = useRef(new Float32Array(points.length * 3));

    useEffect(() => {
        // Initialize static array
        points.forEach((p, i) => {
            nodePositions.current[i * 3] = p.position[0];
            nodePositions.current[i * 3 + 1] = p.position[1];
            nodePositions.current[i * 3 + 2] = p.position[2];
        });
    }, [points]);

    // Stable Reference for Click Handler Closure
    const handlePointClickRef = useRef();
    handlePointClickRef.current = (data, canConnect) => {
        const isCaptured = capturedNodes.has(data.id);
        
        if (isCaptured) {
            setSelectedId(data.id);
            onSelect(data);
            return;
        }

        if (!canConnect) return; // Prevent connecting if out of range

        if (data.type === 'hazard') {
            audioManager.playErrorSound();
            
            if (onComboEvent) onComboEvent('break');

            const numToBreak = Math.floor(Math.random() * 3) + 2; // Break 2 to 4 connections
            
            setActiveEdges(prevEdges => {
                if (prevEdges.length === 0) return prevEdges;
                const newEdges = [...prevEdges];
                const removedEdges = newEdges.splice(-numToBreak, numToBreak);
                
                setCapturedNodes(prevNodes => {
                    const newNodes = new Set(prevNodes);
                    removedEdges.forEach(edge => {
                        const nodeId = points[edge.eIdx].id;
                        newNodes.delete(nodeId);
                    });
                    return newNodes;
                });
                
                return newEdges;
            });
            
            return;
        }

        // Find the absolute closest captured node to draw a branch from
        let closestNodeIdx = -1;
        let minDistSq = Infinity;
        const p1 = data.position;
        
        points.forEach((p, index) => {
            if (capturedNodes.has(p.id)) {
                const distSq = (p1[0]-p.position[0])**2 + (p1[1]-p.position[1])**2 + (p1[2]-p.position[2])**2;
                if (distSq < minDistSq) {
                    minDistSq = distSq;
                    closestNodeIdx = index;
                }
            }
        });

        if (closestNodeIdx !== -1 && minDistSq <= MAX_CONNECT_DIST_SQ) {
            setCapturedNodes(prev => new Set([...prev, data.id]));
            setActiveEdges(prev => [...prev, { sIdx: closestNodeIdx, eIdx: data.index }]);
            setSelectedId(data.id);
            if (onComboEvent) onComboEvent('hit');
            onSelect(data); // Snap camera only on successful connect
        }
    };

    // Absolutely stable function reference for React.memo
    const handlePointClick = React.useCallback((data, canConnect) => {
        if (handlePointClickRef.current) {
            handlePointClickRef.current(data, canConnect);
        }
    }, []);

    // Construct the geometry for the connected lines
    const lineGeo = useMemo(() => {
        if (activeEdges.length === 0) return null;
        const positions = new Float32Array(activeEdges.flatMap(edge => {
            const p1 = points[edge.sIdx].position;
            const p2 = points[edge.eIdx].position;
            return [...p1, ...p2];
        }));
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [activeEdges, points]);

    return (
        <group>
            {points.map((data, i) => {
                const isCaptured = capturedNodes.has(data.id);
                
                let canConnect = false;
                if (!isCaptured) {
                    // Check if it's within range of ANY captured node
                    for (let j = 0; j < points.length; j++) {
                        const p = points[j];
                        if (capturedNodes.has(p.id)) {
                            const distSq = (data.position[0]-p.position[0])**2 + (data.position[1]-p.position[1])**2 + (data.position[2]-p.position[2])**2;
                            if (distSq <= MAX_CONNECT_DIST_SQ) {
                                canConnect = true;
                                break;
                            }
                        }
                    }
                }

                return (
                    <DataPoint
                        key={data.id}
                        index={i}
                        sharedPositions={nodePositions.current}
                        position={data.position}
                        data={data}
                        onClick={handlePointClick}
                        onHover={onHover}
                        isSelected={selectedId === data.id}
                        isCaptured={isCaptured}
                        canConnect={canConnect}
                        phosphorColor={phosphorColor}
                    />
                );
            })}

            {/* DYNAMIC COLORED LINES RENDERER USING NATIVE lineSegments */}
            {lineGeo && (
                <lineSegments geometry={lineGeo}>
                    <lineBasicMaterial attach="material" color={phosphorColor} transparent opacity={0.8} />
                </lineSegments>
            )}
        </group>
    );
});

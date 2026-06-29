import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import DataPoint from './DataPoint';
import { audioManager } from '../audio/AudioManager';
import { useGameStore } from '../core/store';

export default React.memo(function DataCluster({ sectorData, onSelect, onHover, phosphorColor }) {
    const { setComboCount, setMappingProgress } = useGameStore();
    const [selectedId, setSelectedId] = useState(null);
    const [capturedNodes, setCapturedNodes] = useState(new Set([sectorData.startNodeId]));
    const [activeEdges, setActiveEdges] = useState([]); // array of {sIdx, eIdx}
    const MAX_CONNECT_DIST_SQ = 60; // Increased to 60 to prevent dead ends, but still prevent cross-map jumps

    const points = sectorData.nodes;
    
    const totalSafeNodes = useMemo(() => {
        return points.filter(p => p.type !== 'hazard').length;
    }, [points]);

    useEffect(() => {
        setMappingProgress({ captured: capturedNodes.size, total: totalSafeNodes });
        if (capturedNodes.size === totalSafeNodes && totalSafeNodes > 0 && !useGameStore.getState().has100Percent) {
            useGameStore.getState().setHas100Percent(true);
            useGameStore.getState().setLastHint("DIAG_LOG: SECTOR TRACE 100% [ BONUS DATA UNLOCKED ]");
            audioManager.playNote(880, 0);
            audioManager.playNote(1046, 0.2);
            audioManager.playNote(1318, 0.4);
        }
    }, [capturedNodes.size, totalSafeNodes, setMappingProgress]);
    
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
            
            setComboCount(0);

            const numToBreak = Math.floor(Math.random() * 3) + 2; // Break 2 to 4 connections
            
            setActiveEdges(prevEdges => {
                if (prevEdges.length === 0) return prevEdges;
                const newEdges = [...prevEdges];
                const removedEdges = newEdges.splice(-numToBreak, numToBreak);
                
                setTimeout(() => {
                    setCapturedNodes(prevNodes => {
                        const newNodes = new Set(prevNodes);
                        removedEdges.forEach(edge => {
                            const nodeId = points[edge.eIdx].id;
                            newNodes.delete(nodeId);
                        });
                        return newNodes;
                    });
                }, 0);
                
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
            setComboCount(c => c + 1);
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
    const linePositions = useMemo(() => {
        if (activeEdges.length === 0) return null;
        return new Float32Array(activeEdges.length * 6);
    }, [activeEdges.length]);

    const geoRef = useRef();

    useFrame(() => {
        if (geoRef.current && activeEdges.length > 0) {
            const positions = geoRef.current.attributes.position.array;
            for (let i = 0; i < activeEdges.length; i++) {
                const sIdx = activeEdges[i].sIdx;
                const eIdx = activeEdges[i].eIdx;
                positions[i * 6] = nodePositions.current[sIdx * 3];
                positions[i * 6 + 1] = nodePositions.current[sIdx * 3 + 1];
                positions[i * 6 + 2] = nodePositions.current[sIdx * 3 + 2];
                positions[i * 6 + 3] = nodePositions.current[eIdx * 3];
                positions[i * 6 + 4] = nodePositions.current[eIdx * 3 + 1];
                positions[i * 6 + 5] = nodePositions.current[eIdx * 3 + 2];
            }
            geoRef.current.attributes.position.needsUpdate = true;
        }
    });

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
            {linePositions && (
                <lineSegments>
                    <bufferGeometry ref={geoRef} key={activeEdges.length}>
                        <bufferAttribute
                            attach="attributes-position"
                            count={linePositions.length / 3}
                            array={linePositions}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial attach="material" color={phosphorColor} transparent opacity={0.8} />
                </lineSegments>
            )}
        </group>
    );
});

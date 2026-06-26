import { v4 as uuidv4 } from 'uuid';
import { GameConfig } from './GameConfig';
import { STORY_DATA } from './StoryData';

export class StoryGenerator {
    generateSector(depth) {
        const isDeep = depth >= GameConfig.SCALING.WIN_DEPTH;
        
        let nodeCount = GameConfig.SCALING.BASE_NODE_COUNT + (depth * GameConfig.SCALING.NODES_PER_DEPTH);
        if (nodeCount > GameConfig.SCALING.MAX_NODES) nodeCount = GameConfig.SCALING.MAX_NODES;

        // 1. Generate Raw Positions
        const rawPositions = [];
        for (let i = 0; i < nodeCount; i++) {
            rawPositions.push(this.getRandomPosition());
        }

        const distSq = (p1, p2) => (p1[0]-p2[0])**2 + (p1[1]-p2[1])**2 + (p1[2]-p2[2])**2;

        // 2. Find Start Node (Closest to Camera / z=30)
        let startIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < nodeCount; i++) {
            const p = rawPositions[i];
            const d = (p[0])**2 + (p[1])**2 + (p[2]-30)**2;
            if (d < minDist) {
                minDist = d;
                startIdx = i;
            }
        }

        // 3. Find Key Node (Furthest from Start)
        let endIdx = 0;
        let maxDist = 0;
        for (let i = 0; i < nodeCount; i++) {
            if (i === startIdx) continue;
            const d = distSq(rawPositions[startIdx], rawPositions[i]);
            if (d > maxDist) {
                maxDist = d;
                endIdx = i;
            }
        }

        // 4. Select exactly 5 indices for Lore Fragments
        const availableIndices = [];
        for (let i = 0; i < nodeCount; i++) {
            if (i !== startIdx && i !== endIdx) availableIndices.push(i);
        }
        
        const loreIndices = new Set();
        const loreAssignment = {}; // Map node index -> fragment index
        
        // Ensure we don't try to place more fragments than available nodes
        const numLoreNodes = Math.min(5, availableIndices.length); 
        
        for (let f = 0; f < numLoreNodes; f++) {
            const rIdx = Math.floor(Math.random() * availableIndices.length);
            const nodeIndex = availableIndices.splice(rIdx, 1)[0];
            loreIndices.add(nodeIndex);
            loreAssignment[nodeIndex] = f; // 0 to 4
        }

        // Safely fetch stage data (fallback to stage 5 if beyond)
        const stageDepth = Math.min(depth, 5);
        const stageLore = STORY_DATA[stageDepth] || STORY_DATA[5];

        // 5. Build Nodes Array
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            let type = 'normal';
            let isKey = false;
            let isStart = false;
            let title = '';
            let description = '';
            let fragmentId = null;

            if (i === startIdx) {
                type = 'start';
                isStart = true;
                title = "UPLINK_ORIGIN";
                description = "Neural link established. The network is dark. Find the 5 fragments to unlock the sector archive.";
            } else if (i === endIdx) {
                type = isDeep ? 'blackbox' : 'key';
                isKey = true;
                title = isDeep ? ">>> THE BLACK BOX <<<" : "ENCRYPTED GATEWAY";
                description = isDeep ? "CRITICAL SYSTEM SUCCESS.\n\nPROMETHEUS CORE LOCATED." : "Gateway located. Sequence complete. Ready for descent.";
            } else if (loreIndices.has(i)) {
                type = 'corrupted'; // This is a lore fragment
                const fragIndex = loreAssignment[i];
                const fragmentData = stageLore.fragments[fragIndex];
                title = fragmentData.title;
                description = fragmentData.text;
                fragmentId = fragmentData.id;
            } else {
                if (Math.random() < 0.15) { 
                    type = 'hazard';
                    title = "WARNING: ANOMALY";
                    description = "MALICIOUS CODE EXECUTED. SIGNAL DISRUPTION DETECTED.";
                } else {
                    title = `NODE_${i.toString(16).toUpperCase()}`;
                    description = "Standard routing node. Safe to traverse.";
                }
            }

            nodes.push({
                id: uuidv4(),
                index: i,
                type: type,
                title: title,
                description: description,
                position: rawPositions[i],
                isKey: isKey,
                isStart: isStart,
                fragmentId: fragmentId // Undefined if not a fragment
            });
        }

        return {
            id: uuidv4(),
            depth: depth,
            nodes: nodes,
            keyNodeId: nodes[endIdx].id,
            startNodeId: nodes[startIdx].id
        };
    }

    getRandomPosition() {
        const RADIUS = GameConfig.SCALING.CLUSTER_RADIUS;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        return [
            RADIUS * Math.sin(phi) * Math.cos(theta),
            RADIUS * Math.sin(phi) * Math.sin(theta),
            RADIUS * Math.cos(phi)
        ];
    }
}

export const storyGenerator = new StoryGenerator();

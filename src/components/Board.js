import React from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

const GraphBoard_new = ({ notes }) => {
    const nodes = notes.map((note, index) => ({
        id: note.id,
        data: { label: note.content },
        position: { x: note.x || index * 200, y: note.y || index * 100 },
        style: { background: "#fff", borderRadius: "8px", padding: "8px", border: "1px solid #ccc" },
    }));

    const edges = [];
    notes.forEach((noteA, indexA) => {
        notes.forEach((noteB, indexB) => {
            if (indexA !== indexB && noteA.tags && noteB.tags) {
                const commonTags = noteA.tags.filter((tag) => noteB.tags.includes(tag));
                if (commonTags.length > 0) {
                    edges.push({
                        id: `${noteA.id}-${noteB.id}`,
                        source: noteA.id,
                        target: noteB.id,
                        animated: true,
                        style: { stroke: "#888" },
                    });
                }
            }
        });
    });

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <MiniMap />
                <Controls />
                <Background gap={16} size={0.5} color="#ddd" />
            </ReactFlow>
        </div>
    );
};

export default GraphBoard;

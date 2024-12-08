import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import NoteModal from "./NoteModal";
import "reactflow/dist/style.css";

const GraphBoard = ({ notes, onUpdateNote }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [selectedProject,setSelectedProject] = useState();

    useEffect(() => {
        // Обновляем узлы и связи при изменении заметок
        setNodes(
            notes.map((note, index) => ({
                id: note.id,
                data: {
                    label: (
                        <div>
                            <div>{note.content}</div>
                            <div style={{ marginTop: 8 }}>
                                {note.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            fontSize: "0.8rem",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            padding: "2px 4px",
                                            marginRight: "4px",
                                            color: getColorForTag(tag),
                                        }}
                                    >
                    {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    ),
                },
                position: { x: note.x || index * 200, y: note.y || index * 100 },
                style: {
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "8px",
                    border: "1px solid #ccc",
                },
            }))
        );

        setEdges(getEdges(notes));
    }, [notes]);

    const handleNodeClick = (_, node) => {
        const note = notes.find((n) => n.id === node.id);
        setSelectedNote(note || {});
        setIsModalOpen(true);
    };

    const handleSaveNote = (updatedNote) => {
        onUpdateNote(updatedNote);
        setIsModalOpen(false);
    };

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                onNodeClick={handleNodeClick} // Добавляем обработчик клика
            >
                <MiniMap />
                <Controls />
                <Background gap={16} size={0.5} color="#ddd" />
            </ReactFlow>

            {isModalOpen && (
                <NoteModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNote}
                    note={selectedNote}
                    projects={selectedProject}
                    isGlobalAnalysisEnabled={false}
                />
            )}
        </div>
    );
};

const getEdges = (notes) => {
    const edges = [];
    const addedEdges = new Set();

    notes.forEach((noteA, indexA) => {
        notes.forEach((noteB, indexB) => {
            if (indexA < indexB && noteA.tags && noteB.tags) {
                const commonTags = noteA.tags.filter((tag) => noteB.tags.includes(tag));
                commonTags.forEach((tag) => {
                    const edgeId = `${noteA.id}-${noteB.id}-${tag}`;
                    const reverseEdgeId = `${noteB.id}-${noteA.id}-${tag}`;
                    if (!addedEdges.has(edgeId) && !addedEdges.has(reverseEdgeId)) {
                        edges.push({
                            id: edgeId,
                            source: noteA.id,
                            target: noteB.id,
                            animated: true,
                            style: { stroke: getColorForTag(tag) },
                        });
                        addedEdges.add(edgeId);
                    }
                });
            }
        });
    });

    return edges;
};

const getColorForTag = (tag) => {
    const hash = Array.from(tag).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FF5733"];
    return colors[hash % colors.length];
};

export default GraphBoard;

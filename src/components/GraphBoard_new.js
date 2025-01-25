import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background, applyEdgeChanges, applyNodeChanges } from "reactflow";
import "reactflow/dist/style.css";
import NoteModal from "./NoteModal";
import { Box, Button, Switch } from "@mui/material";
import { analyzeNotes, updateNoteCoordinates } from "../api/api";
import { useNavigate } from "react-router-dom";

const GraphBoard_new = ({
                        notes,
                        setNotes,
                        onUpdateNote,
                        projects,
                        onCreateNote,
                        selectedProject,
                        filteredNotes,
                        setFilteredNotes,
                    }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNoteIds, setSelectedNoteIds] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/auth");
    };

    const onNodeDragStop = async (_, node) => {
        const updatedNodes = nodes.map((n) =>
            n.id === node.id ? { ...n, position: node.position } : n
        );
        setNodes(updatedNodes);

        const movedNote = notes.find((note) => note.id === node.id);
        if (movedNote) {
            const updatedNote = {
                ...movedNote,
                x: Math.round(node.position.x),
                y: Math.round(node.position.y),
            };

            try {
                await updateNoteCoordinates(updatedNote.id, updatedNote.x, updatedNote.y);
                setNotes((prevNotes) =>
                    prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
                );
            } catch (error) {
                console.error("Ошибка при обновлении координат на сервере:", error);
            }

            setSelectedNote(updatedNote);
        }
    };

    const handleNoteSelection = (event, noteId, isChecked) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                note.id === noteId ? { ...note, individualAnalysisFlag: isChecked } : note
            )
        );
        setSelectedNoteIds((prevIds) =>
            event.target.checked ? [...prevIds, noteId] : prevIds.filter((id) => id !== noteId)
        );
    };

    useEffect(() => {
        setNodes(
            (filteredNotes || []).map((note, index) => ({
                id: note.id,
                data: { label: note.content || "Нет содержания" },
                position: { x: note.x || index * 100, y: note.y || index * 50 },
                style: { background: '#fff', border: '1px solid #ccc' },
            }))
        );
    }, [filteredNotes]);

    useEffect(() => {
        if (notes?.length > 0) {
            const calculatedEdges = getEdges(notes);
            setEdges(calculatedEdges);
        }
    }, [notes]);

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
        const colors = ["#FF5733", "#079c21", "#3357FF", "#F333FF", "#FF5733"];
        return colors[hash % colors.length];
    };

    const handleNodeClick = (event, node) => {
        const note = notes.find((n) => n.id === node.id);
        if (!note) {
            console.error("Заметка не найдена:", node.id);
            return;
        }
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    const handleSaveNote = async (updatedNote) => {
        if (updatedNote.id) {
            const savedNote = await onUpdateNote(updatedNote);
            return savedNote;
        } else {
            const savedNote = await onCreateNote(updatedNote, selectedProject);
            return savedNote;
        }
    };

    const handleAnalyze = async () => {
        try {
            const response = await analyzeNotes(selectedNoteIds);
            console.log("Ответ сервера:", response);
            alert("Заметки успешно отправлены на анализ!");
        } catch (error) {
            console.error("Ошибка при отправке на анализ:", error);
            alert("Не удалось отправить заметки на анализ. Попробуйте ещё раз.");
        } finally {
            setSelectedNoteIds([]);
        }
    };

    return (
        <Box sx={{ width: "100%", height: "100vh", display: "flex" }}>
            <Box sx={{ flex: 1 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={(changes) => setNodes(applyNodeChanges(changes, nodes))}
                    onEdgesChange={(changes) => setEdges(applyEdgeChanges(changes, edges))}
                    onNodeDragStop={onNodeDragStop}
                    onNodeClick={handleNodeClick}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background gap={16} size={0.5} color="#11F3B2" />
                </ReactFlow>
            </Box>
            <Box sx={{ position: "absolute", bottom: "16px", right: "16px" }}>
                <Button
                    variant="contained"
                    onClick={() => {
                        setSelectedNote(null);
                        setIsModalOpen(true);
                    }}
                >
                    +
                </Button>
                {selectedNoteIds.length > 0 && (
                    <Button variant="contained" onClick={handleAnalyze} sx={{ ml: 2 }}>
                        Отправить на анализ
                    </Button>
                )}
            </Box>
            {isModalOpen && (
                <NoteModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNote}
                    note={selectedNote || { urls: [] }}
                    projects={projects}
                    selectedProject={selectedProject}
                    setNotes={setNotes}
                />
            )}
        </Box>
    );
};

export default GraphBoard_new;
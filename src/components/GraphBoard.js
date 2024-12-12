import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import NoteModal from "./NoteModal";
import {Checkbox, Switch} from "@mui/material";
import {analyzeNotes} from "../api/api";

const GraphBoard = ({ notes, setNotes, onUpdateNote, projects, onCreateNote, selectedProject }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNoteIds, setSelectedNoteIds] = useState([])

    const onNodeDragStart = (_, node) => {
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === node.id ? { ...n, style: { ...n.style, opacity: 0.5 } } : n
            )
        );
    };

    const onNodeDragStop = (_, node) => {

        const updatedNodes = nodes.map((n) =>
            n.id === node.id ? { ...n, position: node.position } : n
        );
        setNodes(updatedNodes);

        // Локальное обновление координат заметки
        const movedNote = notes.find((note) => note.id === node.id);
        if (movedNote) {
            const updatedNote = {
                ...movedNote,
                x: Math.round(node.position.x),
                y: Math.round(node.position.y),
            };

            // Обновляем состояние notes локально
            setNotes((prevNotes) =>
                prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
            );

            // Обновляем selectedNote для модального окна
            setSelectedNote(updatedNote);
        }
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === node.id ? { ...n, style: { ...n.style, opacity: 1 } } : n
            )
        );
    };
    const handleNoteSelection = (event, noteId) => {
        setSelectedNoteIds((prevIds) =>
            event.target.checked
                ? [...prevIds, noteId] // Добавляем ID, если чекбокс выбран
                : prevIds.filter((id) => id !== noteId) // Убираем ID, если чекбокс снят
        );
    };

    useEffect(() => {
        // Обновляем узлы и связи при изменении заметок
        setNodes(
            notes.map((note, index) => ({
                id: note.id,
                data: {
                    label: (
                        <div style={{
                            resize: "both",
                            overflow: "auto",
                            minWidth: "100px",
                            minHeight: "50px",
                            maxWidth: "300px",
                            maxHeight: "200px",
                        }}>
                            <Switch
                                checked={selectedNoteIds.includes(note.id)}
                                onChange={(e) => handleNoteSelection(e, note.id)}
                                onClick={(e) => e.stopPropagation()} // Останавливаем распространение клика
                                style={{ marginRight: "4px" }}
                            />
                            <div>{note.content}</div>
                            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {note.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            fontSize: "0.6rem",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            padding: "1px 2px",
                                            marginRight: "2px",
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
                    cursor: "nwse-resize",
                },
            }))
        );

        setEdges(getEdges(notes));
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

    const handleNodeClick = (event, node) => {
        const note = notes.find((n) => n.id === node.id);
        if (!note) {
            console.error("Заметка не найдена:", node.id);
            return;
        }
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    const getColorForTag = (tag) => {
        const hash = Array.from(tag).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const colors = ["#FF5733", "#079c21", "#3357FF", "#F333FF", "#FF5733"];
        return colors[hash % colors.length];
    };

    const handleSaveNote = (updatedNote) => {
        if (updatedNote.id) {
            // Локально обновляем заметку, серверный запрос будет сделан вручную
            setNotes((prevNotes) =>
                prevNotes.map((note) => note.id === updatedNote.id ? updatedNote : note));
            onUpdateNote(updatedNote)

        } else {
            // Создание новой заметки
            onCreateNote(updatedNote, selectedProject);
        }
        setIsModalOpen(false);
    };
    const handleAnalyze = async () => {
        try {
            console.log("Отправляем на анализ:", selectedNoteIds);
            const response = await analyzeNotes(selectedNoteIds); // Вызов API
            console.log("Ответ сервера:", response);
            alert("Заметки успешно отправлены на анализ!");
        } catch (error) {
            console.error("Ошибка при отправке на анализ:", error);
            alert("Не удалось отправить заметки на анализ. Попробуйте ещё раз.");
        } finally {
            setSelectedNoteIds([]); // Сбрасываем выбор после отправки
        }
    };

    return (
        <div className="board" style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                onNodeClick={handleNodeClick}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
            >
                <MiniMap />
                <Controls />
                <Background gap={16} size={0.5} color="#ddd" />
            </ReactFlow>
            <button
                onClick={() => {
                    setSelectedNote(null);
                    setIsModalOpen(true);
                }}
                style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "16px",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "56px",
                    height: "56px",
                    fontSize: "24px",
                    cursor: "pointer",
                }}
            >
                +
            </button>
            {isModalOpen && (
                <NoteModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNote}
                    note={selectedNote}
                    projects={projects}
                    selectedProject={selectedProject}
                />
            )}
            {selectedNoteIds.length > 0 && (
                <button
                    onClick={handleAnalyze}
                    style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        padding: "5px 10px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "1px",
                        cursor: "pointer",
                    }}
                >
                    Отправить на анализ
                </button>
            )}
        </div>
    );
};
export default GraphBoard;
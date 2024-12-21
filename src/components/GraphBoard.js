import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import NoteModal from "./NoteModal";
import {Checkbox, Switch} from "@mui/material";
import {analyzeNotes, updateNoteCoordinates} from "../api/api";
import OGPreview from "./OGPreview";
import { fetchOpenGraphDataForNote } from "../api/api";


const GraphBoard = ({
                        notes, // Список отфильтрованных заметок
                        setNotes,
                        onUpdateNote,
                        projects,
                        onCreateNote,
                        selectedProject,
                        filteredNotes,
                        setFilteredNotes, // Функция обновления
}) => {
    // console.log(" start GraphBoard, filteredNotes: ", filteredNotes);
    // console.log(" start GraphBoard, notes: ", notes);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNoteIds, setSelectedNoteIds] = useState([]);
    const [openGraphData, setOpenGraphData] = useState({});
    const [selectedProjectId, setSelectedProjectId] = useState(null); // Активный проект
    const [activeTab, setActiveTab] = useState(0); // Активный таб
    const [selectedTags, setSelectedTags] = useState([]); // Выбранные теги


    const onNodeDragStart = (_, node) => {
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === node.id ? { ...n, style: { ...n.style, opacity: 0.5 } } : n
            )
        );
    };

    const onNodeDragStop = async (_, node) => {

        const updatedNodes = nodes.map((n) =>
            n.id === node.id ? {...n, position: node.position} : n
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

            try {
                // Отправляем новые координаты на сервер
                await updateNoteCoordinates(updatedNote.id, updatedNote.x, updatedNote.y);

                // Обновляем состояние notes локально
                setNotes((prevNotes) =>
                    prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
                );
            } catch (error) {
                console.error("Ошибка при обновлении координат на сервере:", error);
            }

            // Обновляем selectedNote для модального окна
            setSelectedNote(updatedNote);
        }
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === node.id ? {...n, style: {...n.style, opacity: 1}} : n
            )
        );
    };

    const handleNoteSelection = (event, noteId,isChecked) => {
        setNotes((prevNotes) => {
            const updatedNotes = prevNotes.map((note) =>
                note.id === noteId ? { ...note, individualAnalysisFlag: isChecked } : note
            );
            console.log("Updated Notes:", updatedNotes);
            return updatedNotes})

        setSelectedNoteIds((prevIds) =>
            event.target.checked
                ? [...prevIds, noteId] // Добавляем ID, если чекбокс выбран
                : prevIds.filter((id) => id !== noteId) // Убираем ID, если чекбокс снят
        )
    };


    useEffect(() => {
        if (selectedProjectId) {
            const filtered = filteredNotes.filter((note) => note.projectId === selectedProjectId);
            //console.log("in useeffect GraphBoard filtered: ",filtered);
            setFilteredNotes(filtered);
        }
    }, [selectedProjectId, notes]);

    const handleAnalysisFlagChange = (noteId, isChecked) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                note.id === noteId ? { ...note, individualAnalysisFlag: isChecked } : note
            )
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
                            maxWidth: "700px",
                            maxHeight: "500px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%", // Растягиваем содержимое
                            textAlign: "center", // Центрируем текст
                            fontSize: "0.9rem", // Пропорциональный размер текста
                        }}>

                            {/*/>*/}
                            <div>{note.content}</div>
                            {note.urls?.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    {openGraphData[note.id]?.map((ogData, index) => (
                                        <OGPreview key={index} ogData={ogData} />
                                    ))}

                                </div>
                            )}
                            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {note.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            fontSize: "0.6rem",
                                            border: "1px solid #ccc",
                                            borderRadius: "1px",
                                            padding: "1px 1px",
                                            marginRight: "1px",
                                            marginBottom: "1px",
                                            color: getColorForTag(tag),
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div style={{ marginTop: 4, display: "flex"}}>
                                <Switch
                                    checked={selectedNoteIds.includes(note.id)}
                                    onChange={(e) => handleNoteSelection(e, note.id)}
                                    onClick={(e) => e.stopPropagation()} // Останавливаем распространение клика
                                    // style={{ marginRight: "2px",marginTop: "4px" }}
                                />
                            </div>
                        </div>
                    ),
                },
                position: { x: note.x || index * 200, y: note.y || index * 100 },
                style: {
                    background: "#fff",
                    borderRadius: "8px", // Оставляем радиус для эстетики
                    padding: "2px", // Увеличиваем внутренний отступ
                    width: "150px", // Было 100px, увеличено на 50%
                    height: "150px", // Сделали квадратной, аналогично ширине
                    border: "1px solid #ccc",
                    fontSize: "0.3rem", // Увеличиваем шрифт, чтобы соответствовать размеру
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "center",
                    boxSizing: "border-box",
                },
            }))
        );

        setEdges(getEdges(notes));
    }, [notes]);


   useEffect(() => {
        const loadOpenGraphData = async () => {
            const newOpenGraphData = {};

            for (const note of notes) {
                if (note.urls?.length) {
                    try {
                        console.log("получаем OpenGraphData для каждой заметки")
                        const ogData = await fetchOpenGraphDataForNote(note.id, note.urls);
                        newOpenGraphData[note.id] = ogData; // Сохраняем данные для каждой заметки
                    } catch (error) {
                        console.error(`Ошибка загрузки OpenGraph данных для заметки ${note.id}:`, error);
                    }
                }
            }

            setOpenGraphData(newOpenGraphData);
        };

        if (notes.length > 0) {
            loadOpenGraphData();
        }
    }, [filteredNotes]);

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

    const handleSaveNote = async (updatedNote) => {
        if (updatedNote.id) {
            // Обновляем заметку
            const savedNote = await onUpdateNote(updatedNote);
            return savedNote;
        } else {
            // Создаём новую заметку
            const savedNote = await onCreateNote(updatedNote, selectedProject);
            return savedNote;
        }
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

    // Выбор проекта
    // const handleSelectProject = (projectId) => {
    //     console.log("Выбран проект:", projectId);
    //     setSelectedProjectId(projectId);
    //     const filtered = notes.filter((note) => note.projectId === projectId);
    //     console.log("Заметки для выбранного проекта:", filtered);
    //     setFilteredNotes(filtered);
    //
    // };

    // Выбор тега
    const handleSelectTag = (tag) => {
        const updatedTags = selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(updatedTags);

        const filteredByTags = notes.filter((note) =>
            updatedTags.some((selectedTag) => note.tags.includes(selectedTag))
        );
        setFilteredNotes(filteredByTags);
    };

    // Переключение табов
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        if (newTab === 0) {
            if (selectedProjectId) {
                const filtered = filteredNotes?.filter((note) => note.projectId === selectedProjectId);
                setFilteredNotes(filtered);
            } else {

                setFilteredNotes([]);
            }
        } else if (newTab === 1) {

            setFilteredNotes([]); // Очистка доски при переключении на теги
            setSelectedTags([]);  // Сброс выбранных тегов
        }
    };



    return (
        <div className="board" style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges} // Пока без связей
                fitView
                onNodeClick={handleNodeClick}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                style={{ flex: 1 }}
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
                    backgroundColor: "#0000CD",
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
                        bottom: "16px", // Перенос вниз
                        right: "16px", // Перенос вправо
                        padding: "5px 8px", // Было больше
                        backgroundColor: "#007bff",
                        color: "#fff",
                        fontSize: "0.8rem", // Уменьшение текста
                        border: "none",

                        borderRadius: "4px", // Сделаем углы чуть более острыми
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
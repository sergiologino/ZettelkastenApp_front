import React, { useState, useEffect } from "react";
import ReactFlow, {MiniMap, Controls, Background, applyEdgeChanges} from "reactflow";
import { applyNodeChanges } from "reactflow";
import { Handle } from "reactflow";
import "reactflow/dist/style.css";
import NoteModal from "./NoteModal";
import {Checkbox, Switch} from "@mui/material";
import {analyzeNotes, updateNoteCoordinates} from "../api/api";
import {onCreateNote} from "../api/api";
import OGPreview from "./OGPreview";
import { fetchOpenGraphDataForNote } from "../api/api";
import { useNavigate } from "react-router-dom";



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
    const navigate = useNavigate();
    // console.log("Selected notes: ",notes);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/auth"); // Перенаправляем на страницу авторизации
    };

    const resizableStyle = {
        display: "flex",
        flexDirection: "column", // Выстраиваем элементы в колонку
        justifyContent: "space-between", // Оставляем место между элементами
        alignItems: "center", // Центруем элементы по горизонтали
        width: "150px", //"100%",
        height: "150px", //"100%",
        padding: "8px", // Добавляем отступы
        boxSizing: "border-box", // Учитываем padding в размерах
        overflow: "hidden", // Скрываем выходящий контент
    };



    // const onNodeDragStart = (_, node) => {
    //     if (node.style.cursor === "nwse-resize") {
    //         return; // Прерываем обработку, если пользователь тянет за область изменения размера
    //     }
    //     setNodes((prevNodes) =>
    //         prevNodes.map((n) =>
    //             n.id === node.id ? { ...n, style: { ...n.style, opacity: 0.5 } } : n
    //         )
    //     );
    // };

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
            console.log("заметка для модалки: ", updatedNote);
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

    const onNodeResizeStart = (event, node) => {
        // Проверяем, началось ли изменение через псевдоэлемент
        if (event.target.classList.contains("node") || event.target.matches(".node::after")) {
            event.stopPropagation(); // Останавливаем перемещение ноды
        }
    };

     const handleResizeStart = (event, nodeId) => {
        event.stopPropagation(); // Отключаем событие drag

        const node = nodes.find((n) => n.id === nodeId);

        if (!node) return;

        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = parseInt(node.style.width, 10) || 150;
        const startHeight = parseInt(node.style.height, 10) || 150;

        const handleMouseMove = (e) => {
            const newWidth = Math.max(50, startWidth + e.clientX - startX);
            const newHeight = Math.max(50, startHeight + e.clientY - startY);

            setNodes((prevNodes) =>
                prevNodes.map((n) =>
                    n.id === nodeId
                        ? {
                            ...n,
                            style: {
                                ...n.style,
                                width: `${newWidth}px`,
                                height: `${newHeight}px`,
                            },
                        }
                        : n
                )
            );
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            const updatedNode = nodes.find((n) => n.id === nodeId);
            if (updatedNode) {
                const updatedNote = {
                    ...notes.find((note) => note.id === nodeId),
                    width: parseInt(updatedNode.style.width, 10),
                    height: parseInt(updatedNode.style.height, 10),
                };
                onUpdateNote(updatedNote).catch((err) =>
                    console.error("Ошибка сохранения размера ноды:", err)
                );
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };


    const handleAnalysisFlagChange = (noteId, isChecked) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                note.id === noteId ? { ...note, individualAnalysisFlag: isChecked } : note
            )
        );
    };

    useEffect(() => {
        //console.log("Заметки для отображения в GraphBoard:", filteredNotes);
        setNodes((filteredNotes || []).map((note, index) => ({
            id: note.id,
            data: { label: note.content || "Нет содержания" },
            position: { x: note.x || index * 100, y: note.y || index * 50 },
            style: { background: '#fff', border: '1px solid #ccc' },
        })));
    }, [filteredNotes]);

    useEffect(() => {
        if (notes?.length > 0) {
            const calculatedEdges = getEdges(notes);
            setEdges(calculatedEdges);
        }
    }, [notes]);


    useEffect(() => {
        setNodes(
            notes?.map((note, index) => ({
                id: note.id,
                data: {
                    label: (
                        <div
                            style={{
                                ...resizableStyle,
                                position: "relative",
                            }}
                            className="node"
                        >
                            {/* Контент */}
                            <div>{note.content}</div>

                            {/* Теги */}
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "4px",
                                    marginTop: "8px",
                                }}
                            >
                                {note.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            fontSize: "0.6rem",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            padding: "2px 4px",
                                            backgroundColor: getColorForTag(tag),
                                            color: "#fff",
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Переключатель */}
                            <div
                                style={{
                                    marginTop: "auto",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Switch
                                    checked={selectedNoteIds.includes(note.id)}
                                    onChange={(e) =>
                                        handleNoteSelection(e, note.id, e.target.checked)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            {/* Элемент изменения размера */}
                            <div
                                className="node-resize-handle"
                                onMouseDown={(e) => handleResizeStart(e, note.id)}
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: "#ccc",
                                    cursor: "nwse-resize",
                                    zIndex: 10,
                                }}
                            />
                        </div>
                    ),
                },
                position: {x: note.x || index * 200, y: note.y || index * 100},
                style: {
                    width: `${note.width || 150}px`,
                    height: `${note.height || 150}px`,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                },
            }))
        );
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

        if (notes?.length > 0) {
            loadOpenGraphData().then(r => '');
        }
    }, [filteredNotes, notes]);

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

                        // Убедимся, что связь уникальна
                        if (!addedEdges.has(edgeId) && !addedEdges.has(reverseEdgeId)) {
                            edges.push({
                                id: edgeId,
                                source: noteA.id,
                                target: noteB.id,
                                animated: true, // Для анимации связи
                                style: { stroke: getColorForTag(tag) },
                            });
                            addedEdges.add(edgeId); // Сохраняем уникальность
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

        // Гарантируем, что urls всегда массив
        const noteWithUrls = {
            ...updatedNote,
            urls: Array.isArray(updatedNote.urls) ? updatedNote.urls : [], // Если urls отсутствует или не массив, создаём пустой массив
        };


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

    useEffect(() => {
        if (activeTab === 1) {
            const filteredByTags = notes.filter((note) =>
                selectedTags.some((selectedTag) => note.tags.includes(selectedTag))
            );
            setFilteredNotes(filteredByTags.length > 0 ? filteredByTags : notes);
        }
    }, [selectedTags, activeTab]);




    return (

        <div className="board" style={{width: "100%", height: "100vh"}}>
            <ReactFlow
                nodes={nodes}
                edges={edges} // Пока без связей
                onNodesChange={(changes) => {
                    const updatedNodes = applyNodeChanges(changes, nodes);
                    setNodes(updatedNodes);
                }}
                onEdgesChange={(changes) => setEdges(applyEdgeChanges(changes, edges))}
                onNodeDragStart={(event, node) => {
                    if (event.target.classList.contains("node-resize-handle")) {
                        event.stopPropagation(); // Останавливаем перетаскивание
                        return;
                    }
                }
                }
                // onNodeResizeStop={onNodeResizeStop}
                fitView

                onNodeClick={handleNodeClick}
                // onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}

                style={{flex: 1}}

            >
                <MiniMap/>
                <Controls/>
                <Background gap={16} size={0.5} color="##11F3B2"/>
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
            <button onClick={handleLogout} style={{border:"thin", color: "blue", margin: "10px", height: "20px", width: "60px", borderRadius: "10px",padding: "2px"}}>
                Выйти
            </button>
            {isModalOpen && (
                <NoteModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNote}
                    note={selectedNote || { urls: [] }} // Передаём объект с полем urls
                    projects={projects}
                    selectedProject={selectedProject}
                    setNotes={setNotes} // Передача setNotes

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

                        borderRadius: "6px", // Сделаем углы чуть более острыми
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
import OGPreview from "./OGPreviewBoard"; // Импортируем OGPreview
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Импорт иконки копирования
import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background, applyEdgeChanges, applyNodeChanges } from "reactflow";
import "reactflow/dist/style.css";
import { IconButton} from "@mui/material";
// import {Badge, Box, Button, Switch} from "@mui/material";
import {analyzeNotes, deleteNote, fetchOpenGraphDataForNote, updateNoteCoordinates} from "../api/api";
import { useNavigate } from "react-router-dom";
import NoteModal_new from "./NoteModal_new";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import {format} from "date-fns";
import {ru} from "date-fns/locale";

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
    const [activeTab] = useState(0); // Активный таб
    const [selectedTags, setSelectedTags] = useState([]); // Выбранные теги.
    const [openGraphData, setOpenGraphData] = useState({});
    const navigate = useNavigate();
    const [hoveredNote, setHoveredNote] = useState(null);
    const [recentlyHoveredNote, setRecentlyHoveredNote] = useState(null);


    // const handleLogout = () => {
    //     localStorage.removeItem("accessToken");
    //     localStorage.removeItem("refreshToken");
    //     navigate("/auth");
    // };

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

    const ResizableHandle = ({ onResizeStart }) => (
        <div
            onMouseDown={onResizeStart}
            style={{
                position: "absolute",
                bottom: "-8px", // 🔹 Снаружи ноды
                right: "-8px",  // 🔹 Снаружи ноды
                width: "12px",
                height: "12px",
                backgroundColor: "#888",
                cursor: "se-resize",
                borderRadius: "4px",
                border: "2px solid #fff",
                zIndex: 20, // 🔹 Выше всех остальных элементов
            }}
        />
    );


    const onNodeDragStop = async (_, node) => {
        const movedNote = notes.find((note) => note.id === node.id);
        if (!movedNote) return;

        const updatedNote = { ...movedNote, x: Math.round(node.position.x), y: Math.round(node.position.y) };

        try {
            await updateNoteCoordinates(updatedNote.id, updatedNote.x, updatedNote.y);
            setNotes((prevNotes) => prevNotes.map((note) => note.id === updatedNote.id ? updatedNote : note));
        } catch (error) {
            console.error("Ошибка при обновлении координат на сервере:", error);
        }
    };


    const calculateNewNotePosition = (notes) => {
        if (notes.length === 0) {
            return { x: 100, y: 100 }; // Если заметок нет, ставим в начальные координаты
        }

        const minX = Math.min(...notes.map(note => note.x || 0));
        const minY = Math.min(...notes.map(note => note.y || 0));

        console.log("initial coordinates X:: ", minX, " Y: ", minY);

        return { x: minX + 50, y: minY + 50 }; // Смещаем новую заметку вниз и вправо
    };

    const handleDeleteNote = async (noteId) => {
        console.log("Удаляем заметку: ",noteId);
        if (window.confirm("Вы действительно хотите удалить эту заметку?")) {
            try {
                await deleteNote(noteId);
                setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId)); // ✅ Удаление из состояния
            } catch (error) {
                alert("Ошибка при удалении заметки.");
            }
        }
    };

    const handleCopyNote = (originalNote) => {
        const copiedNote = {
            title: `Copy: ${originalNote.title}`,
            content: originalNote.content,
            tags: [...originalNote.tags],
            projectId: originalNote.projectId,
        };

        setSelectedNote(copiedNote);
        setIsModalOpen(true);
    };


    const getOpenGraphThumbnail = (note) => {
        if (!note.openGraphData || Object.keys(note.openGraphData).length === 0) return null;
        const firstOG = Object.values(note.openGraphData)[0]; // Берем первую OG-ссылку
        return <OGPreview ogData={firstOG} />;
    };
    const formatDate = (dateInput) => {
        if (!dateInput) return "Нет даты";

        // Если `dateInput` - массив чисел, конвертируем в дату
        if (Array.isArray(dateInput) && dateInput.length >= 6) {
            const [year, month, day, hour, minute, second, millisecond = 0] = dateInput;
            const date = new Date(year, month - 1, day, hour, minute, second, millisecond);
            return format(date, "dd.MM.yy HH:mm", { locale: ru });
        }

        return "Некорректная дата";
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
        setNodes(
            notes?.map((note, index) => ({
                id: note.id,
                data: {
                    label: (
                        <div
                            style={{
                                position: "revert",
                                padding: "4px",
                                textAlign: "center",
                                fontSize: "12px",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={() => setHoveredNote(note.id)}
                            onMouseLeave={() => setTimeout(() => setHoveredNote(null), 500)}
                        >
                            <div style={{fontSize: "12px", fontWeight: "regular", right:"8px", color: "rgba(155,159,156,0.45)"}}>
                                {formatDate(note.createdAt)}
                            </div>
                            <div style={{fontSize: "18px", fontWeight: "bold"}}>
                                {note.title}
                            </div>
                            <div style={{fontSize: "16px", color: "#666"}}>
                                {note.content
                                    ? note.content.length > 30
                                        ? note.content.slice(0, 30) + "..."
                                        : note.content
                                    : ""}
                            </div>

                            {/* Миниатюра OpenGraph */}
                            {getOpenGraphThumbnail(note)}

                            {/* Теги */}
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "4px",
                                    marginTop: "4px",
                                    marginBottom: "4px",
                                    marginLeft: "2px",
                                }}
                            >
                                {note.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            fontSize: "0.4rem",
                                            border: "1px solid #ccc",
                                            borderColor: getColorForTag(tag),
                                            borderRadius: "4px",
                                            padding: "2px 4px",
                                            backgroundColor: "#fff",
                                            color: getColorForTag(tag),
                                        }}
                                    >
                                    {tag}
                                </span>
                                ))}
                            </div>

                            {/* Бейджик вложений */}
                            {((note.files?.length || 0) +
                                (note.audios?.length || 0) +
                                (note.urls?.length || 0)) > 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "2px",
                                        right: "2px",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "12px",
                                        color: "#006400",
                                        fontWeight: "bold",
                                    }}
                                >
                                    <AttachFileIcon style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        marginRight: "2px",
                                        marginBottom: "2px"
                                    }}/>
                                    {(note.files?.length || 0) +
                                        (note.audios?.length || 0) +
                                        (note.urls?.length || 0)}
                                </div>
                            )}
                            {/* Иконка копирования */}
                            {(hoveredNote === note.id || recentlyHoveredNote === note.id) && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyNote(note);
                                    }}
                                    onMouseEnter={() => setHoveredNote(note.id)}
                                    onMouseLeave={() => setTimeout(() => setHoveredNote(null), 300)}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        right: "-20px", // Снаружи ноды
                                        transform: "translateY(-50%)",
                                        background: "rgba(255,255,255,0.9)",
                                        width: "20px",
                                        height: "20px",
                                        zIndex: 10,
                                        borderRadius: "50%",
                                        border: "1px solid #ccc",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                        padding: "2px",
                                    }}
                                >
                                    <AddCircleOutlineIcon color="primary" style={{fontSize: "16px"}}/>
                                </IconButton>
                            )}

                            {/* Кнопка удаления - в правом верхнем углу */}
                            {(hoveredNote === note.id || recentlyHoveredNote === note.id) && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(note.id);
                                    }}
                                    onMouseEnter={() => setRecentlyHoveredNote(note.id)}
                                    onMouseLeave={() => setTimeout(() => setRecentlyHoveredNote(null), 500)}
                                    style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        background: "rgba(255,255,255,0.9)",
                                        width: "20px",
                                        height: "20px",
                                        zIndex: 10,
                                        borderRadius: "50%",
                                        border: "1px solid #ccc",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                        padding: "2px",
                                    }}
                                >
                                    <DeleteIcon color="error" style={{fontSize: "16px"}}/>
                                </IconButton>
                            )}
                            {/* Изменение размера - в правом нижнем углу снаружи */}
                            <ResizableHandle onResizeStart={(e) => handleResizeStart(e, note.id)}/>

                        </div>


                    ),
                },
                position: {x: note.x || index * 100, y: note.y || index * 50},
                style: {
                    width: `${note.width || 300}px`,
                    height: `${note.height || 200}px`,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    padding: "8px",
                    position: "absolute",
                    overflow: "hidden",
                },
            }))
        );
        setEdges(getEdges(notes));
    }, [notes]); // ✅ hoveredNote убран из зависимостей



    const getEdges = (notes) => {
        const edges = [];
        // Группируем заметки по тегам
        const tagToNotes = {};

        notes?.forEach((note) => {
            if (note.tags) {
                note.tags?.forEach((tag) => {
                    if (!tagToNotes[tag]) {
                        tagToNotes[tag] = [];
                    }
                    tagToNotes[tag].push(note);
                });
            }
        });

        // Для каждой группы по тегу
        Object.entries(tagToNotes)?.forEach(([tag, notesWithTag]) => {
            if (notesWithTag.length > 1) {
                // Сортируем по дате создания (от старой к новой)
                notesWithTag.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const sourceNote = notesWithTag[0]; // самая старая заметка
                // Создаём связь от самой старой ко всем остальным
                for (let i = 1; i < notesWithTag.length; i++) {
                    const targetNote = notesWithTag[i];
                    edges.push({
                        id: `${sourceNote.id}-${targetNote.id}-${tag}`,
                        source: sourceNote.id,
                        target: targetNote.id,
                        animated: true,
                        style: { stroke: getColorForTag(tag) },
                    });
                }
            }
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


        const projectId = updatedNote.projectId || selectedProject;

        try {
            let savedNote;


            if (updatedNote.id) {
                // Обновляем заметку
                savedNote = await onUpdateNote(updatedNote);
            } else {
                // Создаём новую заметку
                savedNote = await onCreateNote(updatedNote, projectId);
                setNotes((prevNotes) => [...prevNotes, savedNote]);
            }
            if (!savedNote) {
                console.error("❌ Ошибка: savedNote undefined после сохранения", updatedNote);
                alert("Ошибка: сервер не вернул сохраненную заметку.");
                return;
            }
            setNotes((prevNotes) =>
                prevNotes.map((note) => (note.id === savedNote.id ? savedNote : note))
            );
                return savedNote;
            } catch (error) {
            console.error("Ошибка при сохранении заметки:", error);
            alert("Не удалось сохранить заметку. Проверьте соединение с сервером.");
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

    const handleResizeStart = (event, nodeId) => {
        event.preventDefault(); // 🔹 Блокируем стандартное поведение браузера
        event.stopPropagation(); // 🔹 Останавливаем событие, чтобы не перетаскивалась нода

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = parseInt(node.style.width, 10) || 150;
        const startHeight = parseInt(node.style.height, 10) || 100;

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

        const handleMouseUp = async () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            const updatedNode = nodes.find((n) => n.id === nodeId);
            if (updatedNode) {
                const updatedNote = {
                    ...notes.find((note) => note.id === nodeId),
                    width: parseInt(updatedNode.style.width, 10),
                    height: parseInt(updatedNode.style.height, 10),
                };

                try {
                    await onUpdateNote(updatedNote); // ✅ Обновляем бэкенд
                    setNotes((prevNotes) =>
                        prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
                    );
                } catch (err) {
                    console.error("Ошибка сохранения размера ноды:", err);
                }
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
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
        <div className="board" style={{width: "100%", height: "90vh"}}>
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
            {isModalOpen && (

                <NoteModal_new
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNote}
                    onUpdateNote={handleSaveNote}
                    note={selectedNote || {urls: []}} // Передаём объект с полем urls
                    projects={projects}
                    selectedProject={selectedProject}
                    setNotes={setNotes} // Передача setNotes
                    notes={notes}
                    calculateNewNotePosition={() => calculateNewNotePosition(notes)} // ✅ Передаем функцию координат новой заметки
                    onDelete={handleDeleteNote}
                    setSelectedNote={setSelectedNote} // 🔹 Передаём setSelectedNote в модальное окно
                    setIsModalOpen={setIsModalOpen} // 🔹 Передаём setIsModalOpen в модальное окно

                />
            )}
            {selectedNoteIds.length > 0 && (
                <button
                    onClick={handleAnalyze}
                    style={{
                        position: "absolute",
                        top: "20px", // Перенос вниз
                        right: "25px", // Перенос вправо
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

export default GraphBoard_new;
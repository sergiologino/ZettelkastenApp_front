import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import { Box, Checkbox } from "@mui/material";
import "reactflow/dist/style.css";
import NoteModal from "./NoteModal";
import './appStyle.css'; // Импортируем CSS-файл компонента



const GraphBoard = ({ notes, setNotes, onUpdateNote, projects, onCreateNote, selectedProject }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    //const [notes, setNotes] = useState([]);

    //console.log("selectedProject сразу при открытии графБорда: ", selectedProject);


    const onNodeDragStop = (_, node) => {
        const updatedNodes = nodes.map((n) =>
            n.id === node.id ? { ...n, position: node.position } : n
        );
        setNodes(updatedNodes);

        // Локальное обновление координат без вызова onUpdateNote
        const movedNote = notes.find((note) => note.id === node.id);
        console.log("++++ movedNote при открытии графБорда: ", movedNote);
        if (movedNote) {
            const updatedNote = {
                ...movedNote,
                x: node.position.x,
                y: node.position.y,
            };

            // Обновляем selectedNote, чтобы передать в NoteModal актуальные данные
            setSelectedNote(updatedNote);
            // Сохраняем изменения локально, но не отправляем на сервер

                notes.map((note) =>
                    note.id === updatedNote.id ? updatedNote : note
                );
            console.log("++++ updatedNote при открытии графБорда: ", updatedNote);
            console.log("++++ selectedNote при открытии графБорда: ", selectedNote);

        }
    };


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

    const handleNodeClick = (event, node) => {
        const note = notes.find((n) => n.id === node.id);
        if (!note) {
            console.error("Заметка не найдена:", node.id);
            return;
        }
        setSelectedNote(note);
        console.log("*****ПОСЛЕ КЛИКА НА НОДЕ ЗАМЕТКА: ",note)
        setIsModalOpen(true);
    };


    const handleSaveNote = (selectedNote) => {
        console.log("ОБНОВЛЕНИЕ ЗАМЕТКИ: ",selectedNote)
        if (selectedNote.id) {
            // Обновление существующей заметки
            onUpdateNote(selectedNote);
        } else {
            console.log("СОЗДАНИЕ НОВОЙ заметки: ", selectedProject);
            console.log("selectedProject при вызове создания заметки из графБорда: ", selectedProject);
            // Создание новой заметки
            onCreateNote(selectedNote,selectedProject);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="board" style={{width: "100%", height: "100%"}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                onNodeClick={handleNodeClick} // Добавляем обработчик клика>
                onNodeDragStop={onNodeDragStop} // Обработчик перемещения узлов
            >
                <MiniMap/>
                <Controls/>
                <Background gap={16} size={0.5} color="#ddd"/>
                <div className="grid_new"/>
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
                    //backgroundColor: "#007bff",
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
                    note= {selectedNote}
                    /* {selectedNote}*/
                    projects={projects}
                    selectedProject={selectedProject} // Передаём список проектов
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

import React from "react";
import { Box } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Board = ({ notes, onDragEnd }) => {
    return (
        <Box
            sx={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                backgroundColor: "#f4f4f4",
                display: "flex",
            }}
        >
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" direction="horizontal">
                    {(provided) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            {notes.map((note, index) => (
                                <Draggable key={note.id} draggableId={note.id} index={index}>
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            sx={{
                                                position: "absolute",
                                                top: note.y,
                                                left: note.x,
                                                width: "200px",
                                                height: "150px",
                                                backgroundColor: "#fff",
                                                borderRadius: "8px",
                                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                                                padding: "16px",
                                                cursor: "grab",
                                            }}
                                        >
                                            {note.content}
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
        </Box>
    );
};

export default Board;

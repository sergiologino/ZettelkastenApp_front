import React, { useState } from "react";
import { Box, Checkbox } from "@mui/material";

const Board = ({ notes, onDragEnd, onSelect }) => {
    console.log("получены заметки:", notes);
    const [selectedNotes, setSelectedNotes] = useState([]);


    const handleNoteSelect = (noteId) => {
        const updatedSelection = selectedNotes.includes(noteId)
            ? selectedNotes.filter((id) => id !== noteId)
            : [...selectedNotes, noteId];
        setSelectedNotes(updatedSelection);
        onSelect(updatedSelection);
    };

    const handleDragEnd = (e, noteId) => {
        const updatedNotes = notes.map((note) =>
            note.id === noteId
                ? {
                    ...note,
                    x: e.clientX - 100, // Центрируем элемент
                    y: e.clientY - 75,
                }
                : note
        );
        onDragEnd(updatedNotes);
    };

    return (
        <Box
            sx={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                backgroundColor: "#f4f4f4",
            }}
        >
            {notes.map((note) => (
                <Box
                    key={note.id}
                    sx={{
                        margin: "16px", // Добавляем отступы между заметками
                        width: "200px",
                        height: "150px",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        padding: "16px",
                        cursor: "grab",
                    }}
                    draggable
                    onDragEnd={(e) => handleDragEnd(e, note.id)}
                >
                    <Checkbox
                        checked={selectedNotes.includes(note.id)}
                        onChange={() => handleNoteSelect(note.id)}
                        sx={{ position: "absolute", top: 0, right: 0 }}
                    />
                    {note.content}
                </Box>
            ))}
        </Box>
    );
};

export default Board;

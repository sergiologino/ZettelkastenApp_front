import React from "react";
import {Box, Typography, Paper, Chip, IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const SearchResults = ({ results, onSelectNote, onClose  }) => {
    if (results.length === 0) {
        return <Typography sx={{ padding: 2 }}>Ничего не найдено.</Typography>;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 2, position: "fixed", top: "64px", right: 4, width: "200px", backgroundColor: "#f5f5f5", boxShadow: 3, borderRadius: "8px", zIndex: 1000 }}>
            {/* Иконка закрытия */}
            <IconButton
                sx={{ position: "absolute", top: 2, right: 2, zIndex: 10 }}
                onClick={onClose}
            >
                <CloseIcon />
            </IconButton>

            {results.map((note) => (
                <Paper
                    key={note.id}
                    sx={{
                        padding: 1,
                        width: "100%",
                        cursor: "pointer",
                        transition: "0.3s",
                        position: "relative",
                        right: 16,
                        left:-8,
                        "&:hover": { backgroundColor: "#E6E6FA" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "60px"
                    }}
                    onClick={() => onSelectNote(note)}
                >
                    {/* ✅ Проект */}
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: "bold",
                            color: note.projectColor || "black",
                            marginBottom: 1,
                        }}
                    >
                        {note.projectName}
                    </Typography>

                    {/* ✅ Контент заметки */}
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {note.content}
                    </Typography>

                    {/* ✅ Метки совпадений */}
                    <Box sx={{ position: "absolute", top: 8, right: 32, display: "flex", gap: 0.5 }}>
                        {note.matches?.map((match) => (
                            <Chip
                                key={match}
                                label={match}
                                variant="outlined"
                                sx={{
                                    color: "#1976d2",
                                    borderColor: "#1976d2",
                                    fontSize: "0.7rem",
                                    height: "22px",
                                }}
                            />
                        ))}
                    </Box>

                    {/* ✅ Дата редактирования */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: "gray",
                            marginTop: 1,
                            textAlign: "right",
                        }}
                    >
                        {note.formattedDate}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
};

export default SearchResults;

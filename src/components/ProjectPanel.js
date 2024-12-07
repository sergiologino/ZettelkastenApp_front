import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";

const ProjectPanel = ({ projects, onSelect, onCreate, onDelete }) => {
    const [newProjectName, setNewProjectName] = useState("");

    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            alert("Название проекта не может быть пустым.");
            return;
        }
        onCreate(newProjectName);
        setNewProjectName("");
    };

    return (
        <Box
            sx={{
                width: "300px",
                height: "100vh",
                backgroundColor: "#ffffff",
                borderRight: "1px solid #e0e0e0",
                overflowY: "auto",
                padding: "16px",
            }}
        >
            <Typography variant="h6" sx={{ marginBottom: "16px" }}>
                Проекты
            </Typography>
            {projects.map((project) => (
                <Box
                    key={project.id}
                    sx={{
                        marginBottom: "12px",
                        padding: "12px",
                        backgroundColor: project.color || "#f0f0f0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        position: "relative",
                    }}
                >
                    <Typography onClick={() => onSelect(project.id)}>{project.name}</Typography>
                    <Button
                        size="small"
                        color="error"
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        onClick={() => onDelete(project.id)}
                    >
                        Удалить
                    </Button>
                </Box>
            ))}
            <TextField
                fullWidth
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Название проекта"
                sx={{ marginBottom: "8px" }}
            />
            <Button variant="contained" fullWidth onClick={handleCreateProject}>
                Добавить проект
            </Button>
        </Box>
    );
};

export default ProjectPanel;

import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import './appStyle.css'; // Импортируем CSS-файл
import DeleteIcon from '@mui/icons-material/Delete';

const ProjectPanel = ({ projects, selectedProjectId, onSelect, onCreate, onDelete }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");


    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            alert("Название проекта не может быть пустым.");
            return;
        }
        const newProject = {
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
        };
        onCreate(newProject); // Передаем объект с названием и описанием
        setNewProjectName(""); // Очищаем поле после добавления
        setNewProjectDescription(""); // Очищаем описание

    };
    const displayProjectDescription = (project) => {
        return (
            <Typography variant="body2" color="textSecondary" sx={{ marginTop: "2px" }}>
                {project.description}
            </Typography>
        );
    };

    return (
        <div className ="projpanel">
        <Box
            sx={{
                width: "300px",
                height: "100vh",
                backgroundColor: "#c5e6ff",
                borderRight: "1px solid #e0e0e0",
                overflowY: "auto",
                padding: "16px",
                opacity: 0.9,
            }}
        >
            <Typography variant="h6" sx={{ marginBottom: "12px" }}>
                Проекты
            </Typography>
            {projects.map((project) => (
                <Box
                    key={project.id}
                    sx={{
                        marginBottom: "12px",
                        padding: "12px",
                        backgroundColor: project.id === selectedProjectId ? "#b3e5fc" : "#f0f0f0", // Выделяем выбранный проект
                        borderRadius: "8px",
                        border: project.id === selectedProjectId ? "2px solid #0288d1" : "1px solid #e0e0e0", // Добавляем рамку для выбранного проекта
                        cursor: "pointer",
                        position: "relative",
                    }}
                >
                    <Typography onClick={() => onSelect(project.id)}>{project.name}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ marginLeft: "8px" }}>
                        {displayProjectDescription(project)}
                    </Typography>
                    <Button
                        size="small"
                        color={"#D6D4D4"}
                        opacity={"0.5"}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        onClick={() => onDelete(project.id)}
                    >
                        <DeleteIcon />
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
            <TextField
                fullWidth
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Описание проекта"
                sx={{ marginBottom: "8px" }}
            />
            <Button variant="contained" fullWidth onClick={handleCreateProject}>
                Добавить проект
            </Button>
        </Box>
        </div>
    );
};

export default ProjectPanel;

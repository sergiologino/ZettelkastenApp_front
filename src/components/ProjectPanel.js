import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import "./appStyle.css";
import DeleteIcon from "@mui/icons-material/Delete";

const ProjectPanel = ({
                          projects = [],
                          selectedProjectId,
                          onSelect,
                          onCreate,
                          onDelete,
                      }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [panelWidth, setPanelWidth] = useState(25); // Процент ширины панели

    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            alert("Название проекта не может быть пустым.");
            return;
        }
        const newProject = {
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
        };
        onCreate(newProject);
        setNewProjectName("");
        setNewProjectDescription("");
    };

    const handleResize = (e) => {
        const newWidth = Math.max(5, Math.min(25, (e.clientX / window.innerWidth) * 100));
        setPanelWidth(newWidth);
    };

    console.log("Рендер панели проектов, проекты:", projects);

    return (
        <div
            className="projpanel"
            style={{
                width: `${panelWidth}%`,
                height: "100vh",
                backgroundColor: "#c5e6ff",
                borderRight: "1px solid #e0e0e0",
                display: "flex",
                flexDirection: "column",
                position: "relative",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px",
                }}
            >
                <Typography variant="h6" sx={{ marginBottom: "12px" }}>
                    Проекты
                </Typography>
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <Box
                            key={project.id}
                            sx={{
                                marginBottom: "12px",
                                padding: "12px",
                                backgroundColor:
                                    project.id === selectedProjectId ? "#b3e5fc" : "#f0f0f0",
                                borderRadius: "8px",
                                border:
                                    project.id === selectedProjectId
                                        ? "2px solid #0288d1"
                                        : "1px solid #e0e0e0",
                                cursor: "pointer",
                                position: "relative",
                            }}
                        >
                            <Typography onClick={() => onSelect(project.id)}>
                                {project.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ marginLeft: "8px" }}
                            >
                                {project.description}
                            </Typography>
                            <Button
                                size="small"
                                sx={{ position: "absolute", right: 8, top: 8 }}
                                onClick={() => onDelete(project.id)}
                            >
                                <DeleteIcon />
                            </Button>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        Нет проектов для отображения.
                    </Typography>
                )}
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
            <div
                className="resizer"
                onMouseDown={(e) => {
                    e.preventDefault();
                    document.addEventListener("mousemove", handleResize);
                    document.addEventListener("mouseup", () => {
                        document.removeEventListener("mousemove", handleResize);
                    });
                }}
            />
        </div>
    );
};

export default ProjectPanel;

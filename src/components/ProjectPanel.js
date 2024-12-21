import React, { useState } from "react";
import { Box, Typography, Button, TextField, Tabs, Tab } from "@mui/material";
import "./appStyle.css";
import DeleteIcon from "@mui/icons-material/Delete";



const ProjectPanel = ({
                          projects = [],
                          selectedProjectId,
                          onSelect,
                          onCreate,
                          onDelete,
                          tags = [], // Список уникальных тегов
                          onTagSelect, // Функция для обработки выбранных тегов
                          activeTab, // Текущий активный таб
                          onTabChange, // Функция переключения табов
                      }) => {
    //console.log("onTabChange передан в ProjectPanel:", onTabChange);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [panelWidth, setPanelWidth] = useState(25); // Процент ширины панели
    const [selectedTab, setSelectedTab] = useState(0); // Текущий активный таб

    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            alert("Название проекта не может быть пустым.");
            return;
        }

        // Генерация текущей даты в формате "yyyy-mm-dd hh:mm"
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        const newProject = {
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
            createdAt: formattedDate, // Добавляем дату создания
        };
        onCreate(newProject);
        setNewProjectName("");
        setNewProjectDescription("");
    };

    const handleResize = (e) => {
        const newWidth = Math.max(5, Math.min(25, (e.clientX / window.innerWidth) * 100));
        setPanelWidth(newWidth);
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

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
            {/* Добавление табов */}
            <Tabs
                value={activeTab}
                onChange={(e, newValue) => onTabChange(newValue)}
                variant="fullWidth"
                sx={{ borderBottom: "1px solid #e0e0e0", backgroundColor: "#fff" }}
            >
                <Tab label="Проекты" />
                <Tab label="Теги" />
            </Tabs>

            {/* Контент табов */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px",
                }}
            >
                {selectedTab === 0 && (
                    <>
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
                                            project.id === selectedProjectId
                                                ? "#b3e5fc"
                                                : "#f0f0f0",
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
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        sx={{ position: "absolute", top: "12px", right: "12px", fontSize: "0.8rem", color: "#666" }}
                                    >
                                        {project.createdAt} {/* Отображаем дату */}
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
                    </>
                )}

                {selectedTab === 1 && (
                    <>
                        <Typography variant="h6" sx={{ marginBottom: "12px" }}>
                            Теги
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                            }}
                        >
                            {tags?.map((tag) => (
                                <Button
                                    key={tag}
                                    variant="outlined"
                                    onClick={() => onTagSelect(tag)}
                                    sx={{
                                        border: "1px solid",
                                        borderRadius: "4px",
                                        padding: "4px 8px",
                                        fontSize: "0.8rem",
                                        color: "#333",
                                    }}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </Box>
                    </>
                )}
            </Box>

            {/* Разделитель для изменения ширины панели */}
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

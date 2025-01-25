import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Tabs,
    Tab,
    Chip,
    IconButton,
    Popover,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { SketchPicker } from "react-color";
import { fetchAllTags } from "../api/api";
import "./appStyle.css";

const ProjectPanel = ({
                          projects = [],
                          selectedProjectId,
                          onSelect,
                          onCreate,
                          onTagChange,
                          onDelete,
                          tags = [],
                          onTagSelect,
                          activeTab,
                          onTabChange,
                          selectedTags,
                      }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [panelWidth, setPanelWidth] = useState(25);
    const [selectedTab, setSelectedTab] = useState(0);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [projectColor, setProjectColor] = useState("#1976d2");
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);

    useEffect(() => {
        if (activeTab === 1) {
            const loadTags = async () => {
                try {
                    const tags = await fetchAllTags();
                    onTagChange(tags);
                } catch (error) {
                    console.error("Ошибка при загрузке тегов:", error);
                }
            };
            loadTags();
        }
    }, [activeTab]);

    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            alert("Название проекта не может быть пустым.");
            return;
        }

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        const newProject = {
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
            createdAt: formattedDate,
            color: projectColor,
        };
        onCreate(newProject);
        setNewProjectName("");
        setNewProjectDescription("");
        setProjectColor("#1976d2");
        setIsCreatingProject(false);
    };

    const handleResize = (e) => {
        const newWidth = Math.max(5, Math.min(25, (e.clientX / window.innerWidth) * 100));
        setPanelWidth(newWidth);
    };

    const handleColorChange = (color) => {
        setProjectColor(color.hex);
    };

    const handleColorPickerOpen = (event) => {
        setColorPickerAnchor(event.currentTarget);
    };

    const handleColorPickerClose = () => {
        setColorPickerAnchor(null);
    };

    const getGradientBackground = (color) => {
        return `linear-gradient(135deg, ${color}, ${color}80)`;
    };

    const getColorForTag = (tag) => {
        const hash = Array.from(tag).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const colors = ["#FF5733", "#079c21", "#3357FF", "#F333FF", "#FF5733"];
        return colors[hash % colors.length];
    };

    return (
        <div
            className="projpanel"
            style={{
                width: `${panelWidth}%`,
                height: "100vh",
                backgroundColor: "rgba(197,221,255,0.6)",
                borderRight: "1px solid #e0e0e0",
                display: "flex",
                flexDirection: "column",
                position: "relative",
            }}
        >
            <Tabs
                value={activeTab}
                onChange={(e, newValue) => onTabChange(newValue)}
                variant="fullWidth"
                sx={{ borderBottom: "1px solid #e0e0e0", backgroundColor: "#fff" }}
            >
                <Tab label="Проекты" />
                <Tab label="Теги" />
            </Tabs>

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px",
                }}
            >
                {activeTab === 0 && (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                            <IconButton
                                color="primary"
                                onClick={() => setIsCreatingProject(!isCreatingProject)}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>

                        {isCreatingProject && (
                            <Box
                                sx={{
                                    mb: 2,
                                    transition: "all 0.3s ease",
                                    opacity: isCreatingProject ? 1 : 0,
                                    transform: isCreatingProject ? "translateY(0)" : "translateY(-20px)",
                                }}
                            >
                                <TextField
                                    fullWidth
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="Название проекта"
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    value={newProjectDescription}
                                    onChange={(e) => setNewProjectDescription(e.target.value)}
                                    placeholder="Описание проекта"
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleColorPickerOpen}
                                    sx={{ mb: 2 }}
                                >
                                    Выбрать цвет
                                </Button>
                                <Popover
                                    open={Boolean(colorPickerAnchor)}
                                    anchorEl={colorPickerAnchor}
                                    onClose={handleColorPickerClose}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "center",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "center",
                                    }}
                                >
                                    <SketchPicker color={projectColor} onChange={handleColorChange} />
                                </Popover>
                                <Button variant="contained" fullWidth onClick={handleCreateProject}>
                                    Создать проект
                                </Button>
                            </Box>
                        )}

                        {projects?.length > 0 ? (
                            projects.map((project) => (
                                <Box
                                    key={project.id}
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        borderRadius: "8px",
                                        background: getGradientBackground(project.color),
                                        cursor: "pointer",
                                        position: "relative",
                                        boxShadow: 2,
                                        transition: "transform 0.2s ease",
                                        "&:hover": {
                                            transform: "scale(1.02)",
                                        },
                                    }}
                                    onClick={() => onSelect(project.id)}
                                >
                                    <Typography variant="h6" sx={{ color: "#fff" }}>
                                        {project.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#fff", opacity: 0.8 }}>
                                        {project.description}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ position: "absolute", top: 8, right: 8, color: "#fff", opacity: 0.8 }}
                                    >
                                        {project.createdAt}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        sx={{ position: "absolute", bottom: 8, right: 8, color: "#fff" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(project.id);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                Нет проектов для отображения.
                            </Typography>
                        )}
                    </>
                )}

                {activeTab === 1 && (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Теги
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                            }}
                        >
                            {tags?.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                const tagColor = getColorForTag(tag);
                                return (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onClick={() => onTagSelect(tag)}
                                        sx={{
                                            backgroundColor: isSelected ? tagColor : "#e0e0e0",
                                            color: isSelected ? "#fff" : "#000",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                transform: "scale(1.1)",
                                                backgroundColor: tagColor,
                                                color: "#fff",
                                            },
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </>
                )}
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
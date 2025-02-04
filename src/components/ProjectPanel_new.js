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
    Popover, Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { SketchPicker } from "react-color";
import { fetchAllTags } from "../api/api";
import "./appStyle.css";
import {format, formatDate} from "date-fns";
import { ru } from "date-fns/locale";

const ProjectPanel_new = ({
                          projects = [],
                          selectedProjectId,
                          onSelect,
                          onCreate,
                          onEdit,
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
    const [selectedProject, setSelectedProject] = useState(null); // Для редактирования
    const [isEditingProject, setIsEditingProject] = useState(false); // Открыто ли окно редактирования
    const [editColor, setEditColor] = useState("#1976d2");
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

    // Открытие модального окна для редактирования
    const handleEditProject = (project) => {
        setSelectedProject(project);
        setNewProjectName(project.name);
        setNewProjectDescription(project.description);
        setEditColor(project.color || "#1976d2");
        setIsEditingProject(true);
    };

    // Закрытие модального окна
    const handleCloseEditModal = () => {
        setIsEditingProject(false);
        setSelectedProject(null);
        setNewProjectName("");
        setNewProjectDescription("");
        setEditColor("#1976d2");
    };

    const handleSaveEditProject = async () => {
        if (!newProjectName.trim()) {
            alert("Название проекта не может быть пустым.");
            return;
        }

        const updatedProject = {
            ...selectedProject,
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
            color: editColor, // Теперь цвет сохраняется
        };

        try {
            await onEdit(updatedProject);
            handleCloseEditModal();
        } catch (error) {
            console.error("Ошибка при обновлении проекта:", error);
            alert("Не удалось обновить проект.");
        }
    };

    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            alert("Название проекта не может быть пустым.");
            return;
        }

        // const now = new Date();
        // const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19); // 💡 Правильный формат ISO

        const newProject = {
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
            createdAt: formattedDate,
            updatedAt: formattedDate,
            color: projectColor,
        };
        onCreate(newProject);
        setNewProjectName("");
        setNewProjectDescription("");
        setProjectColor("#1976d2");
        setIsCreatingProject(false);
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

    //     // Преобразуем в дату
    //     const date = new Date(timestamp);
    //     console.log("Итог Дата время ",date);
    //     return isNaN(date.getTime()) ? "Некорректная дата" : format(date, "dd.MM.yy HH:mm", { locale: ru });
    // };




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

    const handleConfirmColor = () => {
        handleColorPickerClose();
        console.info(`Выбран цвет: ${projectColor}`);
    };


    const getGradientBackground = (color) => {
        return `linear-gradient(135deg, ${color} 0%, ${color}B0 100%)`;
    };

    const getColorForTag = (tag) => {
        const hash = Array.from(tag).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const colors = ["#FF5733", "#079c21", "#3357FF", "#F333FF", "#FF5733"];
        return colors[hash % colors.length];
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
                                    <Button onClick={handleConfirmColor} style={{ margin: "10px" }}>
                                        Ok
                                    </Button>
                                </Popover>
                                <Button variant="contained" fullWidth onClick={handleCreateProject}>
                                    Создать проект
                                </Button>
                            </Box>
                        )}
                        <Box sx={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                        {projects?.length > 0 ? (
                            projects.map((project) => {
                                const isSelected = project.id === selectedProjectId; // ✅ Проверяем, активен ли проект
                                return (
                                    <Box
                                        key={project.id}
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            borderRadius: "8px",
                                            background: getGradientBackground(project.color),
                                            cursor: "pointer",
                                            position: "relative",
                                            boxShadow: isSelected ? "0 0 10px rgba(255, 255, 255, 0.8)" : "2px 2px 5px rgba(0,0,0,0.2)",
                                            border: isSelected ? "2px solid #fff" : "2px solid transparent",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                transform: "scale(1.02)",
                                            },
                                        }}
                                        onClick={() => onSelect(project.id)}
                                        onDoubleClick={() => handleEditProject(project)}
                                    >
                                        {/* Название проекта */}
                                        <Typography variant="h6" sx={{ fontSize: "0.9rem", fontWeight: "normal", color: "#fff" }}>
                                            {project.name}
                                        </Typography>
                                        {/* Описание проекта */}
                                        <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#fff", opacity: 0.8, wordWrap: "normal" }}>
                                            {project.description}
                                        </Typography>
                                        {/* Дата проекта */}
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                position: "absolute",
                                                bottom: 4,
                                                right: 8,
                                                fontSize: "0.7rem",
                                                color: "#ffffffaa",
                                            }}
                                        >
                                            {formatDate(project.createdAt)}
                                        </Typography>

                                        {/* Кнопка редактирования */}
                                        <IconButton
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                right: 40, // Сдвигаем кнопку влево, чтобы не накладывалась
                                                color: "#fff",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditProject(project);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>

                                        {/* Кнопка удаления */}
                                        <IconButton
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                right: 8,
                                                color: "#fff",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(project.id);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                );
                            })
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                Нет проектов для отображения.
                            </Typography>
                        )}
                        </Box>
                        {/* Модальное окно для редактирования */}
                        <Modal
                            open={isEditingProject}
                            onClose={handleCloseEditModal}
                            aria-labelledby="edit-project-modal"
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 400,
                                    bgcolor: "background.paper",
                                    boxShadow: 24,
                                    p: 4,
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h6" mb={2}>
                                    Редактировать проект
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Название проекта"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Описание проекта"
                                    value={newProjectDescription}
                                    onChange={(e) => setNewProjectDescription(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <Typography variant="body1" sx={{ mr: 2 }}>Цвет проекта:</Typography>
                                    <IconButton
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            backgroundColor: editColor,
                                            border: "2px solid #ccc",
                                            transition: "all 0.3s ease",
                                            "&:hover": { transform: "scale(1.1)" },
                                        }}
                                        onClick={(e) => setColorPickerAnchor(e.currentTarget)}
                                    />
                                </Box>
                                <Modal // диалог выбора цвета
                                    open={Boolean(colorPickerAnchor)}
                                    onClose={() => setColorPickerAnchor(null)}
                                >
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            bgcolor: "background.paper",
                                            boxShadow: 24,
                                            p: 3,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Typography variant="h6">Выберите цвет</Typography>
                                        <SketchPicker color={editColor} onChange={(color) => setEditColor(color.hex)} />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            sx={{ mt: 2 }}
                                            onClick={() => setColorPickerAnchor(null)}
                                        >
                                            ОК
                                        </Button>
                                    </Box>
                                </Modal>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSaveEditProject}
                                    sx={{ mt: 2 }}
                                >
                                    Сохранить изменения
                                </Button>
                            </Box>
                        </Modal>
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
                                            border: isSelected ? "2px solid" : "1px solid", // Жирная граница для выбранных тегов
                                            borderColor: getColorForTag(tag), // Цвет границы совпадает с цветом тэга
                                            backgroundColor: isSelected ? `${getColorForTag(tag)}30` : "transparent", // Прозрачная заливка для выбранных
                                            borderRadius: "15px",
                                            padding: "4px 4px",
                                            fontSize: "0.6rem",
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

export default ProjectPanel_new;
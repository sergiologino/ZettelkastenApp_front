import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Modal,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Chip,
    IconButton,
    Badge,
    Fade,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import './appStyle.css';
import { Save, Close, Add } from "@mui/icons-material";
import { AttachFile, Delete } from "@mui/icons-material";
import OGPreview from "./OGPreview";
import { uploadAudioFiles, uploadFiles } from "../api/api";
import { fetchOpenGraphData } from "../api/api";

const NoteModal_new = ({
                       open,
                       onClose,
                       onSave,
                       projects = [],
                       isGlobalAnalysisEnabled = false,
                       note = null,
                       selectedProject,
                       setNotes,
                   }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [title, setTitle] = useState(note?.title || "");
    const [content, setContent] = useState(note?.content || "");
    const [file, setFile] = useState(null);
    const [selectedProjectModal, setSelectedProject] = useState(note?.projectId || selectedProject || null);
    const [selectedCategory, setSelectedCategory] = useState(note?.category || "");
    const [individualAnalysisFlag, setIndividualAnalysisFlag] = useState(isGlobalAnalysisEnabled);
    const [tags, setTags] = useState(note?.tags || []);
    const [newTag, setNewTag] = useState("");
    const [files, setFiles] = useState(note?.files || []);
    const [urls, setUrls] = useState(note?.urls || []);
    const [newUrl, setNewUrl] = useState("");
    const [audios, setAudioFiles] = useState(note?.audioFiles || []);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [openGraphData, setOpenGraphData] = useState({});
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const noteId = note?.id || "Нет ID";
    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        if (open && note) {
            setTitle(note.title || "");
            setContent(note.content || "");
            setSelectedProject(note.projectId || "");
            setSelectedCategory(note.category || "");
            setTags(note.tags || []);
            setAudioFiles(note.audios || []);
            setFiles(note.files || []);
            setOpenGraphData(note.openGraphData || {});
        } else if (open) {
            setTitle("");
            setContent("");
            setSelectedProject(selectedProject || "");
            setSelectedCategory("");
            setTags([]);
            setOpenGraphData({});
            setAudioFiles([]);
            setFiles([]);
            setUrls([]);
        }
    }, [open, note]);

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = "Заголовок не может быть пустым";
        if (!content.trim()) newErrors.content = "Текст заметки не может быть пустым";
        if (!selectedProjectModal) newErrors.project = "Выберите проект";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            const updatedNote = {
                ...note,
                title,
                content,
                projectId: selectedProjectModal,
                category: selectedCategory,
                audios: audios?.map((audio) => ({
                    url: audio.url,
                    name: audio.name,
                })),
                files: files?.map((file) => {
                    if (file instanceof File) {
                        return {
                            name: file.name,
                            fileUrl: URL.createObjectURL(file),
                        };
                    } else {
                        return file;
                    }
                }),
                individualAnalysisFlag,
                tags,
                urls,
            };

            const savedNote = await onSave(updatedNote);

            if (files.length > 0) {
                const formDataFiles = new FormData();
                files.forEach((file) => {
                    if (file instanceof File) {
                        formDataFiles.append("files", file);
                    } else if (file.file instanceof File) {
                        formDataFiles.append("files", file.file);
                    } else if (file.filePath) {
                        const blob = new Blob([file.filePath], { type: "text/plain" });
                        formDataFiles.append("files", blob, file.fileName);
                    }
                });

                if (Array.from(formDataFiles.keys()).length > 0) {
                    await uploadFiles(savedNote.id, formDataFiles);
                }
            }

            if (audios.length > 0) {
                const formDataAudio = new FormData();
                const newAudiosFormData = await prepareFormDataForAudios(audios);
                if (newAudiosFormData.has("audios")) {
                    await uploadAudioFiles(savedNote.id, newAudiosFormData);
                }
            }

            setNotes((prevNotes) =>
                prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n))
            );

            alert("Заметка успешно сохранена!");
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении заметки:", error.response?.data || error.message);
            alert("Не удалось сохранить заметку. Проверьте соединение с сервером.");
        }
    };

    // Остальные функции остаются без изменений...

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "900px",
                    height: "600px",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    <Tab label="Основное" />
                    <Tab label={<Badge badgeContent={files.length + audios.length + urls.length} color="primary">Вложения</Badge>} />
                </Tabs>
                <Box sx={{ flex: 1, overflowY: "auto", padding: 4 }}>
                    <Fade in={activeTab === 0} timeout={500}>
                        <Box>
                            {activeTab === 0 && (
                                <>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Заголовок заметки"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        error={!!errors.title}
                                        helperText={errors.title}
                                    />
                                    <FormControl fullWidth margin="normal" error={!!errors.project}>
                                        <InputLabel id="project-select-label">Проект</InputLabel>
                                        <Select
                                            labelId="project-select-label"
                                            value={selectedProjectModal}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                        >
                                            {projects.map((project) => (
                                                <MenuItem key={project.id} value={project.id}>
                                                    {project.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.project && <Typography color="error" variant="caption">{errors.project}</Typography>}
                                    </FormControl>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="category-select-label">Категория</InputLabel>
                                        <Select
                                            labelId="category-select-label"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                        >
                                            <MenuItem value="category1">Категория 1</MenuItem>
                                            <MenuItem value="category2">Категория 2</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Текст заметки"
                                        multiline
                                        rows={5}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        error={!!errors.content}
                                        helperText={errors.content}
                                    />
                                    <Box>
                                        <TextField
                                            label="Добавить тег"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                            sx={{ marginRight: 2 }}
                                        />
                                        <Button variant="contained" onClick={handleAddTag}>
                                            Добавить
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                                        {tags.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                onDelete={() => handleDeleteTag(tag)}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Fade>
                    <Fade in={activeTab === 1} timeout={500}>
                        <Box>
                            {activeTab === 1 && (
                                <>
                                    <Typography variant="h6">Вложения</Typography>
                                    <Box mt={2}>
                                        <Typography variant="subtitle1">Файлы:</Typography>
                                        <Button variant="outlined" component="label" startIcon={<AttachFile />} sx={{ marginTop: "8px" }}>
                                            Загрузить файл
                                            <input type="file" hidden onChange={handleFileChange} />
                                        </Button>
                                        <Box mt={2}>
                                            {files?.map((file, index) => (
                                                <Box key={index} display="flex" justifyContent="space-between" alignItems="flex-end" mb={1}>
                                                    <Typography variant="body2">{file.fileName || file.name}</Typography>
                                                    <IconButton onClick={(e) => handleDownloadFile(e, file)} aria-label="Скачать файл">
                                                        <DownloadIcon />
                                                    </IconButton>
                                                    <IconButton color="error" onClick={() => handleFileDelete(file)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box mt={2}>
                                        <Typography variant="subtitle1">Ссылки:</Typography>
                                        <Box display="flex" mt={1}>
                                            <TextField
                                                fullWidth
                                                label="Введите ссылку"
                                                value={newUrl}
                                                onChange={(e) => setNewUrl(e.target.value)}
                                                sx={{ marginRight: "8px" }}
                                            />
                                            <Button variant="contained" onClick={handleAddUrl}>
                                                Добавить
                                            </Button>
                                        </Box>
                                        <Box mt={2}>
                                            <Typography variant="subtitle1">OpenGraph данные:</Typography>
                                            {Object.keys(openGraphData).length > 0 ? (
                                                Object.entries(openGraphData).map(([url, ogData], index) => (
                                                    <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                                        {ogData ? (
                                                            <OGPreview
                                                                ogData={{
                                                                    title: ogData.title || "Без названия",
                                                                    description: ogData.description || "Описание отсутствует",
                                                                    image: ogData.image || "Нет изображения",
                                                                    url: ogData.url || url,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography variant="body2">Нет данных для URL: {url}</Typography>
                                                        )}
                                                        <IconButton color="error" onClick={() => handleDeleteUrl(url)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography variant="body2">Нет OpenGraph данных</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Box mt={2}>
                                        <Typography variant="subtitle1">Аудиофайлы:</Typography>
                                        <Box display="flex" gap={2} mt={1}>
                                            <Button
                                                variant="contained"
                                                color={isRecording ? "error" : "primary"}
                                                onClick={isRecording ? stopRecording : startRecording}
                                            >
                                                {isRecording ? "Остановить запись" : "Записать"}
                                            </Button>
                                            {recordedAudio && (
                                                <Button variant="outlined" onClick={saveRecordedAudio}>
                                                    Сохранить запись
                                                </Button>
                                            )}
                                            <Button variant="outlined" component="label">
                                                Загрузить файл
                                                <input type="file" hidden accept="audio/*" onChange={handleAudioFileChange} />
                                            </Button>
                                        </Box>
                                        <Box mt={2}>
                                            {audios?.map((audio, index) => (
                                                <Box key={index} display="flex" justifyContent="space-between" alignItems="flex-end" mb={1}>
                                                    <audio controls src={`${BASE_URL}${audio.url}`} style={{ width: "40%", fontSize: "0.5em", height: "30px", padding: "inherit" }} />
                                                    <Typography variant="body2" style={{ color: "#888", fontSize: "0.6rem" }}>
                                                        {audio.name || "Неизвестно"}
                                                    </Typography>
                                                    <IconButton onClick={(e) => handleDownloadAudio(e, audio)} aria-label="Скачать аудио">
                                                        <DownloadIcon />
                                                    </IconButton>
                                                    <IconButton color="error" onClick={() => handleAudioDelete(audio)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Fade>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", padding: "16px", borderTop: "1px solid #e0e0e0" }}>
                    <Button variant="outlined" color="secondary" onClick={onClose} sx={{ width: "40%" }}>
                        Отмена
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSave} sx={{ width: "40%" }}>
                        Сохранить
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default NoteModal;
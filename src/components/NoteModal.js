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
    Switch,
    FormControlLabel,
    Chip, IconButton,
} from "@mui/material";
import { AttachFile, Delete } from "@mui/icons-material"; // Иконки для загрузки и удаления файлов


const NoteModal = ({
                       open,
                       onClose,
                       onSave,
                       projects = [],
                       isGlobalAnalysisEnabled = false,
                       note = null, // Обрабатываем null корректно

                   }) => {
    const [content, setContent] = useState(note?.content || "");
    const [file, setFile] = useState(null);
    const [selectedProject, setSelectedProject] = useState(note?.projectId || "");
    const [individualAnalysisFlag, setIndividualAnalysisFlag] = useState(
        isGlobalAnalysisEnabled
    );
    const [tags, setTags] = useState(note?.tags || []);
    const [newTag, setNewTag] = useState("");
    const [files, setFiles] = useState(note?.files || []); // Состояние для загруженных файлов
    const [newFile, setNewFile] = useState(null); // Временное состояние для выбранного файла

    const [links, setLinks] = useState(note?.links || []); // Состояние для ссылок
    const [newLink, setNewLink] = useState("");

    const [audioFiles, setAudioFiles] = useState(note?.audioFiles || []); // Список аудиофайлов
    const [isRecording, setIsRecording] = useState(false); // Флаг записи
    const [mediaRecorder, setMediaRecorder] = useState(null); // MediaRecorder
    const [recordedAudio, setRecordedAudio] = useState(null); // Временное аудио


    // console.log("note: ",note);
    // console.log("project: ",note?.projectId);
    // console.log("on begin NoteModal selected project: ",selectedProject);

    useEffect(() => {

        //console.log("note status in NoteModal: ",note);
        if (open && note) {
            // console.log("Open note for edit");
            setContent(note.content || "");
            setSelectedProject(note.projectId || "");
            setTags(note.tags || []);
        } else if (open){
            // console.log("Open new note");
            setContent("");
            setSelectedProject(selectedProject||"");
            setTags([]);
        }
    }, [open,note]);

    // Начало записи
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const audioChunks = [];

            recorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setRecordedAudio({ url: audioUrl, blob: audioBlob, name: `recording-${Date.now()}.mp3` });
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            console.error("Ошибка при доступе к микрофону:", error);
            alert("Не удалось начать запись. Проверьте доступ к микрофону.");
        }
    };

// Остановка записи
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };


// Сохранение записанного аудио в список
    const saveRecordedAudio = () => {
        if (recordedAudio) {
            setAudioFiles((prev) => [...prev, recordedAudio]);
            setRecordedAudio(null);
        }
    };


    // Обработчик выбора файла
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFiles((prevFiles) => [...prevFiles, file]);
        }
    };

    // Удаление файла
    const handleFileDelete = (fileToDelete) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToDelete));
    };

    const handleAddLink = () => {
        if (!newLink.trim()) {
            alert("Введите ссылку.");
            return;
        }
        if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(newLink.trim())) {
            alert("Введите корректный URL.");
            return;
        }
        setLinks((prevLinks) => [...prevLinks, newLink.trim()]);
        setNewLink("");
    };

    const handleDeleteLink = (linkToDelete) => {
        setLinks((prevLinks) => prevLinks.filter((link) => link !== linkToDelete));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setTags(tags.filter((tag) => tag !== tagToDelete));
    };

    const handleSave = () => {
        if (!content.trim()) {
            alert("Текст заметки не может быть пустым.");
            return;
        }

        if (!selectedProject) {
            alert("Выберите проект.");
            return;
        }

        const updatedNote = {
            ...note, // Копируем все свойства из текущей заметки
            content,
            file,
            projectId: selectedProject,
            individualAnalysisFlag,
            tags,
        };

        onSave(updatedNote); // Передаём обновлённые данные
        setContent("");
        setFile(null);
        setSelectedProject("");
        setIndividualAnalysisFlag(isGlobalAnalysisEnabled);
        onClose();
    };

    const handleAudioFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "audio/mpeg" || file.type === "audio/wav")) {
            setAudioFiles((prev) => [...prev, { name: file.name, url: URL.createObjectURL(file), blob: file }]);
        } else {
            alert("Пожалуйста, загрузите файл в формате MP3 или WAV.");
        }
    };

    const handleAudioDelete = (audioToDelete) => {
        setAudioFiles((prev) => prev.filter((audio) => audio !== audioToDelete));
    };



    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
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
                <Typography id="modal-title" variant="h6" component="h2">
                    {note?.id ? "Редактировать заметку" : "Добавить заметку"}
                </Typography>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="project-select-label">Проект</InputLabel>
                    <Select
                        labelId="project-select-label"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                {project.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Текст заметки"
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                {/* Загрузка файлов */}
                <Box mt={2}>
                    <Typography variant="subtitle1">Файлы:</Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFile />}
                        sx={{ marginTop: "8px" }}
                    >
                        Загрузить файл
                        <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    <Box mt={2}>
                        {files.map((file, index) => (
                            <Box
                                key={index}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                            >
                                <Typography variant="body2">{file.name}</Typography>
                                <IconButton
                                    color="error"
                                    onClick={() => handleFileDelete(file)}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                    {/* Работа с ссылками */}
                    <Box mt={2}>
                        <Typography variant="subtitle1">Ссылки:</Typography>
                        <Box display="flex" mt={1}>
                            <TextField
                                fullWidth
                                label="Введите ссылку"
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                                sx={{ marginRight: "8px" }}
                            />
                            <Button variant="contained" onClick={handleAddLink}>
                                Добавить
                            </Button>
                        </Box>
                        <Box mt={2}>
                            {links.map((link, index) => (
                                <Box
                                    key={index}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1}
                                >
                                    <Typography
                                        variant="body2"
                                        component="a"
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ textDecoration: "none", color: "primary.main" }}
                                    >
                                        {link}
                                    </Typography>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteLink(link)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}
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
                                <input
                                    type="file"
                                    hidden
                                    accept="audio/*"
                                    onChange={handleAudioFileChange}
                                />
                            </Button>
                        </Box>
                        <Box mt={2}>
                            {audioFiles.map((audio, index) => (
                                <Box
                                    key={index}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1}
                                >
                                    <audio controls src={audio.url} style={{ width: "70%" }} />
                                    <Typography variant="body2">{audio.name}</Typography>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleAudioDelete(audio)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>
            </Box>
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
                <Box sx={{ marginTop: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                <FormControlLabel
                    control={
                        <Switch
                            checked={individualAnalysisFlag}
                            onChange={(e) => setIndividualAnalysisFlag(e.target.checked)}
                        />
                    }
                    label="Отправить на анализ"
                    sx={{ marginTop: "16px" }}
                />
                <Box mt={2} display="flex" justifyContent="space-between">
                    <Button onClick={onClose} color="secondary">
                        Отмена
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Сохранить
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default NoteModal;

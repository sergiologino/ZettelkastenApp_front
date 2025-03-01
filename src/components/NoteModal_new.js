import React, {useState, useEffect, useRef} from "react";
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
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // Иконка копирования
import SaveIcon from "@mui/icons-material/Save"; // Иконка сохранения
import CancelIcon from "@mui/icons-material/Cancel"; // Иконка отмены
import DeleteIcon from "@mui/icons-material/Delete"; // Иконка удаления
import DownloadIcon from "@mui/icons-material/Download";
import './appStyle.css';
import { Save, Close, Add } from "@mui/icons-material";
import { AttachFile, Delete } from "@mui/icons-material";
import OGPreview from "./OGPreview";
import {fetchProjects, uploadAudioFiles, uploadFiles} from "../api/api";
import { fetchOpenGraphData } from "../api/api";

const NoteModal_new = ({
                       open,
                       onClose,
                       onSave,
                       onUpdateNote,
                       onDelete,
                       setNotes,
                       notes,
                       projects = [],
                       isGlobalAnalysisEnabled = false,
                       note = null,
                       selectedProject,
                       calculateNewNotePosition,
                       setSelectedNote,
                       setIsModalOpen,

                   }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [title, setTitle] = useState(note?.title ?? "Новая заметка");
    const [content, setContent] = useState(note?.content || "");
    const [file, setFile] = useState(null);
    const [selectedProjectModal, setSelectedProject] = useState(note?.projectId ?? selectedProject);
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
    const [deletedAudios, setDeletedAudios] = useState([]);
    const [project, setProjectName] = useState(note?.project|| "Не заполнено");
    // const [notes, setNotes]=useState([]);
    const [errors, setErrors] = useState({});
    const noteId = note?.id || "Нет ID";
    const BASE_URL = "http://localhost:8080";
    const titleRef = useRef(title);


    useEffect(() => {
        if (!note?.projectId) {

            setSelectedProject(selectedProject); // ✅ Теперь следим за изменениями `selectedProject`

        }
    }, [selectedProject]);


    useEffect(() => {
        if (!note?.id) { // ✅ Только для новой заметки
            setSelectedProject(selectedProject);

        }
    }, [selectedProject]); // ✅ Теперь отслеживаем изменения `selectedProject`

    useEffect(() => {
        if (open) {
            if (note?.id) {  // ✅ Если заметка уже существует
                setTitle(note.title || "Заметка без заголовка");
                setContent(note.content || "Заметка без контента");
                setSelectedProject(note.projectId || "");
                setSelectedCategory(note.category || "");
                setTags(note.tags || []);
                setAudioFiles(note.audios || []);
                setFiles(note.files || []);
                setProjectName(note.projectName || "Не заполнено");
                setOpenGraphData(note.openGraphData || {});
            } else {  // ✅ Если `note` не передана - создаем новую

                setTitle("");
                setContent("");
                setSelectedProject(selectedProject);

                setSelectedCategory("");
                setTags([]);
                setOpenGraphData({});
                setAudioFiles([]);
                setFiles([]);
                setUrls([]);
            }
        }
    }, [open, note, selectedProject]);

    useEffect(() => {
        if (note) {
            setTitle(note.title || "Новая заметка");
            setContent(note.content || "");
            setTags(note.tags || []);
            setSelectedProject(note.projectId || selectedProject);
        }
    }, [note]); // 🔹 Следим за изменением note

    const validate = () => {
        const newErrors = {};
        if (!content.trim()) newErrors.content = "Текст заметки не может быть пустым";
        if (!selectedProjectModal) newErrors.project = "Выберите проект";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Начало записи
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            const recorder = new MediaRecorder(stream);
            const audioChunks = [];

            recorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, {type: 'audio/mp3'});
                const audioUrl = URL.createObjectURL(audioBlob);
                setRecordedAudio({url: audioUrl, blob: audioBlob, name: `recording-${Date.now()}.mp3`});
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            console.error("Ошибка при доступе к микрофону:", error);
            alert("Не удалось начать запись. Проверьте доступ к микрофону.");
        }
    };






    const handleDownloadAudio = async (e, audio) => {
        e.preventDefault(); // Останавливает стандартное поведение
        console.log("Путь для скачивания аудио: ", BASE_URL + audio.url);
        if (!audio || !audio.url) {
            console.error("Некорректный объект audio:", audio);
            return;
        }
        try {
            const response = await fetch(BASE_URL + audio.url);
            if (!response.ok) throw new Error("Ошибка загрузки файла");

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = audio.name || "noname.mp3";
            link.click();
            URL.revokeObjectURL(link.href); // Освобождаем память
        } catch (error) {
            console.error("Ошибка при скачивании аудио:", error);
        }
    };

    const handleDownloadFile = async (e, file) => {
        e.preventDefault(); // Останавливает стандартное поведение
        console.log("Путь для скачивания файла : ", BASE_URL + file.fileUrl);
        if (!file || !file.fileUrl) {
            console.error("Некорректный объект :", file);
            return;
        }
        try {
            console.log("download file: ",file);
            const response = await fetch(BASE_URL + file.fileUrl);
            if (!response.ok) throw new Error("Ошибка загрузки файла");

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = file.name;
            link.click();
            URL.revokeObjectURL(link.href); // Освобождаем память
        } catch (error) {
            console.error("Ошибка при скачивании файла:", error);
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
            const fileData = {
                name: file.name,
                url: URL.createObjectURL(file), // Создаём временную ссылку
                file,
            };
            setFiles((prevFiles) => [...prevFiles, fileData]); // Добавляем файл в состояние
        }
    };


    // Удаление файла
    const handleFileDelete = (fileToDelete) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToDelete));

        if (fileToDelete.id) {
            setDeletedFiles((prev) => [...prev, fileToDelete.id]);
        }
    };

    const handleAudioDelete = (audioToDelete) => {
        setAudioFiles((prev) => prev.filter((audio) => audio !== audioToDelete));
        if (audioToDelete.id) {
            setDeletedAudios((prev) => [...prev, audioToDelete.id]);
        }
    };

    const handleAddUrl = async () => {
        if (!newUrl.trim()) {
            alert("Введите ссылку.");
            return;
        }
        if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(newUrl.trim())) {
            alert("Введите корректный URL.");
            return;
        }

        try {
            // Пытаемся получить OpenGraph данные для нового URL
            const ogData = await fetchOpenGraphData(newUrl.trim());
            setOpenGraphData((prev) => ({
                ...prev,
                [newUrl]: ogData || { url: newUrl }, // Если данные не найдены, сохраняем только URL
            }));
            setUrls((prevUrls) => [...prevUrls, newUrl]); // Добавляем URL в список
            setNewUrl("");
        } catch (error) {
            console.error("Ошибка при поиске OpenGraph данных:", error);
            alert("Не удалось загрузить OpenGraph данные. URL будет добавлен без данных.");
            setUrls((prevUrls) => [...prevUrls, newUrl]); // Добавляем только URL
            setNewUrl("");
        }
        console.log("массив ссылок после добавления OGData: ",urls);
    };



    // Удалить URL
    const handleDeleteUrl = (urlToDelete) => {
        setUrls((prevUrls) => prevUrls.filter((url) => url !== urlToDelete));
        const updatedOpenGraphData = {...openGraphData};
        delete updatedOpenGraphData[urlToDelete];
        setOpenGraphData(updatedOpenGraphData);
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


    const handleSave = async () => {
        if (!validate()) return;
            let savedNote = {
                ...note,
                title,
                content,
                projectId: selectedProjectModal,
                category: selectedCategory,
                tags: tags ?? [], // ✅ Гарантируем, что всегда массив
                urls: urls ?? [], // ✅ Гарантируем, что всегда массив

            };

        try {
            console.log("Подготовленная заметка перед сохранением:", savedNote);

            // Если это новая заметка, сначала создаем ее
            if (savedNote.id) {
                // Если заметка уже существует, вызываем функцию обновления
                savedNote = await onUpdateNote(savedNote);
            } else {
                // Если заметка новая, вызываем функцию создания
                savedNote = await onSave(savedNote);
            }

            if (!savedNote.id) {
                alert("Ошибка сохранения. Сервер не вернул ID.");
                return;
            }

            // Устанавливаем координаты новой заметки
            if (!note.id) { // Если это новая заметка
                const newPosition = calculateNewNotePosition(notes);
                savedNote.x = newPosition.x;
                savedNote.y = newPosition.y;
            }

            // Загружаем файлы, если они есть
            if (files.length > 0) {
                const formDataFiles = new FormData();
                files.forEach((file) => {
                    if (file instanceof File) {
                        formDataFiles.append("files", file);
                    } else if (file.file instanceof File) {
                        formDataFiles.append("files", file.file);
                    }
                });
                await uploadFiles(savedNote.id, formDataFiles);

            } else {
                console.log("Отправляем ПУСТЫЕ файлы для заметки");
                await uploadFiles(savedNote.id, new FormData());

            }

            // Загружаем аудиофайлы, если есть
            if (audios.length > 0) {
                const formDataAudios = new FormData();
                audios.forEach((audio) => {
                    if (audio.blob instanceof Blob) {
                        formDataAudios.append("audios", audio.blob, audio.name || "recording.mp3");
                    }
                });
                await uploadAudioFiles(savedNote.id, formDataAudios);

                // if (formDataAudios.has("audios")) {
                //     console.log("Загружаем аудио для заметки ID:", savedNote.id);
                //     const uploadedAudios = await uploadAudioFiles(savedNote.id, formDataAudios);
                //     savedNote.audios = uploadedAudios.files;
                // }
            } else {
                await uploadAudioFiles(savedNote.id, new FormData());
            }


            setNotes((prevNotes) => {
                const existingIndex = prevNotes.findIndex((n) => n.id === savedNote.id);
                if (existingIndex !== -1) {
                    // Обновляем существующую заметку
                    return prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n));
                } else {
                    // Добавляем новую заметку
                    return [...prevNotes, savedNote];
                }
            });


            alert("Вести с фронта (NoteModal-handleSave): Заметка успешно сохранена!");
            onClose();
        } catch (error) {
            console.error("Вести с фронта (NoteModal-handleSave): Ошибка при сохранении заметки:", error.response?.data || error.message);
        }
    };

    const handleAudioFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "audio/mpeg" || file.type === "audio/wav" || file.type === "audio/m4a")) {
            setAudioFiles((prev) => [...prev, {name: file.name, url: URL.createObjectURL(file), blob: file}]);
        } else {
            alert("Пожалуйста, загрузите файл в формате MP3 или WAV.");
        }
    };


    const prepareFormDataForAudios = async (audios) => {
        const formData = new FormData();

        for (const audio of audios) {
            if (audio.blob instanceof Blob) {
                console.log("Если это Blob, добавляем напрямую: ", audio);
                // Если это Blob, добавляем напрямую
                formData.append("audios", audio.blob, audio.name || generateDefaultFileName());
            } else if (audio.url) {
                try {
                    console.log("Если это ссылка, загружаем аудиофайл и создаем Blob: ", audio.url);
                    // Если это ссылка, загружаем аудиофайл и создаем Blob
                    const response = await fetch(audio.url);
                    if (response.ok) {
                        console.log("Получилось response = await fetch(audio.url) стр 344: ", response);
                        const blob = await response.blob();
                        formData.append("audios", blob, audio.name || generateDefaultFileName());
                    } else {
                        console.warn(`Не удалось загрузить аудио: ${audio.url}`);
                    }
                } catch (error) {
                    console.error(`Ошибка при загрузке аудио с ${audio.url}:`, error);
                }
            } else {
                console.warn("Пропущено некорректное аудио:", audio);
            }
        }

        return formData;
    };

    const generateDefaultFileName = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}_${hours}-${minutes}_recording.mp3`;
    };
    const handleCopyFromModal = () => {
        const copiedNote = {
            title: `Copy: ${title}`,
            content,
            tags: [...tags],
            projectId: selectedProjectModal,
        };

        onClose(); // Закрываем текущую заметку
        setTimeout(() => {
            setSelectedNote(copiedNote);
            setIsModalOpen(true);
        }, 300); // Небольшая задержка, чтобы не было резкого переключения
    };


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
                <TextField
                    fullWidth
                    margin="normal"
                    label="Заголовок заметки"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    sx={{ mb: 2,  width: "800px", marginLeft:"25px", marginRight:"25px", }}
                />
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    <Tab label="Основное" />
                    <Tab label={<Badge
                        badgeContent={
                            (Array.isArray(files) ? files.length : 0) +
                            (Array.isArray(audios) ? audios.length : 0) +
                            (Array.isArray(urls) ? urls.length : 0)
                        }
                        color="primary"
                    >
                        Вложения
                    </Badge>} />
                </Tabs>
                <Box sx={{ flex: 1, overflowY: "auto", padding: 4 }}>
                    <Fade in={activeTab === 0} timeout={500}>
                        <Box>
                            {activeTab === 0 && (
                                <>
                                    {/*<TextField*/}
                                    {/*    fullWidth*/}
                                    {/*    margin="normal"*/}
                                    {/*    label="Заголовок заметки"*/}
                                    {/*    value={title}*/}
                                    {/*    onChange={(e) => setTitle(e.target.value)}*/}
                                    {/*    error={!!errors.title}*/}
                                    {/*    helperText={errors.title}*/}
                                    {/*/>*/}
                                    <FormControl
                                        fullWidth
                                        margin="normal"
                                        value={project}
                                        error={!!errors.project}>
                                        <InputLabel id="project-select-label">Проект</InputLabel>
                                        <Select
                                            labelId="project-select-label"
                                            value={selectedProjectModal || ""}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                        >
                                            {projects.length > 0 ? (
                                              projects.map((project) => (
                                                <MenuItem key={project.id} value={project.id}>
                                                    {project.name}
                                                </MenuItem>
                                            ))
                                                ):(
                                                <MenuItem disabled>Нет доступных проектов</MenuItem>
                                                )}
                                        </Select>
                                        {errors.project && <Typography color="error" variant="caption">{errors.project}</Typography>}
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
                                    <Typography sx={{ color: "#757575", display: "flex", flexWrap: "wrap", left: "50%",bottom:"2px", mt: 2 }}>id заметки: {note.id}</Typography>
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
                                            <Typography variant="subtitle1">Ссылки:</Typography>
                                            {Object.keys(openGraphData).length > 0 ? (
                                                Object.entries(openGraphData).map(([url, ogData], index) => (
                                                    <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                                        {ogData ? (
                                                            <OGPreview
                                                                ogData={{
                                                                    title: ogData.title || ogData.url,
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

                    {/* Кнопка удаления (левая) */}
                    {note?.id && (
                        <IconButton
                            color="error"
                            onClick={async () => {
                                if (window.confirm("Вы уверены, что хотите удалить заметку?")) {
                                    try {
                                        await onDelete(note.id);
                                        setNotes((prevNotes) => prevNotes.filter((n) => n.id !== note.id));
                                        onClose();
                                    } catch (error) {
                                        alert("Ошибка при удалении заметки.");
                                    }
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}

                    {/* Кнопка копирования */}
                    <IconButton color="primary" onClick={() => handleCopyFromModal()}>
                        <ContentCopyIcon />
                    </IconButton>

                    {/* Кнопка отмены */}
                    <IconButton color="secondary" onClick={onClose}>
                        <CancelIcon />
                    </IconButton>

                    {/* Кнопка сохранения */}
                    <IconButton color="primary" onClick={handleSave}>
                        <SaveIcon />
                    </IconButton>
                </Box>
            </Box>
        </Modal>
    );
};

export default NoteModal_new;
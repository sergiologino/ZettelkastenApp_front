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
    Fade, Autocomplete,
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
import {
    addNote,
    fetchAllTags,
    fetchProjects,
    updateNote,
    updateNoteWithFiles,
    uploadAudioFiles,
    uploadFiles
} from "../api/api";
import { fetchOpenGraphData } from "../api/api";
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Можете выбрать другие стили подсветки
import "katex/dist/katex.min.css";
import 'react-quill/dist/quill.bubble.css';
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
    const BASE_URL = process.env.REACT_APP_API_URL;
    const titleRef = useRef(title);
    const [filteredTags, setFilteredTags] = useState(tags);
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        if (open && activeTab === 0) {
            setShowEditor(false);
            const timer = setTimeout(() => setShowEditor(true), 100); // 100 мс для полной инициализации модалки
            return () => clearTimeout(timer);
        }
    }, [open, activeTab]);

    useEffect(() => {
        hljs.configure({
            languages: ['javascript', 'java', 'python', 'html', 'css', 'json', 'xml'],
        });
    }, []);

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

    const modules = {
        syntax: {
            highlight: text => hljs.highlightAuto(text).value, // Используем Highlight.js для подсветки кода
        },
        toolbar: [
            [{ 'font': [] }, { 'size': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['link', 'image', 'video', 'formula'],
            ['clean']
        ]
    };

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

    // Удаление аудиофайла
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
                tags: tags ?? [],
                urls: urls ?? []
            };


                // files.forEach((file) => {
                //     if (file instanceof File) {
                //         formDataFiles.append("files", file);
                //     } else if (file.file instanceof File) {
                //         formDataFiles.append("files", file.file);
                //     }
                // });

        try {
            console.log("Отправка заметки на сервер:", savedNote);

            if (savedNote.id) {
                savedNote = await updateNote(savedNote);
            } else {
                const newPosition = calculateNewNotePosition(notes);
                savedNote.x = newPosition.x;
                savedNote.y = newPosition.y;
                savedNote = await addNote(savedNote, selectedProjectModal);
            }

            if (savedNote.id) {
                const formData = new FormData();
                formData.append("note", new Blob([JSON.stringify(savedNote)], { type: "application/json" }));

                files.forEach((file) => {
                    if (file instanceof File) {
                        formData.append("files", file);
                    } else if (file.file instanceof File) {
                        formData.append("files", file.file);
                    }
                });


                audios.forEach((audio) => {
                    if (audio.blob instanceof Blob) {
                        formData.append("audios", audio.blob, audio.name || "recording.mp3");
                    }
                });

                // Добавляем список удалённых файлов
                formData.append("deletedFiles", new Blob([JSON.stringify(deletedFiles)], { type: "application/json" }));

                // Добавляем список удалённых файлов
                formData.append("deletedAudios", new Blob([JSON.stringify(deletedAudios)], { type: "application/json" }));



                console.log("Финальная FormData перед отправкой:");
                for (let pair of formData.entries()) {
                    console.log(pair[0], pair[1]);
                }

                savedNote = await updateNoteWithFiles(formData);
            } else {
                savedNote = await onSave(savedNote);
            }


            setNotes((prevNotes) => {
                const existingIndex = prevNotes.findIndex((n) => n.id === savedNote.id);
                return existingIndex !== -1 ? prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n)) : [...prevNotes, savedNote];
            });

            alert("Заметка успешно сохранена!");
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении заметки:", error.response?.data || error.message);
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
                    height: "700px",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Typography sx={{ color: "#757575", margin: "10px", textAlign:"left" ,fontSize: "small", flexWrap: "wrap", left: "10px",bottom:"2px", mt: 2 }}>id заметки: {note.id}</Typography>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Заголовок заметки"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    sx={{ mb: 2,  width: "90%", marginLeft:"25px", marginRight:"25px", }}
                />
                <FormControl
                    fullWidth
                    label="Проект"
                    margin="none"
                    value={project}
                    error={!!errors.project}
                    sx={{ mb: 2,  width: "90%", marginLeft:"25px", marginRight:"25px", }}>
                    <InputLabel id="project-select-label"></InputLabel>
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
                <Box sx={{ overflowY: "auto", padding: 4 }}>
                    {/*<Fade in={activeTab === 0} timeout={500}>*/}
                    <Box>
                        {activeTab === 0 && (
                            <>
                                {showEditor && (
                                    <ReactQuill
                                        style={{ height: "150px", marginBottom: "10px" }}
                                        modules={modules}
                                        theme="snow"
                                        placeholder="Введите текст заметки..."
                                        value={content}
                                        onChange={setContent}
                                    />
                                )}
                                <Box sx={{ marginTop: "170px" }}>
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
                    {/*</Fade>*/}
                    <Fade in={activeTab === 1} timeout={500}>
                        <Box>
                            {activeTab === 1 && (
                                <>
                                    {/*<Typography variant="h6">Вложения</Typography>*/}
                                    <Box mt={2}>
                                        {/*<Typography variant="subtitle1">Файлы:</Typography>*/}
                                        <Button variant="outlined" component="label" startIcon={<AttachFile />} sx={{ marginTop: "8px", color:"#FFFFFF",backgroundColor:"#0033FF" }}>
                                            {/*Загрузить файл*/}
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
                                        {/*<Typography variant="subtitle1">Ссылки:</Typography>*/}
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
                                            {/*<Typography variant="subtitle1">Ссылки:</Typography>*/}
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
                                        {/*<Typography variant="subtitle1">Аудиофайлы:</Typography>*/}
                                        <Box display="flex" gap={2} mt={1}>
                                            <Button
                                                variant="contained"
                                                color={isRecording ? "error" : "primary"}
                                                onClick={isRecording ? stopRecording : startRecording}
                                            >
                                                {isRecording ? "Остановить запись" : "Записать аудио"}
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
                                // if (window.confirm("Вы уверены, что хотите удалить заметку?")) {
                                    try {
                                        await onDelete(note.id);
                                        setNotes((prevNotes) => prevNotes.filter((n) => n.id !== note.id));
                                        onClose();
                                    } catch (error) {
                                        alert("Ошибка при удалении заметки.");
                                    }
                                // }
                            }}
                        >
                            <DeleteIcon />
                            Delete
                        </IconButton>
                    )}

                    {/* Кнопка копирования */}
                    <IconButton color="primary" onClick={() => handleCopyFromModal()}>
                        <ContentCopyIcon />
                        Copy
                    </IconButton>

                    {/* Кнопка отмены */}
                    <IconButton color="secondary" onClick={onClose}>
                        <CancelIcon />
                        Close
                    </IconButton>

                    {/* Кнопка сохранения */}
                    <IconButton color="primary" onClick={handleSave}>
                        <SaveIcon />
                        Save
                    </IconButton>
                </Box>
            </Box>
        </Modal>
    );
};

export default NoteModal_new;
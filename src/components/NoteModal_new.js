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
                       projects = [],
                       isGlobalAnalysisEnabled = false,
                       note = null,
                       selectedProject,
                       calculateNewNotePosition,
                       // setNotes = () => {},
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
    const [project, setProjectName] = useState(note?.project|| "Не заполнено");
    const [notes, setNotes]=useState([]);

    const [errors, setErrors] = useState({});
    const noteId = note?.id || "Нет ID";
    const BASE_URL = "http://localhost:8080";
    const titleRef = useRef(title);
    //console.log("Поступившая заметка: ", note)
    // console.log("selectedProject: ", selectedProject);
    // console.log("Projects: ", projects);
    // console.log("selectedProjectModal: ", selectedProjectModal);
    // console.log("note.projectName: ", note?.projectName);
    //console.log("onSave при открытии NoteModal: ", onSave);

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

    // const handleSave = async () => {
    //     if (!validate()) return;
    //
    //     try {
    //         const updatedNote = {
    //             ...note,
    //             title,
    //             content,
    //             projectId: selectedProjectModal,
    //             category: selectedCategory,
    //             audios: audios?.map((audio) => ({
    //                 url: audio.url,
    //                 name: audio.name,
    //             })),
    //             files: files?.map((file) => {
    //                 if (file instanceof File) {
    //                     return {
    //                         name: file.name,
    //                         fileUrl: URL.createObjectURL(file),
    //                     };
    //                 } else {
    //                     return file;
    //                 }
    //             }),
    //             individualAnalysisFlag,
    //             tags,
    //             urls,
    //         };
    //
    //         console.log("заметка перед отправкой на БЭК: ", updatedNote);
    //         //console.log("onSave перед отправкой на БЭК: ", onSave);
    //         // Если это новая заметка, сначала создаем ее
    //         if (!updatedNote.id) {
    //             console.log("Создаем новую заметку...");
    //             updatedNote = await onSave(updatedNote); // Сохраняем и получаем ID
    //         }
    //
    //         if (!updatedNote.id) {
    //             console.error("Ошибка: сервер не вернул ID созданной заметки.");
    //             alert("Ошибка сохранения. Сервер не вернул ID.");
    //             return;
    //         }
    //
    //         console.log("Заметка сохранена, ID:", updatedNote.id);
    //
    //         // const savedNote = await onSave(updatedNote);
    //         let savedNote = updatedNote;
    //
    //         // if (updatedNote!== undefined){
    //         //     console.log(" ЗАМЕТКА СОХРАНЕНА НА БЭКЕ начинаем сохранять вложения! ",updatedNote);
    //         // }else{
    //         //     console.log(" Не удалось сохранить заметку, пытаемся сохранить вложения! ",updatedNote);
    //         // }
    //         console.log("Добавляем в заметку вложения! ",updatedNote);
    //
    //
    //         console.log("Дебаг: note.files", note?.files);
    //         if (files.length > 0) {
    //             const formDataFiles = new FormData();
    //             files.forEach((file) => {
    //                if (file.file instanceof File) {
    //                     console.log("file.file instanceof File");
    //                     console.log("добавляем файл: ", file.file);
    //                     formDataFiles.append("files", file.file);
    //
    //                 }
    //             });
    //             console.log("получился такой formDataFiles файлов: ",formDataFiles);
    //             console.log("Пробуем отправить массив файлов, размер массива: ",Array.from(formDataFiles.keys()).length);
    //
    //             if (Array.from(formDataFiles.keys()).length > 0) {
    //                 console.log("длина массива файлов >0, отправлям, для заметки ",updatedNote.id);
    //
    //                 const uploadedFiles = await uploadFiles(updatedNote.id, formDataFiles);
    //                 console.log("отправили файлы ",uploadedFiles);
    //                 updatedNote.files = uploadedFiles.files;
    //             }
    //         }
    //
    //         console.log(" Файлы сохранены ",updatedNote);
    //
    //         console.log("Дебаг: note.audios", note?.audios);
    //         if (audios.length > 0) {
    //             try {
    //             // const formDataAudio = new FormData();
    //                 const newAudiosFormData = await prepareFormDataForAudios(audios);
    //                 console.log("Проверим есть ли в formData аудио: ",newAudiosFormData.has("audios"));
    //                 if (newAudiosFormData.has("audios")) {
    //                     console.log("audios in formdata: ", newAudiosFormData);
    //                     const uploadedAudios = await uploadAudioFiles(updatedNote.id, newAudiosFormData);
    //                     console.log("отправили аудио ",uploadedAudios);
    //                     updatedNote.audios = uploadedAudios.files;
    //                 }else{
    //                     console.log("Аудио нет в formdata: ");
    //                 }
    //
    //             } catch (error) {
    //                 console.error("Не удалось сохранить аудио. Ошибка при сохранении audios:", error);
    //             }
    //
    //         }
    //         savedNote = await onSave(updatedNote);
    //         if (!savedNote) {
    //             alert("Ошибка: сервер не вернул сохраненную заметку.");
    //             return;
    //         }
    //
    //         // ✅ Обновляем доску (GraphBoard)
    //         setNotes((prevNotes) => {
    //             const existingNoteIndex = prevNotes.findIndex((n) => n.id === savedNote.id);
    //             if (existingNoteIndex !== -1) {
    //                 return prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n)); // 🔄 Обновляем заметку
    //             } else {
    //                 return [...prevNotes, savedNote]; // 🆕 Добавляем новую заметку
    //             }
    //         });
    //
    //         setNotes((prevNotes) =>
    //             prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n))
    //         );
    //         audios.forEach((audio) => {
    //             if (audio.url && audio instanceof File) {
    //                 URL.revokeObjectURL(audio.url); // Удаляем временную ссылку
    //             }
    //         });
    //         files.forEach((file) => {
    //             if (file.fileUrl && file instanceof File) {
    //                 URL.revokeObjectURL(file.fileUrl); // Удаляем временную ссылку
    //             }
    //         });
    //
    //         alert("Заметка с ВЛОЖЕНИЯМИ  успешно сохранена!");
    //         onClose();
    //
    //     } catch (error) {
    //         console.error("Ошибка при сохранении заметки:", error.response?.data || error.message);
    //         alert("Не удалось сохранить заметку. Проверьте соединение с сервером.");
    //     }
    //     setContent("");
    //     setFile(null);
    //     setSelectedProject("");
    //     setIndividualAnalysisFlag(isGlobalAnalysisEnabled);
    //     setAudioFiles(null);
    //     setUrls(null);
    //     setFiles(null);
    //     setOpenGraphData(null);
    //     onClose();
    // };
    const handleSave = async () => {
        if (!validate()) return;

        try {
            let savedNote = {
                ...note,
                title,
                content,
                projectId: selectedProjectModal,
                category: selectedCategory,
                tags: tags ?? [], // ✅ Гарантируем, что всегда массив
                urls: urls ?? [], // ✅ Гарантируем, что всегда массив
                files: note.files ?? [], // ✅ Если `files` нет, передаем пустой массив
                audios: note.audios ?? [] // ✅ Если `audios` нет, передаем пустой массив
            };

            console.log("Подготовленная заметка перед сохранением:", savedNote);

            // Если это новая заметка, сначала создаем ее
            if (!savedNote.id) {
                console.log("Создаем новую заметку...");
                savedNote = await onSave(savedNote); // Сохраняем и получаем ID
            }

            if (!savedNote.id) {
                console.error("Ошибка: сервер не вернул ID созданной заметки.");
                alert("Ошибка сохранения. Сервер не вернул ID.");
                return;
            }

            console.log("Заметка сохранена, ID:", savedNote.id);

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

                if (Array.from(formDataFiles.keys()).length > 0) {
                    console.log("Загружаем файлы для заметки ID:", savedNote.id);
                    const uploadedFiles = await uploadFiles(savedNote.id, formDataFiles);
                    savedNote.files = uploadedFiles.files;
                }
            }

            // Загружаем аудиофайлы, если есть
            if (audios.length > 0) {
                const formDataAudios = new FormData();
                audios.forEach((audio) => {
                    if (audio.blob instanceof Blob) {
                        formDataAudios.append("audios", audio.blob, audio.name || "recording.mp3");
                    }
                });

                if (formDataAudios.has("audios")) {
                    console.log("Загружаем аудио для заметки ID:", savedNote.id);
                    const uploadedAudios = await uploadAudioFiles(savedNote.id, formDataAudios);
                    savedNote.audios = uploadedAudios.files;
                }
            }

            // Финальное обновление заметки с файлами
            savedNote = await onSave(savedNote);

            // setNotes((prevNotes) =>
            //     prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n))
        // );
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


            alert("Заметка успешно сохранена!");
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении заметки:", error.response?.data || error.message);
            alert("Не удалось сохранить заметку. Проверьте соединение с сервером.");
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

    const handleAudioDelete = (audioToDelete) => {
        setAudioFiles((prev) => prev.filter((audio) => audio !== audioToDelete));
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
                    sx={{ mb: 2 }}
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

export default NoteModal_new;
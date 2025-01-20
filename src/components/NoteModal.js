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
    Switch,
    FormControlLabel,
    Chip,
    IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import './appStyle.css';
import { Save, Close, Add } from "@mui/icons-material";
import { AttachFile, Delete } from "@mui/icons-material"; // Иконки для загрузки и удаления файлов
import OGPreview from "./OGPreview";
import {uploadAudioFiles, uploadFiles} from "../api/api";
import {fetchOpenGraphData} from "../api/api";



const NoteModal = ({
                       open,
                       onClose,
                       onSave,
                       projects = [],
                       isGlobalAnalysisEnabled = false,
                       note = null, // Обрабатываем null корректно
                       selectedProject,
                       setNotes,

                   }) => {
    const [activeTab, setActiveTab] = useState(0); // Текущий таб
    const [content, setContent] = useState(note?.content || "");
    const [file, setFile] = useState(null);
    const [selectedProjectModal, setSelectedProject] = useState(note?.projectId || selectedProject || null);
    const [individualAnalysisFlag, setIndividualAnalysisFlag] = useState(
        isGlobalAnalysisEnabled
    );
    const [tags, setTags] = useState(note?.tags || []);
    const [newTag, setNewTag] = useState("");
    const [files, setFiles] = useState(note?.files || []); // Состояние для загруженных файлов
    // const [newFile, setNewFile] = useState(null); // Временное состояние для выбранного файла

    const [urls, setUrls] = useState(note?.urls || []); // Состояние для ссылок
    const [newUrl, setNewUrl] = useState("");

    const [audios, setAudioFiles] = useState(note?.audioFiles || []); // Список аудиофайлов
    const [isRecording, setIsRecording] = useState(false); // Флаг записи
    const [mediaRecorder, setMediaRecorder] = useState(null); // MediaRecorder
    const [recordedAudio, setRecordedAudio] = useState(null); // Временное аудио
    const [openGraphData, setOpenGraphData] = useState({});
    const [deletedFiles, setDeletedFiles] = useState([]);  // Удаленные файлы
    const noteId = note?.id || "Нет ID"; // Проверяем наличие ID заметки
    const BASE_URL = "http://localhost:8080";


    console.log("Заметка с доски, note: ",note);
    //console.log("OpenGraphData in NoteModal:", openGraphData);

    useEffect(() => {

        //console.log("note status in NoteModal: ",note);
        console.log("!!! Открываем заметку: ", note);
        if (open && note) {
           // console.log("EXISTING projectId в Select:", note?.projectId, "selectedProject:", selectedProject);
            setContent(note.content || "");
            setSelectedProject(note.projectId || "");
            setTags(note.tags || []);
            setAudioFiles(note.audios || []);
            setFiles(note.files || []);
            setOpenGraphData(note.openGraphData || {}); // Устанавливаем OpenGraph данные


        } else if (open){
           // console.log("CREATE projectId в Select:", note?.projectId, "selectedProject:", selectedProject);
            // console.log("Open new note");
            setContent("");
            setSelectedProject(selectedProject||"");
            setTags([]);
            setOpenGraphData({}); // Очищаем OpenGraph данные
            setAudioFiles([]);
            setFiles([]);

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


    const handleDownloadAudio = async (e, audio) => {
        e.preventDefault(); // Останавливает стандартное поведение
        console.log("Путь для скачивания: ", BASE_URL + audio.url);
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
            console.error("Ошибка при скачивании файла:", error);
        }
    };

    const handleDownloadFile = async (e, file) => {
        e.preventDefault(); // Останавливает стандартное поведение
        console.log("Путь для скачивания: ", BASE_URL + file.url);
        if (!file || !file.url) {
            console.error("Некорректный объект audio:", file);
            return;
        }
        try {
            const response = await fetch(BASE_URL + file.url);
            if (!response.ok) throw new Error("Ошибка загрузки файла");

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = file.name || "noname.mp3";
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
    };

    // Удалить URL
    const handleDeleteUrl = (urlToDelete) => {
        setUrls((prevUrls) => prevUrls.filter((url) => url !== urlToDelete));
        const updatedOpenGraphData = { ...openGraphData };
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
        console.log("Файлы перед сохранением:", files);
        if (!content.trim()) {
            alert("Текст заметки не может быть пустым.");
            return;
        }

        if (!selectedProject) {
            alert("Выберите проект.");
            return;
        }

        try {
            // Создаем или обновляем заметку
            const updatedNote = {
                ...note, // Копируем все свойства из текущей заметки
                content,
                projectId: selectedProject,
                audios: audios?.map((audio) => ({
                    url: audio.url,
                    name: audio.name,
                })), // Добавляем аудиофайлы
                files: files?.map((file) => {
                    if (file instanceof File) {
                        return {
                            name: file.name,
                            url: URL.createObjectURL(file), // Временно создаём ссылку
                        };
                    } else {
                        return file; // Возвращаем объект как есть, если это не File
                    }
                }),

                individualAnalysisFlag,
                tags,
                urls,

            };
            //console.log(" tags of note: ",tags);

            const savedNote = await onSave(updatedNote);

            //console.log(" ЗАМЕТКА СОХРАНЕНА НА БЭКЕ !",savedNote);

            // Отправляем файлы
            if (files.length > 0) {
                const formDataFiles = new FormData();
                console.log("Отправка файлов: ",files);
                files.forEach((file) => {
                    if (file instanceof File) {
                        // Если файл уже объект File
                        formDataFiles.append("files", file);
                        console.log("Добавление напрямую (1-е условие):", file);
                    } else if (file.file instanceof File) {
                        // Если внутри объекта есть поле file, являющееся File
                        formDataFiles.append("files", file.file);
                        console.log("Добавление напрямую (2-е условие):", file.file);
                    } else if (file.filePath) {
                        // Если файл передается в формате с метаданными
                        const blob = new Blob([file.filePath], { type: "text/plain" });
                        formDataFiles.append("files", blob, file.fileName);
                        console.log("Добавление из метаданных (3-е условие):", file.fileName);
                    } else {
                        console.warn("Неподдерживаемый формат файла:", file);
                    }
                });
                console.log("--- Итоговый formData на отправку на бэк: ", formDataFiles);
                // console.log("Код заметки: ", savedNote.id);

                if (Array.from(formDataFiles.keys()).length > 0) { // Проверка на наличие данных в formData
                    await uploadFiles(savedNote.id, formDataFiles);
                }
            }

            // Отправляем аудиофайлы
            if (audios.length > 0) {
                const formDataAudio = new FormData();
                console.log("Исходный массив аудиофайлов: ", audios);
                try {
                    const newAudiosFormData = await prepareFormDataForAudios(audios);

                    if (newAudiosFormData.has("audios")) {
                        await uploadAudioFiles(savedNote.id, newAudiosFormData);
                    }
                }catch (error) {
                    console.error("Не удалось сохранить. Ошибка при сохранении audios:", error);
                }

                // if (Array.from(formDataAudio.keys()).length > 0) { // Проверка на наличие данных в formData
                //     await uploadAudioFiles(savedNote.id, formDataAudio); // Передаём ID заметки и аудио
                // }
                // Обновляем состояние
                setNotes((prevNotes) =>
                    prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n))
                );
                files.forEach((file) => {
                    if (file.url && file instanceof File) {
                        URL.revokeObjectURL(file.url); // Удаляем временную ссылку
                    }
                });
            }
            alert("Заметка успешно сохранена!");
            onClose();

        } catch (error) {
            console.error("Ошибка при сохранении заметки:", error.response?.data || error.message);
            alert("Не удалось сохранить заметку. Проверьте соединение с сервером.");
        }
        //  освобождаем созданные временные ссылки, чтобы избежать утечек памяти
        setContent("");
        setFile(null);
        setSelectedProject("");
        setIndividualAnalysisFlag(isGlobalAnalysisEnabled);
        setAudioFiles(null);
        setUrls(null);
        setFiles(null);
        setOpenGraphData(null);
        onClose();

    };


    const handleAudioFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "audio/mpeg" || file.type === "audio/wav" || file.type === "audio/m4a")) {
            setAudioFiles((prev) => [...prev, { name: file.name, url: URL.createObjectURL(file), blob: file }]);
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
                formData.append("audios", audio.blob, audio.name);
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
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <React.Fragment>

                <Box
                    sx={{
                        //position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "900px",
                        height: "600px",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        display: "flex",
                        flexDirection: "column",
                        // overflow: "hidden",
                        position: "relative", // Для корректного позиционирования дочерних элементов
                        paddingBottom: 8,
                    }}
                >

                    {/* Вкладки и их содержимое */}
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
                            <Tabs value={activeTab}
                                  onChange={(e, newValue) => setActiveTab(newValue)}
                                  centered
                                  sx={{ borderBottom: "1px solid #e0e0e0" }}
                            >
                                <Tab label="Основное" />
                                <Tab label="Вложения" />
                            </Tabs>
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    padding: 4,
                                }}
                            >
                                {activeTab === 0 && (

                                        <Box sx={{
                                            flex: 1,
                                            overflowY: "auto",
                                            padding: 2,
                                            }}
                                        >
                                            <FormControl
                                                fullWidth
                                                margin="normal"
                                            >
                                                <InputLabel id="project-select-label">Проект</InputLabel>
                                                <Select
                                                    labelId="project-select-label"
                                                    value={note?.projectId || selectedProject || ""}
                                                    onChange={(e) => setSelectedProject(e.target.value)}
                                                >
                                                    {projects.map((project) => (
                                                        <MenuItem key={project.id} value={project.id}>
                                                            {project.name}
                                                        </MenuItem>
                                                            )
                                                        )
                                                    }
                                                </Select>
                                            </FormControl>
                                            <TextField
                                                // className="multi-line-fade"
                                                fullWidth
                                                margin="normal"
                                                label="Текст заметки"
                                                multiline
                                                rows={5}
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            />
                                        <Box>
                                                <TextField sx={{ display: "flex", flexWrap: "wrap",  bottom: "100px", gap: 1, mt: 2 }}
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
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                     style={{
                                                         position: "absolute",
                                                         bottom: "50px",
                                                         right: "50px",
                                                         color: "#888",
                                                         fontSize: "0.6rem",
                                                     }}
                                                >
                                                    id объекта: {noteId}
                                                </Typography>
                                            </Box>
                                        </Box>
                                )}
                                {activeTab === 1 && (

                                        <Box>
                                            <Typography variant="h6">Вложения</Typography>
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
                                                    {files?.map((file, index) => (
                                                        <Box
                                                            key={index}
                                                            display="flex"
                                                            justifyContent="space-between"
                                                            alignItems="flex-end"
                                                            mb={1}
                                                        >
                                                            <Typography variant="body2">{file.fileName || file.name}</Typography>
                                                            <IconButton
                                                                onClick={(e) => handleDownloadFile(e, file)}
                                                                style={{
                                                                    marginLeft: "8px",
                                                                    zIndex: 9999, // Убедимся, что кнопка на переднем плане
                                                                }}

                                                                aria-label="Скачать файл"
                                                            >
                                                                <DownloadIcon />
                                                            </IconButton>
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
                                                                <Box key={index}
                                                                     display="flex"
                                                                     alignItems="center"
                                                                     justifyContent="space-between" // Разделяем содержимое и иконку удаления
                                                                     mt={1}
                                                                >
                                                                    {ogData ? (
                                                                        <OGPreview
                                                                            ogData={{
                                                                                title: ogData.title || "Без названия",
                                                                                description: ogData.description || "Описание отсутствует",
                                                                                image: ogData.image || "Нет изображения",
                                                                                url: ogData.url || url, // Используем URL из ключа
                                                                            }}
                                                                        />
                                                                    )
                                                                        : (
                                                                        <Typography variant="body2">Нет данных для URL: {url}</Typography>

                                                                    )}
                                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() => handleDeleteUrl(url)}
                                                                        >
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </Box>
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
                                                            <input
                                                                type="file"
                                                                hidden
                                                                accept="audio/*"
                                                                onChange={handleAudioFileChange}
                                                            />
                                                        </Button>
                                                    </Box>
                                                    <Box mt={2}>
                                                        {audios?.map((audio, index) => (
                                                            <Box
                                                                key={index}
                                                                display="flex"
                                                                justifyContent="space-between"
                                                                alignItems="flex-end"
                                                                mb={1}
                                                            >
                                                                <audio controls src={`${BASE_URL}${audio.url}`}
                                                                       style={{
                                                                    width: "40%",
                                                                    fontSize: "0.5em", // Уменьшаем шрифт в 2 раза
                                                                    height: "30px",    // Устанавливаем высоту явно
                                                                    padding: "inherit",
                                                                        }}
                                                                />
                                                                <Typography variant="body2"
                                                                            style={{
                                                                                // position: "absolute",
                                                                                color: "#888",
                                                                                fontSize: "0.6rem",
                                                                            }}
                                                                >
                                                                    {audio.name || "Неизвестно"}
                                                                </Typography>
                                                                <IconButton
                                                                    onClick={(e) => handleDownloadAudio(e, audio)}
                                                                    style={{
                                                                        marginLeft: "8px",
                                                                        zIndex: 9999, // Убедимся, что кнопка на переднем плане
                                                                    }}
                                                                    aria-label="Скачать аудио"
                                                                >
                                                                    <DownloadIcon />
                                                                </IconButton>
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
                                        </Box>
                                )}
                            </Box>
                    </Box>

                    {/* Кнопки внизу */}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "16px",
                            borderTop: "1px solid #e0e0e0",
                            position: "absolute", // Позиция фиксируется относительно модального окна
                            bottom: 0, // Прижимаем к нижнему краю модального окна
                            width: "95%", // Устанавливаем ширину в 100% от родительского элемента
                            backgroundColor: "background.paper", // Цвет совпадает с фоном модального окна
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={onClose}
                            sx={{ width: "40%" }}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            sx={{ width: "40%" }}
                        >
                            Сохранить
                        </Button>
                    </Box>

                </Box>

            </React.Fragment>
        </Modal>
    );
};
export default NoteModal;


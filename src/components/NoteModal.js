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
    const BASE_URL = "http://localhost:8080";


    console.log("Заметка с доски, note: ",note);
    console.log("OpenGraphData in NoteModal:", openGraphData);

    useEffect(() => {

        //console.log("note status in NoteModal: ",note);
        if (open && note) {
            console.log("EXISTING projectId в Select:", note?.projectId, "selectedProject:", selectedProject);
            setContent(note.content || "");
            setSelectedProject(note.projectId || "");
            setTags(note.tags || []);
            setAudioFiles(note.audios || []);
            setFiles(note.files || []);
            setOpenGraphData(note.openGraphData || {}); // Устанавливаем OpenGraph данные

        } else if (open){
            console.log("CREATE projectId в Select:", note?.projectId, "selectedProject:", selectedProject);
            // console.log("Open new note");
            setContent("");
            setSelectedProject(selectedProject||"");
            setTags([]);
            setOpenGraphData({}); // Очищаем OpenGraph данные

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
    };

    // const handleAddUrl = () => {
    //     if (!newUrl.trim()) {
    //         alert("Введите ссылку.");
    //         return;
    //     }
    //     if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(newUrl.trim())) {
    //         alert("Введите корректный URL.");
    //         return;
    //     }
    //     setUrls((prevUrls) => [...prevUrls, newUrl.trim()]);
    //     setNewUrl("");
    // };

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
                files: files?.map((file) => ({
                    name: file.name,
                    url: URL.createObjectURL(file), // Временно создаём ссылку
                })), // Добавляем файлы
                individualAnalysisFlag,
                tags,
                urls,

            };
            console.log(" tags of note: ",tags);

            const savedNote = await onSave(updatedNote);

            // Отправляем файлы
            if (files.length > 0) {
                const formData = new FormData();
                files.forEach((file) => formData.append("files", file));
                await uploadFiles(savedNote.id, formData); // Передаём ID заметки и файлы
            }

            // Отправляем аудиофайлы
            if (audios.length > 0) {
                const formData = new FormData();
                audios.forEach((audio) => formData.append("audios", audio.blob));
                console.log("---Аудиомассив audios: ", formData);
                await uploadAudioFiles(savedNote.id, formData); // Передаём ID заметки и аудио
            }

            alert("Заметка успешно сохранена!");
            onClose();

        } catch (error) {
            console.error("Ошибка при сохранении заметки:", error);
            alert("Не удалось сохранить заметку. Проверьте соединение с сервером.");
        }
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
                                                            alignItems="center"
                                                            mb={1}
                                                        >
                                                            <Typography variant="body2">{file.name}</Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                href={file.url} // Используем временную ссылку
                                                                download={file.name} // Имя файла для загрузки
                                                            >
                                                                Скачать
                                                            </Button>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleFileDelete(file)}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                            {/*<Typography variant="body2">{file.filePath}</Typography>*/}
                                                            {/*<Button*/}
                                                            {/*    variant="outlined"*/}
                                                            {/*    size="small"*/}
                                                            {/*    href={file.url}*/}
                                                            {/*    download={file.name}*/}
                                                            {/*>*/}
                                                            {/*    Скачать*/}
                                                            {/*</Button>*/}
                                                            {/*<IconButton*/}
                                                            {/*    color="error"*/}
                                                            {/*    onClick={() => handleFileDelete(file)}*/}
                                                            {/*>*/}
                                                            {/*    <Delete />*/}
                                                            {/*</IconButton>*/}
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
                                                                alignItems="center"
                                                                mb={1}
                                                            >
                                                                <audio controls src={audio.url} style={{ width: "40%" }} />
                                                                <Typography variant="body2">{audio.name || "Неизвестно"}</Typography>
                                                                <Typography variant="body2">{audio.audioPath}</Typography>
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
    // return (
    //     <Modal
    //         open={open}
    //         onClose={onClose}
    //         aria-labelledby="modal-title"
    //         aria-describedby="modal-description"
    //     >
    //         <Box
    //             sx={{
    //                 position: "absolute",
    //                 top: "50%",
    //                 left: "50%",
    //                 transform: "translate(-50%, -50%)",
    //                 width: "900px",
    //                 height: "600px",
    //                 bgcolor: "background.paper",
    //                 boxShadow: 24,
    //                 borderRadius: "8px",
    //                 display: "flex",
    //                 flexDirection: "column",
    //                 overflow: "hidden",
    //             }}
    //         >
    //             <Tabs
    //                 value={activeTab}
    //                 onChange={(e, newValue) => setActiveTab(newValue)}
    //                 centered
    //                 sx={{ borderBottom: "1px solid #e0e0e0" }}
    //             >
    //                 <Tab label="Основное" />
    //                 <Tab label="Вложения" />
    //             </Tabs>
    //
    //             <Box
    //                 sx={{
    //                     flex: 1,
    //                     overflowY: "auto",
    //                     padding: "16px",
    //                     fontSize: "0.9rem",
    //                 }}
    //             >
    //                 {activeTab === 0 && (
    //                     <Box>
    //                         <Typography variant="h6">Основное</Typography>
    //                         <FormControl fullWidth margin="normal">
    //                             <InputLabel id="project-select-label">Проект</InputLabel>
    //                             <Select
    //                                 labelId="project-select-label"
    //                                 value={selectedProject || ""}
    //                                 onChange={(e) => setSelectedProject(e.target.value)}
    //                             >
    //                                 {projects.map((project) => (
    //                                     <MenuItem key={project.id} value={project.id}>
    //                                         {project.name}
    //                                     </MenuItem>
    //                                 ))}
    //                             </Select>
    //                         </FormControl>
    //                         <TextField
    //                             fullWidth
    //                             margin="normal"
    //                             label="Текст заметки"
    //                             multiline
    //                             rows={3}
    //                             value={content}
    //                             onChange={(e) => setContent(e.target.value)}
    //                         />
    //                         <Box mt={2}>
    //                             <TextField
    //                                 label="Добавить тег"
    //                                 value={newTag}
    //                                 onChange={(e) => setNewTag(e.target.value)}
    //                                 onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
    //                                 sx={{ marginRight: 2 }}
    //                             />
    //                             <Button variant="contained" onClick={handleAddTag}>
    //                                 Добавить
    //                             </Button>
    //                         </Box>
    //                         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
    //                             {tags.map((tag) => (
    //                                 <Chip
    //                                     key={tag}
    //                                     label={tag}
    //                                     onDelete={() => handleDeleteTag(tag)}
    //                                     color="primary"
    //                                     variant="outlined"
    //                                 />
    //                             ))}
    //                         </Box>
    //                     </Box>
    //                 )}
    //
    //                 {activeTab === 1 && (
    //                     <Box>
    //                         <Typography variant="h6">Вложения</Typography>
    //
    //                         {/* OpenGraph */}
    //                         <Box mt={2}>
    //                             <Typography variant="subtitle1">OpenGraph данные:</Typography>
    //                             <Box display="flex" mt={1}>
    //                                 <TextField
    //                                     fullWidth
    //                                     label="Добавить ссылку"
    //                                     value={newUrl}
    //                                     onChange={(e) => setNewUrl(e.target.value)}
    //                                     sx={{ marginRight: "8px" }}
    //                                 />
    //                                 <Button
    //                                     variant="contained"
    //                                     onClick={handleAddUrl}
    //                                 >
    //                                     Добавить
    //                                 </Button>
    //                             </Box>
    //                             <Box mt={2}>
    //                                 {Object.entries(openGraphData || {}).map(([url, ogData]) => (
    //                                     <Box
    //                                         key={url}
    //                                         mt={1}
    //                                         sx={{
    //                                             borderBottom: "1px solid #e0e0e0",
    //                                             paddingBottom: "8px",
    //                                             display: "flex",
    //                                             flexDirection: "column",
    //                                             gap: "8px",
    //                                         }}
    //                                     >
    //                                         <Typography variant="body2">
    //                                             <strong>{ogData.title || "Без названия"}</strong>
    //                                         </Typography>
    //                                         {ogData.image && (
    //                                             <img
    //                                                 src={ogData.image}
    //                                                 alt={ogData.title || "Изображение"}
    //                                                 style={{ maxWidth: "100%", height: "auto" }}
    //                                             />
    //                                         )}
    //                                         <Typography variant="body2">{ogData.description || "Без описания"}</Typography>
    //                                         <Box display="flex" justifyContent="space-between" alignItems="center">
    //                                             <a href={ogData.url} target="_blank" rel="noopener noreferrer">
    //                                                 Открыть ссылку
    //                                             </a>
    //                                             <IconButton
    //                                                 color="error"
    //                                                 onClick={() => handleDeleteUrl(url)}
    //                                             >
    //                                                 <Delete />
    //                                             </IconButton>
    //                                         </Box>
    //                                     </Box>
    //                                 ))}
    //                             </Box>
    //                         </Box>
    //                     </Box>
    //                 )}
    //             </Box>
    //
    //             <Box
    //                 sx={{
    //                     display: "flex",
    //                     justifyContent: "space-between",
    //                     padding: "16px",
    //                     borderTop: "1px solid #e0e0e0",
    //                 }}
    //             >
    //                 <Button variant="outlined" onClick={onClose} sx={{ width: "48%" }}>
    //                     Отмена
    //                 </Button>
    //                 <Button variant="contained" onClick={handleSave} sx={{ width: "48%" }}>
    //                     Сохранить
    //                 </Button>
    //             </Box>
    //         </Box>
    //     </Modal>
    // );
};
export default NoteModal;


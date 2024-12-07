import React, { useState } from "react";
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
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const NoteModal = ({ open, onClose, onSave, projects, isGlobalAnalysisEnabled }) => {
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [selectedProject, setSelectedProject] = useState("");
    const [individualAnalysisFlag, setIndividualAnalysisFlag] = useState(isGlobalAnalysisEnabled);
    const [tags, setTags] = useState(note.tags || []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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

        onSave({ content, file, projectId: selectedProject, individualAnalysisFlag, tags });
        setContent("");
        setFile(null);
        setSelectedProject("");
        setIndividualAnalysisFlag(isGlobalAnalysisEnabled);
        onClose();
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
                    Добавить заметку
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

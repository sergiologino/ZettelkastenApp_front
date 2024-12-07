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
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{note.id ? "Редактировать заметку" : "Новая заметка"}</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Текст заметки"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    rows={4}
                    sx={{ marginBottom: 2 }}
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSave}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NoteModal;

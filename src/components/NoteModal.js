import React, { useState } from "react";
import {
    Box,
    Button,
    Modal,
    TextField,
    Typography,
    IconButton,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const NoteModal = ({ open, onClose, onSave }) => {
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSave = () => {
        onSave({ content, file });
        setContent("");
        setFile(null);
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
                <TextField
                    fullWidth
                    margin="normal"
                    label="Текст заметки"
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Button variant="contained" component="label" startIcon={<AttachFileIcon />}>
                        Загрузить файл
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {file && <Typography>{file.name}</Typography>}
                </Box>
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

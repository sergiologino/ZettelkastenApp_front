import React from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const AddNoteButton = ({ onClick }) => {
    return (
        <Fab
            color="primary"
            aria-label="add"
            sx={{
                position: "fixed",
                bottom: "16px",
                right: "16px",
            }}
            onClick={onClick}
        >
            <AddIcon />
        </Fab>
    );
};

export default AddNoteButton;

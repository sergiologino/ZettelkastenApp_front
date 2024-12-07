import React from "react";
import { Button } from "@mui/material";

const AnalyzeButton = ({ selectedNotes, onAnalyze }) => {
    return (
        <Button
            variant="contained"
            color="primary"
            disabled={selectedNotes.length === 0}
            onClick={() => onAnalyze(selectedNotes)}
            sx={{
                position: "fixed",
                bottom: "16px",
                left: "16px",
            }}
        >
            Отправить на анализ
        </Button>
    );
};

export default AnalyzeButton;

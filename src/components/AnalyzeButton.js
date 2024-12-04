import React from "react";
import { Button } from "@mui/material";

const AnalyzeButton = ({ selectedNotes, onAnalyze }) => {
    return (
        <Button
            variant="contained"
            color="primary"
            onClick={() => onAnalyze(selectedNotes)}
            disabled={selectedNotes.length === 0}
        >
            Отправить на анализ
        </Button>
    );
};

export default AnalyzeButton;

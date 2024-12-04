import React from "react";
import { Box, Typography } from "@mui/material";

const ProjectPanel = ({ projects, onSelect }) => {
    return (
        <Box
            sx={{
                width: "300px",
                height: "100vh",
                backgroundColor: "#ffffff",
                borderRight: "1px solid #e0e0e0",
                overflowY: "auto",
                padding: "16px",
            }}
        >
            <Typography variant="h6" sx={{ marginBottom: "16px" }}>
                Проекты
            </Typography>
            {projects.map((project) => (
                <Box
                    key={project.id}
                    sx={{
                        marginBottom: "12px",
                        padding: "12px",
                        backgroundColor: project.color,
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                    onClick={() => onSelect(project.id)}
                >
                    <Typography>{project.name}</Typography>
                </Box>
            ))}
        </Box>
    );
};

export default ProjectPanel;

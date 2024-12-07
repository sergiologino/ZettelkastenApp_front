import React, { useState, useEffect } from "react";
import Board from "./components/Board";
import ProjectPanel from "./components/ProjectPanel";
import AddNoteButton from "./components/AddNoteButton";
import NoteModal from "./components/NoteModal";
import {
  fetchProjects,
  fetchNotes,
  addNote,
  createProject,
  deleteProject } from "./api/api";
import { Switch, FormControlLabel } from "@mui/material";
import GraphBoard from "./components/GraphBoard";


const App = () => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalysisEnabled, setIsAnalysisEnabled] = useState(false); // Глобальный флаг анализа

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjects();
        setProjects(Array.isArray(projects) ? projects : []); // Убедитесь, что `projects` — массив
      } catch (error) {
        console.error("Ошибка загрузки проектов:", error);
        setProjects([]);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const loadNotes = async () => {
        const notes = await fetchNotes(selectedProjectId);
        setNotes(notes);
      };

      loadNotes();
    }
  }, [selectedProjectId]);

  const handleSaveNote = async ({ content, file, projectId, individualAnalysisFlag }) => {
    if (!content || content.trim() === "") {
      alert("Текст заметки не может быть пустым.");
      return;
    }

    if (!projectId) {
      alert("Пожалуйста, выберите проект перед добавлением заметки.");
      return;
    }


    const analyze = individualAnalysisFlag ?? isAnalysisEnabled; // Используем индивидуальный флаг или глобальный

    const newNote = {
      content,
      x: 100,
      y: 100,
      project: { id: projectId },
      analyze, // Передаём флаг анализа

    };

    console.log("Данные для отправки:", JSON.stringify(newNote, null, 2)); // Логируем данные
    try {
      const savedNote = await addNote(newNote);
      setNotes([...notes, savedNote]);
      if (file) {
        console.log("Загруженный файл:", file);
        // Реализуйте логику загрузки файла
      }
    } catch (error) {
      console.error("Ошибка при добавлении заметки:", error);
      alert("Не удалось добавить заметку. Проверьте соединение с сервером.");
    }
};

  const handleProjectSelect = async (projectId) => {
    try {
      const loadedNotes = await fetchNotes(projectId);

      console.log("Загруженные заметки:", loadedNotes);
      setNotes((prevNotes) => {
        // Добавляем новые заметки, избегая дублирования
        const uniqueNotes = loadedNotes.filter(
            (newNote) => !prevNotes.some((note) => note.id === newNote.id)

        );

        return [...prevNotes, ...uniqueNotes];
      });
      setSelectedProjectId(projectId);
    } catch (error) {
      console.error("Ошибка при загрузке заметок:", error);
      alert("Не удалось загрузить заметки. Проверьте соединение с сервером.");
    }
  };

  const handleCreateProject = async (projectName) => {
    try {
      const newProject = await createProject({ name: projectName, description: "" });
      setProjects([...projects, newProject]);
    } catch (error) {
      console.error("Ошибка при создании проекта:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((project) => project.id !== projectId));
      if (selectedProjectId === projectId) {
        setNotes([]); // Очистить заметки, если удаляем текущий проект
        setSelectedProjectId(null);
      }
    } catch (error) {
      console.error("Ошибка при удалении проекта:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <FormControlLabel
          control={
            <Switch
                checked={isAnalysisEnabled}
                onChange={(e) => setIsAnalysisEnabled(e.target.checked)}
            />
          }
          label="Анализ всех заметок по умолчанию"
          sx={{ margin: "16px" }}
      />
      <div style={{ display: "flex" }}>
        <ProjectPanel
            projects={projects}
            onSelect={handleProjectSelect}
            onCreate={handleCreateProject}
            onDelete={handleDeleteProject}
        />
        <Board
            notes={notes} onDragEnd={() => {}}
        />
        <GraphBoard
            notes={notes}
        />
        <AddNoteButton onClick={() => setIsModalOpen(true)} />
        <NoteModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveNote}
            projects={projects}
            isGlobalAnalysisEnabled={isAnalysisEnabled} // Передаём глобальный флаг в NoteModal
        />
      </div>
    </div>
  );

};

export default App;

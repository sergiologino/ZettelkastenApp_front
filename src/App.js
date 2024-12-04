import React, { useState, useEffect } from "react";
import Board from "./components/Board";
import ProjectPanel from "./components/ProjectPanel";
import AddNoteButton from "./components/AddNoteButton";
import NoteModal from "./components/NoteModal";
import { fetchProjects, fetchNotes, addNote } from "./api/api";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      const projects = await fetchProjects();
      setProjects(projects);
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

  const handleSaveNote = async ({ content, file }) => {
    if (!selectedProjectId) {
      alert("Пожалуйста, выберите проект перед добавлением заметки.");
      return;
    }

    const newNote = {
      content,
      x: 100,
      y: 100,
      projectId: selectedProjectId,
    };

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

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
  };

  return (
      <div style={{ display: "flex" }}>
        <ProjectPanel projects={projects} onSelect={handleProjectSelect} />
        <Board notes={notes} onDragEnd={() => {}} />
        <AddNoteButton onClick={() => setIsModalOpen(true)} />
        <NoteModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveNote}
        />
      </div>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import GraphBoard from "./components/GraphBoard";
import ProjectPanel from "./components/ProjectPanel";
import {fetchProjects, fetchNotes, createProject, updateNote} from "./api/api";
import { addNote } from "./api/api"; // Импорт функции создания заметки из api.js

const App = () => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);



  // Загрузка проектов
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjects();
        setProjects(projects);
      } catch (error) {
        console.error("Ошибка загрузки проектов:", error);
      }
    };

    loadProjects();
  }, []);

  const handleCreateProject = async (newProject) => {
    try {
      const createdProject = await createProject(newProject); // Вызов API для создания проекта
      setProjects((prevProjects) => [...prevProjects, createdProject]); // Добавляем новый проект в состояние
    } catch (error) {
      console.error("Ошибка при создании проекта:", error);
      alert("Не удалось создать проект. Проверьте соединение с сервером.");
    }
  };

  const handleProjectSelect = async (projectId) => {
    setSelectedProjectId(projectId); // Устанавливаем текущий проект
    try {
      const loadedNotes = await fetchNotes(projectId);
      setNotes(loadedNotes); // Загружаем заметки проекта
    } catch (error) {
      console.error("Ошибка при загрузке заметок:", error);
      alert("Не удалось загрузить заметки. Проверьте соединение с сервером.");
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    try {
      console.log("------in App_js before send updatedNote: ",updatedNote);
      const response = await updateNote(updatedNote);

    setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
    }catch (error){
      console.error("Ошибка при обновлении заметки:", error);
      alert("Не удалось обновить заметку. Проверьте соединение с сервером.");
    }
  };

  const handleCreateNote = async (newNote,projectId) => {

    try {
      const response = await addNote(newNote,newNote.projectId); // Используем метод из api.js
      setNotes((prevNotes) => [...prevNotes, response]); // Обновляем список заметок
    } catch (error) {
      console.error("Ошибка при создании заметки:", error);
      alert("Не удалось создать заметку. Проверьте соединение с сервером.");
    }
  };

  return (
      <div style={{ display: "flex", height: "100vh" }}>
        <ProjectPanel
            projects={projects}
            onSelect={handleProjectSelect}
            onCreate={handleCreateProject}
        />
        {selectedProjectId ? (
            <GraphBoard
                notes={notes}
                onUpdateNote={handleUpdateNote}
                projects={projects} // Передаём projects в GraphBoard
                selectedProject={selectedProjectId}
                onCreateNote={handleCreateNote}


           />
            ):(
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h3>Выберите проект, чтобы увидеть граф заметок</h3>
            </div>
        )}
      </div>
  );
};

export default App;

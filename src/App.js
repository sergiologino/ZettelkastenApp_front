import React, { useState, useEffect } from "react";
import GraphBoard from "./components/GraphBoard";
import ProjectPanel from "./components/ProjectPanel";
import {fetchProjects, fetchNotes, createProject, updateNote} from "./api/api";
import { addNote } from "./api/api"; // Импорт функции создания заметки из api.js

const App = () => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 — таб "Проекты", 1 — таб "Теги"
  const [filteredNotes, setFilteredNotes] = useState([]); // Список заметок для отображения



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

  useEffect(() => {
    if (activeTab === 0) {
      // Таб "Проекты"
      if (selectedProjectId) {
        const filtered = notes.filter((note) => note.projectId === selectedProjectId);
        setFilteredNotes(filtered);
      } else {
        setFilteredNotes([]); // Если проект не выбран
      }
    } else if (activeTab === 1) {
      // Таб "Теги"
      setFilteredNotes([]); // На табе "Теги" изначально скрываем заметки
    }
  }, [activeTab, selectedProjectId, notes]);

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
      console.log("Ура! Получена ОБНОВЛЕННАЯ заметка с сервера: ", response );

    setNotes((prevNotes) =>
        prevNotes.map((note) =>
                      (note.id === updatedNote.id ? updatedNote : note)
                      )

            )
    }catch (error){
      console.error("Ошибка при обновлении заметки:", error);
      alert("Не удалось обновить заметку. Проверьте соединение с сервером.");
    }
  };

  const handleCreateNote = async (newNote,projectId) => {

    try {
      const response = await addNote(newNote,newNote.projectId);
      setNotes((prevNotes) => [...prevNotes, response]); // Обновляем список заметок
      console.log("Ура! Получена НОВАЯ заметка с сервера: ", response );

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
            selectedProjectId={selectedProjectId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        />
        {selectedProjectId ? (
            <GraphBoard
                notes={filteredNotes} // Передаём отфильтрованные заметки
                setNotes={setNotes}
                onUpdateNote={handleUpdateNote}
                projects={projects}
                selectedProject={selectedProjectId}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setFilteredNotes={setFilteredNotes} // Передаём функцию для обновления
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

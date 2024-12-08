import React, { useState, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import GraphBoard from "./components/GraphBoard";
import ProjectPanel from "./components/ProjectPanel";
import { fetchProjects, fetchNotes } from "./api/api";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState(null);

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

  const handleUpdateNote = (updatedNote) => {
    setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  return (
      <ReactFlowProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <ProjectPanel
            projects={projects}
            onSelect={handleProjectSelect}
        />

        {selectedProjectId ? (
            <GraphBoard
                notes={notes}
                onUpdateNote={handleUpdateNote}
                projects={projects} // Передаём projects в GraphBoard

            />
            ):(
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h3>Выберите проект, чтобы увидеть граф заметок</h3>
            </div>
        )}

      </div>
      </ReactFlowProvider>
  );
};

export default App;

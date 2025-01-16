import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GraphBoard from "./components/GraphBoard";
import ProjectPanel from "./components/ProjectPanel";
import AuthPage from "./components/auth/AuthPage";
import {
  fetchProjects,
  fetchNotes,
  createProject,
  updateNote,
  fetchAllNotes,
  fetchNotesByTags,
} from "./api/api";
import { addNote } from "./api/api";
import HomePage from "./components/HomePage";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const App = () => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

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
    if (activeTab === 1) {
      const loadAllNotes = async () => {
        try {
          const notes = await fetchAllNotes();
          setNotes(notes);
        } catch (error) {
          console.error("Ошибка при загрузке всех заметок:", error);
        }
      };
      loadAllNotes();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedTags.length > 0) {
      const loadNotesByTags = async () => {
        try {
          const filteredNotes = await fetchNotesByTags(selectedTags);
          setFilteredNotes(filteredNotes);
        } catch (error) {
          console.error("Ошибка при фильтрации заметок по тегам:", error);
        }
      };
      loadNotesByTags();
    } else {
      setFilteredNotes(notes);
    }
  }, [selectedTags]);

  const handleTagSelect = (tag) => {
    const updatedTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];

    setSelectedTags(updatedTags);

    if (updatedTags.length > 0) {
      const filtered = notes.filter((note) =>
          updatedTags.some((selectedTag) => note.tags.includes(selectedTag))
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  };

  const handleCreateProject = async (newProject) => {
    try {
      const createdProject = await createProject(newProject);
      setProjects((prevProjects) => [...prevProjects, createdProject]);
    } catch (error) {
      console.error("Ошибка при создании проекта:", error);
      alert("Не удалось создать проект. Проверьте соединение с сервером.");
    }
  };

  const handleProjectSelect = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      const loadedNotes = await fetchNotes(projectId);
      setNotes(loadedNotes);
      setFilteredNotes(loadedNotes);
    } catch (error) {
      console.error("Ошибка при загрузке заметок:", error);
      alert("Не удалось загрузить заметки. Проверьте соединение с сервером.");
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    try {
      const response = await updateNote(updatedNote);
      setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      return response;
    } catch (error) {
      console.error("Ошибка при обновлении заметки:", error);
      alert("Не удалось обновить заметку. Проверьте соединение с сервером.");
    }
  };

  const handleCreateNote = async (newNote, projectId) => {
    try {
      const response = await addNote(newNote, newNote.projectId);
      setNotes((prevNotes) => [...prevNotes, response]);
      return response;
    } catch (error) {
      console.error("Ошибка при создании заметки:", error);
      alert("Не удалось создать заметку. Проверьте соединение с сервером.");
    }
  };

  return (
      // <>
      //   <head>
      //     <script src="https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js"></script>
      //   </head>
  <Router>
    <Routes>
      <Route path="/auth" element={<AuthPage/>}/>
      <Route path="/oauth2/authorization/yandex" element={<AuthPage />} />
      <Route path="/notes" element={<ProtectedRoute><GraphBoard /></ProtectedRoute>} />
      {/*<Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />*/}
      <Route
          path="/"
          element={
                <ProtectedRoute>
                  <div style={{ display: "flex", height: "100vh" }}>
                    <ProjectPanel
                        projects={projects}
                        onSelect={handleProjectSelect}
                        onCreate={handleCreateProject}
                        onTagSelect={handleTagSelect}
                        selectedProjectId={selectedProjectId}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tags={tags}
                        onTagChange={setTags} // Функция для обновления
                        selectedTags={selectedTags}
                    />
                    {selectedProjectId ? (
                          <GraphBoard
                              notes={filteredNotes || []}
                              setNotes={setNotes}
                              onUpdateNote={handleUpdateNote}
                              projects={projects}
                              selectedProject={selectedProjectId}
                              activeTab={activeTab}
                              setActiveTab={setActiveTab}
                              filteredNotes={filteredNotes || []}
                          />
                          ) : (
                          <div
                              style={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                          >
                            <h3>Выберите проект, чтобы увидеть граф заметок</h3>
                          </div>
                          )}
                        </div>
                      </ProtectedRoute>
                    }
                    />
                  </Routes>
                </Router>
      // </>
  );
};

export default App;

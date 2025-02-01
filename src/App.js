import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GraphBoard_new from "./components/GraphBoard_new";
import AuthForm from "./components/auth/AuthForm";
import ProjectPanel_new from "./components/ProjectPanel_new";
import AuthPage from "./components/auth/AuthPage";
import Profile from "./components/Profile";
import TopNavBar from "./components/TopNavBar"; // Импортируем TopNavBar
import NotFound from "./components/NotFound";
import PrivateRoute from "./components/PrivateRoute";

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

  //console.log("Run App.js");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const loadProjects = async () => {
        try {
          const projects = await fetchProjects();
          setProjects(projects);
        } catch (error) {
          console.error("Ошибка загрузки проектов:", error);
        }
      };
      loadProjects();
    }
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
      <Router>
        <Routes>
          {/* Маршрут для авторизации (без TopNavBar) */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/oauth2/authorization/yandex" element={<AuthPage />} />
          {/* Маршруты для защищенных страниц (с TopNavBar) */}
          <Route
              path="/*"
              element={
                <>
                  <TopNavBar />
                  <div style={{ display: "flex", height: "100vh" }}>
                    <ProjectPanel_new
                        projects={projects}
                        onSelect={handleProjectSelect}
                        onCreate={handleCreateProject}
                        onTagSelect={handleTagSelect}
                        selectedProjectId={selectedProjectId}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tags={tags}
                        onTagChange={setTags}
                        selectedTags={selectedTags}
                    />
                    <Routes>
                      <Route path="/" element={<Navigate to="/notes" />} />
                      <Route path="/notes" element={
                        <ProtectedRoute>
                          <GraphBoard_new
                              notes={filteredNotes}
                              setNotes={setNotes}
                              onUpdateNote={handleUpdateNote}
                              onCreateNote={handleCreateNote}
                              projects={projects}
                              selectedProject={selectedProjectId}
                          />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </div>
                </>
              }
          />
        </Routes>
      </Router>
  );
};

export default App;
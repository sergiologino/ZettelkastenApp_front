import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GraphBoard_new from "./components/GraphBoard_new";
import ProjectPanel_new from "./components/ProjectPanel_new";
import AuthPage from "./components/auth/AuthPage";
import Profile from "./components/Profile";
import TopNavBar from "./components/TopNavBar";
import SearchResults from "./components/SearchResults";
// import NotFound from "./components/NotFound";
// import PrivateRoute from "./components/PrivateRoute";

import {
  fetchProjects,
  fetchNotes,
  createProject,
  updateNote,
  fetchAllNotes,
  fetchNotesByTags, updateProject, deleteProject,
} from "./api/api";

import { addNote } from "./api/api";
import searchResults from "./components/SearchResults";
import NoteModal_new from "./components/NoteModal_new";

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
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

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

  const handleEditProject = async (updatedProject) => {
    try {
      const updated = await updateProject(updatedProject);
      setProjects((prevProjects) =>
          prevProjects.map((project) =>
              project.id === updated.id ? updated : project
          )
      );
    } catch (error) {
      console.error("Ошибка при обновлении проекта:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId); // Отправляем запрос на удаление
      setProjects((prevProjects) => prevProjects.filter((p) => p.id !== projectId));
      console.info("Проект удален!");
    } catch (error) {
      console.error("Ошибка при удалении проекта:", error);
      alert("Не удалось удалить проект.");
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
      const savedNote  = await updateNote(updatedNote);
      setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === savedNote .id ? savedNote  : note))
      );
      return savedNote;
    } catch (error) {
      console.error("Ошибка при обновлении заметки:", error);
      alert("Не удалось обновить заметку. Проверьте соединение с сервером.");
    }
  };

  const handleCreateNote = async (newNote, selectedProject) => {

    const projectId = selectedProject || projects[0]?.id;// ✅ Используем выбранный проект или первый доступный

    if (!projectId) {
      alert("Ошибка: Выберите проект перед созданием заметки.");
      return;
    }
    try {
      const savedNote  = await addNote({ ...newNote, projectId }, projectId);
      setNotes((prevNotes) => [...prevNotes, savedNote ]);
      return savedNote ;
    } catch (error) {
      console.error("Ошибка при создании заметки:", error);
      alert("Не удалось создать заметку. Проверьте соединение с сервером.");
    }
  };

  const resetAppState = () => {
    console.log("🔹 Очистка данных приложения...");

    setProjects([]);
    setNotes([]);
    setSelectedProjectId(null);
    setTags([]);
    setSelectedTags([]);

    // localStorage.removeItem("accessToken"); // ✅ Очистка токена авторизации
    // localStorage.removeItem("refreshToken"); // ✅ Очистка refresh-токена
  };

  const loadProjectsAndSelectFirst = async () => {
    try {
      const projects = await fetchProjects();
      setProjects(projects);

      if (projects.length > 0) {
        setSelectedProjectId(projects[0].id); // ✅ Выбираем первый проект
        const notes = await fetchNotes(projects[0].id); // ✅ Загружаем заметки для первого проекта
        setNotes(notes);
        setFilteredNotes(notes);
      }
    } catch (error) {
      console.error("Ошибка загрузки проектов:", error);
    }
  };

// ✅ Загружаем проекты при загрузке страницы
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      loadProjectsAndSelectFirst();
    }
  }, []);



  return (
      <Router>
        <Routes>
          {/* Маршрут для авторизации (без TopNavBar) */}
          <Route path="/auth" element={<AuthPage
              resetAppState={resetAppState}
              loadProjectsAndSelectFirst={loadProjectsAndSelectFirst}/>}
          />
          <Route path="/oauth2/authorization/yandex" element={<AuthPage />} />
          {/* Маршруты для защищенных страниц (с TopNavBar) */}
          <Route
              path="/*"
              element={
                <>
                  <TopNavBar
                      resetAppState={resetAppState}
                      onSearchResults={setSearchResults}
                  />
                  {searchResults.length > 0 && (
                      <SearchResults
                          results={searchResults}
                          onSelectNote={setSelectedNote}
                          onClose={() => setSearchResults([])}
                          projects={projects} // ✅ Передаем список проектов в SearchResults
                          onSave={handleUpdateNote}
                      />
                  )}
                  {/* Модальное окно заметки */}
                  {selectedNote && (
                      <NoteModal_new
                          open={Boolean(selectedNote)}
                          onClose={() => setSelectedNote(null)}
                          onSave={(updatedNote) => {
                            setSelectedNote(null); // Закрываем окно после сохранения
                          }}
                          note={selectedNote}
                          setNotes={setNotes} // ✅ Теперь setNotes передается!
                      />
                  )}
                  <Routes>
                    <Route path="/" element={<GraphBoard_new />} />
                  </Routes>
                  <div style={{ display: "flex", height: "100vh" }}>
                    <ProjectPanel_new
                        projects={projects}
                        onSelect={handleProjectSelect}
                        onCreate={handleCreateProject}
                        onTagSelect={handleTagSelect}
                        onDelete={handleDeleteProject}
                        selectedProjectId={selectedProjectId}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tags={tags}
                        onEdit={handleEditProject}
                        onTagChange={setTags}
                        selectedTags={selectedTags}
                        setFilteredNotes={setFilteredNotes}
                        setSelectedTags = {setSelectedTags }
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
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
  );
};

export default App;
import React, { useState, useEffect } from "react";
import GraphBoard from "./components/GraphBoard";
import ProjectPanel from "./components/ProjectPanel";
import {fetchProjects, fetchNotes, createProject, updateNote, fetchAllNotes, fetchNotesByTags} from "./api/api";
import { addNote } from "./api/api"; // Импорт функции создания заметки из api.js


const App = () => {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 — таб "Проекты", 1 — таб "Теги"
  const [filteredNotes, setFilteredNotes] = useState([]); // Список заметок для отображения
  const [tags, setTags] = useState([]); // Добавлено состояние для тегов
  const [selectedTags, setSelectedTags] = useState([]); // Выбранные теги



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

  //Получение всех заметок при переключении на вкладку "Теги"
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

//Получение заметок по выбранным тегам
  useEffect(() => {
    if (selectedTags.length > 0) {
      const loadNotesByTags = async () => {
        try {
          // console.log("Передаем на бэк выбранные тэги: ", selectedTags);
          const filteredNotes = await fetchNotesByTags(selectedTags);
          setFilteredNotes(filteredNotes);
        } catch (error) {
          console.error("Ошибка при фильтрации заметок по тегам:", error);
        }
      };
      loadNotesByTags();
    } else {
      setFilteredNotes(notes); // Если теги не выбраны, показываем все заметки
    }
  }, [selectedTags]);



  useEffect(() => {
    if (activeTab === 1) {
      const uniqueTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));
      setTags(uniqueTags);
      setFilteredNotes(notes); // Отображаем все заметки при переключении на таб "Теги"
    }
  }, [activeTab, notes]);

  const handleTagChange = React.useCallback((tags) => {
    setTags(tags); // Обновляем состояние тегов
  }, []);


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


  useEffect(() => {
    if (activeTab === 0) {
      // Таб "Проекты"
      if (selectedProjectId) {
        const filtered = notes.filter((note) => note.projectId === selectedProjectId);
        console.log("Filtered notes for project: ",filtered);
        setFilteredNotes(filtered); // Обновляем заметки для проекта
        console.log("notes in filtered: ",filtered);
      } else {
        console.log("No project selected");
        setFilteredNotes([]); // Очищаем, если проект не выбран
      }
    } else if (activeTab === 1) {
      // Таб "Теги"
      // console.log("Switching to tags tab, resetting filteredNotes");
      setFilteredNotes(notes); // На табе "Теги" очищаем доску
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
      setFilteredNotes(loadedNotes); // Устанавливаем filteredNotes сразу после загрузки
      console.log("notes in handleProjectSelect: ",loadedNotes);
    } catch (error) {
      console.error("Ошибка при загрузке заметок:", error);
      alert("Не удалось загрузить заметки. Проверьте соединение с сервером.");
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    try {

      const response = await updateNote(updatedNote);

      setNotes((prevNotes) =>
          prevNotes.map((note) =>
                        (note.id === updatedNote.id ? updatedNote : note)));
      return response;

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
      return response;

    } catch (error) {
      console.error("Ошибка при создании заметки (App.js): ", error);
      alert("Не удалось создать заметку. Проверьте соединение с сервером.");
    }
  };

  return (

      <div style={{ display: "flex", height: "100vh" }}>
        <ProjectPanel
            projects={projects}
            onSelect={handleProjectSelect}
            onCreate={handleCreateProject}
            onTagSelect={handleTagSelect}
            selectedProjectId={selectedProjectId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tags={tags} // Передача уникальных тегов
            selectedTags={selectedTags} // Передача выбранных тегов
            onTagChange={handleTagChange}

        />
        {/*<ReactFlowProvider>*/}
        {selectedProjectId ? (
            // <GraphBoard
            //     filteredNotes={filteredNotes}
            //     notes={filteredNotes} // Передаём отфильтрованные заметки
            //     setNotes={setNotes}
            //     onCreateNote={handleCreateNote} // Здесь должно передаваться onCreateNote
            //     onUpdateNote={handleUpdateNote}
            //     projects={projects}
            //     selectedProject={selectedProjectId}
            //     activeTab={activeTab}
            //     setActiveTab={setActiveTab}
            //     setFilteredNotes={setFilteredNotes} // Передаём функцию для обновления
            //
            // />
            <GraphBoard
                notes={filteredNotes || []} // передаётся пустой массив, если заметок не найдено (filteredNotes undefined)
                setNotes={setNotes}
                onUpdateNote={handleUpdateNote}
                projects={projects}
                selectedProject={selectedProjectId}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filteredNotes={filteredNotes || []} // Для обновления фильтрации
                onCreateNote={handleCreateNote}
                setFilteredNotes={setFilteredNotes} // Передаём функцию для обновления
            />

            ):(
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h3>Выберите проект, чтобы увидеть граф заметок</h3>

            </div>

        )}

      {/*</ReactFlowProvider>*/}
      </div>

  );
};

export default App;

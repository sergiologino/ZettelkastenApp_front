import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api", // Замените на ваш URL бэкенда
});

// Получить список проектов
export const fetchProjects = async () => {
    const response = await api.get("/projects");
    return response.data;
};

// Получить список заметок проекта
export const fetchNotes = async (projectId) => {
    const response = await api.get(`/projects/${projectId}/notes`);
    return response.data;
};

// Добавить новую заметку
export const addNote = async (note) => {
    const response = await api.post("/notes", note);
    return response.data;
};

// Отправить заметки на анализ
export const analyzeNotes = async (noteIds) => {
    const response = await api.put("/notes/analyze", { noteIds });
    return response.data;
};

export default api;

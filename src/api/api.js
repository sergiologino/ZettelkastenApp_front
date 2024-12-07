import axios from "axios";
import api from "./axiosConfig";


// const api = axios.create({
//     baseURL: "http://localhost:8080/api", // Замените на ваш URL бэкенда
// });
console.log("api: ",api);
// Получить список проектов
export const fetchProjects = async () => {
    const response = await api.get("/api/projects");
    console.log("Полученные проекты:", response.data);
    return response.data;
};

// Получить список заметок проекта
export const fetchNotes = async (projectId) => {
    try {
        const response = await api.get(`/api/projects/${projectId}/notes`);
        console.log("список заметок проекта: ", response.data);
        return response.data;
        console.log("список заметок проекта: ", )
    } catch (error) {
        console.error("Ошибка при загрузке заметок:", error.response?.data || error.message);
        throw error;
    }
};

export const addNote = async (note) => {
    try {
        console.log("идем создавать заметку note: ",note)
        const response = await api.post("/api/notes", note);
        return response.data;
    } catch (error) {
        console.error("Ошибка в API при добавлении заметки:", error.response?.data || error.message);
        throw error;
    }
};
// Добавить новую заметку
// export const addNote = async (note) => {
//     console.log("Отправляем заметку из api :", note);
//     try {
//         const response = await api.post("/notes", note);
//         return response.data;
//     } catch (error) {
//         console.error("Ошибка в API при добавлении заметки:", error.response?.data || error.message);
//         throw error;
//     }
// };

export const createProject = async (project) => {
    try {
        const response = await api.post("/api/projects", project);
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании проекта:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteProject = async (projectId) => {
    try {
        await api.delete(`/projects/${projectId}`);
    } catch (error) {
        console.error("Ошибка при удалении проекта:", error.response?.data || error.message);
        throw error;
    }
};

// Отправить заметки на анализ
export const analyzeNotes = async (noteIds) => {
    const response = await api.put("/api/notes/analyze", { noteIds });
    return response.data;
};

export default api;

import axios from "axios";
import api from "./axiosConfig";


// const api = axios.create({
//     baseURL: "http://localhost:8080/api", // Замените на ваш URL бэкенда
// });
console.log("api: ",api);
// Получить список проектов
export const fetchProjects = async () => {
    // eslint-disable-next-line no-template-curly-in-string
    const response = await api.get('/projects');
    console.log("uri: ", api.getUri() );
    console.log("Полученные проекты:", response.data);
    return response.data;
};

// Получить список заметок проекта
export const fetchNotes = async (projectId) => {
    try {
        // eslint-disable-next-line no-template-curly-in-string
        console.log("id проекта: ", projectId);
        const response = await api.get(`/projects/${projectId}/notes`);
        console.log("uri: ", api.getUri() );
        console.log("список заметок проекта: ", response.data);
        return response.data;

    } catch (error) {
        console.error("Ошибка при загрузке заметок:", error.response?.data || error.message);
        throw error;
    }
};

export const updateNote = async (note) => {
        console.log("обновляем заметку: ",note );
    try {

        console.log("отправляем заметку на сервер: ", note);
        const response = await api.put(`/notes`, note, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data; // Возвращаем данные созданной заметки
    } catch (error) {
        console.error("Ошибка при вызове API для обновления заметки:", error);
        throw error;
    }
};


///-----------------
export const addNote = async (note,projectId) => {
    console.log("новая заметка по проекту: ",projectId );
    console.log("добавляем заметку: ",note );
    try {
        console.log("uri: ", api.getUri(),"/notes/",projectId);
        console.log("по проекту: ", projectId);
        console.log("отправляем заметку на сервер: ", note);
        const response = await api.post(`/notes/${projectId}`, note, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data; // Возвращаем данные созданной заметки
    } catch (error) {
        console.error("Ошибка при вызове API для создания заметки:", error);
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
        // eslint-disable-next-line no-template-curly-in-string
        const response = await api.post('/projects', project);
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
    // eslint-disable-next-line no-template-curly-in-string
    const response = await api.put('/notes/analyze', { noteIds });
    return response.data;
};

export default api;

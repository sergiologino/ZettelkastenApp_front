import axios from "axios";
import api from "./axiosConfig";



// Получить список проектов
export const fetchProjects = async () => {
    // eslint-disable-next-line no-template-curly-in-string
    const response = await api.get('/projects');

    //console.log("Полученные проекты:", response.data);
    return response.data;
};

// Получить список заметок проекта
export const fetchNotes = async (projectId) => {
    try {
        // eslint-disable-next-line no-template-curly-in-string

        const response = await api.get(`/notes/${projectId}/notes`);

        return response.data;

    } catch (error) {
        console.error("Ошибка при загрузке заметок:", error.response?.data || error.message);
        throw error;
    }
};

export const updateNote = async (note) => {

    try {

        //console.log("отправляем измененную заметку на сервер: ", note);
        const response = await api.put(`/notes`, note, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data; // Возвращаем данные обновленной заметки

    } catch (error) {
        console.error("Ошибка при вызове API для обновления заметки:", error);
        throw error;
    }
};


///-----------------
export const addNote = async (note,projectId) => {

    try {
        //console.log("отправляем новую заметку на сервер: ", note);
        const response = await api.post(`/notes/${projectId}`, note, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data; // Возвращаем данные созданной заметки
    } catch (error) {
        console.error("Ошибка при вызове API для создания заметки:", error);
        throw error;
    }
};


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

// export const fetchOpenGraphData = async (url) => {
//     try {
//         const response = await api.get(`/notes/og-data`, {
//             params: { url },
//         });
//         return response.data; // Возвращаем данные OpenGraph
//     } catch (error) {
//         console.error("Ошибка при получении данных OpenGraph:", error);
//         throw error;
//     }
// };

 export const fetchOpenGraphDataForNote = async (noteId, urls) => {
    try {
        const response = await api.post(`/notes/og-data`, {
            noteId,
            urls,
        });
        return response.data; // Массив OpenGraph данных
    } catch (error) {
        console.error("Ошибка при получении OpenGraph данных:", error);
        throw error;
    }
};

export const updateNoteCoordinates = async (noteId, x, y) => {
    console.log(`отправка координат на сервер`);
    try {
        const response = await api.put(`/notes/${noteId}/coordinates`, { x, y });
        console.log(`Координаты для заметки ${noteId} обновлены на сервере:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении координат для заметки ${noteId}:`, error);
        throw error;
    }
};

export const uploadFiles = async (noteId, formData) => {
    try {
        const response = await api.post(`/notes/${noteId}/files`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(`файлы для заметки ${noteId} обновлены на сервере:`, response.data);
        return response.data;

    } catch (error) {
        console.error("Ошибка при загрузке файлов:", error);
        throw error;
    }
};

export const uploadAudioFiles = async (noteId, formData) => {
    try {
        formData.forEach((value, key) => {
            console.log(key, value);
        });
        const response = await api.post(`/notes/${noteId}/audios`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(`АудиоЗаписи для заметки ${noteId} обновлены на сервере:`, response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка при загрузке аудиофайлов:", error);
        throw error;
    }
};



export default api;

import api from "./axiosConfig";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Получить список проектов
export const fetchProjects = async () => {
    // eslint-disable-next-line no-template-curly-in-string
    const response = await api.get('/projects');

    //console.log("Полученные проекты:", response.data);
    return response.data.map(project => ({
        ...project,
        noteCount: project.noteCount || 0, // Убедимся, что значение не undefined
    }));
};

// Получить список заметок проекта
export const fetchNotes = async (projectId) => {
    try {
        // eslint-disable-next-line no-template-curly-in-string

        const response = await api.get(`/notes/${projectId}/notes`);
        console.log("Получены заметки по проекту:", response);

        return response.data;

    } catch (error) {
        console.error("Ошибка при загрузке заметок:", error.response?.data || error.message);
        throw error;
    }
};
// обновить существующую заметку
export const updateNote = async (note) => {

    try {

        console.log("!!! отправляем измененную заметку на сервер: ", JSON.stringify(note));
        const response = await api.put(`/notes`, note, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("успешное обновление заметки: ",response.data);
        return response.data; // Возвращаем данные обновленной заметки

    } catch (error) {
        console.error("api.js: Ошибка при передаче на сервер обновления заметки:", error);
        throw error;
    }
};


///-  создать заметку ----------------
export const addNote = async (note,projectId) => {
    console.log("Создаем заметку: ", note);
    console.log("по проекту: ", projectId);

    try {
        //console.log("отправляем новую заметку на сервер: ", note);
        const response = await api.post(`/notes/${projectId}`, note, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("Ответ сервера по сохранению заметки: ", response.data);
        return response.data; // Возвращаем данные созданной заметки
    } catch (error) {
        console.error("api.js: Ошибка при передаче на сервер создания заметки:", error);
        throw error;
    }
};

// создать проект
export const createProject = async (project) => {
    try {
        // const token = localStorage.getItem("accessToken");
        const response = await api.post('/projects', project); // , {
            // headers: {
            //     Authorization: `Bearer ${token}`,
            //     "Content-Type": "application/json",
            // },
        // });
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании проекта:", error.response?.data || error.message);
        throw error;
    }
};
// изменить проект
export const updateProject = async (project) => {
    try {
        console.log("Отправляем в API:", JSON.stringify(project)); // Логируем данные

        const response = await api.put(`/projects/${project.id}`, project, {
            headers: { "Content-Type": "application/json" },
        });

        // console.log("Ответ API:", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении проекта:", error.response?.data || error.message);
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

export const fetchOpenGraphData = async (url) => {
    try {
        const response = await api.get(`/notes/og-data-clear`, {
            params: { url },
        });
        // console.log("Ответ с OpenGraph: ",response.data);
        return response.data; // Возвращаем данные OpenGraph
    } catch (error) {
        console.error("Ошибка при получении данных OpenGraph:", error);
        throw error;
    }
};

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
    // console.log(`отправка координат на сервер`);
    try {
        const response = await api.put(`/notes/${noteId}/coordinates`, { x, y });
        // console.log(`Координаты для заметки ${noteId} обновлены на сервере:`, response.data);
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
        console.error("Ошибка при отправке файлов на сервер:", error);
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
        console.error("Ошибка при отправке аудиофайлов на сервер:", error);
        throw error;
    }
};

// Получение всех заметок
export const fetchAllNotes = async () => {
    try {
        const response = await api.get('/notes');
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке всех заметок:', error);
        throw error;
    }
};

// Получение заметок по массиву тегов
export const fetchNotesByTags = async (tags) => {
    try {
        console.log("1. Исходное значение tags: ", tags);
        const params = new URLSearchParams();
        tags.forEach((tag) => params.append("tags", tag)); // Форматируем в tags=tag1&tags=tag2
        console.log("2. значение tags после преобразования: ", tags);

        const response = await api.get('/notes/tags/search', {
            params,
        });
        console.log("3. Ответ с заметками: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка при загрузке заметок по тегам:", error);
        throw error;
    }
};

// Получение всех тегов
export const fetchAllTags = async () => {
    try {
        const response = await api.get('/notes/tags');
        console.log(" tags from back: ", response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке тегов:', error);
        throw error;
    }
};

export const updateAvatar = async (userId, avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    return api.put(`/users/${userId}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateUserProfile = async (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
};

export const deleteNote = async (noteId) => {
    try {
        await api.delete(`/notes/${noteId}`);
    } catch (error) {
        console.error("Ошибка при удалении заметки:", error.response?.data || error.message);
        throw error;
    }
};

export default api;

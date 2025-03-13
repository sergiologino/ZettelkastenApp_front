import api from "./axiosConfig";

// Получить список проектов
export const fetchProjects = async () => {
    // eslint-disable-next-line no-template-curly-in-string
    // console.log("API загружен как:", api());
    const response = await api.get('/projects');
    // console.log("сходили за проектами:",response.data);

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
        // console.log("Идем за заметками по проекту:", projectId);
        const response = await api.get(`/notes/${projectId}/notes`);
        // console.log("Получены заметки по проекту:", response.data);

        return response.data;

    } catch (error) {
        console.error("Ошибка при загрузке заметок:", error.response?.data || error.message);
        throw error;
    }
};
// обновить существующую заметку
export const updateNote = async (note, files, audios) => {
    try {
        const formData = new FormData();
        formData.append("note", new Blob([JSON.stringify(note)], { type: "application/json" }));

        if (files && files.length > 0) {
            files.forEach(file => formData.append("files", file));
        }
        if (audios && audios.length > 0) {
            audios.forEach(audio => formData.append("audios", audio));
        }

        console.log("Отправка заметки с файлами:", formData);

        const response = await api.put(`/notes/full`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении заметки:", error);
        throw error;
    }
};

export const updateNoteWithFiles = async (formData) => {
    try {
        console.log("Отправка заметки с файлами:", formData);


        const response = await api.put(`/notes/full`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });


        return response.data;
    } catch (error) {
        console.error("Ошибка при обновлении заметки:", error);
        throw error;
    }
};

// **Загрузка файлов к заметке**
export const uploadFiles = async (noteId, formDataFiles) => {
    try {
        const response = await api.post(`/notes/${noteId}/files`, formDataFiles, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Файлы успешно загружены:", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка при загрузке файлов:", error);
        throw error;
    }
};

// **Загрузка аудиофайлов к заметке**
export const uploadAudioFiles = async (noteId, formDataAudios) => {
    try {
        const response = await api.post(`/notes/${noteId}/audios`, formDataAudios, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Аудиофайлы успешно загружены:", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка при загрузке аудиофайлов:", error);
        throw error;
    }
};



///-  создать заметку ----------------
export const addNote = async (note, projectId) => {
    try {
        console.log("Создание новой заметки:", note);
        // `/notes/full`, { ...note, projectId },
        const response = await api.post(`/notes/${projectId}`, note,{
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при создании заметки:", error);
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
    return api.put(`/users/${userId}`, {
        ...userData,
        isAskProjectBeforeSave: userData.isAskProjectBeforeSave || false, // Значение по умолчанию false
    });
};

export const deleteNote = async (noteId) => {
    try {
        console.log("Удаление заметки: ",noteId);
        await api.delete(`/notes/${noteId}`);
    } catch (error) {
        console.error("Ошибка при удалении заметки:", error.response?.data || error.message);
        throw error;
    }
};

export default api;

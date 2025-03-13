import React, { useState, useEffect } from 'react';
import { Tabs, Tab, TextField, Button, IconButton, Modal } from '@mui/material';
import { Add, Edit, Trash, XCircle } from 'lucide-react';
import { SketchPicker } from 'react-color';

const ProjectPanel = ({
                          projects,
                          selectedProjectId,
                          onSelect,
                          onCreate,
                          onEdit,
                          onDelete,
                          tags,
                          selectedTags,
                          onTagSelect,
                          notes,
                          fetchAllTags,
                      }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [hoveredProject, setHoveredProject] = useState(null);
    const [filteredTags, setFilteredTags] = useState(tags);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectColor, setProjectColor] = useState('#1976d2');

    useEffect(() => {
        if (selectedTags.length > 0) {
            const filteredNotes = notes.filter(note =>
                selectedTags.every(tag => note.tags.includes(tag))
            );
            const remainingTags = new Set(filteredNotes.flatMap(note => note.tags));
            setFilteredTags(Array.from(remainingTags));
        } else {
            setFilteredTags(tags);
        }
    }, [selectedTags, notes, tags]);

    const handleCreateProject = () => {
        if (!projectName.trim()) return;
        onCreate({ name: projectName, description: projectDescription, color: projectColor });
        setProjectName('');
        setProjectDescription('');
        setProjectColor('#1976d2');
        setIsModalOpen(false);
    };

    const handleEditProject = () => {
        if (!projectName.trim()) return;
        onEdit({ ...selectedProject, name: projectName, description: projectDescription, color: projectColor });
        setIsEditModalOpen(false);
    };

    const handleOpenEditModal = (project) => {
        setSelectedProject(project);
        setProjectName(project.name);
        setProjectDescription(project.description);
        setProjectColor(project.color);
        setIsEditModalOpen(true);
    };

    const resetTagFilter = () => {
        onTagSelect([]);
        fetchAllTags();
    };

    return (
        <div className="w-64 h-full bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} className="mb-4">
                <Tab label="Проекты" />
                <Tab label="Теги" />
            </Tabs>

            {activeTab === 0 && (
                <>
                    <Button
                        variant="contained"
                        size="small"
                        className="mb-4"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Add size={16} /> Новый проект
                    </Button>

                    <div className="space-y-2">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="relative p-3 bg-gray-100 dark:bg-gray-700 rounded shadow hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition"
                                onMouseEnter={() => setHoveredProject(project.id)}
                                onMouseLeave={() => setHoveredProject(null)}
                                onClick={() => onSelect(project.id)}
                            >
                                <div className="font-semibold truncate">{project.name}</div>
                                <div className="text-xs text-gray-500 truncate">{project.description}</div>

                                {hoveredProject === project.id && (
                                    <div className="absolute top-1 right-1 flex gap-1">
                                        <IconButton size="small" onClick={() => handleOpenEditModal(project)}>
                                            <Edit size={14} />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDelete(project.id)}>
                                            <Trash size={14} />
                                        </IconButton>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 1 && (
                <>
                    <Button size="small" className="mb-2" onClick={resetTagFilter}>
                        <XCircle size={16} className="mr-1" /> Сбросить
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        {filteredTags.map((tag) => (
                            <div
                                key={tag}
                                className={`px-2 py-1 rounded cursor-pointer text-xs transition-colors duration-200 ${selectedTags.includes(tag) ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => onTagSelect(tag)}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Create/Edit Modal */}
            <Modal open={isModalOpen || isEditModalOpen} onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 p-6 rounded shadow-md space-y-4">
                    <TextField fullWidth label="Название проекта" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    <TextField fullWidth label="Описание" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
                    <SketchPicker color={projectColor} onChange={(color) => setProjectColor(color.hex)} />
                    <Button variant="contained" fullWidth onClick={isEditModalOpen ? handleEditProject : handleCreateProject}>
                        {isEditModalOpen ? 'Сохранить изменения' : 'Создать проект'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectPanel;

import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { Copy, Trash, Plus } from 'lucide-react';
import AddNoteButton from './AddNoteButton';
import '@reactflow/node-resizer/dist/style.css';
import 'reactflow/dist/style.css';

const GraphBoardNew = ({ notes, onCopyNote, onDeleteNote, onOpenNote, onAddNote }) => {
    const [showEdges, setShowEdges] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    const initialNodes = notes.map((note) => ({
        id: note.id,
        position: { x: note.x || 0, y: note.y || 0 },
        data: { note },
        style: { width: note.width || 250, height: note.height || 150 },
    }));

    const initialEdges = notes.flatMap((note) =>
        note.relatedNotes?.map((relId) => ({
            id: `${note.id}-${relId}`,
            source: note.id,
            target: relId,
            animated: true,
            style: { stroke: '#a78bfa' },
        })) || []
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [notes]);

    const handleResizeStop = useCallback((event, params, node) => {
        setNodes((nds) =>
            nds.map((n) =>
                n.id === node.id ? { ...n, style: { ...n.style, width: params.width, height: params.height } } : n
            )
        );
    }, []);

    const handleNodeClick = useCallback((event, node) => {
        setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    }, []);

    const nodeTypes = {
        customNode: ({ id, data }) => (
            <div
                className={`relative flex flex-col p-2 rounded shadow border transition-all duration-150
        ${selectedNodeId === id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                onClick={() => handleNodeClick(null, { id })}
                onDoubleClick={() => onOpenNote(data.note)}
            >
                <NodeResizer color="#a78bfa" isVisible={selectedNodeId === id} minWidth={200} minHeight={120} />
                <div className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">
                    {data.note.title}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 overflow-hidden flex-1">
                    {data.note.content?.replace(/<[^>]+>/g, '').substring(0, 60)}...
                </div>

                {selectedNodeId === id && (
                    <div className="absolute top-1 right-1 flex gap-1">
                        <button
                            className="bg-white dark:bg-gray-700 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCopyNote(data.note);
                            }}
                        >
                            <Copy size={14} className="text-purple-500" />
                        </button>
                        <button
                            className="bg-white dark:bg-gray-700 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(data.note.id);
                            }}
                        >
                            <Trash size={14} className="text-red-500" />
                        </button>
                    </div>
                )}
            </div>
        ),
    };

    return (
        <div className="w-full h-full relative bg-gray-100 dark:bg-gray-900">
            <button
                className="absolute top-4 right-32 bg-green-500 text-white py-1 px-3 text-sm rounded shadow flex items-center gap-1 z-10"
                onClick={AddNoteButton}
            >
                <Plus size={16} /> +
            </button>
            <button
                className="absolute top-4 right-40 bg-purple-500 text-white py-1 px-3 text-sm rounded shadow z-10"
                onClick={() => setShowEdges((prev) => !prev)}
            >
                {showEdges ? 'Скрыть связи' : 'Показать связи'}
            </button>
            <ReactFlow
                nodes={nodes}
                edges={showEdges ? edges.filter((e) => !selectedNodeId || e.target === selectedNodeId || e.source === selectedNodeId) : []}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                fitView
            >
                <Background color="#d1d5db" gap={16} />
                <MiniMap />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default GraphBoardNew;

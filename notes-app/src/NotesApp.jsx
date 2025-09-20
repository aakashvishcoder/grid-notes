import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background, addEdge } from "react-flow-renderer";
import { GraphView } from "./GraphView";
import { EditableNote } from "./EditableNote";

// Main Notes App
export default function NotesApp() {
  const [pages, setPages] = useState(() => [{ id: Date.now().toString(), title: "Page 1", notes: [], links: [] }]);
  const [currentPageId, setCurrentPageId] = useState(pages[0].id);
  const [graphMode, setGraphMode] = useState(false);

  const currentPage = pages.find(p => p.id === currentPageId);

  const addPage = () => {
    const newPage = { id: Date.now().toString(), title: `Page ${pages.length + 1}`, notes: [], links: [] };
    setPages([...pages, newPage]);
    setCurrentPageId(newPage.id);
  };

  const addNote = () => {
    const newNote = { id: Date.now().toString(), title: "New Note", content: "" };
    setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, notes: [...p.notes, newNote] } : p));
  };

  const updateNoteContent = (noteId, newContent, newTitle = null) => {
    setPages(prev => prev.map(p => p.id !== currentPageId ? p : {
      ...p,
      notes: p.notes.map(n => n.id === noteId ? { ...n, content: newContent ?? n.content, title: newTitle ?? n.title } : n)
    }));
  };

  const deleteNote = (noteId) => setPages(prev => prev.map(p => p.id !== currentPageId ? p : { ...p, notes: p.notes.filter(n => n.id !== noteId) }));
  const deletePage = (pageId) => setPages(prev => prev.filter(p => p.id !== pageId));

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", backgroundColor: "#343541", color: "white", display: "flex", flexDirection: "column", padding: "10px" }}>
        <button onClick={addPage} style={{ marginBottom: "10px", padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#10a37f", color: "white", cursor: "pointer" }}>
          + New Page
        </button>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {pages.map(p => (
            <div key={p.id} onClick={() => setCurrentPageId(p.id)} style={{ padding: "10px", marginBottom: "5px", borderRadius: "6px", backgroundColor: p.id === currentPageId ? "#444654" : "transparent", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{p.title}</span>
              <button onClick={(e) => { e.stopPropagation(); deletePage(p.id); }} style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontWeight: "bold" }}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addNote} style={{ marginTop: "10px", padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#10a37f", color: "white", cursor: "pointer" }}>
          + New Note
        </button>
        <button onClick={() => setGraphMode(!graphMode)} style={{ marginTop: "10px", padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#10a37f", color: "white", cursor: "pointer" }}>
          {graphMode ? "Return to Notes" : "Graph View"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: "#343541", padding: "20px", overflowY: "auto" }}>
        {graphMode ? (
          <GraphView pages={pages} setPages={setPages} onSelectPage={(id) => { setGraphMode(false); setCurrentPageId(id); }} />
        ) : (
          currentPage.notes.map((note) => (
            <div key={note.id} style={{ backgroundColor: "#444654", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              <EditableNote note={note} updateContent={updateNoteContent} />
              <button onClick={() => deleteNote(note.id)} style={{ marginTop: "10px", background: "none", border: "none", color: "red", cursor: "pointer", fontWeight: "bold" }}>
                Delete Note
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

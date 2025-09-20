// storage.js

// Load notes from localStorage
export function loadNotes() {
  const notes = localStorage.getItem("notes");
  return notes ? JSON.parse(notes) : [];
}

// Save notes to localStorage
export function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

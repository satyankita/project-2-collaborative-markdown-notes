import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./services/api";
import "./App.css";

const emptyNote = { title: "", content: "", tags: [] };

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyNote);
  const [isNew, setIsNew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const loadNotes = async () => {
    try {
      setError("");
      const data = await getNotes();
      setNotes(data);

      if (selectedId) {
        const selected = data.find((note) => note._id === selectedId);
        if (selected && !isNew) {
          setForm({
            title: selected.title,
            content: selected.content,
            tags: selected.tags || [],
          });
        }
      }
    } catch {
      setError("Backend se connect nahi ho pa raha. Check karo ki server running hai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const startNewNote = () => {
    setSelectedId(null);
    setForm(emptyNote);
    setIsNew(true);
    setShowPreview(false);
    setError("");
  };

  const openNote = (note) => {
    setSelectedId(note._id);
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    });
    setIsNew(false);
    setShowPreview(false);
    setError("");
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      let saved;
      if (isNew) {
        saved = await createNote(form);
      } else {
        saved = await updateNote(selectedId, form);
      }

      const data = await getNotes();
      setNotes(data);
      setSelectedId(saved._id);
      setForm({
        title: saved.title,
        content: saved.content,
        tags: saved.tags || [],
      });
      setIsNew(false);
    } catch {
      setError("Note save nahi hua. Backend aur MongoDB connection check karo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || isNew) return;
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote(selectedId);
      setNotes((previous) => previous.filter((note) => note._id !== selectedId));
      startNewNote();
    } catch {
      setError("Note delete nahi ho paya.");
    }
  };

  const filteredNotes = notes.filter((note) =>
    `${note.title} ${note.content}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h1>NoteSpace</h1>
            <p>YOUR THINKING SPACE</p>
          </div>
        </div>

        <button className="new-note-btn" onClick={startNewNote}>
          <span>＋</span> Create new note
        </button>

        <div className="sidebar-label">YOUR NOTES <span>{notes.length}</span></div>

        <input
          className="search-input"
          placeholder="⌕  Search notes..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="notes-list">
          {loading ? (
            <p className="muted">Loading notes...</p>
          ) : filteredNotes.length === 0 ? (
            <p className="muted">No notes yet. Create one!</p>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note._id}
                className={`note-item ${selectedId === note._id ? "active" : ""}`}
                onClick={() => openNote(note)}
              >
                <span className="note-symbol">▤</span>
                <span className="note-item-text">
                  <strong>{note.title}</strong>
                  <small>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </small>
                </span>
              </button>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="avatar">N</div>
<button
  type="button"
  className="workspace-home"
  onClick={() => {
    startNewNote();
  }}
>
  <span>My Workspace</span>
  <small>Personal notes</small>
</button>        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <span className="breadcrumb">Workspace <span>/</span> Notes</span>
          <span className="status"><i /> All changes saved to database</span>
        </header>

        <section className="editor-area">
          <div className="editor-topline">
            <span className="eyebrow">{isNew ? "NEW DOCUMENT" : "YOUR DOCUMENT"}</span>
            <div className="editor-actions">
              {!isNew && (
                <button className="delete-btn" onClick={handleDelete}>Delete</button>
              )}
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save note  ↗"}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <input
            className="title-input"
            placeholder="Give your note a title..."
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />

          <div className="metadata">
            <span>✦ &nbsp; Markdown document</span>
            <span>•</span>
            <span>{form.content.length} characters</span>
          </div>

          <div className="format-toolbar">
            <span className="toolbar-label">FORMAT</span>
            <button title="Bold" onClick={() => setForm({ ...form, content: form.content + "**bold text**" })}><b>B</b></button>
            <button title="Italic" onClick={() => setForm({ ...form, content: form.content + "*italic text*" })}><i>I</i></button>
            <button title="Heading" onClick={() => setForm({ ...form, content: form.content + "\n## Heading\n" })}>H</button>
            <button title="List" onClick={() => setForm({ ...form, content: form.content + "\n- List item\n" })}>☷</button>
            <span className="toolbar-divider" />
            <button className={showPreview ? "preview-active" : ""} onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>

          {showPreview ? (
            <article className="markdown-preview">
              {form.content ? (
                <ReactMarkdown>{form.content}</ReactMarkdown>
              ) : (
                <p className="muted">Your Markdown preview will appear here.</p>
              )}
            </article>
          ) : (
            <textarea
              className="content-input"
              placeholder={"Start writing your thoughts here...\n\nYou can use Markdown:\n# Heading\n**Bold text**\n- List item"}
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              spellCheck="false"
            />
          )}

          <div className="editor-bottom">
            <span>✧ Take your time. Ideas grow here.</span>
            <span>MARKDOWN SUPPORTED</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

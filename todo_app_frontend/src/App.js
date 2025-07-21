import React, { useState, useEffect } from "react";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  // Main state
  const [todos, setTodos] = useState([]);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all|upcoming|completed
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [theme, setTheme] = useState("light");

  // Demo: use localStorage; swap with backend integration later
  useEffect(() => {
    const stored = localStorage.getItem("todos");
    if (stored) setTodos(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Computed: search and filter
  const filteredTodos = todos.filter((todo) => {
    // filter
    if (filter === "upcoming") {
      return todo.reminder && new Date(todo.reminder) > new Date() && !todo.completed;
    }
    if (filter === "completed") {
      return todo.completed;
    }
    // search
    if (search) {
      const s = search.toLowerCase();
      return (
        todo.title.toLowerCase().includes(s) ||
        (todo.notes && todo.notes.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const selectedTodo =
    todos.find((t) => t.id === selectedTodoId) || filteredTodos[0] || null;

  // PUBLIC_INTERFACE
  function handleAddNew() {
    setShowForm(true);
    setEditingTodo(null);
  }

  // PUBLIC_INTERFACE
  function handleEdit(todo) {
    setShowForm(true);
    setEditingTodo(todo);
  }

  // PUBLIC_INTERFACE
  function handleDelete(todoId) {
    if (!window.confirm("Delete this to-do item permanently?")) return;
    setTodos(todos.filter((t) => t.id !== todoId));
    if (selectedTodoId === todoId) setSelectedTodoId(null);
  }

  // PUBLIC_INTERFACE
  function handleToggleComplete(todoId) {
    setTodos(
      todos.map((t) =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleSave(todoValues) {
    if (editingTodo) {
      setTodos(
        todos.map((t) =>
          t.id === editingTodo.id ? { ...t, ...todoValues } : t
        )
      );
    } else {
      const newTodo = {
        ...todoValues,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
      };
      setTodos([newTodo, ...todos]);
    }
    setShowForm(false);
    setEditingTodo(null);
  }

  // PUBLIC_INTERFACE
  function handleAddNote(noteText) {
    if (!selectedTodo) return;
    setTodos(
      todos.map((t) =>
        t.id === selectedTodo.id ? { ...t, notes: noteText } : t
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
  }

  function handleSelectTodo(todoId) {
    setSelectedTodoId(todoId);
  }

  function handleThemeToggle() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">📝 TODO App</div>
        <div className="navbar-search-filter">
          <input
            className="search-box"
            type="text"
            placeholder="Search to-dos..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search tasks"
          />
          <button
            className={`filter-btn${filter === "all" ? " active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            All
          </button>
          <button
            className={`filter-btn${filter === "upcoming" ? " active" : ""}`}
            onClick={() => handleFilterChange("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn${filter === "completed" ? " active" : ""}`}
            onClick={() => handleFilterChange("completed")}
          >
            Completed
          </button>
        </div>
        <button
          className="theme-toggle"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </nav>
      <main className="dashboard">
        <section className="tasklist-pane">
          <div className="tasklist-header">
            <h2>Your Tasks</h2>
            <button className="add-btn" onClick={handleAddNew} tabIndex={0}>
              + Add Task
            </button>
          </div>
          <ul className="tasklist">
            {filteredTodos.length === 0 && (
              <li className="tasklist-empty">No tasks found.</li>
            )}
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={`tasklist-item${
                  selectedTodo && todo.id === selectedTodo.id ? " selected" : ""
                }`}
                onClick={() => handleSelectTodo(todo.id)}
                tabIndex={0}
                aria-label={todo.title}
              >
                <span
                  className={`status-dot${todo.completed ? " completed" : ""}`}
                  title={todo.completed ? "Completed" : "Incomplete"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(todo.id);
                  }}
                ></span>
                <span className="task-title">
                  {todo.title}
                  {todo.reminder && (
                    <span className="reminder-badge" title="Task Reminder">
                      ⏰
                    </span>
                  )}
                </span>
                <span className="task-actions">
                  <button
                    className="edit-btn"
                    aria-label="Edit Task"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(todo);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    aria-label="Delete Task"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(todo.id);
                    }}
                  >
                    🗑️
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="details-pane">
          {showForm ? (
            <TodoForm
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingTodo(null);
              }}
              initial={editingTodo}
            />
          ) : selectedTodo ? (
            <TodoDetails
              todo={selectedTodo}
              onEdit={() => handleEdit(selectedTodo)}
              onAddNote={handleAddNote}
              hideEdit={showForm}
            />
          ) : (
            <div className="details-empty">Select a task to view details.</div>
          )}
        </section>
      </main>
      <footer className="footer">
        <span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Source
          </a>{" "}
          | Minimal Task Manager
        </span>
      </footer>
    </div>
  );
}

// --------------------------- TodoForm Component ---------------------------

function TodoForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial ? initial.title : "");
  const [reminder, setReminder] = useState(
    initial && initial.reminder ? initial.reminder : ""
  );
  const [notes, setNotes] = useState(initial && initial.notes ? initial.notes : "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title cannot be empty.");
      return;
    }
    onSave({
      title: title.trim(),
      reminder: reminder || null,
      notes: notes.trim(),
      completed: initial ? initial.completed : false,
      id: initial ? initial.id : undefined,
      createdAt: initial ? initial.createdAt : undefined,
    });
    setTitle("");
    setReminder("");
    setNotes("");
  }

  return (
    <form className="todoform" onSubmit={handleSubmit}>
      <h3>{initial ? "Edit Task" : "Add a New Task"}</h3>
      <div className="todoform-field">
        <label htmlFor="title">Title*</label>
        <input
          autoFocus
          id="title"
          type="text"
          value={title}
          maxLength={60}
          required
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="todoform-field">
        <label htmlFor="reminder">Reminder</label>
        <input
          id="reminder"
          type="datetime-local"
          value={reminder || ""}
          onChange={(e) => setReminder(e.target.value)}
        />
      </div>
      <div className="todoform-field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <div className="todoform-actions">
        <button type="submit" className="save-btn">
          {initial ? "Save Changes" : "Add Task"}
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// --------------------------- TodoDetails Component ---------------------------

function TodoDetails({ todo, onEdit, onAddNote }) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(todo.notes || "");

  useEffect(() => {
    setEditingNote(false);
    setNoteDraft(todo.notes || "");
  }, [todo.id]);

  function handleNoteSave() {
    onAddNote(noteDraft);
    setEditingNote(false);
  }

  return (
    <div className="tododetails">
      <h3>
        {todo.title}{" "}
        {todo.completed && (
          <span title="Completed" className="completed-done">
            ✔️
          </span>
        )}
      </h3>
      <div>
        <strong>Reminder:</strong>{" "}
        {todo.reminder
          ? formatDatetime(todo.reminder)
          : "None"}
      </div>
      <div>
        <strong>Created:</strong> {formatDatetime(todo.createdAt)}
      </div>
      <div className="tododetails-section">
        <strong>Notes:</strong>
        {editingNote ? (
          <>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={4}
              style={{ width: "100%" }}
            />
            <button
              className="save-btn"
              onClick={handleNoteSave}
              style={{ marginRight: 8 }}
            >
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => setEditingNote(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <div>
            <div className="note-content">
              {todo.notes ? todo.notes : <span style={{ color: "#AAA" }}>No notes.</span>}
            </div>
            <button
              className="editnote-btn"
              onClick={() => setEditingNote(true)}
            >
              {todo.notes ? "Edit Note" : "Add Note"}
            </button>
          </div>
        )}
      </div>
      <div className="tododetails-actions">
        <button className="edit-btn" onClick={onEdit}>
          Edit Task
        </button>
      </div>
    </div>
  );
}

// --------------------- Utility: datetime formatter ---------------------
function formatDatetime(dtString) {
  if (!dtString) return "";
  const d = new Date(dtString);
  if (isNaN(d.getTime())) return dtString;
  const now = new Date();
  // Show date and time, if not today
  if (
    d.getDate() !== now.getDate() ||
    d.getMonth() !== now.getMonth() ||
    d.getFullYear() !== now.getFullYear()
  ) {
    return d.toLocaleString();
  } else {
    // same day: show just hour+min
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}

export default App;

import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, loginUser, registerUser } from './api';
import './App.css';

export default function App() {
  const [user, setUser]       = useState(JSON.parse(localStorage.getItem('user')));
  const [tasks, setTasks]     = useState([]);
  const [form, setForm]       = useState({ title:'', desc:'', priority:'medium', status:'todo', due:'' });
  const [editId, setEditId]   = useState(null);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState('login');
  const [authForm, setAuthForm] = useState({ name:'', email:'', password:'' });
  const [error, setError]     = useState('');

  useEffect(() => { if (user) loadTasks(); }, [user]);

  const loadTasks = async () => {
    const data = await getTasks();
    if (Array.isArray(data)) setTasks(data);
  };

  const handleAuth = async () => {
    setError('');
    const res = page === 'login'
      ? await loginUser({ email: authForm.email, password: authForm.password })
      : await registerUser(authForm);
    if (res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    } else {
      setError(res.message || 'Something went wrong');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setTasks([]);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert('Title is required');
    if (editId) {
      const updated = await updateTask(editId, form);
      setTasks(tasks.map(t => t._id === editId ? updated : t));
      setEditId(null);
    } else {
      const newTask = await createTask(form);
      setTasks([newTask, ...tasks]);
    }
    setForm({ title:'', desc:'', priority:'medium', status:'todo', due:'' });
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setForm({ title:task.title, desc:task.desc, priority:task.priority, status:task.status, due:task.due });
    window.scrollTo(0,0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const handleToggle = async (task) => {
    const updated = await updateTask(task._id, { ...task, status: task.status === 'done' ? 'todo' : 'done' });
    setTasks(tasks.map(t => t._id === task._id ? updated : t));
  };

  const filtered = tasks
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const count = (s) => tasks.filter(t => s === 'all' ? true : t.status === s).length;

  // AUTH PAGE
  if (!user) return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="logo">✅ Taskflow</h1>
        <p className="auth-sub">{page === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>

        {page === 'register' && (
          <input className="input" placeholder="Full name"
            value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
        )}
        <input className="input" placeholder="Email address" type="email"
          value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
        <input className="input" placeholder="Password" type="password"
          value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />

        {error && <p className="error">{error}</p>}

        <button className="btn-primary" onClick={handleAuth}>
          {page === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="switch-auth">
          {page === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setPage(page === 'login' ? 'register' : 'login'); setError(''); }}>
            {page === 'login' ? 'Register' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );

  // MAIN APP
  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h2 className="logo">✅ Taskflow</h2>
        <div className="user-bar">
          <span>👤 {user.name}</span>
          <button className="btn-outline" onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        {[['All','all'],['Todo','todo'],['In Progress','in-progress'],['Done','done']].map(([label, key]) => (
          <div className="stat" key={key}>
            <div className="stat-label">{label}</div>
            <div className="stat-val">{count(key)}</div>
          </div>
        ))}
      </div>

      {/* Task Form */}
      <div className="card form-card">
        <h3>{editId ? '✏️ Edit Task' : '➕ Add New Task'}</h3>
        <div className="form-grid">
          <input className="input" placeholder="Task title *" value={form.title}
            onChange={e => setForm({...form, title: e.target.value})} />
          <input className="input" placeholder="Description (optional)" value={form.desc}
            onChange={e => setForm({...form, desc: e.target.value})} />
          <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
          <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="todo">📋 Todo</option>
            <option value="in-progress">⚡ In Progress</option>
            <option value="done">✅ Done</option>
          </select>
          <input className="input" type="date" value={form.due}
            onChange={e => setForm({...form, due: e.target.value})} />
        </div>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleSubmit}>{editId ? 'Update Task' : 'Add Task'}</button>
          {editId && <button className="btn-outline" onClick={() => { setEditId(null); setForm({ title:'', desc:'', priority:'medium', status:'todo', due:'' }); }}>Cancel</button>}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="toolbar">
        <input className="input search" placeholder="🔍 Search tasks..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <div className="filters">
          {['all','todo','in-progress','done'].map(f => (
            <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {filtered.length === 0 && <div className="empty">No tasks found 📭</div>}
        {filtered.map(t => (
          <div key={t._id} className={`task-card ${t.status === 'done' ? 'done' : ''}`}>
            <input type="checkbox" checked={t.status === 'done'} onChange={() => handleToggle(t)} />
            <div className="task-info">
              <div className="task-title">{t.title}</div>
              {t.desc && <div className="task-desc">{t.desc}</div>}
              <div className="task-badges">
                <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                <span className={`badge status-${t.status}`}>{t.status}</span>
                {t.due && <span className="badge due">📅 {t.due}</span>}
              </div>
            </div>
            <div className="task-btns">
              <button className="btn-outline" onClick={() => handleEdit(t)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(t._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
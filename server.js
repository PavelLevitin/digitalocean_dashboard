require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const PROJECTS_FILE = path.join(__dirname, 'projects.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readProjects() {
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
}

function writeProjects(projects) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD not configured on server' });
  }
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/projects', (req, res) => {
  res.json(readProjects());
});

app.post('/api/projects', requireAdmin, (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'name and url are required' });
  }
  const projects = readProjects();
  const newProject = {
    id: projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1,
    name,
    url,
    enabled: true
  };
  projects.push(newProject);
  writeProjects(projects);
  res.status(201).json(newProject);
});

app.patch('/api/projects/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const projects = readProjects();
  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (typeof req.body.enabled === 'boolean') {
    project.enabled = req.body.enabled;
  }
  if (req.body.name) project.name = req.body.name;
  if (req.body.url) project.url = req.body.url;
  writeProjects(projects);
  res.json(project);
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Dashboard running on http://127.0.0.1:${PORT}`);
});

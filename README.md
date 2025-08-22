
# 📋 Task Manager-API

A simple **Task Management Web App** built with **Flask, SQLite, and JavaScript**.  
It allows you to **create, update, filter, and delete tasks** with real-time statistics for pending, completed, and in-progress tasks.

---

## ✨ Features

- ➕ Add, ✏️ Edit, and ❌ Delete tasks  
- 📊 Task statistics (total, completed, pending, in-progress)  
- 🔍 Filter tasks by **status** and **priority**  
- 📅 Set due dates for tasks  
- 🎨 Clean and responsive UI  

---

## 🛠 Tech Stack

- **Backend**: Flask, Flask-SQLAlchemy, Flask-CORS  
- **Database**: SQLite  
- **Frontend**: HTML, CSS, JavaScript  
- **API Format**: REST (JSON responses)  

---

## 📂 Project Structure

task-manager-pro/
│── app.py # Flask backend
│── tasks.db # SQLite database (auto-created)
│
├── templates/
│ └── index.html # Frontend UI
│
├── static/
│ ├── styles.css # Styling
│ └── script.js # Frontend logic (fetch API, modal, etc.)
│
└── README.md # Documentation

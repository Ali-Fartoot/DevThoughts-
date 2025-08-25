# DevThoughts

A full-stack social media platform for developers to share thoughts, ideas, and code snippets.

## Table of Contents
- [DevThoughts](#devthoughts)
  - [Table of Contents](#table-of-contents)
  - [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [DevOps](#devops)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
  - [Services](#services)
    - [Backend API](#backend-api)
    - [Database](#database)
      - [PostgreSQL](#postgresql)
      - [MongoDB](#mongodb)
    - [Search Engine](#search-engine)
      - [Elasticsearch](#elasticsearch)
      - [Kibana](#kibana)
    - [File Storage](#file-storage)
      - [MinIO](#minio)
    - [Frontend](#frontend-1)
  - [Development](#development)
    - [Running Migrations](#running-migrations)
    - [Creating Superuser](#creating-superuser)
    - [API Documentation](#api-documentation)
  - [Deployment](#deployment)
****
## Architecture

DevThoughts follows a microservices architecture pattern with separate services for different functionalities:

```
┌────────────────┐    ┌──────────────┐    ┌────────────────┐
│   Frontend     │    │   Backend    │    │  PostgreSQL    │
│   (React)      │◄──►│ (Django API) │◄──►│  (Users/Auth)  │
└────────────────┘    └──────────────┘    └────────────────┘
                            │  ▲
                            │  │
                   ┌────────▼──┴────────┐
                   │     MongoDB       │
                   │  (Posts/Comments) │
                   └───────────────────┘
                            │  ▲
                            │  │
                   ┌────────▼──┴────────┐
                   │  Elasticsearch    │
                   │   (Search Index)  │
                   └───────────────────┘
                            │  ▲
                            │  │
                   ┌────────▼──┴────────┐
                   │      MinIO        │
                   │  (File Storage)   │
                   └───────────────────┘
```

## Tech Stack

### Frontend
- [React 18](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Material UI](https://mui.com/)
- [Emotion](https://emotion.sh/)
- [React Router](https://reactrouter.com/)

**Note**: The frontend is currently in development mode and uses Vite's development server with hot reloading.

### Backend
- [Python 3.12](https://www.python.org/)
- [Django 5.2](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [MongoDB](https://www.mongodb.com/)
- [Elasticsearch](https://www.elastic.co/elasticsearch/)
- [MinIO](https://min.io/)

### DevOps
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Project Structure

```
devthoughts/
├── backend/              # Django application
│   ├── accounts/         # User authentication and profiles
│   ├── posts/            # Posts and comments functionality
│   ├── search/           # Search integration
│   ├── settings/         # Configuration files
│   ├── cron/             # Elasticsearch sync cron job
│   ├── manage.py         # Django CLI utility
│   ├── requirements.txt  # Python dependencies
│   └── devthoughts/      # Main Django project files
├── frontend/             # React application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── package.json      # Node.js dependencies
│   └── vite.config.js    # Vite configuration
├── docker-compose.yaml   # Docker services orchestration
├── Dockerfile.backend    # Backend Docker image
├── Dockerfile.cron       # Cron job Docker image
├── entrypoint.sh         # Backend entrypoint script
├── cron.sh               # Cron job entrypoint script
├── backend.env           # Environment variables
└── Makefile              # Development commands
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd devthoughts
   ```

2. Set up environment variables:
   ```bash
   # backend.env contains all required environment variables
   # Review and modify if needed
   cat backend.env
   ```

### Running the Application

### Running Backend Services

Start all backend services with Docker Compose:
```bash
docker-compose up -d
```

This will start all backend services:
- Backend API on http://localhost:8000
- PostgreSQL on port 5432
- MongoDB on port 27017
- Elasticsearch on port 9200
- Kibana on port 5601
- MinIO on ports 9000 (API) and 9001 (Console)

To stop all services:
```bash
docker-compose down
```

### Running the Complete Application

To run the complete application with both frontend and backend:

1. Start the backend services using Docker Compose as described above
2. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   yarn install
   yarn dev
   ```

The frontend will be available at http://localhost:3000 and will automatically proxy API requests to the backend service.

## Services

### Backend API

The Django backend provides a REST API for the application.

- **URL**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Default Admin Credentials**: 
  - Username: `admin`
  - Password: `admin`

Key features:
- User authentication and management
- Post creation, editing, and deletion
- Comment system
- Like functionality
- File upload via MinIO integration
- Search via Elasticsearch

### Database

#### PostgreSQL
- **Service Name**: `pgdb`
- **Purpose**: User authentication, profiles, and relational data
- **Credentials**: See `backend.env`

#### MongoDB
- **Service Name**: `mongodb`
- **Purpose**: Posts, comments, and other document-based data
- **Credentials**: See `backend.env`

### Search Engine

#### Elasticsearch
- **Service Name**: `elasticsearch`
- **Purpose**: Full-text search for posts
- **API Port**: 9200
- **Security**: Disabled for development

#### Kibana
- **Service Name**: `kibana`
- **Purpose**: Elasticsearch visualization and management
- **UI Port**: 5601
- **URL**: http://localhost:5601

### File Storage

#### MinIO
- **Service Name**: `minio`
- **Purpose**: Object storage for file uploads
- **API Port**: 9000
- **Console Port**: 9001
- **URL**: http://localhost:9001
- **Default Credentials**: 
  - Username: `root`
  - Password: `rootroot`

### Frontend

The React frontend provides the user interface.

- **URL**: http://localhost:3000
- **Development Server**: `yarn dev`
- **Build for Production**: `yarn build`

**Note**: The frontend is currently in development mode and uses Vite's development server with hot reloading. It proxies API requests to the backend service.

#### Development Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

The development server will start on http://localhost:3000 with hot reloading enabled. API requests to `/api` are automatically proxied to the backend service at http://localhost:8000.

#### Project Structure

```
frontend/
├── src/                 # Source code
│   ├── assets/          # Static assets
│   ├── components/      # React components (currently empty)
│   ├── api.js           # API utility functions
│   ├── auth.js          # Authentication utilities
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   ├── Home.jsx         # Home page
│   ├── Login.jsx        # Login page
│   ├── Signup.jsx       # Signup page
│   ├── UserPanel.jsx    # User profile page
│   ├── Settings.jsx     # User settings page
│   ├── Search.jsx       # Search page
│   ├── Post.jsx         # Post component
│   ├── CreatePost.jsx   # Create post component
│   ├── Comments.jsx     # Comments page
│   └── CreateComment.jsx# Create comment component
├── public/              # Static assets
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Development

### Running Migrations

Django migrations are automatically run when starting the backend service. To manually run migrations:

```bash
# Run in the backend container
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Creating Superuser

A superuser is automatically created on first run:
- Username: `admin`
- Password: `admin`

To create additional superusers:
```bash
docker-compose exec backend python manage.py createsuperuser
```

### API Documentation

API endpoints can be explored through the Django REST Framework browsable API at http://localhost:8000/api/



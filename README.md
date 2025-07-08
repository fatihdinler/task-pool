# Task Management System 🚀

A modern, full-stack task management application built with **Spring Boot** (backend) and **Next.js** (frontend). This project demonstrates enterprise-level architecture patterns, RESTful API design, and modern web development practices.

![Project Architecture](./docs/Ekran%20Resmi%202025-07-01%2014.04.23.png)

## 🏗️ **System Architecture**

### **Backend Architecture (Spring Boot)**

The backend follows a **layered architecture** pattern with clear separation of concerns:

```
backend/
├── controllers/          # REST API Controllers
│   ├── TaskController.java
│   └── TaskListController.java
├── services/            # Business Logic Layer
│   ├── TaskService.java
│   ├── TaskListService.java
│   └── impl/
├── repositories/        # Data Access Layer
│   ├── TaskRepository.java
│   └── TaskListRepository.java
├── entities/           # JPA Entities
│   ├── Task.java
│   └── TaskList.java
├── dto/               # Data Transfer Objects
│   ├── TaskDto.java
│   └── TaskListDto.java
├── mappers/           # Entity-DTO Mappers
├── enums/            # Enumerations
│   ├── TaskPriorityEnum.java
│   └── TaskStatusEnum.java
└── config/           # Configuration Classes
    └── CorsConfig.java
```

### **Frontend Architecture (Next.js)**

The frontend implements a **component-based architecture** with modern React patterns:

```
frontend-v2/
├── app/                 # Next.js App Router
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/          # React Components
│   └── TaskManagement.tsx
├── types/              # TypeScript Definitions
└── lib/               # Utility Functions
```

## 🔧 **Technology Stack**

### **Backend Technologies**
- **Spring Boot 3.x** - Enterprise Java framework
- **Spring Data JPA** - Data persistence layer
- **Hibernate** - Object-Relational Mapping
- **PostgreSQL/MySQL** - Relational database
- **Maven** - Dependency management
- **Java 17+** - Programming language

### **Frontend Technologies**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Context API** - State management

## 🎯 **Core Features**

### **Task List Management**
- ✅ Create, read, update, delete task lists
- ✅ Progress tracking and statistics
- ✅ Real-time search and filtering
- ✅ Responsive grid layout

### **Task Management**
- ✅ CRUD operations for individual tasks
- ✅ Priority levels (HIGH, MEDIUM, LOW)
- ✅ Status tracking (OPEN, CLOSED)
- ✅ Due date management
- ✅ Task completion toggle

### **User Experience**
- ✅ **Glassmorphism UI** with stunning visual effects
- ✅ **Smooth animations** and micro-interactions
- ✅ **Real-time updates** with optimistic UI
- ✅ **Mobile-responsive** design
- ✅ **Loading states** and error handling

## 🗄️ **Database Design**

### **Entity Relationships**

```sql
-- Task Lists Table
CREATE TABLE task_lists (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created TIMESTAMP NOT NULL,
    updated TIMESTAMP NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    task_list_id UUID NOT NULL,
    created TIMESTAMP NOT NULL,
    updated TIMESTAMP NOT NULL,
    FOREIGN KEY (task_list_id) REFERENCES task_lists(id)
);
```

### **JPA Entity Relationships**
- **TaskList** `@OneToMany` **Task** (Bidirectional)
- **Task** `@ManyToOne` **TaskList**
- Cascade operations: `REMOVE`, `PERSIST`

## 🌐 **REST API Endpoints**

### **Task List Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/task-lists` | Get all task lists |
| `GET` | `/api/task-lists/{id}` | Get task list by ID |
| `POST` | `/api/task-lists` | Create new task list |
| `PUT` | `/api/task-lists/{id}` | Update task list |
| `DELETE` | `/api/task-lists/{id}` | Delete task list |

### **Task Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/task-lists/{taskListId}/tasks` | Get all tasks in list |
| `GET` | `/api/task-lists/{taskListId}/tasks/{taskId}` | Get specific task |
| `POST` | `/api/task-lists/{taskListId}/tasks` | Create new task |
| `PUT` | `/api/task-lists/{taskListId}/tasks/{taskId}` | Update task |
| `DELETE` | `/api/task-lists/{taskListId}/tasks/{taskId}` | Delete task |

### **API Request/Response Examples**

#### Create Task List
```json
POST /api/task-lists
{
  "title": "Personal Projects",
  "description": "My personal development goals"
}
```

#### Create Task
```json
POST /api/task-lists/{taskListId}/tasks
{
  "title": "Build amazing UI",
  "description": "Create beautiful task manager",
  "dueDate": "2025-07-15T10:00:00",
  "priority": "HIGH"
}
```

## 🚀 **Getting Started**

### **Prerequisites**
- **Java 17+**
- **Node.js 18+**
- **PostgreSQL/MySQL**
- **Maven**

### **Backend Setup**

1. **Clone the repository**
```bash
git clone <repository-url>
cd task-management-system
```

2. **Configure database**
```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taskmanagement
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

3. **Add CORS configuration**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

4. **Run the backend**
```bash
./mvnw spring-boot:run
```
Backend will be available at `http://localhost:8080`

### **Frontend Setup**

1. **Navigate to frontend directory**
```bash
cd frontend-v2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API base URL**
```typescript
// In TaskManagement.tsx
const API_BASE_URL = 'http://localhost:8080/api';
```

4. **Run the frontend**
```bash
npm run dev
```
Frontend will be available at `http://localhost:3000`

## 🔒 **Security & Best Practices**

### **Backend Security**
- **Input validation** with Bean Validation
- **CORS configuration** for cross-origin requests
- **Error handling** with proper HTTP status codes
- **UUID-based** entity identifiers
- **Transactional operations** for data consistency

### **Frontend Security**
- **TypeScript** for type safety
- **Error boundaries** for graceful error handling
- **Input sanitization** and validation
- **Loading states** for better UX

## 🎨 **UI/UX Features**

### **Visual Design**
- **Glassmorphism effects** with backdrop blur
- **Gradient backgrounds** and modern color palette
- **Smooth animations** with CSS transitions
- **Responsive grid layouts**
- **Interactive hover effects**

### **User Experience**
- **Real-time search** and filtering
- **Optimistic updates** for immediate feedback
- **Progress tracking** with animated progress bars
- **Priority badges** with color coding
- **Mobile-first responsive design**

## 📊 **Performance Optimizations**

### **Backend Optimizations**
- **Lazy loading** for entity relationships
- **DTO pattern** to reduce data transfer
- **Proper indexing** on frequently queried fields
- **Connection pooling** for database connections

### **Frontend Optimizations**
- **Component memoization** with React.memo
- **Efficient state management** with useReducer
- **Optimistic UI updates** for better perceived performance
- **Debounced search** to reduce API calls

## 🔄 **Development Workflow**

1. **Backend-First Development**
   - Design entities and relationships
   - Implement repository layer
   - Create service layer with business logic
   - Develop REST controllers
   - Add validation and error handling

2. **Frontend Integration**
   - Create TypeScript interfaces matching DTOs
   - Implement API service layer
   - Build React components
   - Add state management
   - Integrate with backend APIs
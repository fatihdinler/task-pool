'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { ChevronLeft, Plus, Edit3, Trash2, Check, Calendar, Flag, Search, Filter, MoreVertical, Star, Clock, Target, Sparkles, Zap, CheckCircle2, Circle, AlertCircle, ChevronRight, ArrowRight, TrendingUp, Award, Activity } from 'lucide-react';

// Types and Enums
enum TaskPriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

enum TaskStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
}

interface TaskList {
  id: string;
  title: string;
  description?: string;
  count?: number;
  progress?: number;
  tasks?: Task[];
}

interface AppState {
  taskLists: TaskList[];
  tasks: { [taskListId: string]: Task[] };
  currentView: 'dashboard' | 'tasklist' | 'createList' | 'editList' | 'createTask' | 'editTask';
  currentTaskListId?: string;
  currentTaskId?: string;
  searchQuery: string;
  selectedPriority?: TaskPriority;
}

type Action =
  | { type: 'SET_VIEW'; payload: { view: AppState['currentView']; taskListId?: string; taskId?: string } }
  | { type: 'SET_TASK_LISTS'; payload: TaskList[] }
  | { type: 'ADD_TASK_LIST'; payload: TaskList }
  | { type: 'UPDATE_TASK_LIST'; payload: TaskList }
  | { type: 'DELETE_TASK_LIST'; payload: string }
  | { type: 'SET_TASKS'; payload: { taskListId: string; tasks: Task[] } }
  | { type: 'ADD_TASK'; payload: { taskListId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { taskListId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { taskListId: string; taskId: string } }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_PRIORITY_FILTER'; payload: TaskPriority | undefined };

const initialState: AppState = {
  taskLists: [],
  tasks: {},
  currentView: 'dashboard',
  searchQuery: '',
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload.view,
        currentTaskListId: action.payload.taskListId,
        currentTaskId: action.payload.taskId,
      };
    case 'SET_TASK_LISTS':
      return { ...state, taskLists: action.payload };
    case 'ADD_TASK_LIST':
      return { ...state, taskLists: [...state.taskLists, action.payload] };
    case 'UPDATE_TASK_LIST':
      return {
        ...state,
        taskLists: state.taskLists.map(list =>
          list.id === action.payload.id ? action.payload : list
        ),
      };
    case 'DELETE_TASK_LIST':
      return {
        ...state,
        taskLists: state.taskLists.filter(list => list.id !== action.payload),
        tasks: Object.fromEntries(
          Object.entries(state.tasks).filter(([key]) => key !== action.payload)
        ),
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: { ...state.tasks, [action.payload.taskListId]: action.payload.tasks },
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.taskListId]: [
            ...(state.tasks[action.payload.taskListId] || []),
            action.payload.task,
          ],
        },
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.taskListId]: (state.tasks[action.payload.taskListId] || []).map(task =>
            task.id === action.payload.task.id ? action.payload.task : task
          ),
        },
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.taskListId]: (state.tasks[action.payload.taskListId] || []).filter(
            task => task.id !== action.payload.taskId
          ),
        },
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_PRIORITY_FILTER':
      return { ...state, selectedPriority: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const API_BASE_URL = 'http://localhost:8080/api';

// API Headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
});


const api = {
  // TaskList endpoints
  getTaskLists: async (): Promise<TaskList[]> => {
    const response = await fetch(`${API_BASE_URL}/task-lists`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch task lists');
    }
    const data = await response.json();

    // Backend'den gelen verileri frontend formatına çeviriyoruz
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      count: item.count,
      progress: item.progress,
      tasks: item.tasks,
    }));
  },

  getTaskList: async (id: string): Promise<TaskList> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch task list');
    }
    const data = await response.json();

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      count: data.count,
      progress: data.progress,
      tasks: data.tasks,
    };
  },

  createTaskList: async (taskList: Omit<TaskList, 'id'>): Promise<TaskList> => {
    const response = await fetch(`${API_BASE_URL}/task-lists`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: taskList.title,
        description: taskList.description,
        count: taskList.count,
        progress: taskList.progress,
        tasks: taskList.tasks,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create task list');
    }
    const data = await response.json();

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      count: data.count,
      progress: data.progress,
      tasks: data.tasks,
    };
  },

  updateTaskList: async (id: string, taskList: TaskList): Promise<TaskList> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        id: taskList.id,
        title: taskList.title,
        description: taskList.description,
        count: taskList.count,
        progress: taskList.progress,
        tasks: taskList.tasks,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task list');
    }
    const data = await response.json();

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      count: data.count,
      progress: data.progress,
      tasks: data.tasks,
    };
  },

  deleteTaskList: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete task list');
    }
  },

  // Task endpoints
  getTasks: async (taskListId: string): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${taskListId}/tasks`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data = await response.json();

    // Backend'den gelen verileri frontend formatına çeviriyoruz
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      dueDate: item.dueDate,
      priority: item.priority,
      status: item.status,
    }));
  },

  getTask: async (taskListId: string, taskId: string): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${taskListId}/tasks/${taskId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    const data = await response.json();

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
    };
  },

  createTask: async (taskListId: string, task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${taskListId}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    const data = await response.json();

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
    };
  },

  updateTask: async (taskListId: string, taskId: string, task: Task): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${taskListId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    const data = await response.json();

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
    };
  },

  deleteTask: async (taskListId: string, taskId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/task-lists/${taskListId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  },
};

// Utility Components
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', gradient = false, hover = true, onClick }) => (
  <div
    className={`
      backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl
      ${gradient ? 'bg-gradient-to-br from-white/20 to-white/5' : ''}
      ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
);

const PriorityBadge: React.FC<{ priority: TaskPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'md'
}) => {
  const colors = {
    [TaskPriority.HIGH]: 'from-red-400 to-pink-500 shadow-red-500/40',
    [TaskPriority.MEDIUM]: 'from-yellow-400 to-orange-500 shadow-yellow-500/40',
    [TaskPriority.LOW]: 'from-green-400 to-emerald-500 shadow-green-500/40',
  };

  const icons = {
    [TaskPriority.HIGH]: AlertCircle,
    [TaskPriority.MEDIUM]: Clock,
    [TaskPriority.LOW]: Target,
  };

  const Icon = icons[priority];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${colors[priority]} 
      text-white font-medium shadow-lg ${sizeClasses}
      transform hover:scale-105 transition-all duration-200
    `}>
      <Icon size={size === 'sm' ? 12 : 14} />
      <span className="capitalize">{priority.toLowerCase()}</span>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-600 rounded-full animate-spin animation-delay-150"></div>
    </div>
  </div>
);

// Main Components
const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('Dashboard must be used within AppProvider');

  const { state, dispatch } = context;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const taskLists = await api.getTaskLists();
        dispatch({ type: 'SET_TASK_LISTS', payload: taskLists });
      } catch (error) {
        console.error('Failed to load task lists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const filteredTaskLists = state.taskLists.filter(list =>
    list.title.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const totalTasks = state.taskLists.reduce((sum, list) => sum + (list.count || 0), 0);
  const avgProgress = state.taskLists.length > 0
    ? state.taskLists.reduce((sum, list) => sum + (list.progress || 0), 0) / state.taskLists.length
    : 0;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <GlassCard className="p-6" gradient>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Task Master Pro
                  </h1>
                  <p className="text-white/70 text-lg">Your productivity companion</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search task lists..."
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                    className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Total Lists</p>
                    <p className="text-2xl font-bold text-white">{state.taskLists.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Total Tasks</p>
                    <p className="text-2xl font-bold text-white">{totalTasks}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Avg Progress</p>
                    <p className="text-2xl font-bold text-white">{Math.round(avgProgress * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Create New Button */}
        <div className="mb-8">
          <GlassCard
            className="p-6 cursor-pointer group"
            gradient
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'createList' } })}
          >
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="p-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl shadow-lg group-hover:shadow-emerald-500/40 transition-all duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">Create New Task List</h3>
                <p className="text-white/70">Start organizing your next project</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </GlassCard>
        </div>

        {/* Task Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTaskLists.map((list) => (
            <GlassCard
              key={list.id}
              className="p-6 group"
              gradient
              onClick={() => dispatch({
                type: 'SET_VIEW',
                payload: { view: 'tasklist', taskListId: list.id }
              })}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl shadow-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-200 transition-colors">
                      {list.title}
                    </h3>
                    <p className="text-white/70 text-sm">{list.count} tasks</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: 'SET_VIEW',
                      payload: { view: 'editList', taskListId: list.id }
                    });
                  }}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {list.description && (
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{list.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Progress</span>
                  <span className="text-white font-medium">{Math.round((list.progress || 0) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(list.progress || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Updated recently</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredTaskLists.length === 0 && (
          <div className="text-center py-16">
            <GlassCard className="p-12 max-w-md mx-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">No task lists found</h3>
                <p className="text-white/70 text-center">
                  {state.searchQuery ? 'Try adjusting your search terms' : 'Create your first task list to get started'}
                </p>
                {!state.searchQuery && (
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'createList' } })}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                  >
                    Create Task List
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskListView: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('TaskListView must be used within AppProvider');

  const { state, dispatch } = context;
  const [isLoading, setIsLoading] = useState(true);

  const currentTaskList = state.taskLists.find(list => list.id === state.currentTaskListId);
  const tasks = state.currentTaskListId ? state.tasks[state.currentTaskListId] || [] : [];

  useEffect(() => {
    const loadTasks = async () => {
      if (!state.currentTaskListId) return;

      setIsLoading(true);
      try {
        const taskData = await api.getTasks(state.currentTaskListId);
        dispatch({
          type: 'SET_TASKS',
          payload: { taskListId: state.currentTaskListId, tasks: taskData }
        });
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [state.currentTaskListId, dispatch]);

  const completedTasks = tasks.filter(task => task.status === TaskStatus.CLOSED);
  const openTasks = tasks.filter(task => task.status === TaskStatus.OPEN);
  const progress = tasks.length > 0 ? completedTasks.length / tasks.length : 0;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesPriority = !state.selectedPriority || task.priority === state.selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const toggleTaskStatus = async (task: Task) => {
    if (!state.currentTaskListId) return;

    const updatedTask = {
      ...task,
      status: task.status === TaskStatus.OPEN ? TaskStatus.CLOSED : TaskStatus.OPEN,
    };

    try {
      await api.updateTask(state.currentTaskListId, task.id, updatedTask);
      dispatch({
        type: 'UPDATE_TASK',
        payload: { taskListId: state.currentTaskListId, task: updatedTask },
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard className="p-6 mb-8" gradient>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'dashboard' } })}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{currentTaskList?.title}</h1>
                <p className="text-white/70">{currentTaskList?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch({
                  type: 'SET_VIEW',
                  payload: { view: 'editList', taskListId: state.currentTaskListId }
                })}
                className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Tasks</p>
                  <p className="text-2xl font-bold text-white">{tasks.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedTasks.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Progress</p>
                  <p className="text-2xl font-bold text-white">{Math.round(progress * 100)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Overall Progress</span>
              <span className="text-white font-medium">{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/40"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <GlassCard
            className="flex-1 p-4 cursor-pointer group"
            onClick={() => dispatch({
              type: 'SET_VIEW',
              payload: { view: 'createTask', taskListId: state.currentTaskListId }
            })}
          >
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl shadow-lg group-hover:shadow-emerald-500/40 transition-all duration-300">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">Add New Task</span>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </GlassCard>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                className="pl-9 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 w-48"
              />
            </div>

            <select
              value={state.selectedPriority || ''}
              onChange={(e) => dispatch({
                type: 'SET_PRIORITY_FILTER',
                payload: e.target.value ? e.target.value as TaskPriority : undefined
              })}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
            >
              <option value="">All Priorities</option>
              <option value={TaskPriority.HIGH}>High Priority</option>
              <option value={TaskPriority.MEDIUM}>Medium Priority</option>
              <option value={TaskPriority.LOW}>Low Priority</option>
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <GlassCard key={task.id} className="p-6 group" gradient>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${task.status === TaskStatus.CLOSED
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 border-emerald-400 shadow-lg shadow-emerald-500/40'
                      : 'border-white/30 hover:border-white/50'
                    }
                  `}
                >
                  {task.status === TaskStatus.CLOSED && <Check className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className={`
                        text-lg font-semibold transition-all duration-300
                        ${task.status === TaskStatus.CLOSED
                          ? 'text-white/60 line-through'
                          : 'text-white group-hover:text-purple-200'
                        }
                      `}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-white/70 text-sm mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} size="sm" />
                      <button
                        onClick={() => dispatch({
                          type: 'SET_VIEW',
                          payload: {
                            view: 'editTask',
                            taskListId: state.currentTaskListId,
                            taskId: task.id
                          }
                        })}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (state.currentTaskListId) {
                            try {
                              await api.deleteTask(state.currentTaskListId, task.id);
                              dispatch({
                                type: 'DELETE_TASK',
                                payload: { taskListId: state.currentTaskListId, taskId: task.id },
                              });
                            } catch (error) {
                              console.error('Failed to delete task:', error);
                            }
                          }
                        }}
                        className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className={`
                      flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium
                      ${task.status === TaskStatus.CLOSED
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-blue-500/20 text-blue-300'
                      }
                    `}>
                      {task.status === TaskStatus.CLOSED ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      <span>{task.status === TaskStatus.CLOSED ? 'Completed' : 'Open'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <GlassCard className="p-12 max-w-md mx-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">No tasks found</h3>
                <p className="text-white/70 text-center">
                  {state.searchQuery || state.selectedPriority
                    ? 'Try adjusting your filters'
                    : 'Create your first task to get started'
                  }
                </p>
                {!state.searchQuery && !state.selectedPriority && (
                  <button
                    onClick={() => dispatch({
                      type: 'SET_VIEW',
                      payload: { view: 'createTask', taskListId: state.currentTaskListId }
                    })}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                  >
                    Create Task
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateEditTaskList: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const context = useContext(AppContext);
  if (!context) throw new Error('CreateEditTaskList must be used within AppProvider');

  const { state, dispatch } = context;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentTaskList = isEdit && state.currentTaskListId
    ? state.taskLists.find(list => list.id === state.currentTaskListId)
    : null;

  useEffect(() => {
    if (isEdit && currentTaskList) {
      setTitle(currentTaskList.title);
      setDescription(currentTaskList.description || '');
    }
  }, [isEdit, currentTaskList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      if (isEdit && state.currentTaskListId) {
        const updatedTaskList: TaskList = {
          ...currentTaskList!,
          title: title.trim(),
          description: description.trim() || undefined,
        };
        const result = await api.updateTaskList(state.currentTaskListId, updatedTaskList);
        dispatch({ type: 'UPDATE_TASK_LIST', payload: result });
        dispatch({ type: 'SET_VIEW', payload: { view: 'tasklist', taskListId: state.currentTaskListId } });
      } else {
        const newTaskList = {
          title: title.trim(),
          description: description.trim() || undefined,
          count: 0,
          progress: 0,
        } as Omit<TaskList, 'id'>;
        const result = await api.createTaskList(newTaskList);
        dispatch({ type: 'ADD_TASK_LIST', payload: result });
        dispatch({ type: 'SET_VIEW', payload: { view: 'dashboard' } });
      }
    } catch (error) {
      console.error('Failed to save task list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8" gradient>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => dispatch({
                type: 'SET_VIEW',
                payload: isEdit && state.currentTaskListId
                  ? { view: 'tasklist', taskListId: state.currentTaskListId }
                  : { view: 'dashboard' }
              })}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isEdit ? 'Edit Task List' : 'Create Task List'}
              </h1>
              <p className="text-white/70">
                {isEdit ? 'Update your task list details' : 'Organize your tasks with a new list'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task list title..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your task list..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => dispatch({
                  type: 'SET_VIEW',
                  payload: isEdit && state.currentTaskListId
                    ? { view: 'tasklist', taskListId: state.currentTaskListId }
                    : { view: 'dashboard' }
                })}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {isEdit ? 'Update List' : 'Create List'}
                  </>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

const CreateEditTask: React.FC<{ isEdit?: boolean }> = ({ isEdit = false }) => {
  const context = useContext(AppContext);
  if (!context) throw new Error('CreateEditTask must be used within AppProvider');

  const { state, dispatch } = context;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [isLoading, setIsLoading] = useState(false);

  const currentTask = isEdit && state.currentTaskListId && state.currentTaskId
    ? state.tasks[state.currentTaskListId]?.find(task => task.id === state.currentTaskId)
    : null;

  useEffect(() => {
    if (isEdit && currentTask) {
      setTitle(currentTask.title);
      setDescription(currentTask.description || '');
      setDueDate(currentTask.dueDate ? currentTask.dueDate.split('T')[0] : '');
      setPriority(currentTask.priority);
    }
  }, [isEdit, currentTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !state.currentTaskListId) return;

    setIsLoading(true);
    try {
      if (isEdit && state.currentTaskId) {
        const updatedTask: Task = {
          ...currentTask!,
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
        };
        const result = await api.updateTask(state.currentTaskListId, state.currentTaskId, updatedTask);
        dispatch({
          type: 'UPDATE_TASK',
          payload: { taskListId: state.currentTaskListId, task: result }
        });
      } else {
        const newTask = {
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
          status: TaskStatus.OPEN,
        } as Omit<Task, 'id'>;
        const result = await api.createTask(state.currentTaskListId, newTask);
        dispatch({
          type: 'ADD_TASK',
          payload: { taskListId: state.currentTaskListId, task: result }
        });
      }

      dispatch({
        type: 'SET_VIEW',
        payload: { view: 'tasklist', taskListId: state.currentTaskListId }
      });
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8" gradient>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => dispatch({
                type: 'SET_VIEW',
                payload: { view: 'tasklist', taskListId: state.currentTaskListId }
              })}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isEdit ? 'Edit Task' : 'Create Task'}
              </h1>
              <p className="text-white/70">
                {isEdit ? 'Update your task details' : 'Add a new task to your list'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add task details..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-3">
                Priority
              </label>
              <div className="flex gap-3">
                {Object.values(TaskPriority).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`
                      flex-1 px-4 py-3 rounded-xl border transition-all duration-300 font-medium
                      ${priority === p
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg shadow-purple-500/40'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15 hover:text-white'
                      }
                    `}
                  >
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => dispatch({
                  type: 'SET_VIEW',
                  payload: { view: 'tasklist', taskListId: state.currentTaskListId }
                })}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {isEdit ? 'Update Task' : 'Create Task'}
                  </>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

// Main App Component
const TaskManagementApp: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasklist':
        return <TaskListView />;
      case 'createList':
        return <CreateEditTaskList />;
      case 'editList':
        return <CreateEditTaskList isEdit />;
      case 'createTask':
        return <CreateEditTask />;
      case 'editTask':
        return <CreateEditTask isEdit />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {renderCurrentView()}
    </AppContext.Provider>
  );
};

export default TaskManagementApp;
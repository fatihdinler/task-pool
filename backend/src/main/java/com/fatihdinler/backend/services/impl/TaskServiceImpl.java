package com.fatihdinler.backend.services.impl;

import com.fatihdinler.backend.entities.Task;
import com.fatihdinler.backend.entities.TaskList;
import com.fatihdinler.backend.enums.TaskPriorityEnum;
import com.fatihdinler.backend.enums.TaskStatusEnum;
import com.fatihdinler.backend.repositories.TaskListRepository;
import com.fatihdinler.backend.repositories.TaskRepository;
import com.fatihdinler.backend.services.TaskService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class TaskServiceImpl implements TaskService {
  private final TaskRepository taskRepository;
  private final TaskListRepository taskListRepository;

  public TaskServiceImpl(TaskRepository taskRepository, TaskListRepository taskListRepository) {
    this.taskRepository = taskRepository;
    this.taskListRepository = taskListRepository;

  }

  @Override
  public List<Task> getTasks(UUID taskListId) {
    System.out.println("Service Layer: getTasks");
    System.out.println("Repository Layer: getTasks (not a concurrent method, called in service layer.)");
    return taskRepository.findByTaskListId(taskListId);
  }

  @Override
  public Task createTask(UUID taskListId, Task task) {
    if (task.getId() != null) {
      throw new IllegalArgumentException("Task id is already set");
    }
    if (task.getTitle() == null || task.getTitle().isEmpty()) {
      throw new IllegalArgumentException("Task title is empty");
    }

    TaskPriorityEnum priorityEnum = Optional.ofNullable(task.getPriority()).orElse(TaskPriorityEnum.MEDIUM);
    TaskStatusEnum taskStatusEnum = TaskStatusEnum.OPEN;

    TaskList taskList = taskListRepository
      .findById(taskListId)
      .orElseThrow(() -> new IllegalArgumentException("Task list not found"));

    LocalDateTime now = LocalDateTime.now();
    Task taskToSave = new Task(
      null,
      task.getTitle(),
      task.getDescription(),
      task.getDueDate(),
      taskStatusEnum,
      priorityEnum,
      taskList,
      now,
      now
    );

    return taskRepository.save(taskToSave);
  }

  @Override
  public Optional<Task> getTask(UUID taskListId, UUID taskId) {
    return taskRepository.findByTaskListIdAndId(taskListId, taskId);
  }

  @Override
  public Task updateTask(UUID taskListId, UUID taskId, Task task) {
    if (task.getId() == null) {
      throw new IllegalArgumentException("Task id is empty");
    }
    if (!Objects.equals(taskId, task.getId())) {
      throw new IllegalArgumentException("Task id does not match");
    }
    if (task.getPriority() == null) {
      throw new IllegalArgumentException("Task priority is empty");
    }
    if (task.getStatus() == null) {
      throw new IllegalArgumentException("Task status is empty");
    }

    Task existingTask = taskRepository.findByTaskListIdAndId(taskListId, taskId)
      .orElseThrow(() -> new IllegalArgumentException("Task not found"));

    existingTask.setTitle(task.getTitle());
    existingTask.setDescription(task.getDescription());
    existingTask.setDueDate(task.getDueDate());
    existingTask.setStatus(task.getStatus());
    existingTask.setPriority(task.getPriority());
    existingTask.setUpdated(LocalDateTime.now());

    return taskRepository.save(existingTask);
  }

  @Transactional
  @Override
  public void deleteTask(UUID taskListId, UUID taskId) {
    taskRepository.deleteByTaskListIdAndId(taskListId, taskId);
  }
}
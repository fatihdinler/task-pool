package com.fatihdinler.backend.services.impl;

import com.fatihdinler.backend.entities.TaskList;
import com.fatihdinler.backend.repositories.TaskListRepository;
import com.fatihdinler.backend.services.TaskListService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class TaskListServiceImpl implements TaskListService {
  private final TaskListRepository taskListRepository;

  public TaskListServiceImpl(TaskListRepository taskListRepository) {
    this.taskListRepository = taskListRepository;
  }

  @Override
  public List<TaskList> getTaskList() {
    System.out.println("Service Layer: getTaskList");
    System.out.println("Repository Layer: getTaskList (not a concurrent method, called in service layer.)");
    return taskListRepository.findAll();
  }

  @Override
  public TaskList createTaskList(TaskList taskList) {
    System.out.println("Service Layer: createTaskList");
    System.out.println("Repository Layer: createTaskList (not a concurrent method, called in service layer.)");
    if (taskList.getId() != null) {
      throw new IllegalArgumentException("TaskList id already exists");
    }
    if (taskList.getTitle() == null || taskList.getTitle().isEmpty()) {
      throw new IllegalArgumentException("TaskList title is empty");
    }

    LocalDateTime now = LocalDateTime.now();
    taskList.setCreated(now);
    taskList.setUpdated(now);
    return taskListRepository.save(taskList);
  }

  @Override
  public Optional<TaskList> getTaskListById(UUID id) {
    return taskListRepository.findById(id);
  }

  @Override
  public TaskList updateTaskList(UUID taskListId, TaskList taskList) {
    if (taskList.getId() == null) {
      throw new IllegalArgumentException("Task list must have an id");
    }

    if (!Objects.equals(taskList.getId(), taskListId)) {
      throw new IllegalArgumentException("Attempting updateTaskList with different id");
    }

    TaskList existingTaskList = taskListRepository
      .findById(taskListId)
      .orElseThrow(() -> new IllegalArgumentException("Task list does not exist"));

    existingTaskList.setTitle(taskList.getTitle());
    existingTaskList.setDescription(taskList.getDescription());
    existingTaskList.setUpdated(LocalDateTime.now());
    return taskListRepository.save(existingTaskList);
  }

  @Override
  public void deleteTaskList(UUID id) {
    taskListRepository.deleteById(id);
  }
}

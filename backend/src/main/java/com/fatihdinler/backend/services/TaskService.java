package com.fatihdinler.backend.services;

import com.fatihdinler.backend.entities.Task;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskService {
  List<Task> getTasks(UUID taskListId);

  Task createTask(UUID taskListId, Task task);

  Optional<Task> getTask(UUID taskListId, UUID taskId);

  Task updateTask(UUID taskListId, UUID taskId, Task task);

  @Transactional
  void deleteTask(UUID taskListId, UUID taskId);
}

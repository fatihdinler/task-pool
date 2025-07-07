package com.fatihdinler.backend.services;

import com.fatihdinler.backend.entities.TaskList;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskListService {
  List<TaskList> getTaskList();

  TaskList createTaskList(TaskList taskList);

  Optional<TaskList> getTaskListById(UUID id);

  TaskList updateTaskList(UUID taskListId, TaskList taskList);

  void deleteTaskList(UUID id);
}

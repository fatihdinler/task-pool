package com.fatihdinler.backend.services;

import com.fatihdinler.backend.entities.TaskList;

import java.util.List;

public interface TaskListService {
  List<TaskList> getTaskList();

  TaskList createTaskList(TaskList taskList);
}

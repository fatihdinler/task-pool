package com.fatihdinler.backend.mappers;

import com.fatihdinler.backend.dto.TaskDto;
import com.fatihdinler.backend.entities.Task;

public interface TaskMapper {
  Task fromDto(TaskDto taskDto); // It will take a task dto and returns a task.

  TaskDto toDto(Task task); // It will take a task and returns a task dto.
}

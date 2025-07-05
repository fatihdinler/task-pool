package com.fatihdinler.backend.mappers;

import com.fatihdinler.backend.dto.TaskListDto;
import com.fatihdinler.backend.entities.TaskList;

public interface TaskListMapper {
  TaskList fromDto(TaskListDto taskListDto);
  TaskListDto toDto(TaskList taskList);
}

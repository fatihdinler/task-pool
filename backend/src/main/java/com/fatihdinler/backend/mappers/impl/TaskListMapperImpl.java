package com.fatihdinler.backend.mappers.impl;

import com.fatihdinler.backend.dto.TaskListDto;
import com.fatihdinler.backend.entities.Task;
import com.fatihdinler.backend.entities.TaskList;
import com.fatihdinler.backend.enums.TaskStatusEnum;
import com.fatihdinler.backend.mappers.TaskListMapper;
import com.fatihdinler.backend.mappers.TaskMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class TaskListMapperImpl implements TaskListMapper {
  private final TaskMapper taskMapper;

  public TaskListMapperImpl(TaskMapper taskMapper) {
    this.taskMapper = taskMapper;
  }

  @Override
  public TaskList fromDto(TaskListDto taskListDto) {
    System.out.println("DTO Layer: fromDto");
    return new TaskList(
      taskListDto.id(),
      taskListDto.title(),
      taskListDto.description(),
      Optional.ofNullable(taskListDto.tasks())
        .map(tasks ->
          tasks
            .stream()
            .map(taskMapper::fromDto)
            .toList())
        .orElse(null),
      null,
      null
    );
  }

  @Override
  public TaskListDto toDto(TaskList taskList) {
    System.out.println("DTO Layer: toDto");
    return new TaskListDto(
      taskList.getId(),
      taskList.getTitle(),
      taskList.getDescription(),

      // Count
      Optional.ofNullable(taskList.getTasks())
        .map(List::size)
        .orElse(0),

      //Progress
      calculateTaskListProgress(taskList.getTasks()),
      Optional.ofNullable(taskList.getTasks())
        .map(tasks ->
          tasks
            .stream()
            .map(taskMapper::toDto)
            .toList())
        .orElse(null)
    );
  }

  private Double calculateTaskListProgress(List<Task> tasks) {
    if (tasks == null || tasks.isEmpty()) {
      return 0.0;
    }

    long closedTaskCounts = tasks
      .stream()
      .filter(task -> TaskStatusEnum.CLOSED == task.getStatus())
      .count();

    return (double) closedTaskCounts / tasks.size();
  }
}

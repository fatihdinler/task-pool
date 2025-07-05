package com.fatihdinler.backend.controllers;

import com.fatihdinler.backend.dto.TaskListDto;
import com.fatihdinler.backend.entities.TaskList;
import com.fatihdinler.backend.mappers.TaskListMapper;
import com.fatihdinler.backend.services.TaskListService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-lists")
public class TaskListController {
  private final TaskListService taskListService;
  private final TaskListMapper taskListMapper;

  public TaskListController(TaskListService taskListService, TaskListMapper taskListMapper) {
    this.taskListService = taskListService;
    this.taskListMapper = taskListMapper;
  }

  @GetMapping
  public List<TaskListDto> getTaskLists() {
    System.out.println("Controller Layer: getTaskLists");
    return taskListService
      .getTaskList()
      .stream()
      .map(taskListMapper::toDto)
      .toList();
  }

  @PostMapping
  public TaskListDto createTaskList(@RequestBody TaskListDto taskListDto) {
    TaskList createdTaskList = taskListService.createTaskList(taskListMapper.fromDto(taskListDto));
    return taskListMapper.toDto(createdTaskList);
  }
}

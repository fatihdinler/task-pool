package com.fatihdinler.backend.controllers;

import com.fatihdinler.backend.dto.TaskListDto;
import com.fatihdinler.backend.entities.TaskList;
import com.fatihdinler.backend.mappers.TaskListMapper;
import com.fatihdinler.backend.services.TaskListService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

  @GetMapping("/{task_list_id}")
  public Optional<TaskListDto> getTaskListById(@PathVariable("task_list_id") UUID taskListId) {
    return taskListService.getTaskListById(taskListId).map(taskListMapper::toDto);
  }

  @PutMapping(path = "/{task_list_id}")
  public TaskListDto updateTaskList(@PathVariable("task_list_id") UUID taskListId, @RequestBody TaskListDto taskListDto) {
    TaskList updatedTaskList = taskListService.updateTaskList(taskListId, taskListMapper.fromDto(taskListDto));
    return taskListMapper.toDto(updatedTaskList);
  }

  @DeleteMapping(path = "/{task_list_id}")
  public void deleteTaskList(@PathVariable("task_list_id") UUID taskListId) {
    taskListService.deleteTaskList(taskListId);
  }
}

package com.fatihdinler.backend.dto;

import com.fatihdinler.backend.enums.TaskPriorityEnum;
import com.fatihdinler.backend.enums.TaskStatusEnum;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskDto(
  UUID id,
  String title,
  String description,
  LocalDateTime dueDate,
  TaskPriorityEnum priority,
  TaskStatusEnum status
) {
}

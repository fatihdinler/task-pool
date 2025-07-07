package com.fatihdinler.backend.exceptions;

public record ErrorResponse(
  int status,
  String message,
  String details
) {

}

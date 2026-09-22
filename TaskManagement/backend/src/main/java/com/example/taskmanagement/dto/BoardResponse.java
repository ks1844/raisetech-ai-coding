package com.example.taskmanagement.dto;

import com.example.taskmanagement.entity.Board;

import java.time.LocalDateTime;

public record BoardResponse(
		Long id,
		String title,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
) {
	public static BoardResponse from(Board board) {
		return new BoardResponse(
				board.getId(),
				board.getTitle(),
				board.getCreatedAt(),
				board.getUpdatedAt()
		);
	}
}

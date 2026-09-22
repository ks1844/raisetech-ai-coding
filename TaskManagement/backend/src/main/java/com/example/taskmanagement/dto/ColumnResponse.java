package com.example.taskmanagement.dto;

import com.example.taskmanagement.entity.BoardColumn;

public record ColumnResponse(
		Long id,
		Long boardId,
		String title,
		Integer position
) {
	public static ColumnResponse from(BoardColumn column) {
		return new ColumnResponse(
				column.getId(),
				column.getBoardId(),
				column.getTitle(),
				column.getPosition()
		);
	}
}

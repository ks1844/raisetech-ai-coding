package com.example.taskmanagement.controller;

import com.example.taskmanagement.dto.BoardDetailResponse;
import com.example.taskmanagement.dto.BoardResponse;
import com.example.taskmanagement.dto.ColumnResponse;
import com.example.taskmanagement.service.BoardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class BoardController {

	private final BoardService boardService;

	public BoardController(BoardService boardService) {
		this.boardService = boardService;
	}

	@GetMapping("/api/boards")
	public List<BoardResponse> getBoards() {
		return boardService.findAll();
	}

	@GetMapping("/api/boards/{id}")
	public BoardDetailResponse getBoard(@PathVariable Long id) {
		return boardService.findDetail(id);
	}

	@GetMapping("/api/boards/{id}/columns")
	public List<ColumnResponse> getColumns(@PathVariable Long id) {
		return boardService.findColumns(id);
	}
}

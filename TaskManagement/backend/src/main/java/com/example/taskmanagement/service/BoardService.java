package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.BoardDetailResponse;
import com.example.taskmanagement.dto.BoardResponse;
import com.example.taskmanagement.dto.CardResponse;
import com.example.taskmanagement.dto.ColumnResponse;
import com.example.taskmanagement.entity.Board;
import com.example.taskmanagement.entity.BoardColumn;
import com.example.taskmanagement.entity.Card;
import com.example.taskmanagement.repository.BoardColumnRepository;
import com.example.taskmanagement.repository.BoardRepository;
import com.example.taskmanagement.repository.CardRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BoardService {

	private final BoardRepository boardRepository;
	private final BoardColumnRepository boardColumnRepository;
	private final CardRepository cardRepository;

	public BoardService(BoardRepository boardRepository,
						BoardColumnRepository boardColumnRepository,
						CardRepository cardRepository) {
		this.boardRepository = boardRepository;
		this.boardColumnRepository = boardColumnRepository;
		this.cardRepository = cardRepository;
	}

	public List<BoardResponse> findAll() {
		return boardRepository.findAll(Sort.by("id")).stream()
				.map(BoardResponse::from)
				.toList();
	}

	public BoardDetailResponse findDetail(Long boardId) {
		Board board = getBoard(boardId);
		List<BoardColumn> columns = boardColumnRepository.findByBoardIdOrderByPositionAsc(boardId);

		// カラムごとに1回ずつ問い合わせないよう、配下のカードはまとめて取得する
		List<Long> columnIds = columns.stream().map(BoardColumn::getId).toList();
		Map<Long, List<CardResponse>> cardsByColumnId = cardRepository.findByColumnIdInOrderByPositionAsc(columnIds).stream()
				.collect(Collectors.groupingBy(Card::getColumnId,
						Collectors.mapping(CardResponse::from, Collectors.toList())));

		List<BoardDetailResponse.ColumnWithCards> columnResponses = columns.stream()
				.map(column -> new BoardDetailResponse.ColumnWithCards(
						column.getId(),
						column.getTitle(),
						column.getPosition(),
						cardsByColumnId.getOrDefault(column.getId(), List.of())))
				.toList();

		return new BoardDetailResponse(board.getId(), board.getTitle(), columnResponses);
	}

	public List<ColumnResponse> findColumns(Long boardId) {
		getBoard(boardId);
		return boardColumnRepository.findByBoardIdOrderByPositionAsc(boardId).stream()
				.map(ColumnResponse::from)
				.toList();
	}

	private Board getBoard(Long boardId) {
		return boardRepository.findById(boardId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ボードが見つかりません: id=" + boardId));
	}
}

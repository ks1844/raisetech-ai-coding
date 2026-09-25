package com.example.taskmanagement.controller;

import com.example.taskmanagement.dto.CardCreateRequest;
import com.example.taskmanagement.dto.CardResponse;
import com.example.taskmanagement.dto.CardSearchCondition;
import com.example.taskmanagement.dto.CardUpdateRequest;
import com.example.taskmanagement.service.CardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class CardController {

	private final CardService cardService;

	public CardController(CardService cardService) {
		this.cardService = cardService;
	}

	@GetMapping("/api/cards")
	public List<CardResponse> getCards(
			@RequestParam(required = false) Long columnId,
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) String priority,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
			@RequestParam(required = false) String sort) {
		return cardService.search(new CardSearchCondition(columnId, keyword, priority, dueFrom, dueTo, sort));
	}

	@GetMapping("/api/cards/{id}")
	public CardResponse getCard(@PathVariable Long id) {
		return cardService.findById(id);
	}

	@PostMapping("/api/cards")
	@ResponseStatus(HttpStatus.CREATED)
	public CardResponse createCard(@RequestBody CardCreateRequest request) {
		return cardService.create(request);
	}

	@PutMapping("/api/cards/{id}")
	public CardResponse updateCard(@PathVariable Long id, @RequestBody CardUpdateRequest request) {
		return cardService.update(id, request);
	}

	@DeleteMapping("/api/cards/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteCard(@PathVariable Long id) {
		cardService.delete(id);
	}
}

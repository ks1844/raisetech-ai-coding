package com.example.taskmanagement.controller;

import com.example.taskmanagement.dto.CardResponse;
import com.example.taskmanagement.repository.CardRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CardController {

	private final CardRepository cardRepository;

	public CardController(CardRepository cardRepository) {
		this.cardRepository = cardRepository;
	}

	@GetMapping("/api/cards")
	public List<CardResponse> getCards(@RequestParam(required = false) Long columnId) {
		var cards = columnId != null
				? cardRepository.findByColumnIdOrderByPositionAsc(columnId)
				: cardRepository.findAll();

		return cards.stream().map(CardResponse::from).toList();
	}
}

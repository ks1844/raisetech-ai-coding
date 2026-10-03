package com.example.taskmanagement.service;

import com.example.taskmanagement.entity.Card;
import com.example.taskmanagement.repository.CardRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceDeleteTest {

	@Mock
	private CardRepository cardRepository;

	@InjectMocks
	private CardService cardService;

	@Test
	void deleteCard_Success() throws Exception {
		Long cardId = 1L;
		Card existingCard = new Card(1L, "タイトル", "medium", "説明", LocalDate.of(2026, 12, 31), 1);
		setCardId(existingCard, cardId);

		when(cardRepository.findById(cardId)).thenReturn(Optional.of(existingCard));

		cardService.delete(cardId);

		verify(cardRepository).findById(cardId);
		verify(cardRepository).delete((Card) any());
	}

	@Test
	void deleteCard_NotFound() {
		Long cardId = 999L;

		when(cardRepository.findById(cardId)).thenReturn(Optional.empty());

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> cardService.delete(cardId));

		assertTrue(exception.getMessage().contains("カードが見つかりません"));

		verify(cardRepository).findById(cardId);
		verify(cardRepository, never()).delete((Card) any());
	}

	private void setCardId(Card card, Long id) throws Exception {
		var field = Card.class.getDeclaredField("id");
		field.setAccessible(true);
		field.set(card, id);
	}
}

package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.CardResponse;
import com.example.taskmanagement.dto.CardUpdateRequest;
import com.example.taskmanagement.entity.Card;
import com.example.taskmanagement.repository.CardRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceUpdateTest {

	@Mock
	private CardRepository cardRepository;

	@InjectMocks
	private CardService cardService;

	@Test
	void updateCard_Success_AllFields() throws Exception {
		Long cardId = 1L;
		Card existingCard = new Card(1L, "古いタイトル", "medium", "古い説明", LocalDate.of(2026, 12, 31), 1);
		setCardId(existingCard, cardId);

		CardUpdateRequest request = new CardUpdateRequest("新しいタイトル", "high", "新しい説明", LocalDate.of(2026, 11, 30));

		when(cardRepository.findById(cardId)).thenReturn(Optional.of(existingCard));
		when(cardRepository.save(any(Card.class))).thenReturn(existingCard);

		CardResponse result = cardService.update(cardId, request);

		assertNotNull(result);
		assertEquals("新しいタイトル", existingCard.getTitle());
		assertEquals("high", existingCard.getPriority());
		assertEquals("新しい説明", existingCard.getDescription());
		assertEquals(LocalDate.of(2026, 11, 30), existingCard.getDueDate());

		verify(cardRepository).findById(cardId);
		verify(cardRepository).save(existingCard);
	}

	@Test
	void updateCard_Success_PartialUpdate() throws Exception {
		Long cardId = 1L;
		Card existingCard = new Card(1L, "タイトル", "medium", "説明", LocalDate.of(2026, 12, 31), 1);
		setCardId(existingCard, cardId);

		CardUpdateRequest request = new CardUpdateRequest("更新タイトル", null, null, null);

		when(cardRepository.findById(cardId)).thenReturn(Optional.of(existingCard));
		when(cardRepository.save(any(Card.class))).thenReturn(existingCard);

		CardResponse result = cardService.update(cardId, request);

		assertNotNull(result);
		assertEquals("更新タイトル", existingCard.getTitle());
		assertEquals("medium", existingCard.getPriority());
		assertEquals("説明", existingCard.getDescription());

		verify(cardRepository).findById(cardId);
		verify(cardRepository).save(existingCard);
	}

	@Test
	void updateCard_NotFound() {
		Long cardId = 999L;
		CardUpdateRequest request = new CardUpdateRequest("タイトル", "high", "説明", null);

		when(cardRepository.findById(cardId)).thenReturn(Optional.empty());

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> cardService.update(cardId, request));

		assertTrue(exception.getMessage().contains("カードが見つかりません"));

		verify(cardRepository).findById(cardId);
		verify(cardRepository, never()).save(any());
	}

	@Test
	void updateCard_InvalidPriority() throws Exception {
		Long cardId = 1L;
		Card existingCard = new Card(1L, "タイトル", "medium", "説明", null, 1);
		setCardId(existingCard, cardId);

		CardUpdateRequest request = new CardUpdateRequest("タイトル", "invalid", "説明", null);

		when(cardRepository.findById(cardId)).thenReturn(Optional.of(existingCard));

		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> cardService.update(cardId, request));

		assertTrue(exception.getMessage().contains("priority は high / medium / low"));

		verify(cardRepository).findById(cardId);
		verify(cardRepository, never()).save(any());
	}

	private void setCardId(Card card, Long id) throws Exception {
		var field = Card.class.getDeclaredField("id");
		field.setAccessible(true);
		field.set(card, id);
	}
}

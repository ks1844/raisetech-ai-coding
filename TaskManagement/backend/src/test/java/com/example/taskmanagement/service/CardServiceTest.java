package com.example.taskmanagement.service;

import com.example.taskmanagement.TestcontainersConfiguration;
import com.example.taskmanagement.dto.CardCreateRequest;
import com.example.taskmanagement.dto.CardResponse;
import com.example.taskmanagement.entity.Card;
import com.example.taskmanagement.repository.CardRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class CardServiceTest {

	@Autowired
	private CardService cardService;

	@Autowired
	private CardRepository cardRepository;

	@Test
	void カードを登録できる() {
		CardCreateRequest request = new CardCreateRequest(1L, "新しいタスク", "high", "説明", LocalDate.of(2026, 10, 1));

		CardResponse response = cardService.create(request);

		assertThat(response).isNotNull();
		assertThat(response.columnId()).isEqualTo(1L);
		assertThat(response.title()).isEqualTo("新しいタスク");
		assertThat(response.priority()).isEqualTo("high");
		assertThat(response.description()).isEqualTo("説明");
		assertThat(response.dueDate()).isEqualTo(LocalDate.of(2026, 10, 1));
		assertThat(response.id()).isNotNull();
		assertThat(response.position()).isNotNull();
	}

	@Test
	void priorityのデフォルト値がmediumになる() {
		CardCreateRequest request = new CardCreateRequest(1L, "新しいタスク", null, null, null);

		CardResponse response = cardService.create(request);

		assertThat(response.priority()).isEqualTo("medium");
		assertThat(response.description()).isEmpty();
	}

	@Test
	void descriptionが空でもカードが登録できる() {
		CardCreateRequest request = new CardCreateRequest(1L, "新しいタスク", null, "", null);

		CardResponse response = cardService.create(request);

		assertThat(response.description()).isEmpty();
	}

	@Test
	void 同じカラム内でpositionが正しく自動決定される() {
		// columnId=1 には既にカードが存在する
		CardCreateRequest request1 = new CardCreateRequest(1L, "タスク1", null, null, null);
		CardResponse response1 = cardService.create(request1);
		int position1 = response1.position();

		CardCreateRequest request2 = new CardCreateRequest(1L, "タスク2", null, null, null);
		CardResponse response2 = cardService.create(request2);
		int position2 = response2.position();

		assertThat(position2).isEqualTo(position1 + 1);
	}

	@Test
	void 異なるカラムのpositionは独立している() {
		CardCreateRequest request1 = new CardCreateRequest(1L, "タスク1", null, null, null);
		CardResponse response1 = cardService.create(request1);

		CardCreateRequest request2 = new CardCreateRequest(2L, "タスク2", null, null, null);
		CardResponse response2 = cardService.create(request2);

		// columnId=1 では既存のカードより後ろ、columnId=2 では最初のカードと同じ position
		assertThat(response2.position()).isNotEqualTo(response1.position());
	}

	@Test
	void 不正なpriorityは例外をスロー() {
		CardCreateRequest request = new CardCreateRequest(1L, "新しいタスク", "urgent", null, null);

		assertThatThrownBy(() -> cardService.create(request))
				.isInstanceOf(ResponseStatusException.class)
				.hasMessageContaining("priority は high / medium / low のいずれかを指定してください");
	}

	@Test
	void titleが空は登録リクエスト作成時に例外をスロー() {
		assertThatThrownBy(() -> new CardCreateRequest(1L, "", null, null, null))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("title は必須です");
	}

	@Test
	void columnIdが空は登録リクエスト作成時に例外をスロー() {
		assertThatThrownBy(() -> new CardCreateRequest(null, "新しいタスク", null, null, null))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("columnId は必須です");
	}

	@Test
	void 登録されたカードがDBに保存される() {
		CardCreateRequest request = new CardCreateRequest(1L, "DBテスト用タスク", "low", "説明", LocalDate.of(2026, 11, 1));

		CardResponse response = cardService.create(request);

		Card card = cardRepository.findById(response.id()).orElseThrow();
		assertThat(card.getTitle()).isEqualTo("DBテスト用タスク");
		assertThat(card.getPriority()).isEqualTo("low");
		assertThat(card.getColumnId()).isEqualTo(1L);
		assertThat(card.getCreatedAt()).isNotNull();
		assertThat(card.getUpdatedAt()).isNotNull();
	}
}

package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.CardCreateRequest;
import com.example.taskmanagement.dto.CardResponse;
import com.example.taskmanagement.dto.CardUpdateRequest;
import com.example.taskmanagement.dto.CardSearchCondition;
import com.example.taskmanagement.dto.CardMoveRequest;
import com.example.taskmanagement.entity.Card;
import com.example.taskmanagement.repository.CardRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

import static com.example.taskmanagement.repository.CardSpecifications.*;

@Service
@Transactional(readOnly = true)
public class CardService {

	// 優先度は文字列順では並ばないため、並び替え用に順位を持たせる
	private static final Map<String, Integer> PRIORITY_ORDER = Map.of("high", 0, "medium", 1, "low", 2);

	private static final Comparator<Card> BY_POSITION =
			Comparator.comparing(Card::getColumnId).thenComparing(Card::getPosition);

	private static final Map<String, Comparator<Card>> SORTS = Map.of(
			"position", BY_POSITION,
			"priority", Comparator.<Card, Integer>comparing(card -> PRIORITY_ORDER.get(card.getPriority()))
					.thenComparing(BY_POSITION),
			"dueDate", Comparator.comparing(Card::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
					.thenComparing(BY_POSITION));

	private final CardRepository cardRepository;

	public CardService(CardRepository cardRepository) {
		this.cardRepository = cardRepository;
	}

	public List<CardResponse> search(CardSearchCondition condition) {
		if (condition.priority() != null && !PRIORITY_ORDER.containsKey(condition.priority())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"priority は high / medium / low のいずれかを指定してください");
		}
		String sort = condition.sort() == null ? "position" : condition.sort();
		Comparator<Card> comparator = SORTS.get(sort);
		if (comparator == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"sort は position / priority / dueDate のいずれかを指定してください");
		}

		List<Specification<Card>> specs = Stream.of(
						columnIdEquals(condition.columnId()),
						keywordContains(condition.keyword()),
						priorityEquals(condition.priority()),
						dueDateFrom(condition.dueFrom()),
						dueDateTo(condition.dueTo()))
				.filter(Objects::nonNull)
				.toList();

		return cardRepository.findAll(Specification.allOf(specs)).stream()
				.sorted(comparator)
				.map(CardResponse::from)
				.toList();
	}

	public CardResponse findById(Long id) {
		return cardRepository.findById(id)
				.map(CardResponse::from)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "カードが見つかりません: id=" + id));
	}

	@Transactional(readOnly = false)
	public CardResponse create(CardCreateRequest request) {
		if (request.priority() != null && !PRIORITY_ORDER.containsKey(request.priority())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"priority は high / medium / low のいずれかを指定してください");
		}

		Float position = calculatePositionForCreate(request.columnId(), request.position());

		Card card = new Card(
				request.columnId(),
				request.title(),
				request.resolvePriority(),
				request.resolveDescription(),
				request.dueDate(),
				position
		);

		Card saved = cardRepository.save(card);
		return CardResponse.from(saved);
	}

	private Float calculatePositionForCreate(Long columnId, Integer dropIndex) {
		List<Card> cards = cardRepository.findAll((root, query, cb) -> {
			query.orderBy(cb.asc(root.get("position")));
			return cb.equal(root.get("columnId"), columnId);
		});

		if (dropIndex == null || dropIndex <= 0) {
			// 最後に追加
			if (cards.isEmpty()) {
				return 1000f;
			}
			return cards.get(cards.size() - 1).getPosition() + 1000f;
		}

		if (dropIndex == 1) {
			// 最初に追加
			if (cards.isEmpty()) {
				return 1000f;
			}
			return cards.get(0).getPosition() / 2f;
		}

		if (dropIndex > cards.size()) {
			// 最後に追加
			if (cards.isEmpty()) {
				return 1000f;
			}
			return cards.get(cards.size() - 1).getPosition() + 1000f;
		}

		// 中間に追加
		Card prevCard = cards.get(dropIndex - 2);
		Card nextCard = cards.get(dropIndex - 1);
		return (prevCard.getPosition() + nextCard.getPosition()) / 2f;
	}

	@Transactional(readOnly = false)
	public CardResponse update(Long id, CardUpdateRequest request) {
		Card card = cardRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "カードが見つかりません: id=" + id));

		if (request.priority() != null && !PRIORITY_ORDER.containsKey(request.priority())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"priority は high / medium / low のいずれかを指定してください");
		}

		if (request.title() != null) {
			card.setTitle(request.title());
		}
		if (request.priority() != null) {
			card.setPriority(request.priority());
		}
		if (request.description() != null) {
			card.setDescription(request.description());
		}
		card.setDueDate(request.dueDate());

		Card updated = cardRepository.save(card);
		return CardResponse.from(updated);
	}

	@Transactional(readOnly = false)
	public void delete(Long id) {
		Card card = cardRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "カードが見つかりません: id=" + id));

		cardRepository.delete(card);
	}

	@Transactional(readOnly = false)
	public CardResponse move(Long id, CardMoveRequest request) {
		Card card = cardRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "カードが見つかりません: id=" + id));

		Long oldColumnId = card.getColumnId();

		card.setColumnId(request.columnId());
		Float newPosition = calculateNewPosition(request.columnId(), request.position(), id);
		card.setPosition(newPosition);
		cardRepository.save(card);

		Card updated = cardRepository.findById(id).orElseThrow();
		return CardResponse.from(updated);
	}

	private Float calculateNewPosition(Long columnId, Integer dropIndex, Long cardId) {
		List<Card> cards = cardRepository.findAll((root, query, cb) -> {
			query.orderBy(cb.asc(root.get("position")));
			return cb.equal(root.get("columnId"), columnId);
		});

		cards = cards.stream()
				.filter(c -> !c.getId().equals(cardId))
				.toList();

		if (dropIndex <= 1) {
			// 最初に移動
			if (cards.isEmpty()) {
				return 1000f;
			}
			return cards.get(0).getPosition() / 2f;
		} else if (dropIndex > cards.size()) {
			// 最後に移動
			if (cards.isEmpty()) {
				return 1000f;
			}
			return cards.get(cards.size() - 1).getPosition() + 1000f;
		} else {
			// 中間に移動
			Card prevCard = cards.get(dropIndex - 2);
			Card nextCard = cards.get(dropIndex - 1);
			return (prevCard.getPosition() + nextCard.getPosition()) / 2f;
		}
	}
}

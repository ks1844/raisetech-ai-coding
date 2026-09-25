package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.CardCreateRequest;
import com.example.taskmanagement.dto.CardResponse;
import com.example.taskmanagement.dto.CardUpdateRequest;
import com.example.taskmanagement.dto.CardSearchCondition;
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

		Integer nextPosition = cardRepository.findMaxPositionByColumnId(request.columnId())
				.map(max -> max + 1)
				.orElse(1);

		Card card = new Card(
				request.columnId(),
				request.title(),
				request.resolvePriority(),
				request.resolveDescription(),
				request.dueDate(),
				nextPosition
		);

		Card saved = cardRepository.save(card);
		return CardResponse.from(saved);
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
}

package com.example.taskmanagement.repository;

import com.example.taskmanagement.entity.Card;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/**
 * カード検索条件。引数が null の場合は条件なし（null を返す）として扱う。
 */
public final class CardSpecifications {

	private CardSpecifications() {
	}

	public static Specification<Card> columnIdEquals(Long columnId) {
		return columnId == null ? null
				: (root, query, cb) -> cb.equal(root.get("columnId"), columnId);
	}

	public static Specification<Card> keywordContains(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return null;
		}
		String pattern = "%" + escapeLike(keyword.strip().toLowerCase()) + "%";
		return (root, query, cb) -> cb.or(
				cb.like(cb.lower(root.get("title")), pattern, '\\'),
				cb.like(cb.lower(root.get("description")), pattern, '\\'));
	}

	public static Specification<Card> priorityEquals(String priority) {
		return priority == null ? null
				: (root, query, cb) -> cb.equal(root.get("priority"), priority);
	}

	public static Specification<Card> dueDateFrom(LocalDate from) {
		return from == null ? null
				: (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dueDate"), from);
	}

	public static Specification<Card> dueDateTo(LocalDate to) {
		return to == null ? null
				: (root, query, cb) -> cb.lessThanOrEqualTo(root.get("dueDate"), to);
	}

	private static String escapeLike(String value) {
		return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
	}
}

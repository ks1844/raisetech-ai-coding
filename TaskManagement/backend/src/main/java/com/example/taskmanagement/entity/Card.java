package com.example.taskmanagement.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
public class Card {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "column_id", nullable = false)
	private Long columnId;

	@Column(nullable = false, length = 100)
	private String title;

	@Column(nullable = false, length = 10)
	private String priority;

	@Column
	private String description;

	@Column(name = "due_date")
	private LocalDate dueDate;

	@Column(nullable = false)
	private Integer position;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	public Long getId() {
		return id;
	}

	public Long getColumnId() {
		return columnId;
	}

	public String getTitle() {
		return title;
	}

	public String getPriority() {
		return priority;
	}

	public String getDescription() {
		return description;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public Integer getPosition() {
		return position;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}

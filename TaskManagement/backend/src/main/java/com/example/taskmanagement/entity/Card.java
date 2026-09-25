package com.example.taskmanagement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

	@CreationTimestamp
	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	public Card() {
	}

	public Card(Long columnId, String title, String priority, String description, LocalDate dueDate, Integer position) {
		this.columnId = columnId;
		this.title = title;
		this.priority = priority;
		this.description = description;
		this.dueDate = dueDate;
		this.position = position;
	}

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

	public void setTitle(String title) {
		this.title = title;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}
}

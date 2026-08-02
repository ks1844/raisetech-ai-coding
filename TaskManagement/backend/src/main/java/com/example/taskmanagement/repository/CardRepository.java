package com.example.taskmanagement.repository;

import com.example.taskmanagement.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

	List<Card> findByColumnIdOrderByPositionAsc(Long columnId);
}

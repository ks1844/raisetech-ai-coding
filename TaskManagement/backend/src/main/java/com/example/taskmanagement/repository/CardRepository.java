package com.example.taskmanagement.repository;

import com.example.taskmanagement.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long>, JpaSpecificationExecutor<Card> {

	List<Card> findByColumnIdOrderByPositionAsc(Long columnId);

	List<Card> findByColumnIdInOrderByPositionAsc(Collection<Long> columnIds);
}

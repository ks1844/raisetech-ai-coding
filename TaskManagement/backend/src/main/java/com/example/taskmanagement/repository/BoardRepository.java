package com.example.taskmanagement.repository;

import com.example.taskmanagement.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {
}

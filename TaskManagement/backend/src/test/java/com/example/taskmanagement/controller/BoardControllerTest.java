package com.example.taskmanagement.controller;

import com.example.taskmanagement.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class BoardControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void ボード一覧を取得できる() throws Exception {
		mockMvc.perform(get("/api/boards"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(2)))
				.andExpect(jsonPath("$[*].title", contains("サンプルボード", "個人タスク")));
	}

	@Test
	void ボード詳細でカラムとカードが入れ子で取得できる() throws Exception {
		mockMvc.perform(get("/api/boards/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("サンプルボード"))
				.andExpect(jsonPath("$.columns[*].title", contains("To Do", "In Progress", "Done")))
				.andExpect(jsonPath("$.columns[0].cards[*].title",
						contains("要件定義をまとめる", "DB設計を見直す", "API設計書を作成する")));
	}

	@Test
	void カラム一覧をposition順で取得できる() throws Exception {
		mockMvc.perform(get("/api/boards/2/columns"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].title", contains("未着手", "作業中", "完了")))
				.andExpect(jsonPath("$[*].position", contains(0, 1, 2)));
	}

	@Test
	void 存在しないボードは404になる() throws Exception {
		mockMvc.perform(get("/api/boards/9999")).andExpect(status().isNotFound());
		mockMvc.perform(get("/api/boards/9999/columns")).andExpect(status().isNotFound());
	}
}

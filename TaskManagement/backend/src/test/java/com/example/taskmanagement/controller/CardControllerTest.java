package com.example.taskmanagement.controller;

import com.example.taskmanagement.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class CardControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void 条件なしで全カードを取得できる() throws Exception {
		mockMvc.perform(get("/api/cards"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(14)));
	}

	@Test
	void カラムIDで絞り込むとposition順で返る() throws Exception {
		mockMvc.perform(get("/api/cards").param("columnId", "1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].title", contains("要件定義をまとめる", "DB設計を見直す", "API設計書を作成する")));
	}

	@Test
	void キーワードでタイトルと説明を部分一致検索できる() throws Exception {
		mockMvc.perform(get("/api/cards").param("keyword", "api"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].title",
						containsInAnyOrder("API設計書を作成する", "API実装（READ）", "カード検索APIの実装")));

		// 説明のみに含まれる語でもヒットする
		mockMvc.perform(get("/api/cards").param("keyword", "領収書"))
				.andExpect(jsonPath("$[*].title", contains("確定申告の準備")));
	}

	@Test
	void キーワード中の記号はワイルドカードとして扱わない() throws Exception {
		mockMvc.perform(get("/api/cards").param("keyword", "%"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void 優先度で絞り込み期限日順に並べられる() throws Exception {
		mockMvc.perform(get("/api/cards").param("priority", "high").param("sort", "dueDate"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].priority", everyItem(is("high"))))
				.andExpect(jsonPath("$[*].dueDate",
						contains("2026-08-05", "2026-08-10", "2026-08-25", "2026-09-30", "2026-10-01")));
	}

	@Test
	void 期限日の範囲で絞り込める() throws Exception {
		mockMvc.perform(get("/api/cards").param("dueFrom", "2026-08-01").param("dueTo", "2026-08-31"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(6)));
	}

	@Test
	void 優先度順は高中低の順に並ぶ() throws Exception {
		mockMvc.perform(get("/api/cards").param("columnId", "1").param("sort", "priority"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].priority", contains("high", "medium", "medium")));
	}

	@Test
	void 期限日順では期限日なしが最後になる() throws Exception {
		mockMvc.perform(get("/api/cards").param("sort", "dueDate"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].dueDate").value("2026-07-20"))
				.andExpect(jsonPath("$[12].dueDate").doesNotExist())
				.andExpect(jsonPath("$[13].dueDate").doesNotExist());
	}

	@Test
	void 不正な検索条件は400になる() throws Exception {
		mockMvc.perform(get("/api/cards").param("priority", "urgent")).andExpect(status().isBadRequest());
		mockMvc.perform(get("/api/cards").param("sort", "foo")).andExpect(status().isBadRequest());
		mockMvc.perform(get("/api/cards").param("dueFrom", "abc")).andExpect(status().isBadRequest());
	}

	@Test
	void カード詳細を取得できる() throws Exception {
		mockMvc.perform(get("/api/cards/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("要件定義をまとめる"))
				.andExpect(jsonPath("$.priority").value("high"))
				.andExpect(jsonPath("$.dueDate").value("2026-08-10"));
	}

	@Test
	void 存在しないカードは404になる() throws Exception {
		mockMvc.perform(get("/api/cards/9999")).andExpect(status().isNotFound());
	}
}

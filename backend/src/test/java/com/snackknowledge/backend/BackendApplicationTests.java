package com.snackknowledge.backend;

import com.snackknowledge.backend.controller.AdminOverviewController;
import com.snackknowledge.backend.controller.CommunityController;
import com.snackknowledge.backend.service.AiUsageMetrics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	JdbcClient jdbc;

	@Autowired
	UserDetailsService users;

	@Autowired
	AdminOverviewController adminOverview;

	@Autowired
	CommunityController community;

	@Autowired
	AiUsageMetrics usage;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional
	void onlyAccountsGrantedAdminMembershipReceiveAdminRole() {
		String username = "test_" + UUID.randomUUID().toString().substring(0, 8);
		jdbc.sql("INSERT INTO member_account (username, password_hash) VALUES (?, ?)")
				.params(username, "unused-in-role-test").update();
		assertEquals(Set.of("ROLE_MEMBER"),
				AuthorityUtils.authorityListToSet(users.loadUserByUsername(username).getAuthorities()));

		jdbc.sql("INSERT INTO member_admin (username) VALUES (?)").param(username).update();
		assertEquals(Set.of("ROLE_ADMIN"),
				AuthorityUtils.authorityListToSet(users.loadUserByUsername(username).getAuthorities()));
	}

	@Test
	@Transactional
	void adminOverviewReportsMembersRecentApplicantsAndStoredAiUsage() {
		var before = adminOverview.overview();
		String username = "test_" + UUID.randomUUID().toString().substring(0, 8);
		UUID cardId = UUID.randomUUID();
		jdbc.sql("INSERT INTO member_account (username, password_hash) VALUES (?, ?)")
				.params(username, "unused-in-overview-test").update();
		jdbc.sql("""
				INSERT INTO member_generated_card (username, card_id, category, title, summary, content)
				VALUES (?, ?, '과학', '테스트 카드', '요약', '본문')
				""").params(username, cardId.toString()).update();
		community.submit(cardId, () -> username);
		usage.recordTokens(80, 20, 100);
		usage.recordTokens(30, 10, 40);
		usage.recordAnsweredQuestion();

		var after = adminOverview.overview();
		assertEquals(before.members() + 1, after.members());
		assertEquals(before.generatedCards() + 1, after.generatedCards());
		assertEquals(before.pendingCount() + 1, after.pendingCount());
		assertEquals(before.usage().answeredQuestions() + 1, after.usage().answeredQuestions());
		assertEquals(before.usage().inputTokens() + 110, after.usage().inputTokens());
		assertEquals(before.usage().outputTokens() + 30, after.usage().outputTokens());
		assertEquals(before.usage().totalTokens() + 140, after.usage().totalTokens());
		assertEquals(before.usage().trackingStartedAt(), after.usage().trackingStartedAt());

		var review = after.pendingReviews().getFirst();
		assertEquals("테스트 카드", review.title());
		assertEquals("과학", review.category());
		assertEquals(username, review.applicant());
		assertEquals(username, community.pendingReviews().getFirst().applicant());
		assertEquals(username, community.readReview(review.id()).applicant());
		assertEquals(review.submittedAt(), community.readReview(review.id()).submittedAt());

		jdbc.sql("INSERT INTO member_admin (username) VALUES (?)").param(username).update();
		assertEquals(before.members(), adminOverview.overview().members());
	}

}

# 한입지식 · SnackKnowledge

일상에서 생긴 궁금증을 짧은 지식 카드로 읽고, AI 질문·퀴즈·설명으로 이해를 확인하는 웹 앱입니다.

## 주요 기능

- **지식 탐색**: 오늘의 한입, 카테고리별 목록, 무작위 카드, 관심 분야 추천
- **AI 학습**: 주제로 카드와 삽화 만들기, 카드별 질문 최대 5회, 퀴즈 생성과 서버 채점, 내 설명에 대한 피드백
- **마이페이지**: 북마크, 생성 카드 보관, 학습 기록, 오답 노트, 관심 분야 설정
- **커뮤니티**: 저장한 카드의 공개 요청과 철회, 승인된 카드 열람. 관리자 검토 화면은 별도 PR로 관리합니다.

## 기술 구성

| 영역 | 사용 기술 |
| --- | --- |
| 프런트엔드 | React, Vite, Axios |
| 백엔드 | Java 21, Spring Boot, Spring Security, Gradle |
| 데이터베이스 | MySQL 8 |
| AI | OpenAI Responses API와 Images API |

## 로컬 실행

Java 21, Node.js 22.12 이상, MySQL 8이 필요합니다.

### 1. MySQL 준비

로컬 MySQL을 실행하고 다음 SQL로 데이터베이스와 기본 지식 테이블을 준비합니다. 나머지 앱 테이블은 백엔드 시작 시 `backend/src/main/resources/schema.sql`로 초기화됩니다.

```sql
CREATE DATABASE IF NOT EXISTS snackknowledge CHARACTER SET utf8mb4;
USE snackknowledge;

CREATE TABLE IF NOT EXISTS knowledge (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  content TEXT NOT NULL
) CHARACTER SET utf8mb4;
```

DB 카드 목록을 채우려면 `knowledge`에 데이터를 넣습니다. DB 카드가 비어 있어도 [샘플 카드](http://localhost:5173/#/sample/sky)는 로컬 앱에서 체험할 수 있습니다.

### 2. 백엔드 실행

`backend/.env.example`을 복사해 `backend/.env`에 `DB_USERNAME`, `DB_PASSWORD`, `OPENAI_API_KEY`를 입력합니다. IntelliJ에서 실행할 때는 작업 디렉터리를 `backend`로 지정합니다. AI 기능을 사용하려면 OpenAI API 키가 필요합니다.

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
.\gradlew.bat bootRun
```

macOS 또는 Linux에서는 `cp .env.example .env`와 `./gradlew bootRun`을 사용합니다. 백엔드는 기본적으로 `8080` 포트에서 실행됩니다.

### 3. 프런트엔드 실행

저장소 루트에서 새 터미널을 열고 실행합니다.

```sh
cd frontend
npm ci
npm run dev
```

[로컬 앱](http://localhost:5173/)에서 확인합니다. 개발 서버는 `/api/` 요청을 로컬 백엔드로 전달합니다.

## AI 요청 검토

서버는 주제·질문·카드 본문·이전 대화를 AI 지시와 분리해 전달합니다. 카드 생성 전 주제를 검토하고, 카드 본문·답변·퀴즈·설명 피드백은 구조화된 별도 검토에서 승인된 경우에만 반환합니다. 검토가 끝나지 않았거나 답변이 불확실하면 재입력 또는 재시도를 안내합니다. 검토에는 외부 출처 조회가 포함되지 않으므로 AI 답변의 정확성을 보장할 수 없습니다.

## 코드 위치와 검사

- `frontend/src/api/http.js`: Axios 요청과 공통 HTTP 상태 판정
- `frontend/src/api/knowledge.js`, `frontend/src/api/study.js`: 카드 조회·생성과 학습 요청
- `backend/src/main/java/com/snackknowledge/backend/service/KnowledgeAiPolicy.java`: AI 요청과 검토 기준

프런트엔드는 `frontend`에서 `npm run lint`, `npm test`, `npm run build`로 확인합니다. 백엔드는 `backend`에서 `./gradlew test` 또는 Windows에서 `.\gradlew.bat test`를 실행합니다. 전체 백엔드 테스트에는 로컬 MySQL 설정이 필요합니다.

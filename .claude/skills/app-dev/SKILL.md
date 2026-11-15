---
name: app-dev
description: "이 앱(Next.js 16 + Supabase 방명록 사이트)에 기능을 추가·수정할 때 nextjs-builder, supabase-specialist, qa-checker 에이전트를 순서대로 조율하는 오케스트레이터. '기능 추가해줘', '페이지 만들어줘', '방명록에 ○○ 넣어줘', '화면 바꿔줘', '버그 고쳐줘', '다시 실행', '수정', '보완', '이전 결과를 바탕으로 개선', '검사만 다시' 같은 요청에 사용한다. 간단한 질문이나 한 줄짜리 문구 수정은 직접 처리해도 된다."
---

# app-dev 오케스트레이터

**실행 모드:** 서브에이전트 위임(생성·검증 패턴). 프로젝트가 작고 단계마다 결과만 받으면 되므로, 단계별로 `Agent` 도구를 한 번씩 호출한다. 에이전트끼리 대화할 필요가 없어 지속형 에이전트나 Workflow는 쓰지 않는다.

## 0단계: 작업 맥락 확인

- `_workspace/`가 없다 → 처음부터 실행한다.
- `_workspace/`가 있고 일부만 고쳐 달라는 요청이다 → 해당 단계만 다시 실행한다(예: "검사만 다시" → 3단계만).
- `_workspace/`가 있고 새 기능 요청이다 → 기존 폴더를 `_workspace_{YYYYMMDD-HHMM}/`으로 옮기고 처음부터 실행한다.

## 1단계: 요청 분석(메인이 직접)

요청을 한두 문장으로 정리하고 다음을 판단한다.
- 새 테이블·컬럼, 데이터 접근 규칙 변경이 필요한가? → 필요하면 2단계 실행, 아니면 건너뛴다.
- 요청이 모호하면 구현 전에 사용자에게 한 가지만 묻는다.

## 2단계: 데이터베이스 설계(필요할 때만)

`Agent(subagent_type: "supabase-specialist")`
- 프롬프트: 정리한 요청 + "결과를 `_workspace/01_supabase-specialist_schema.md`와 `supabase/migrations/`에 저장하라"
- 사용자가 Supabase 대시보드에서 SQL을 실행해야 하면, 4단계 보고에 그 안내를 반드시 포함한다.

## 3단계: 구현 → 검증 반복

1. `Agent(subagent_type: "nextjs-builder")` — 요청 + (있으면) schema 파일 경로 전달. 결과는 `_workspace/02_nextjs-builder_changes.md`.
2. `Agent(subagent_type: "qa-checker")` — changes 파일 경로 전달. 결과는 `_workspace/03_qa-checker_report.md`.
3. 보고서 첫 줄이 `RESULT: FAIL`이면 nextjs-builder를 다시 호출해 보고서의 문제만 고치게 하고 2번을 반복한다. **최대 2회.** 그래도 실패하면 멈추고 남은 문제를 보고한다(끝없이 반복하면 사용량만 늘어난다).
4. 실패 원인이 「환경 문제」(`.env.local` 없음 등)뿐이면 반복하지 않고 사용자에게 알린다.

## 4단계: 사용자에게 보고(메인이 직접)

사용자는 코딩 초보자다. 용어를 풀어서 쉽게 쓴다.
- 무엇이 바뀌었는지(화면에서 어떻게 보이는지)
- 사용자가 직접 해야 할 일(예: Supabase SQL 실행, GitHub Secrets 추가)을 번호 순서로
- 검사 결과(통과/남은 문제)
- 커밋은 사용자가 요청할 때만 한다.

## 데이터 전달

| 파일 | 작성 | 읽음 |
| --- | --- | --- |
| `_workspace/01_supabase-specialist_schema.md` | supabase-specialist | nextjs-builder, qa-checker |
| `_workspace/02_nextjs-builder_changes.md` | nextjs-builder | qa-checker |
| `_workspace/03_qa-checker_report.md` | qa-checker | nextjs-builder(재호출 시), 메인 |

`_workspace/`는 중간 산출물이므로 `.gitignore`에 추가한다.

## 오류 처리

- 에이전트가 실패하면 한 번 다시 호출한다. 또 실패하면 그 단계 없이 진행하고 보고에 누락 사실을 적는다.
- 사용량 한도, 권한 거부처럼 다시 해도 같은 실패는 재시도하지 않는다. 어디까지 진행됐는지 `_workspace/`를 직접 확인해 보고한다.
- 에이전트가 남기지 않은 판단(예: 왜 그렇게 설계했는지)을 메인이 추측해 채우지 않는다.

## 테스트 시나리오

**정상 흐름:** "방명록에 작성 시각을 표시해줘"
→ 1단계: `created_at` 컬럼 필요 판단 → 2단계: 컬럼 추가 마이그레이션 + RLS 유지 → 3단계: builder가 목록에 시각 표시, qa PASS → 4단계: "Supabase SQL Editor에서 ○○ 파일을 실행하세요" 안내 포함 보고

**오류 흐름:** "페이지 제목을 바꾸고 메타데이터도 한국어로"
→ 2단계 생략 → builder 구현 → qa가 build FAIL(타입 오류) 보고 → builder 재호출로 수정 → qa PASS. 만약 `.env.local`이 없어 build가 실패하면 환경 문제로 분류해 반복 없이 사용자에게 안내

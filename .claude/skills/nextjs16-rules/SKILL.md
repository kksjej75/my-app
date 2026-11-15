---
name: nextjs16-rules
description: "이 프로젝트(Next.js 16.4, React 19, cacheComponents·partialPrefetching 켜짐)에서 코드를 쓰기 전에 읽어야 할 공식 문서 위치와 작업 규칙. 페이지·레이아웃·컴포넌트 작성, 데이터 불러오기·저장, 캐싱, 메타데이터, next.config 수정 시 반드시 사용한다. Supabase 테이블·보안 규칙 설계는 supabase-safety를 쓴다."
---

# Next.js 16 작업 규칙

이 저장소의 Next.js는 학습 데이터 속 버전과 API·규칙·파일 구조가 다르다. 그래서 **기억 대신 `node_modules/next/dist/docs/`의 문서를 기준으로 삼는다.** 문서는 설치된 버전과 정확히 일치하는 유일한 자료다.

## 1. 작업 전에 읽을 문서

작업 종류에 맞는 문서만 읽는다(경로는 `node_modules/next/dist/docs/01-app/` 기준).

| 작업 | 문서 |
| --- | --- |
| 페이지·레이아웃 추가, `LayoutProps`/`PageProps` | `01-getting-started/03-layouts-and-pages.md` |
| 서버/클라이언트 컴포넌트 구분 | `01-getting-started/05-server-and-client-components.md` |
| 데이터 불러오기 | `01-getting-started/06-fetching-data.md` |
| 데이터 저장(Server Actions, 폼) | `01-getting-started/07-mutating-data.md`, `02-guides/forms.md` |
| 캐싱(`use cache`, cacheComponents) | `01-getting-started/08-caching.md`, `09-revalidating.md` |
| 오류 화면 | `01-getting-started/10-error-handling.md` |
| 제목·설명·OG 이미지 | `01-getting-started/14-metadata-and-og-images.md` |
| 환경 변수 | `02-guides/environment-variables.md` |
| 데이터 보안 | `02-guides/data-security.md` |
| next.config 옵션 | `03-api-reference/05-config/01-next-config-js/` |

정확한 API 이름을 모르면 `Grep`으로 문서 전체를 검색한다(예: `grep -rl "revalidateTag" node_modules/next/dist/docs`).

## 2. 이 프로젝트의 설정에서 주의할 점

- `next.config.ts`에 `cacheComponents: true`, `partialPrefetching: true`가 켜져 있다. 캐싱·동적 렌더링 동작이 예전과 다르므로 데이터를 불러오는 코드를 쓸 때는 반드시 `08-caching.md`를 먼저 읽는다.
- Tailwind 4는 `@tailwindcss/turbopack` 로더로 처리된다. 스타일은 Tailwind 클래스를 우선 쓰고, 새 설정 파일(`tailwind.config.*`)을 만들기 전에 `app/globals.css`를 확인한다.
- `app/layout.tsx`는 전역 타입 `LayoutProps<"/">`를 쓴다. 새 레이아웃·페이지도 같은 방식을 따른다.
- 문서에 deprecated(사용 중단) 안내가 있는 API는 쓰지 않는다.

## 3. 코드 작성 규칙

1. 서버 컴포넌트를 기본으로 하고 상호작용이 필요한 가장 작은 부분만 클라이언트 컴포넌트로 분리한다.
2. Supabase 호출은 항상 `{ data, error }`를 받고 `error`를 처리한다. 실패를 조용히 넘기면 사용자가 원인을 알 수 없다.
3. 컴포넌트가 다루는 행 타입을 `type`으로 명시한다(예: `{ id: number; message: string }`). qa-checker가 이 타입을 스키마와 대조한다.
4. 사용자에게 보이는 문구는 한국어로 쓴다.
5. 다 쓰면 `npm run lint`를 직접 실행해 본다. 전체 검증은 qa-checker가 한다.

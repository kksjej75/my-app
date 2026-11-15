---
name: supabase-safety
description: "Supabase 테이블 설계, 행 수준 보안(RLS) 정책 작성, SQL 마이그레이션 파일 작성, 환경 변수·키 취급 점검 방법. 새 테이블·컬럼 추가, 누가 어떤 데이터를 읽고 쓸 수 있는지 정할 때, Supabase 보안 점검 요청 시 반드시 사용한다. 화면 코드 작성 자체는 nextjs16-rules를 쓴다."
---

# Supabase 안전하게 쓰기

이 앱은 브라우저에서 공개 키(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)로 Supabase에 직접 접속한다. 공개 키는 누구나 볼 수 있으므로 **"누가 무엇을 할 수 있는가"는 전부 RLS 정책이 정한다.** RLS가 꺼진 테이블은 인터넷의 누구나 읽고, 고치고, 지울 수 있다.

## 1. 테이블을 만들거나 바꿀 때 점검표

- [ ] `alter table ... enable row level security;`를 넣었다.
- [ ] 동작(select / insert / update / delete)마다 정책을 따로 만들고, 기능에 필요한 동작만 허용했다.
- [ ] 로그인 기능이 없으면 update·delete 정책은 만들지 않는다(누가 쓴 글인지 구분할 방법이 없기 때문).
- [ ] 텍스트 컬럼에 길이 제한을 걸었다(예: `check (char_length(message) between 1 and 500)`).
- [ ] 필수 컬럼에 `not null`, 작성 시각이 필요하면 `created_at timestamptz not null default now()`를 넣었다.
- [ ] 다시 실행해도 안전하다(`create table if not exists`, `drop policy if exists ...` 후 `create policy`).

## 2. 마이그레이션 파일 규칙

- 위치: `supabase/migrations/{YYYYMMDDHHMM}_{짧은_이름}.sql`
- 파일 위쪽 주석에 「이 SQL이 하는 일」을 쉬운 한국어로 적는다.
- 이미 적용한 파일은 고치지 않고 새 파일을 추가한다. 어떤 변경을 언제 적용했는지 추적하기 위해서다.
- 사용자 안내: Supabase 대시보드 → SQL Editor → 파일 내용 붙여 넣기 → Run. 이 순서를 schema 문서에 적는다.

## 3. 기본 정책 예시(로그인 없는 공개 방명록)

```sql
-- 방명록: 누구나 읽고 쓸 수 있지만, 고치거나 지울 수는 없다
alter table public.guestbook enable row level security;

drop policy if exists "누구나 읽기" on public.guestbook;
create policy "누구나 읽기" on public.guestbook
  for select to anon, authenticated using (true);

drop policy if exists "누구나 쓰기" on public.guestbook;
create policy "누구나 쓰기" on public.guestbook
  for insert to anon, authenticated
  with check (char_length(message) between 1 and 500);
```

## 4. 키와 환경 변수

| 값 | 어디에 | 브라우저 노출 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, GitHub Secrets | 노출됨(괜찮음) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local`, GitHub Secrets | 노출됨(RLS가 지켜 줌) |
| service role / secret 키 | 서버 전용 변수(`NEXT_PUBLIC_` 없이), 꼭 필요할 때만 | **절대 노출 금지** |

- `.env.local`은 git에 올리지 않는다(`.gitignore` 확인).
- 새 변수는 `.github/workflows/ci.yml`의 build `env`와 GitHub 저장소 Secrets에도 추가해야 한다.

## 5. 코드 점검 포인트

- `select("*")` 대신 필요한 컬럼만 고른다.
- 목록 조회에 `.limit(n)`을 건다. 글이 많아지면 페이지가 느려진다.
- `error`를 무시하는 호출이 없는지 본다.

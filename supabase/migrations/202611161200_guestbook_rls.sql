-- 이 SQL이 하는 일 (방명록 보안 잠그기)
-- 1. guestbook 테이블에 행 수준 보안(RLS)을 켠다.
-- 2. 예전에 만든 정책을 모두 지운다. (정책은 하나라도 허용하면 통과라서,
--    "모두 허용" 같은 옛 정책이 남아 있으면 아래 규칙이 소용없기 때문)
-- 3. 새 규칙: 누구나 읽기·쓰기 가능, 수정·삭제는 아무도 못 함, 글은 1~500자.
-- 여러 번 실행해도 안전하다.

alter table public.guestbook enable row level security;

-- 기존 정책 전부 삭제
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'guestbook'
  loop
    execute format('drop policy %I on public.guestbook', p.policyname);
  end loop;
end $$;

-- 누구나 읽기
create policy "누구나 읽기" on public.guestbook
  for select to anon, authenticated
  using (true);

-- 누구나 쓰기 (빈 글, 500자 초과 글은 거부)
create policy "누구나 쓰기" on public.guestbook
  for insert to anon, authenticated
  with check (char_length(trim(message)) between 1 and 500);

-- 수정(update)·삭제(delete) 정책은 만들지 않는다 → RLS가 자동으로 막는다.

-- 데이터베이스 차원의 글자 수 제한 (기존 글은 검사하지 않도록 not valid)
alter table public.guestbook drop constraint if exists guestbook_message_length;
alter table public.guestbook
  add constraint guestbook_message_length
  check (char_length(trim(message)) between 1 and 500) not valid;

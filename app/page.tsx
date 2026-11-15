"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// 방명록 한 줄의 모양 (created_at은 Supabase의 timestamptz → 문자열로 옴)
type Row = { id: number; message: string; created_at: string };

// "2026-11-09T15:38:02+00:00" 같은 값을 한국 시간으로 읽기 쉽게 바꾼다
function formatTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [text, setText] = useState("");
  // 목록 불러오기 실패 여부 (실패와 "글이 0개"를 구분하려고 따로 둔다)
  const [loadFailed, setLoadFailed] = useState(false);

  // 방명록 불러오기 (최신 글이 위로)
  async function load() {
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .select("id, message, created_at")
        .order("id", { ascending: false });
      // Supabase가 에러를 돌려준 경우
      if (error) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setRows(data ?? []);
    } catch {
      // 네트워크 끊김 등으로 예외가 난 경우
      setLoadFailed(true);
    }
  }

    useEffect(() => {
    supabase
      .from("guestbook")
      .select("id, message, created_at")
      .order("id", { ascending: false })
      .then(
        ({ data, error }) => {
          // Supabase가 에러를 돌려준 경우
          if (error) {
            setLoadFailed(true);
            return;
          }
          setRows(data ?? []);
        },
        // 네트워크 끊김 등으로 예외가 난 경우
        () => setLoadFailed(true)
      );
  }, []);

  // 방명록 글쓰기
  async function save() {
    if (text.trim() === "") return;
    const { error } = await supabase.from("guestbook").insert({ message: text });
    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }
    setText("");
    load();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        이쁜이와 밤송이를 사랑해 주세요!
      </h1>
      <h2 style={{ marginTop: 24, fontSize: 24 }}>📖 방명록</h2>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="한마디 남겨주세요"
          style={{ border: "1px solid #999", padding: 8, flex: 1, maxWidth: 400 }}
        />
        <button
          onClick={save}
          style={{ background: "#16a34a", color: "white", padding: "8px 16px" }}
        >
          등록
        </button>
      </div>

      {/* 불러오기에 실패하면 목록 대신 안내 문구를 보여준다 */}
      {loadFailed ? (
        <p style={{ marginTop: 16, color: "#dc2626" }}>글을 불러오지 못했어요</p>
      ) : (
        <ul style={{ marginTop: 16 }}>
          {rows.map((r) => (
            <li key={r.id}>
              {r.message}
              {/* 작성 시간: 글보다 작고 회색으로 */}
              <span style={{ marginLeft: 8, fontSize: 12, color: "#888" }}>
                {formatTime(r.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

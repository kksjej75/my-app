"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function Home() {
  const [rows, setRows] = useState<{ id: number; message: string }[]>([]);
  const [text, setText] = useState("");

  // 방명록 불러오기 (최신 글이 위로)
  async function load() {
    const { data } = await supabase
      .from("guestbook")
      .select("id, message")
      .order("id", { ascending: false });
    setRows(data ?? []);
  }

    useEffect(() => {
    supabase
      .from("guestbook")
      .select("id, message")
      .order("id", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
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
        안녕하세요! 김규석의 첫 웹사이트
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

      <ul style={{ marginTop: 16 }}>
        {rows.map((r) => (
          <li key={r.id}>{r.message}</li>
        ))}
      </ul>
    </main>
  );
}

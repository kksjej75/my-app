"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function Home() {
  const [rows, setRows] = useState<{ id: number; message: string }[]>([]);

  useEffect(() => {
    supabase
      .from("guestbook")
      .select("id, message")
      .then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        안녕하세요! 김규석의 첫 웹사이트
      </h1>
      <h2 style={{ marginTop: 24, fontSize: 24 }}>📖 방명록</h2>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>{r.message}</li>
        ))}
      </ul>
    </main>
  );
}
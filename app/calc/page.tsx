import type { Metadata } from "next";
import Calculator from "./calculator";

// 브라우저 탭에 보이는 제목 (metadata는 서버 컴포넌트에서만 내보낼 수 있다)
export const metadata: Metadata = {
  title: "이익률 계산기",
  description: "총수입과 지출 항목들로 이익과 이익률을 계산합니다",
};

// 페이지 자체는 서버 컴포넌트, 입력·계산 부분만 클라이언트 컴포넌트(Calculator)
export default function CalcPage() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>이익률 계산기</h1>
      <Calculator />
    </main>
  );
}

"use client";
import { useRef, useState } from "react";

// 숫자에 천 단위 콤마를 붙인다 (예: 1234567 → "1,234,567")
function withComma(n: number) {
  return n.toLocaleString("ko-KR");
}

// 입력값에서 숫자만 남긴다 (콤마·문자 등은 지움)
function onlyDigits(value: string) {
  // 너무 큰 숫자는 계산이 부정확해지므로 15자리까지만 받는다
  return value.replace(/[^0-9]/g, "").slice(0, 15);
}

const inputStyle = { border: "1px solid #999", padding: 8, width: 240 };
const buttonStyle = { border: "1px solid #999", padding: "8px 12px", cursor: "pointer" };

// 지출 항목 하나의 모양 (id는 React가 항목을 구분하는 고유 이름표)
type ExpenseItem = {
  id: string;
  name: string; // 항목 이름 (예: 공사비)
  amount: string; // 금액, "숫자만 있는 문자열" (빈 칸 = "")
};

// 처음 화면에 보이는 세 항목. id를 고정값으로 두어야
// 서버에서 그린 화면과 브라우저 화면이 똑같아진다(하이드레이션 불일치 방지)
const initialItems: ExpenseItem[] = [
  { id: "init-construction", name: "공사비", amount: "" },
  { id: "init-finance", name: "금융비용", amount: "" },
  { id: "init-etc", name: "기타비용", amount: "" },
];

// 지출 항목 한 줄 (이름 입력칸 + 금액 입력칸 + 삭제 버튼)
function ExpenseRow({
  item,
  onChange,
  onRemove,
}: {
  item: ExpenseItem;
  onChange: (changed: ExpenseItem) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
      <input
        aria-label="지출 항목 이름"
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        placeholder="항목 이름"
        style={{ ...inputStyle, width: 160 }}
      />
      <input
        aria-label="지출 금액"
        inputMode="numeric"
        value={item.amount === "" ? "" : withComma(Number(item.amount))}
        onChange={(e) => onChange({ ...item, amount: onlyDigits(e.target.value) })}
        placeholder="금액 (원)"
        style={inputStyle}
      />
      <button type="button" onClick={onRemove} style={buttonStyle}>
        삭제
      </button>
    </div>
  );
}

export default function Calculator() {
  // 입력칸 값은 "숫자만 있는 문자열"로 보관한다 (빈 칸 = "")
  const [income, setIncome] = useState("");
  const [items, setItems] = useState<ExpenseItem[]>(initialItems);

  // 새 항목에 붙일 번호. 버튼을 누를 때(이벤트 핸들러 안)에서만 읽고 늘린다
  const nextId = useRef(1);

  // "항목 추가": 빈 항목 하나를 목록 끝에 붙인다
  function addItem() {
    const id = `item-${nextId.current}`;
    nextId.current += 1;
    setItems((prev) => [...prev, { id, name: "", amount: "" }]);
  }

  // 항목 하나의 값이 바뀌면 같은 id인 항목만 바꿔 끼운다
  function updateItem(changed: ExpenseItem) {
    setItems((prev) => prev.map((it) => (it.id === changed.id ? changed : it)));
  }

  // "삭제": 해당 id만 빼고 나머지로 목록을 다시 만든다
  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const incomeNum = Number(income || 0);
  // 지출 = 모든 항목 금액의 합계 (빈 칸은 0, 항목이 하나도 없으면 0)
  const expense = items.reduce((sum, it) => sum + Number(it.amount || 0), 0);
  const profit = incomeNum - expense;

  // 총수입이 비었거나 0이면 0으로 나누게 되므로 계산하지 않는다
  const canCalcRate = income !== "" && incomeNum !== 0;
  const rate = canCalcRate ? (profit / incomeNum) * 100 : null;

  // 이익은 초록, 손실은 빨강
  const color = profit < 0 ? "#dc2626" : "#16a34a";

  return (
    <div style={{ marginTop: 24 }}>
      <label style={{ display: "block" }}>
        총수입 (원)
        <input
          inputMode="numeric"
          value={income === "" ? "" : withComma(Number(income))}
          onChange={(e) => setIncome(onlyDigits(e.target.value))}
          placeholder="예: 10,000,000"
          style={{ ...inputStyle, display: "block", marginTop: 4 }}
        />
      </label>

      <p style={{ marginTop: 16 }}>지출 항목</p>
      {/* key는 배열 순서(index)가 아니라 항목의 고유 id를 쓴다 (삭제해도 칸이 섞이지 않게) */}
      {items.map((it) => (
        <ExpenseRow
          key={it.id}
          item={it}
          onChange={updateItem}
          onRemove={() => removeItem(it.id)}
        />
      ))}
      <button type="button" onClick={addItem} style={{ ...buttonStyle, marginTop: 12 }}>
        항목 추가
      </button>

      <div style={{ marginTop: 24, fontSize: 20 }}>
        <p>
          지출 합계: <strong>{withComma(expense)}원</strong>
        </p>
        <p style={{ marginTop: 8 }}>
          {profit < 0 ? "손실" : "이익"}:{" "}
          <strong style={{ color }}>
            {profit < 0 ? "-" : ""}
            {withComma(Math.abs(profit))}원
          </strong>
        </p>
        <p style={{ marginTop: 8 }}>
          이익률:{" "}
          {rate === null ? (
            // 총수입이 없으면 계산할 수 없다
            <span style={{ color: "#888" }}>- (총수입을 입력하세요)</span>
          ) : (
            <strong style={{ color }}>{rate.toFixed(2)}%</strong>
          )}
        </p>
      </div>
    </div>
  );
}

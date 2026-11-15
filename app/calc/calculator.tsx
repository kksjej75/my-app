"use client";
import { useState } from "react";

// 숫자에 천 단위 콤마를 붙인다 (예: 1234567 → "1,234,567")
function withComma(n: number) {
  return n.toLocaleString("ko-KR");
}

// 입력값에서 숫자만 남긴다 (콤마·문자 등은 지움)
function onlyDigits(value: string) {
  // 너무 큰 숫자는 계산이 부정확해지므로 15자리까지만 받는다
  return value.replace(/[^0-9]/g, "").slice(0, 15);
}

export default function Calculator() {
  // 입력칸 값은 "숫자만 있는 문자열"로 보관한다 (빈 칸 = "")
  const [income, setIncome] = useState("");
  const [cost, setCost] = useState("");

  const incomeNum = Number(income || 0);
  const costNum = Number(cost || 0);
  const profit = incomeNum - costNum;

  // 총수입이 비었거나 0이면 0으로 나누게 되므로 계산하지 않는다
  const canCalcRate = income !== "" && incomeNum !== 0;
  const rate = canCalcRate ? (profit / incomeNum) * 100 : null;

  // 이익은 초록, 손실은 빨강
  const color = profit < 0 ? "#dc2626" : "#16a34a";

  const inputStyle = { border: "1px solid #999", padding: 8, width: 240 };

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

      <label style={{ display: "block", marginTop: 12 }}>
        시공금액 (원)
        <input
          inputMode="numeric"
          value={cost === "" ? "" : withComma(Number(cost))}
          onChange={(e) => setCost(onlyDigits(e.target.value))}
          placeholder="예: 7,000,000"
          style={{ ...inputStyle, display: "block", marginTop: 4 }}
        />
      </label>

      <div style={{ marginTop: 24, fontSize: 20 }}>
        <p>
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

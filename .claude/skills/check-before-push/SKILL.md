---
name: check-before-push
description: "GitHub의 자동 검사(CI)와 똑같은 lint·build 검사를 내 컴퓨터에서 먼저 실행하고 결과를 판정한다. 코드 변경 후 검증, 커밋·푸시·PR 전 확인, 'CI가 실패했어', '빌드 되는지 봐줘' 같은 요청에 사용한다. GitHub Actions 설정 파일 자체를 고치는 일에는 쓰지 않는다."
---

# 푸시 전 검사

CI(`.github/workflows/ci.yml`)는 `npm ci` → `npm run lint` → `npm run build` 순서로 검사한다. 같은 검사를 먼저 로컬에서 돌리면 GitHub에서 빨간 X를 보기 전에 문제를 잡을 수 있다.

## 실행

```bash
bash .claude/skills/check-before-push/scripts/check.sh
```

스크립트는 lint와 build를 차례로 실행하고 마지막 줄에 `RESULT: PASS` 또는 `RESULT: FAIL`을 출력한다. 검사 명령을 매번 새로 조합하지 말고 이 스크립트를 쓴다. 그래야 CI와 같은 조건으로 검사한다.

## 결과 해석

| 증상 | 원인 | 보고 방법 |
| --- | --- | --- |
| lint 오류(`file:line  error ...`) | 코드 규칙 위반 | 파일·줄·규칙 이름을 그대로 인용 |
| build 중 타입 오류 | 타입 불일치(예: Supabase 행 타입과 컴포넌트 타입) | 오류 메시지와 양쪽 타입을 함께 적음 |
| build 중 `NEXT_PUBLIC_SUPABASE_URL` 관련 오류 | `.env.local` 없음 | 코드 문제가 아니라 **환경 문제**로 분류 |
| 캐싱·동적 렌더링 관련 build 오류 | cacheComponents 규칙 위반 | `nextjs16-rules`의 캐싱 문서를 참고하라고 적음 |

## 추가 대조(파일 검사만으로는 못 잡는 것)

1. 새로 추가된 `process.env.*` 이름이 `ci.yml`의 build `env`에도 있는가 → `grep -rho "process.env.[A-Z_]*" app | sort -u`와 비교
2. Supabase `.select("...")`의 컬럼 목록이 컴포넌트의 행 타입과 일치하는가
3. 모든 `await supabase...` 호출이 `error`를 확인하는가

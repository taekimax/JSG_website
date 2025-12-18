# JSG Investment 웹사이트 (운영/콘텐츠 관리자 안내)

본 문서는 **사이트 운영(콘텐츠) 관리자**를 위한 가이드입니다.  
**이 문서는 한국어로 작성·유지되어야 합니다.** (필요 시 영어는 괄호/보조 표기로만 사용)

---

## 1) 핵심 원칙 (반드시 지켜주세요)

1. **관리자가 편집하는 범위는 `assets/**`만**입니다.  
   `scripts/**`, `styles/**`, `*.html`은 개발자 영역입니다. (구조/동작 변경 금지)
2. 파일 이름은 **바꾸지 말고 “내용만 교체”**하는 것을 기본으로 합니다.  
3. 내용 교체 후에는 해당 페이지의 `assetVersion`을 **반드시 올려서(변경해서)** 캐시를 무효화합니다.
4. 공지사항 페이지는 **반드시 HTTP로 열어야** 합니다. (`file://`로 열면 로딩 실패 가능)

---

## 2) 폴더 구조 (관리자 관점)

관리자가 주로 다루는 경로:

- 공통(로고): `assets/shared/`
- 랜딩 카피: `assets/landing/`
- About 카피: `assets/about/`
- Philosophy 카피/히어로: `assets/philosophy/`
- Team 데이터/이미지: `assets/team/`
- Portfolio 데이터/이미지/설명: `assets/portfolio/`
- Notices 데이터/첨부: `assets/notices/`

각 페이지는 보통 아래 파일을 가집니다:

- 매니페스트(캐시 버전 관리): `assets/{page}/{page}-manifest.json`
- 텍스트(카피): `assets/{page}/*.txt`
- 이미지/첨부: `assets/{page}/*.(jpg|png|...)`, `assets/notices/uploads/*`

---

## 3) 가장 중요한 개념: `assetVersion` (캐시 갱신 스위치)

사이트는 비용/속도를 위해 브라우저/CDN 캐시를 활용합니다.  
따라서 파일 내용만 바꾸고 URL이 같으면, 사용자에게 **이전 내용이 보일 수 있습니다.**

해결책:
- 파일 내용을 교체한 뒤, **해당 페이지의 매니페스트에서 `assetVersion` 값을 변경**합니다.
- 그러면 사이트가 자동으로 `?v=...`를 붙여 **새 URL로 다시 받아오게** 됩니다.

권장 규칙(택 1):
- 날짜: `"2025-12-18"`
- 날짜+시간: `"2025-12-18-1530"`
- 배포 버전: `"v12"`

---

## 4) 작업 공통 체크리스트 (매번 그대로 따라 하기)

1) **수정할 파일을 `assets/**`에서 찾기**  
2) 파일 내용 수정/교체  
3) 같은 폴더의 `*-manifest.json`에서 **`assetVersion` 변경**  
4) 로컬 확인
- `notice.html`은 HTTP로 확인 (아래 “로컬 확인 방법” 참고)
5) 배포 전 최종 점검(가능하면)
- `Validate.bat` 실행 (개발자/운영 PC에 Node가 있다면 함께 권장)

---

## 5) 페이지별 수정 방법 (자주 하는 작업)

### 5.1 Landing (landing.html)
- 수정 위치: `assets/landing/*.txt`
  - 예: `assets/landing/hero-lead.txt`, `assets/landing/cta-label.txt` 등
- 수정 후: `assets/landing/landing-manifest.json`의 `assetVersion` 변경

### 5.2 About (about.html)
- 수정 위치: `assets/about/*.txt`
  - 예: `assets/about/hero-sub-en.txt` (영문 서브 문구)
- 수정 후: `assets/about/about-manifest.json`의 `assetVersion` 변경

로고 교체(About 상단 로고 포함):
- 파일 교체: `assets/shared/logo.png` (파일명 유지)
- 수정 후: `assets/shared/shared-manifest.json`의 `assetVersion` 변경

### 5.3 Philosophy (philosophy.html)
- 히어로 이미지 교체: `assets/philosophy/philosophy-hero.jpg` (파일명 유지)
- 카피 수정: `assets/philosophy/*.txt`
- 수정 후: `assets/philosophy/philosophy-manifest.json`의 `assetVersion` 변경

### 5.4 Team (team.html / team-member.html)
- 데이터/정렬/이미지 경로: `assets/team/team-manifest.json`
  - `order` 숫자가 작을수록 먼저 노출
  - `group`: `core`, `advisory`
  - `id`는 **kebab-case**(예: `park-sang-jin`)로 유지, 한번 정하면 되도록 변경하지 않기
- 프로필 사진 파일:
  - `assets/team/{id}.png` (id와 파일명 베이스가 같아야 함)
- 수정 후: `assets/team/team-manifest.json`의 `assetVersion` 변경

### 5.5 Portfolio (portfolio.html)
- 데이터: `assets/portfolio/portfolio-manifest.json`
- 회사 설명(텍스트): `assets/portfolio/*.txt`
  - 여러 문단은 **빈 줄(한 줄 공백)**로 구분합니다.
- 로고 파일:
  - `assets/portfolio/{company-id}.(png|jpg)` (company `id`와 파일명 베이스 일치)
- 수정 후: `assets/portfolio/portfolio-manifest.json`의 `assetVersion` 변경

### 5.6 Notices / 공지사항 (notice.html)

공지 데이터:
- `assets/notices/notices.json`

첨부 파일:
- `assets/notices/uploads/*`
- 공지의 `attachments` 배열에 파일명을 추가하면 상세 화면에서 다운로드 링크가 생성됩니다.
  - 예: `"attachments": ["proxy_form.docx"]`

공지 추가 절차(권장):
1. `assets/notices/notices.json`에 새 항목 추가
2. 첨부가 있으면 파일을 `assets/notices/uploads/`에 넣기
3. `assets/notices/notices-manifest.json`의 `assetVersion` 변경

필드 규칙(요약):
- `id`: 고유값(중복 금지)
- `date`: `YYYY-MM-DD`
- `content`: **HTML 문자열**(상세 화면에서 그대로 렌더링됨)
  - 보안/안정성을 위해 아래는 금지:
    - `<script>`, `onload=...` 같은 이벤트 핸들러, 임의 iframe/embed
  - 권장 태그 예:
    - `<p>`, `<br>`, `<strong>`, `<ul>`, `<li>`, `<a>`

상세 화면 내비게이션:
- 상세(`notice.html?id=...`)에서는 하단에 이전/목록/다음 내비게이션이 표시됩니다.

---

## 6) 로컬 확인 방법 (중요)

### 6.1 공지사항은 반드시 HTTP로 열기
`notice.html`은 JSON을 fetch로 읽기 때문에, `file://`로 열면 실패할 수 있습니다.

간단한 방법(예시):
- Python이 있으면: `python -m http.server 8000`
  - 접속: `http://localhost:8000/notice.html`
- 또는 VS Code 확장 “Live Server” 사용

### 6.2 변경 내용이 바로 안 보일 때 (캐시)
1) 해당 페이지 매니페스트의 `assetVersion`을 올렸는지 확인  
2) 브라우저 강력 새로고침(Windows: `Ctrl+F5`)  
3) (적용된 페이지에서) URL에 `?nocache=1`을 붙여 임시로 캐시 우회  
   - 예: `about.html?nocache=1`

---

## 7) 배포 전 점검(가능하면 권장)

프로젝트 루트에서:
- `Validate.bat` 실행 → “Validation passed.” 확인

---

## 8) 금지 사항 / 주의 사항

- `scripts/**`, `styles/**`, `*.html`을 임의로 수정하지 마세요.
- 파일명 규칙(중요):
  - 소문자, 숫자, 하이픈만: `kebab-case`
  - 공백/괄호/한글/특수문자 파일명 금지 (링크 깨짐/호스팅 이슈 예방)
- `.txt` 카피는 **서식(HTML) 없이 텍스트로만** 유지됩니다. (줄바꿈/문단은 빈 줄로)

---

## 9) 참고(개발자용)

디자인/UX 규칙 및 구성 원칙은 `agents.md`에 정리되어 있습니다.


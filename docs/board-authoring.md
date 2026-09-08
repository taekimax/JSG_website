# 콘텐츠 작성 안내

Portfolio·Notice와 Perspective 목록은 비공개 [jsg-board-content](https://github.com/taekimax/jsg-board-content) 저장소가 소유합니다. 웹사이트 저장소는 화면과 데이터 주소만 관리합니다.

## Pages CMS

[관리자 편집기](https://app.pagescms.org/taekimax/jsg-board-content/main)는 Mac·Windows 브라우저에서 사용할 수 있습니다.

### Portfolio 투자기업

1. **Portfolio 투자기업**에서 기존 회사를 선택하거나 새 회사를 만듭니다.
2. 회사명, 사업 분야, 표시 순서와 회사 소개를 입력합니다. 순서는 작은 숫자가 먼저이며 소개는 빈 줄로 문단을 나눕니다.
3. 상장사는 KOSDAQ 또는 KOSPI, 종목코드와 상장일을 입력합니다. 비상장사는 상장 항목을 비워 둡니다. 합병 상장처럼 설명이 필요하면 선택 항목인 상장 설명을 사용합니다.
4. **초안 / 비공개**를 끄고 저장하면 배포 후 공개됩니다. 게시를 내릴 때는 다시 켜고 저장합니다.

상장 배지와 소개 끝의 상장 문장은 입력한 항목에서 자동으로 만들어집니다. 회사 소개에 같은 정보를 다시 작성할 필요가 없습니다. 기존 18개 회사의 이름·설명·순서·상세 ID를 이관했습니다. 파일명은 상세 URL의 ID이므로 CMS에서 변경하거나 삭제하지 않습니다.

### Notice 공지사항

**Notice 공지사항**에서 제목, 발행일, 분류, 본문과 첨부를 입력합니다. 작성 중에는 **초안**을 켜 두고 공개할 때 끕니다. 기존 ID와 발행일을 유지하며 새 글은 자동 생성된 고정 파일명을 사용합니다. Markdown raw HTML은 실행되지 않습니다.

### Perspective

글은 기존 Substack 채널에서 작성합니다. 예약 동기화가 제목·날짜·원문 링크를 가져옵니다. RSS에 접근할 수 없으면 저장된 목록을 보존하고 워크플로에 경고를 남깁니다. 이 경우에도 검증된 Portfolio·Notice 변경은 배포할 수 있습니다.

## 저장과 배포

CMS 저장 → 비공개 콘텐츠 저장소 → 검사와 정적 파일 생성 → 공개 출력 배포 순서입니다. 콘텐츠를 저장해도 웹사이트 소스 저장소는 변경하지 않습니다.

GitHub Pages용 공개 출력 저장소는 `taekimax/jsg-public-content`로 구성하며, `/jsg-public-content/board-content/` 아래의 생성 파일만 제공합니다. 원본 Markdown, 초안, 설정과 편집 도구는 공개 출력에서 제외됩니다. 연결에는 출력 저장소에만 쓰기 권한을 가진 배포 키와 콘텐츠 저장소의 Actions 비밀값이 필요합니다. 2026-09-08 사용자 승인 후 이 연결을 활성화했습니다. CMS 저장 시 자동 검사와 공개 출력 배포가 실행됩니다.

Cafe24는 `/board-content/` 경로를 그대로 사용합니다. 호스팅 준비 후 별도 변수와 SFTP 비밀값을 설정할 때 활성화합니다.

## 개발자 경로

콘텐츠 저장소:

- `content/portfolio/*.md`: 회사와 상장 정보
- `content/notices/*.md`, `media/notices/`: 공지와 첨부
- `content/perspective/posts.json`: 저장된 Substack 목록
- `dist/`: 검증 후 생성한 공개 파일

웹사이트는 `assets/shared/board-endpoints.json`에서 Portfolio·Notice·Perspective manifest 주소를 읽습니다. 로컬 HTTP 미리보기에서는 콘텐츠 저장소의 `dist/`를 `board-content`로 연결합니다. 이 연결은 Git과 배포 artifact에서 제외됩니다.

콘텐츠 저장소의 `npm run verify`는 검사 후 공개 출력을 생성합니다. `npm run preview`는 Notice·Perspective의 페이지 탐색용 fixture를 포함하므로 공개 배포에 사용하지 않습니다.

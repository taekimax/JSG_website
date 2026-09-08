# JSG 웹사이트 — 디자인 실험 worktree

기존 콘텐츠 시스템을 유지하면서 시각적 구조와 사용 경험을 발전시키는 작업 공간입니다.

- 현재 작업 경로: `/Volumes/dev/JSG_website`
- 현재 브랜치: `main` (이전 실험 브랜치: `design/modernization-20260906`)
- 기준 커밋: `2261da0b70dad287a1c37f746618014debcaba99`
- 원본 `/Users/tk/dev/JSG-website`의 파일과 작업 상태는 변경하지 않습니다.

## 현재 결정과 구현

[AGENTS.md](AGENTS.md)가 이번 작업 지침입니다. [ASSETS_CONTRACT.md](ASSETS_CONTRACT.md)는 유지하는 콘텐츠 계약을 설명합니다. `docs/superpowers/`와 `docs/reviews/`의 이전 계획·승인·검증은 역사 자료입니다.

우선 방문자는 투자받을 창업자와 JSG의 LP 투자자입니다. 브랜드는 ‘이성에 근거한 대담한 비전’을 전달하며 금융·투자회사 정체성과 실용성을 유지합니다.

- 승인된 About 시안을 홈으로 사용합니다. 사이트 루트와 기존 `landing.html` 주소는 `about.html`로 연결됩니다.
- 모든 페이지는 간결한 상단 메뉴와 모바일 펼침 메뉴를 사용합니다. 내비게이션 아일랜드는 제거했습니다.
- 홈에는 별도 콘텐츠 저장소의 생성 manifest에서 불러오는 회사명 스크롤과 상장 시장 배지가 있습니다. 회사명을 누르면 기존 상세 페이지로 이동합니다.
- 회사 로고는 화면에서 표시하지 않습니다. 회사 정보는 별도 콘텐츠 저장소에서 관리합니다.
- 콘텐츠 원문과 관리 파이프라인은 유지합니다. About → Team → Philosophy → Portfolio → Notice → Contact를 한 페이지에 통합했습니다. 사진은 Team과 멤버 상세에 집중합니다. Philosophy는 파랑, Contact는 남색을 사용합니다.

## 구성과 미리보기

- 루트 HTML: `about.html` 통합 홈과 멤버·회사·공지 상세 화면. 이전 섹션 주소는 홈의 해당 앵커로 연결됩니다.
- `styles/`, `scripts/`: 표현, 공통 내비게이션, manifest 기반 콘텐츠 렌더링.
- `assets/`: 웹사이트 카피·이미지와 페이지별 manifest. Portfolio·Notice·Perspective 데이터는 별도 저장소가 소유합니다.
- `tools/`: 자산 검사와 Node 기반 구조·렌더러 검사.

랜딩 전용 React·Three·Vite 코드와 생성 번들을 제거했습니다. 방문자용 사이트는 빌드가 필요 없는 정적 파일입니다.

이 worktree에서 다음 명령으로 HTTP 미리보기를 실행합니다.

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

접속: [로컬 JSG 홈](http://127.0.0.1:4173/). 콘텐츠 fetch를 위해 HTTP가 필요합니다.

검사:

```sh
npm run verify
```

## 콘텐츠 관리자 안내

웹사이트 카피 관리자는 `assets/**`를 편집합니다. Notice 관리자는 `/admin/`에서 별도 비공개 콘텐츠 저장소를 편집합니다. HTML·스타일·스크립트는 개발자 영역입니다.

| 콘텐츠 | 편집 위치 |
| --- | --- |
| 공통 로고 | `assets/shared/`와 `shared-manifest.json` |
| About·Philosophy 카피 | 각 페이지 폴더의 `.txt`와 manifest |
| 팀 | `assets/team/team-manifest.json`, 기존 ID와 `order`, 멤버 사진 |
| 회사명 스크롤·포트폴리오 | Pages CMS → 별도 콘텐츠 저장소의 Portfolio 목록 |
| 공지·Perspective | `/admin/` → Pages CMS → `taekimax/jsg-board-content` |
| 연락처·지도 | `assets/contact/contact-manifest.json`과 연결된 텍스트·이미지 |

### 회사 추가·수정

홈 회사명과 포트폴리오 페이지는 같은 목록을 사용합니다. 회사 수를 코드에 고정하지 않습니다.

Pages CMS의 **Portfolio 투자기업**에서 회사명·분야·순서·소개를 입력하고 **공식 웹사이트**와 **기업 CI**를 등록합니다. CI는 상세 상단 오른쪽에 원본 비율로 표시됩니다. 흰색 CI는 검정 표시 옵션을 켤 수 있습니다. CI가 없으면 투명한 빈 영역을 유지하고, 웹사이트가 없으면 링크를 생략합니다. 기존 ID는 재사용하거나 변경하지 않습니다. 상세 절차는 [콘텐츠 관리 안내](docs/board-authoring.md)를 참고하세요.

## 검증 상태 — 2026-09-07

- PASS: 웹사이트 구조·렌더러 검사 23개와 자산 검증. 회사 40개 증가, 빈 목록, 미등록 상세 ID, 이름·정렬·설명·상세 연결을 확인했습니다.
- PASS: 브라우저 홈 진입, 회사명 이동·정지·키보드 탐색, 모바일 상단 메뉴, Escape와 포커스 복귀, 작은 높이의 메뉴 스크롤, 동작 줄이기 설정.
- PASS: 통합 홈의 1470px·390px 화면, 모든 섹션 로딩, 상세 연결과 복귀. 별도 헤드리스 Chrome에서 섹션 이동 후 뒤로 가기 위치 복원을 확인했습니다.
- 별도 빌드 없음: 정적 사이트입니다.
- 추가 장식 그래픽은 사용하지 않기로 확정했습니다. [디자인 결정 기록](docs/design/graphic-direction-handoff.md)을 참고하세요.

## 로고 사용

사용자가 지정한 도형과 `JSG INVESTMENT`를 사용합니다. 두 단어는 동일한 글자 크기이며 전체 텍스트 폭은 도형 폭의 두 배 이내입니다.

- 웹: [도형 단독 PNG](assets/shared/jsg-emblem.png) + HTML 회사명. 기존 `shared-manifest.json`의 `logo`와 `assetVersion`으로 관리합니다.
- 문서·자료: [회사명 포함 PNG](assets/shared/jsg-logo-lockup.png). 도형 위·회사명 아래 배치이며 측정한 텍스트/도형 폭 비율은 약 1.73입니다.
- 두 파일은 흰 배경입니다. 첨부 원본에 포함된 체크무늬를 정리한 버전이며 투명 PNG가 아닙니다.
- 웹의 글자 크기는 배치에 따라 달라질 수 있으나 한 회사명 안에서 `JSG`만 확대하거나 `INVESTMENT`만 축소하지 않습니다.

## 폰트와 색면 — 2026-09-06

- 메뉴·영문 제목·포트폴리오 회사명: 고정폭 JetBrainsMono Nerd Font Regular. 본문·로고: Pretendard, 로고는 SemiBold. [파일 버전과 라이선스](assets/fonts/README.md)를 함께 배포합니다.
- 본문은 18px/모바일 17px 중심입니다. `ABOUT JSG INVESTMENT` 소개 블록은 기존 12px label·14px 본문·20px 로고 크기를 유지합니다.
- About·Portfolio 제목: 로고의 공통 시안색 `#04f8fd` + 남색 글자. Team 제목: Philosophy와 동일한 파란색 + 흰 글자. Notice 제목·목록: 파란색 + 흰 글자. 상세 본문은 흰색입니다. Team 본문·Portfolio 회사명 영역은 흰색입니다.
- PASS: 320·390·768·1440px 가로 넘침 검사와 실제 웹 폰트 사용 확인, 제목 색면 분리, 로고 폭 비율 약 1.93, 모바일 메뉴·상세 이동·뒤로 가기. 구조 검사 20개와 자산 검증도 통과했습니다.
- Notice의 기본 편집기는 Pages CMS입니다. 별도 비공개 저장소가 Markdown과 첨부를 소유하며, 이 사이트는 `/board-content/`의 생성 파일만 읽습니다. 사용법은 [게시판 작성 안내](docs/board-authoring.md)를 참고하세요.

### 공통 팔레트

실제 색상 값은 `styles/tokens.css` 한 곳에서 관리합니다. 홈·상세 화면의 배경, 본문, 구분선, 그림자도 이 팔레트를 참조합니다.

| 색상 | 값 | 용도 |
| --- | --- | --- |
| Cyan | `#04f8fd` | 로고에서 추출, About·Portfolio 제목 배경 |
| Blue | `#1d4ed8` | Team 제목·Philosophy·링크 |
| Navy | `#0f172a` | 색면 위 제목·Contact 배경 |
| Yellow | `#e8b51b` | 보존된 팔레트, 현재 제목에는 미사용 |
| Gray Light | `#f4f4f4` | 보조 배경 |
| Gray Medium | `#d4d4d4` | 구분선 |
| Gray Dark | `#656565` | 보조 글자 |
| Black | `#000000` | 기본 본문 |
| White | `#ffffff` | 기본 배경·파란색 위 글자 |
| Red | `#dc2626` | 중요 공지 표시 |

PASS: 320·390·768·1440px에서 공통 제목 색면과 공지 목록을 확인했습니다. Cyan/Navy 대비 약 13.47:1, White/Gray Dark 대비 약 5.83:1입니다.

## 상세 화면과 팀 — 2026-09-07

Team·Portfolio·Notice 상세는 같은 제목·여백·본문·이전/다음 구성으로 정리했습니다. 장식용 상단 사진은 사용하지 않고 멤버 사진만 유지합니다. Partners는 연회색 카드 상단의 원본 비율 전체 사진·이름·직함과 하단 한영 요약을 갖춘 가로 반복 목록입니다. 재생/일시정지 버튼이 있으며 터치·휠·키보드 사용 중에는 멈춥니다. Advisors 요약은 표시하지 않습니다.

Partners·Advisors 제목은 Philosophy의 가치 제목과 같은 스타일입니다. About 한영 제목은 두 줄로 맞추고 설명문은 섹션 폭을 활용합니다. `ABOUT JSG INVESTMENT` 회사 소개는 기존 글자 크기를 유지하며 홈 맨 아래에 합쳤습니다.

PASS: Chrome 320·390·768·1440px의 최신 색면·카드·반복 이동·정지·상세 화면·가로 넘침, 동작 줄이기·키보드 이동. 공지 첨부 2건은 실제 다운로드 후 원본과 일치했습니다. 현재 자동 검사는 웹사이트 Node 23개·자산 검사와 콘텐츠 저장소 Node 7개·RSS fixture 9개를 통과했습니다. 물리적 기기 전체와 사용자 최종 시각 승인은 NOT RUN입니다.

## Philosophy 외부 글 — Substack

하나의 Substack 채널에서 글을 쓰고 JSG에는 제목·날짜·원문 링크만 표시합니다. 이미지가 있는 글을 지원하며 표는 [무료 Datawrapper](https://www.datawrapper.de/pricing)를 [Substack에 삽입](https://support.substack.com/hc/en-us/articles/15722290158100-How-do-I-embed-Datawrapper-charts-in-a-Substack-post)하는 방식입니다. 무료 플랜에는 Datawrapper 표기가 유지됩니다. [Substack은 무료 발행을 지원](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost)합니다.

현재 채널 URL이 없어 공개 Perspective 목록은 비어 있습니다. Mock과 RSS 도구는 별도 `jsg-board-content` 저장소에 있습니다. 첫 공개 글을 발행한 뒤 콘텐츠 저장소에서 실제 주소를 한 번 설정합니다.

```sh
npm run perspective:sync -- --publication-url https://YOUR-PUBLICATION.substack.com
```

이후 GitHub Actions 예약 실행이 새 제목과 날짜를 동기화하고 `/board-content/` 출력에 포함합니다.

```sh
npm run perspective:sync
```

RSS에서 사라진 과거 글은 보존하며 실패 시 기존 JSON을 유지합니다. 채널 변경 시에는 기존 목록을 먼저 정리합니다. 자격 증명이나 글 본문은 저장하지 않습니다.

PASS: RSS fixture 기반 동기화·중복 병합·실패 시 기존 파일 보존과 브라우저 목록 표시. NOT RUN: 실제 Substack 채널의 RSS와 공개 글 연결.

Partners 사진 최종 확인: 320·360·390·430·768·1024·1440px에서 세 사진의 표시 비율이 원본과 일치하고 텍스트가 잘리지 않았습니다. 현재 콘텐츠 기준 카드 높이는 모바일 약 372~421px, 데스크톱 약 409px입니다. 실제 Chrome에서 키보드 상세 이동도 확인했습니다.

## Contact 위치·연락처 — 2026-09-07

Contact는 하나의 전체 폭 영역에서 전화·이메일·주소 순서로 표시하고 맨 아래에 지도를 배치합니다. Location과 중복 Contact 소제목은 제거했습니다. 각 항목은 라벨과 값을 가로로 배치하며, 한국어 주소 아래에 `Samheung2 Bd 8 Fl., Tehran 514, Gangnam, Seoul`을 표시합니다. 연락처 라벨·값은 같은 크기(데스크톱 20px, 모바일 17px)이며 좁은 화면의 긴 주소만 자연스럽게 줄바꿈합니다. 주소는 `서울특별시 강남구 테헤란로 514, 삼흥2빌딩 8층`, 전화번호는 `02-3567-7751`, 이메일은 `contact@jsginvest.com`입니다. 기존 Contact manifest/TXT 파일에서 관리합니다.

[편집용 SVG](assets/contact/contact-map.svg)와 [표시용 PNG](assets/contact/contact-map.png)는 800×600으로 맞췄습니다. 데스크톱에서는 연락처 기준선에 맞춘 최대 572×400px의 10:7 표시 영역으로 지도 높이를 줄이고, 모바일에서는 기존 화면 비율(390px 화면에서 약 342×239px)을 유지합니다. SVG는 같은 저장소의 Pretendard와 JetBrainsMono Nerd Font 파일을 참조합니다. JSG 표식은 왼쪽으로 옮기고 JetBrainsMono 52px의 `JSG`를 Navy로 수평 표시하며 흰 바탕·Navy 테두리·번짐 없는 Navy 그림자의 네오브루탈리즘 버튼 모양입니다. 클릭 기능은 없는 지도 표식입니다. 현대차는 영동대로 오른쪽 코엑스 맞은편에 코엑스와 같은 기울기로 표시합니다. 건물 박스·연결선을 제거하고 테헤란로·영동대로와 장소명만 표시합니다. 흰 도로가 좌측 사이안·우측 블루의 큰 사각 색면을 나누도록 구성해 로고를 사각형으로 변형한 현대미술 카드 느낌을 적용했습니다. 섬유센터를 JSG 오른쪽에 추가했고, 도심공항터미널·삼성역 위치를 사용자 요청에 맞춰 정리했습니다. 실제 거리와 도로 형상을 단순화한 위치 약도입니다.

주소는 사용자 확인과 [삼흥2빌딩 안내](https://officefind.co.kr/%EB%8C%80%EC%B9%98%EB%8F%99944%EC%82%BC%ED%9D%A52%EB%B9%8C%EB%94%A9)를 참고했습니다. 주변 위치 관계는 첨부 지도와 [코엑스 안내](https://www.coex.co.kr/coex-mice-cluster/)를 참고했습니다. 지도는 선·면·텍스트로 직접 작성했습니다.

Notice는 파란 배경에 흰 제목·목록을 사용하며 설명을 제거했습니다. 제목·목록과 각 항목 사이의 여백을 줄였고, 상세는 파란 제목과 흰 본문으로 정리했습니다.

파트너 카드의 영문 직함은 `/`로 구분된 각 직함을 별도 줄에 표시합니다. 데이터 원문의 구분자는 유지하며 카드 렌더러에서 줄바꿈으로 바꿉니다.

지도 최종 배치: 삼성역 교차점은 오른쪽 끝에서 가로 1/3입니다. [글라스타워](https://www.shinhanvc.com/kr/aboutus/contactus)는 교차점 왼쪽 아래, [파크 하얏트 서울](https://www.seoul.park.hyattrestaurants.kr/ko/web/contact/location.php)은 오른쪽 아래에 표시했습니다. 가장 먼 포스코센터는 제외했습니다.

상단 로고·메뉴 바는 문서와 함께 스크롤되어 화면 밖으로 사라집니다. 섹션 이동은 24px 여백을 사용하며 하단 Top은 로고·메뉴가 있는 문서 맨 위로 돌아갑니다. 지도에서 JSG를 제외한 글자는 도로 각도에 맞춰 기울였고 섬유센터·글라스타워는 테헤란로 가장자리와 여백을 두고 배치했습니다.

## 게시판 작성 — Pages CMS

[게시판 작성 안내](docs/board-authoring.md)에 브라우저 편집과 분리된 배포 흐름이 있습니다. `/admin/`은 `taekimax/jsg-board-content`의 Pages CMS 화면으로 이동합니다. 공지 저장은 웹사이트 저장소를 변경하지 않습니다.

콘텐츠 저장소의 GitHub Actions가 검증과 정적 생성을 수행합니다. Cafe24 SFTP 단계는 준비되어 있지만 변수와 비밀값을 넣기 전까지 실행되지 않습니다.

## Portfolio 관리 — 2026-09-08

`/admin/`의 Pages CMS에서 **Portfolio 투자기업**을 선택합니다. 회사명·분야·정렬·소개를 수정하고 상장사는 시장·종목코드·상장일을 입력합니다. 초안을 끄면 공개 대상이며 켜면 목록에서 내립니다. 회사 ID와 상세 주소는 유지됩니다. 작성 방법과 배포 경로는 [콘텐츠 관리 안내](docs/board-authoring.md)에 있습니다.

GitHub Pages는 `tools/stage-site.mjs --github-pages`로 방문자용 파일만 `_site/`에 준비합니다. 로컬 `board-content` 연결은 배포 artifact에 포함하지 않습니다. 게시판과 Portfolio는 별도 공개 출력 사이트에서 읽으므로 콘텐츠 변경으로 웹사이트 소스가 변경되지 않습니다.

## 디자인 일관성

현재 디자인 결정은 [AGENTS.md](AGENTS.md)에 기록합니다. 방향성 내비게이션은 모두 `.nav-chevron[data-direction]`을 사용하며 문자·크기는 `styles/tokens.css`, 공통 표시는 `styles/layout.css`가 소유합니다. 이전·다음·Top·섹션 복귀·프로필·모바일 메뉴에 별도 화살표를 추가하지 않습니다. Advisors의 빈 사진도 기존 사진과 같은 크기의 회색 영역으로 유지합니다.

## Tailscale 로컬 검토

[원격 미리보기](https://jessie.adal-alhena.ts.net/jsg/)는 Tailscale 연결 상태에서 접근합니다. 현재 작업 파일을 바로 제공하므로 새로고침하면 변경을 볼 수 있습니다. 공개 사이트 배포와는 별도입니다.

서버: `node tools/preview-server.mjs` (127.0.0.1:4174). 콘텐츠는 인접한 `jsg-board-content/dist/`를 사용하며 콘텐츠 수정 후 그 저장소에서 `npm run build`를 실행합니다. `JSG_CONTENT_DIST`와 `JSG_PREVIEW_PORT`로 경로·포트를 지정할 수 있습니다.

현재 실행 PID는 `/tmp/jsg-preview-4174.pid`, 로그는 `/tmp/jsg-preview-4174.log`에 있습니다. 종료할 때 해당 프로세스를 확인한 뒤 종료하고 `tailscale serve --https=443 --set-path=/jsg off`로 이 경로만 해제합니다. 다른 Tailscale 경로를 초기화하지 않습니다.

제목과 본문 시작이 데스크톱 144px·모바일 96px의 짧은 스크롤 구간 동안 함께 고정된 뒤 자연스럽게 올라갑니다. 전환 공간은 고정 높이이며 동작 줄이기에서는 고정과 추가 공간을 모두 제거합니다. 재생/일시정지 문자 버튼은 Partners와 Portfolio 제목 오른쪽에 있습니다. iPhone에서는 화면 가장자리까지 표시하고 상·하단 및 가로 safe-area를 반영합니다. 기존 색상은 그대로 유지합니다. 모든 화면의 메뉴는 햄버거 버튼 안에 있으며 Perspective는 Philosophy 내부 위치로 이동합니다.

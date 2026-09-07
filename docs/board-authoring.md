# 게시판 작성 안내

Notice와 Perspective 데이터는 비공개 GitHub 저장소 [`taekimax/jsg-board-content`](https://github.com/taekimax/jsg-board-content)가 소유합니다. 이 웹사이트 저장소에는 공지 원문, 첨부, 생성된 게시판 JSON·HTML을 저장하지 않습니다.

## 관리자 작성

웹사이트의 `/admin/`은 [Pages CMS 편집기](https://app.pagescms.org/taekimax/jsg-board-content/main)로 이동합니다. Mac과 Windows 모두 브라우저에서 같은 화면을 사용합니다.

1. **Notice 공지사항**을 엽니다.
2. 새 글을 만들거나 기존 글을 선택합니다.
3. 제목, 원래 발행일, 분류, 본문과 첨부를 입력합니다.
4. 작성 중에는 **초안**을 켭니다.
5. 공개할 때 **초안**을 끄고 저장합니다.

기존 공지 ID와 발행일은 유지됩니다. 새 글은 생성된 파일명을 고정 ID로 사용합니다. 삭제와 파일명 변경은 비활성화되어 있으며, 게시를 내릴 때는 `draft: true`를 사용합니다.

Pages CMS 저장은 콘텐츠 저장소만 변경합니다. GitHub Actions가 Markdown을 검증하고 `/board-content/`용 정적 파일을 생성합니다. Cafe24 배포가 연결된 뒤에도 공지 작성은 웹사이트 소스나 디자인 파일을 변경하지 않습니다.

## 콘텐츠와 출력

콘텐츠 저장소의 주요 경로는 다음과 같습니다.

- `content/notices/*.md`: Notice 원문과 메타데이터
- `media/notices/`: 첨부파일과 본문 이미지
- `content/perspective/posts.json`: Substack 제목·날짜·원문 링크
- `dist/`: 생성된 JSON, HTML, 첨부와 asset manifest

웹사이트는 `assets/shared/board-endpoints.json`에 고정된 다음 주소만 읽습니다.

- `/board-content/notices-manifest.json`
- `/board-content/perspective-manifest.json`

Markdown은 제목, 문단, 굵게, 기울임, 목록, 표, 링크와 이미지를 지원합니다. Raw HTML은 출력 HTML로 실행되지 않습니다.

## 자동화 상태

콘텐츠 저장소의 워크플로는 검증, 정적 생성, 빌드 artifact 저장과 Substack RSS 동기화를 정의합니다. Cafe24 SFTP 단계는 저장소 변수 `CAFE24_DEPLOY_ENABLED=true`가 설정될 때만 실행됩니다. 현재 Cafe24 변수와 비밀값은 설정하지 않았습니다.

로컬 개발자는 콘텐츠 저장소에서 다음 명령을 사용합니다.

```sh
npm ci
npm run preview
npm run verify
```

`preview`는 Notice 7개와 Perspective 8개의 Mock을 포함해 5/5/2 페이지 탐색을 확인합니다. `verify`는 테스트 후 초안과 Mock을 제외한 공개 출력을 생성합니다.

Substack 첫 공개 글이 준비되면 콘텐츠 저장소에서 발행 주소를 한 번 설정합니다.

```sh
npm run perspective:sync -- --publication-url https://YOUR-PUBLICATION.substack.com
```

이후 예약 워크플로가 제목과 날짜를 동기화합니다. RSS 오류가 발생하면 기존 저장 목록을 보존합니다.

## 연결 상태 — 2026-09-07

- GitHub 계정 `taekimax`에 비공개 `jsg-board-content` 저장소를 만들었습니다.
- Pages CMS GitHub App은 **Only select repositories**로 설치되어 있으며 선택된 저장소는 `taekimax/jsg-board-content` 하나입니다.
- 로컬 콘텐츠 저장소에 Pages CMS 설정, 콘텐츠, 생성기, 테스트와 워크플로를 준비했습니다.
- 사용자 지시에 따라 초기 커밋은 아직 푸시하지 않았습니다. 저장소가 비어 있어 Pages CMS 이메일 collaborator 초대 화면도 아직 열리지 않습니다.
- Cafe24에는 변경하지 않았고 자격 증명도 설정하지 않았습니다.

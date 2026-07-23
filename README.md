# 이미지 편집 도구 모음 (mylifeimg)

가입 없이 무료로 쓰는 이미지 편집 도구 모음. Next.js(App Router) + `sharp`로 만들었습니다.

## 기능

- 이미지 압축, 크기 조절, 자르기
- 이미지 형식 변환 (JPG/PNG/WEBP/GIF/BMP/TIFF)
- 이미지 회전/반전
- 워터마크 추가, 밈 만들기

## 로컬 개발

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

## 배포

`sharp`는 프리빌드 바이너리를 쓰기 때문에 LibreOffice 같은 무거운 시스템 의존성이 없어 서버리스(Vercel)로도 배포 가능하지만, 이 저장소는 PDF 도구 모음([mylifepdf](https://mylifepdf.com))과 동일한 방식으로 Docker + Railway를 사용합니다.

`Dockerfile`이 프로젝트에 포함되어 있으며, Next.js `output: "standalone"` 빌드 + 한글 워터마크/밈 텍스트가 제대로 렌더링되도록 `fonts-noto-cjk`를 설치합니다. `railway.json`도 포함되어 있어 Railway에서 이 저장소를 연결하면 Dockerfile을 자동으로 감지해서 빌드합니다.

### Railway 배포 방법

1. [railway.app](https://railway.app)에서 GitHub 계정으로 로그인
2. "New Project" → "Deploy from GitHub repo" → 이 저장소 선택
3. Dockerfile을 자동 감지해서 빌드 (별도 설정 불필요)
4. 빌드 완료 후 Railway가 제공하는 URL로 접속
5. Settings → Networking → Generate Domain으로 공개 URL 생성
6. 커스텀 도메인(mylifeimg.com) 연결은 Hobby 플랜($5/mo) 이상에서 가능 — Cloudflare로 도메인을 관리 중이라면 Railway의 Cloudflare 연동으로 CNAME/TXT 레코드를 자동 추가할 수 있습니다.

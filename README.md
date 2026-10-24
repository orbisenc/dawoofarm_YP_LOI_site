# 다우팜 양평 조합원 가입 의향서

첨부 시안을 바탕으로 제작한 모바일 중심의 조합원 가입 의향서 웹사이트입니다.

## 로컬 실행

Node.js가 설치된 환경에서 아래 명령어를 실행합니다.

```bash
npm start
```

Windows PowerShell의 실행 정책으로 `npm.ps1`이 차단되는 환경에서는 `npm.cmd start`를 사용합니다.

브라우저에서 `http://127.0.0.1:4173`으로 접속합니다.

## 구현 범위

- 양평 스마트팜 빌리지 소개 및 핵심 사업 수치
- 기본정보 입력
- 가입 의향서 확인 및 동의
- 개인정보 필수 동의와 휴대전화 데모 인증
- 주민등록증·NICE 신용정보 확인서 파일 선택 및 미리보기
- 두 필수 서류의 병렬 업로드 및 Firebase Firestore 영구 저장
- 접수 완료 화면과 고유 접수번호 발급
- 관리자 사이트 실시간 접수 연동

신청 정보는 `applications/{applicationId}`에 저장되며, 제출 서류는 `applications/{applicationId}/files/{chunkId}` 하위 컬렉션에 분할 저장됩니다. 관리자 사이트는 같은 컬렉션을 실시간 구독합니다.

## 참고 자산

양평 사업 정보와 현장 이미지는 공개된 [다우 LG 스마트팜 빌리지 양평](https://orbisenc.github.io/dawoo-lg-smart-farm-village-yangpyeong/) 페이지를 참고했습니다.

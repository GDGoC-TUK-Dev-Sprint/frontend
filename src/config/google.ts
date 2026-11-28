// Google 로그인 OAuth 클라이언트 ID (Google Cloud 콘솔). 비밀값이 아니라 앱에 들어가는 값이다
// - 웹 클라이언트 ID: ID 토큰의 대상(aud). 서버 설정 oauth.google.client-ids에도 같은 값을 넣어야 한다
// - iOS 클라이언트 ID: 넣을 때 Info.plist URL Types에 "뒤집은 iOS 클라이언트 ID" 스킴도 추가해야 한다 (없으면 iOS가 로그인 중 앱을 끈다)
export const GOOGLE_WEB_CLIENT_ID =
  '1065783795400-bjk1nfrb3jqhnmh885ed6r2p3n0o7fp6.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID =
  '1065783795400-bs4gqktiqkhrles1nlercvfnbt3cds1j.apps.googleusercontent.com';

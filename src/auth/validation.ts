// 회원가입 입력 규칙 (spec F11-1). 서버도 같은 규칙으로 다시 검증한다
export const NAME_MAX = 50;
const LOGIN_ID = /^[a-z0-9_]{4,30}$/;

export type SignupForm = {
  name: string;
  loginId: string;
  password: string;
  passwordConfirm: string;
};

// 필드별 통과 여부
export function validateSignup(form: SignupForm) {
  return {
    name: form.name.trim().length > 0 && form.name.length <= NAME_MAX,
    loginId: LOGIN_ID.test(form.loginId),
    password: form.password.length >= 8 && form.password.length <= 64,
    passwordConfirm:
      form.passwordConfirm.length > 0 && form.passwordConfirm === form.password,
  };
}

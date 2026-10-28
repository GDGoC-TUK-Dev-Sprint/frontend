import { validateSignup } from '../auth/validation';

const valid = {
  name: '홍길동',
  loginId: 'gil_dong1',
  password: '12345678',
  passwordConfirm: '12345678',
};

test('규칙에 맞으면 모두 통과', () => {
  expect(validateSignup(valid)).toEqual({
    name: true,
    loginId: true,
    password: true,
    passwordConfirm: true,
  });
});

test('이름은 공백만 있거나 50자를 넘으면 실패', () => {
  expect(validateSignup({ ...valid, name: '  ' }).name).toBe(false);
  expect(validateSignup({ ...valid, name: 'a'.repeat(51) }).name).toBe(false);
});

test('아이디는 영문 소문자·숫자·_ 4~30자', () => {
  const ok = (loginId: string) => validateSignup({ ...valid, loginId }).loginId;
  expect(ok('abc')).toBe(false);
  expect(ok('a'.repeat(31))).toBe(false);
  expect(ok('Abcd')).toBe(false);
  expect(ok('ab-cd')).toBe(false);
  expect(ok('ab_12')).toBe(true);
});

test('비밀번호는 8~64자', () => {
  const ok = (password: string) =>
    validateSignup({ ...valid, password, passwordConfirm: password }).password;
  expect(ok('1234567')).toBe(false);
  expect(ok('a'.repeat(65))).toBe(false);
  expect(ok('a'.repeat(64))).toBe(true);
});

test('비밀번호 확인은 비밀번호와 같아야 함', () => {
  expect(
    validateSignup({ ...valid, passwordConfirm: '87654321' }).passwordConfirm,
  ).toBe(false);
});

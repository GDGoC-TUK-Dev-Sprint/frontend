// TourAPI 자유 텍스트(이용시간·휴무·요금)를 화면에 보여줄 문자열로 바꾼다 (rule.md R-K09)
// <br>은 줄바꿈으로, 나머지 태그는 지우고, 흔한 HTML 엔티티를 되돌린다
export function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

// ISO 3166-1 국가 코드("JP")를 국기 이모지로 바꾼다. 서버는 국기 이미지를 주지 않는다
// TODO: Figma는 국기 SVG. 디자인 확인 후 교체
export const flagEmoji = (code: string) =>
  String.fromCodePoint(
    ...[...code.toUpperCase()].map(c => 0x1f1a5 + c.charCodeAt(0)),
  );

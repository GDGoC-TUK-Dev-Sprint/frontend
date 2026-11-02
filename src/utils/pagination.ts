// 페이지 번호 줄: 처음·끝과 현재 ±1을 보이고 사이가 비면 '…'
// 예: 1페이지/10 → 1 2 3 … 10 (Figma 「Pagination」)
export function pageItems(current: number, total: number): (number | '…')[] {
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    page =>
      page === 1 ||
      page === total ||
      Math.abs(page - current) <= 1 ||
      (current <= 2 && page <= 3) ||
      (current >= total - 1 && page >= total - 2),
  );
  return pages.flatMap((page, i) =>
    i > 0 && page - pages[i - 1] > 1 ? ['…' as const, page] : [page],
  );
}

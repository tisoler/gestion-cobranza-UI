export const isMobile =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

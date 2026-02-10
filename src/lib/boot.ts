export const BOOT_EVENTS = {
  reveal: "bootsequence:reveal",
  done: "bootsequence:done",
} as const;

export const BOOT_DATASET = {
  reveal: "bootReveal",
  done: "bootDone",
} as const;

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function hasBootRevealOrDoneFlag(): boolean {
  if (!hasWindow()) return false;
  const ds = document.documentElement.dataset;
  return ds[BOOT_DATASET.reveal] === "1" || ds[BOOT_DATASET.done] === "1";
}

export function markBootReveal() {
  if (!hasWindow()) return;
  document.documentElement.dataset[BOOT_DATASET.reveal] = "1";
  window.dispatchEvent(new Event(BOOT_EVENTS.reveal));
}

export function markBootDone() {
  if (!hasWindow()) return;
  document.documentElement.dataset[BOOT_DATASET.done] = "1";
  window.dispatchEvent(new Event(BOOT_EVENTS.done));
}

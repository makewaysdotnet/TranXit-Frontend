export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

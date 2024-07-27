export function getDateInputValue(date: Date | string | undefined) {
  if (!date) return undefined;
  return new Date(date).toISOString().split("T")[0];
}

export function getDateFromInputValue(inputValue: string) {
  if (!inputValue) return undefined;
  return new Date(inputValue)?.toISOString();
}

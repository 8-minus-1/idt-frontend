export function tryParse(json: string) {
  try {
    return JSON.parse(json);
  } catch {}
  return null;
}

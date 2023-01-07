export const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

export const camelize = (s: string) => s.replace(/-./g, (x) => x[1].toUpperCase());

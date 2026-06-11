export function citationLabel(url: string): string {
  try {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop();
    if (!slug) return "MyScheme.gov.in";
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "MyScheme.gov.in";
  }
}

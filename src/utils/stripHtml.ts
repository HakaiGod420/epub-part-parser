export const stripHtml = (html: string): string => {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;

  // Replace <br> and <p> with new lines
  let text = tempElement.innerHTML
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with a single newline
    .replace(/<\/p>/gi, "\n\n") // Replace </p> with two newlines
    .replace(/<[^>]+>/g, ""); // Remove all remaining HTML tags

  // Decode HTML entities
  tempElement.innerHTML = text;
  text = tempElement.textContent || tempElement.innerText || "";

  // Collapse multiple newlines into a single newline
  text = text.replace(/\n{2,}/g, "\n\n").trim();

  return text;
};
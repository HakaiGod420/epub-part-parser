export const stripHtml = (html: string): string => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
  
    // Replace <br> and <p> with new lines
    let text = tempElement.innerHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""); // Remove all remaining HTML tags
  
    // Decode HTML entities
    tempElement.innerHTML = text;
    text = tempElement.textContent || tempElement.innerText || "";
  
    return text;
  };
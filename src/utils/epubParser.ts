import Epub, { Book } from "epubjs";

export const parseEpub = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const book = Epub(arrayBuffer);

  await book.ready;

  const chapters = book.navigation?.toc.map((tocItem) => ({
    label: tocItem.label,
    href: tocItem.href,
  }));

  return { book, chapters };
};

export const getChapterContent = async (book: Book, href: string) => {
  try {
    const chapter = (await book.load(href)) as Document;
    const images = chapter.querySelectorAll("img");
    const title = chapter.querySelector("h1")?.textContent || "Untitled Chapter";

    // Hide all images in the chapter
    for (const img of images) {
      img.style.display = "none";
    }

    const chapterHTML = chapter.body.innerHTML;

    // Return both the title and the chapter content
    return {
      title,
      content: chapterHTML,
    };
  } catch (error) {
    console.error(`Error loading chapter: ${href}`, error);
    throw new Error(`Failed to load the chapter file: ${href}. It might be missing or corrupted.`);
  }
};
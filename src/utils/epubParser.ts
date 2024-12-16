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
    const chapter = (await book.load(href)) as Document;;
    const images = chapter.querySelectorAll("img");
    for (const img of images) {
      const src = img.getAttribute("src");
      img.style.display = "none"
    }

    const chapterHTML = chapter.body.innerHTML;
    return chapterHTML;
  } catch (error) {
    console.error(`Error loading chapter: ${href}`, error);
    throw new Error(`Failed to load the chapter file: ${href}. It might be missing or corrupted.`);
  }
};
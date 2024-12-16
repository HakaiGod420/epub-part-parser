import Epub, { Book, Rendition } from "epubjs";

export const parseEpub = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const book = Epub(arrayBuffer);

  // Load the book and get metadata
  await book.ready;

  // Get the list of chapters
  const chapters = book.navigation?.toc.map((tocItem) => ({
    label: tocItem.label,
    href: tocItem.href,
  }));

  return { book, chapters };
};

export const getChapterContent = async (book: Book, href: string) => {
    try {
      // Load the chapter, which is already an HTMLDocument
      const chapter = await book.load(href) as HTMLDocument;
  
      // Extract the inner HTML of the body directly
      const chapterHTML = chapter.body.innerHTML;
      console.log("Parsed chapter HTML:", chapterHTML);
  
      return chapterHTML;
    } catch (error) {
      console.error(`Error loading chapter: ${href}`, error);
      throw new Error(`Failed to load the chapter file: ${href}. It might be missing or corrupted.`);
    }
  };
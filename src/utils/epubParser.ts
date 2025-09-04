import Epub, { Book } from "epubjs";

/**
 * Parse the EPUB file and return a book object along with a list of chapters.
 */
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

/**
 * Extract the title from EPUB metadata
 */
export const getBookTitle = (book: Book): string => {
  try {
    // Try multiple ways to get the title from the book metadata
    let title = null;
    
    // Method 1: Try packaging.metadata.title
    if ((book as any).packaging?.metadata?.title) {
      title = (book as any).packaging.metadata.title;
    }
    
    // Method 2: Try metadata.title directly
    if (!title && (book as any).metadata?.title) {
      title = (book as any).metadata.title;
    }
    
    // Method 3: Try package.metadata.title
    if (!title && (book as any).package?.metadata?.title) {
      title = (book as any).package.metadata.title;
    }
    
    // Method 4: Try spine.metadata.title
    if (!title && (book as any).spine?.metadata?.title) {
      title = (book as any).spine.metadata.title;
    }
    
    if (title) {
      const titleStr = typeof title === 'string' ? title : title.toString();
      console.log("Extracted book title:", titleStr);
      return titleStr;
    }
    
    console.log("No book title found, using fallback");
    return "Untitled Book";
  } catch (error) {
    console.error("Error extracting book title:", error);
    return "Untitled Book";
  }
};

/**
 * Loads a chapter’s content from the book.
 * 
 * If a container element is passed, its innerHTML is cleared (removing any previous images and content)
 * before the new chapter is rendered. Also, the image nodes found in the chapter document are removed so
 * that they do not appear inline with the text. Instead, the images are fetched separately.
 */
export const getChapterContent = async (
  book: Book,
  href: string,
  container?: HTMLElement
) => {
  try {
    // Clear any previous chapter content from the display container
    if (container) {
      container.innerHTML = "";
    }

    // Load the chapter document once
    const chapterDoc = (await book.load(href)) as Document;

    // Fetch the images from the chapter document (they will be re‑fetched each time this function is called)
    const images = await getImagesFromDocument(chapterDoc, book);

    // Remove image elements from the chapter document so they are not rendered with the text
    chapterDoc.querySelectorAll("img").forEach((img) => img.remove());

    // Extract the title and remaining HTML content
    const title = chapterDoc.querySelector("h1")?.textContent || "Untitled Chapter";
    const contentHTML = chapterDoc.body.innerHTML;

    return {
      title,
      content: contentHTML,
      images,
    };
  } catch (error) {
    console.error(`Error loading chapter: ${href}`, error);
    throw new Error(
      `Failed to load the chapter file: ${href}. It might be missing or corrupted.`
    );
  }
};

/**
 * Convenience wrapper that loads the chapter document and then returns its images.
 * (This function will re-load the chapter; if you already have the document, consider calling getImagesFromDocument() directly.)
 */
export const getChapterImages = async (book: Book, href: string): Promise<Uint8Array[]> => {
  const chapterDoc = (await book.load(href)) as Document;
  return getImagesFromDocument(chapterDoc, book);
};

/**
 * Given a chapter Document, this helper function searches for <img> tags and attempts to fetch their binary data.
 * 
 * It uses a list of possible folder prefixes to replace the "../" in the image’s src attribute.
 * On the first successful load (via book.archive.request), the image is converted into a Uint8Array.
 */
const getImagesFromDocument = async (doc: Document, book: Book): Promise<Uint8Array[]> => {
  const imageElements = Array.from(doc.querySelectorAll("img"));
  const images: Uint8Array[] = [];

  // List of folder replacements to try. Add more if needed.
  const possibleFolders = ["/OEBPS/", "/OPS/",];

  for (const img of imageElements) {
    const originalSrc = img.getAttribute("src");
    if (!originalSrc) continue;

    let imageLoaded = false;
    for (const folder of possibleFolders) {
      // Replace the relative path prefix (if present) with the candidate folder
      const candidateSrc = originalSrc.replace("../", folder);
      try {
        // Attempt to fetch the image from the EPUB archive as a blob
        const blob = (await book.archive.request(candidateSrc, "blob")) as Blob;
        const buffer = await blob.arrayBuffer();
        images.push(new Uint8Array(buffer));
        imageLoaded = true;
        break; // Stop trying other folders once the image is successfully loaded
      } catch (err) {
        // Log a warning and try the next folder option
        console.warn(`Failed to load image from candidate src "${candidateSrc}"; trying next option if available.`);
      }
    }
    if (!imageLoaded) {
      console.error(
        `Unable to load image for original src "${originalSrc}" using available folder options.`
      );
    }
  }

  return images;
};

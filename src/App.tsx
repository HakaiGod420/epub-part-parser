import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import ChapterSelector from "./components/ChapterSelector";
import ChapterContent from "./components/ChapterContent";
import { parseEpub, getChapterContent } from "./utils/epubParser";

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Array<{ label: string; href: string }>>([]);
  const [book, setBook] = useState<any>(null);
  const [chapterContent, setChapterContent] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    const { book, chapters } = await parseEpub(file);
    setBook(book);
    setChapters(chapters || []);
  };

  const handleSelectChapter = async (href: string) => {
    if (book && href) {
      const content = await getChapterContent(book, href);
      setChapterContent(content);
    }
  };

  return (
    <div>
      <h1>EPUB Reader</h1>
      <FileUploader onFileUpload={handleFileUpload} />
      {chapters.length > 0 && (
        <ChapterSelector chapters={chapters} onSelectChapter={handleSelectChapter} />
      )}
      {chapterContent && <ChapterContent content={chapterContent} />}
    </div>
  );
};

export default App;
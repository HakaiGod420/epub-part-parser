import React from "react";

interface ChapterSelectorProps {
  chapters: Array<{ label: string; href: string }>;
  onSelectChapter: (href: string) => void;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({ chapters, onSelectChapter }) => {
  return (
    <div className="chapter-selector">
      <h3>Select Chapter:</h3>
      <select onChange={(e) => onSelectChapter(e.target.value)}>
        <option value="">-- Select a Chapter --</option>
        {chapters.map((chapter, index) => (
          <option key={index} value={chapter.href}>
            {chapter.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChapterSelector;
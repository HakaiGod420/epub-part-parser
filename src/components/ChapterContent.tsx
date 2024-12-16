import React from "react";

interface ChapterContentProps {
  content: string;
}

const ChapterContent: React.FC<ChapterContentProps> = ({ content }) => {
  return (
    <div className="chapter-content">
      <h3>Chapter Content:</h3>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default ChapterContent;
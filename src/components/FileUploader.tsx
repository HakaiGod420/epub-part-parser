import React, { ChangeEvent } from "react";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div>
      <label htmlFor="file-upload">Upload EPUB File:</label>
      <input
        type="file"
        id="file-upload"
        accept=".epub"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploader;
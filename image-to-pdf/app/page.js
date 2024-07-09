'use client';

import { useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    for (let file of files) {
      formData.append('image', file);
    }

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      setPdfUrl(URL.createObjectURL(blob));
    } else {
      console.error('Failed to convert images to PDF');
    }
  };

  return (
    <div>
      <h1>Convert Images to PDF</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} accept="image/*" />
        <button type="submit">Convert to PDF</button>
      </form>
      {pdfUrl && (
        <div>
          <h2>Download your PDF:</h2>
          <a href={pdfUrl} download="image.pdf">Download PDF</a>
        </div>
      )}
    </div>
  );
}

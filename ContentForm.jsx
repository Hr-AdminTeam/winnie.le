import React, { useState } from 'react';

const ContentForm = () => {
  const [category, setCategory] = useState('');
  const [detail, setDetail] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi dữ liệu lên backend ở đây
    const formData = new FormData();
    formData.append('category', category);
    formData.append('detail', detail);
    if (file) {
      formData.append('file', file);
    }
    // fetch hoặc axios để gửi dữ liệu
    // Ví dụ: fetch('/api/upload', { method: 'POST', body: formData })
    alert('Đã gửi!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Category:</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Detail Content:</label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          required
        ></textarea>
      </div>
      <div>
        <label>Attach file:</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <button type="submit">Gửi</button>
    </form>
  );
};

export default ContentForm;

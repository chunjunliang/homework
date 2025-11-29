import React, { useState } from 'react';
import { assignmentAPI } from '../services/api';
import './SubmitPage.css';

const SubmitPage = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage({ type: '', text: '' });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage({ type: '', text: '' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 验证表单
    if (!formData.student_name || !formData.student_id || !formData.title) {
      setMessage({ type: 'error', text: '请填写所有必填字段' });
      return;
    }

    if (!file) {
      setMessage({ type: 'error', text: '请选择要上传的文件' });
      return;
    }

    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('student_name', formData.student_name);
      submitFormData.append('student_id', formData.student_id);
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('file', file);

      await assignmentAPI.submitAssignment(submitFormData);
      
      setMessage({ 
        type: 'success', 
        text: '作业提交成功！' 
      });

      // 重置表单
      setFormData({
        student_name: '',
        student_id: '',
        title: '',
        description: ''
      });
      setFile(null);
      
      // 清空文件输入
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || '提交失败，请重试' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-page">
      <div className="page-header">
        <h1>提交作业</h1>
        <p>请填写以下信息并上传您的作业文件</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="student_name">学生姓名 <span className="required">*</span></label>
            <input
              type="text"
              id="student_name"
              name="student_name"
              value={formData.student_name}
              onChange={handleInputChange}
              placeholder="请输入您的姓名"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student_id">学号 <span className="required">*</span></label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              placeholder="请输入您的学号"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">作业标题 <span className="required">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="例如：第1章课后作业"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">作业描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="可选：添加作业的简要说明"
            />
          </div>

          <div className="form-group">
            <label>上传文件 <span className="required">*</span></label>
            <div
              className={`file-upload-area ${dragActive ? 'dragover' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                type="file"
                id="file-input"
                className="file-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <div className="upload-icon">📁</div>
              <p>点击或拖拽文件到此处上传</p>
              <p className="upload-hint">支持 PDF, Word, TXT, ZIP, RAR 格式，最大 50MB</p>
            </div>

            {file && (
              <div className="file-info">
                <div className="file-info-item">
                  <span className="file-name">文件名：{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
            )}
          </div>

          {message.text && (
            <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary submit-button"
            disabled={loading}
          >
            {loading ? '提交中...' : '提交作业'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitPage;


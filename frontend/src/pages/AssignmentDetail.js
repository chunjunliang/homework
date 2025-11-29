import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentAPI } from '../services/api';
import './AssignmentDetail.css';

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAssignmentById(id);
      setAssignment(response.data);
      setError('');
    } catch (err) {
      setError('加载作业详情失败');
      console.error('Error fetching assignment:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  useEffect(() => {
    if (assignment) {
      setGrade(assignment.grade || '');
      setFeedback(assignment.feedback || '');
    }
  }, [assignment]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    try {
      const response = await assignmentAPI.downloadAssignment(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', assignment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('下载失败，请重试');
      console.error('Error downloading file:', err);
    }
  };

  const handleSaveGradeAndFeedback = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const gradeNum = grade ? parseInt(grade) : null;
      
      if (gradeNum !== null && (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100)) {
        setMessage({ type: 'error', text: '评分必须是 0-100 之间的数字' });
        setSaving(false);
        return;
      }

      await assignmentAPI.updateGradeAndFeedback(id, gradeNum, feedback);
      setMessage({ type: 'success', text: '评分和反馈已保存' });
      
      // 刷新作业数据
      fetchAssignment();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || '保存失败，请重试' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>加载中...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="error-container">
        <p className="error-message">{error || '作业不存在'}</p>
        <Link to="/assignments" className="btn btn-primary">
          返回列表
        </Link>
      </div>
    );
  }

  return (
    <div className="assignment-detail-page">
      <div className="page-header">
        <div className="header-actions">
          <Link to="/assignments" className="btn btn-secondary">
            ← 返回列表
          </Link>
        </div>
        <h1>作业详情</h1>
      </div>

      <div className="card">
        <div className="detail-section">
          <h3>基本信息</h3>
          <div className="detail-info">
            <div className="detail-item">
              <div className="detail-label">学生姓名</div>
              <div className="detail-value">{assignment.student_name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">学号</div>
              <div className="detail-value">{assignment.student_id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">作业标题</div>
              <div className="detail-value">{assignment.title}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">提交时间</div>
              <div className="detail-value">{formatDate(assignment.submitted_at)}</div>
            </div>
          </div>

          {assignment.description && (
            <div className="description-box">
              <div className="detail-label">作业描述</div>
              <div className="detail-value">{assignment.description}</div>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h3>文件信息</h3>
          <div className="file-detail-box">
            <div className="file-detail-item">
              <span className="file-detail-label">文件名：</span>
              <span className="file-detail-value">{assignment.file_name}</span>
            </div>
            <div className="file-detail-item">
              <span className="file-detail-label">文件大小：</span>
              <span className="file-detail-value">{formatFileSize(assignment.file_size)}</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleDownload}
            >
              📥 下载文件
            </button>
          </div>
        </div>

        <div className="detail-section">
          <h3>评分和反馈</h3>
          
          {assignment.grade !== null && (
            <div className="grade-display">
              <div className="grade-label">当前评分：</div>
              <div className="grade-value">{assignment.grade} 分</div>
            </div>
          )}

          {assignment.feedback && (
            <div className="feedback-display">
              <div className="feedback-label">教师反馈：</div>
              <div className="feedback-content">{assignment.feedback}</div>
            </div>
          )}

          <div className="grade-section">
            <h4>更新评分和反馈</h4>
            <div className="grade-input-group">
              <label htmlFor="grade">评分：</label>
              <input
                type="number"
                id="grade"
                className="grade-input"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="0-100"
              />
              <span>分</span>
            </div>

            <div className="feedback-input-group">
              <label htmlFor="feedback">反馈：</label>
              <textarea
                id="feedback"
                className="feedback-textarea"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="输入对作业的反馈意见..."
              />
            </div>

            {message.text && (
              <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                {message.text}
              </div>
            )}

            <button
              className="btn btn-success"
              onClick={handleSaveGradeAndFeedback}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存评分和反馈'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;


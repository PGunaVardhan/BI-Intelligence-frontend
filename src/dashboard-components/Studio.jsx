import React from 'react';
import './Studio.css';

const Studio = ({ isCollapsed, onToggleCollapse }) => {
  if (isCollapsed) {
    return (
      <div className="studio-container collapsed">
        <button className="toggle-btn" onClick={onToggleCollapse}>
          ←
        </button>
      </div>
    );
  }

  return (
    <div className="studio-container">
      <div className="studio-header">
        <h2>Studio</h2>
        <button className="toggle-btn" onClick={onToggleCollapse}>
          →
        </button>
      </div>

      <div className="studio-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">🎬</div>
          <h3>Coming Soon</h3>
          <p>Studio features are being developed and will be available soon.</p>
          
          <div className="preview-features">
            <h4>Planned Features:</h4>
            <ul>
              <li>Audio Overview Generation</li>
              <li>Deep Dive Conversations</li>
              <li>Custom Study Guides</li>
              <li>Timeline Creation</li>
              <li>FAQ Generation</li>
              <li>Briefing Documents</li>
            </ul>
          </div>
          
          <div className="placeholder-sections">
            <div className="placeholder-section">
              <div className="section-header">
                <span className="section-icon">🎧</span>
                <span className="section-title">Audio Overview</span>
              </div>
              <p className="section-description">
                Create an Audio Overview in more languages! <span className="learn-more">Learn more</span>
              </p>
            </div>
            
            <div className="placeholder-section">
              <div className="section-header">
                <span className="section-icon">💬</span>
                <span className="section-title">Deep Dive conversation</span>
              </div>
              <p className="section-subtitle">Two hosts</p>
              <div className="section-actions">
                <button className="customize-btn" disabled>Customize</button>
                <button className="generate-btn" disabled>Generate</button>
              </div>
            </div>
            
            <div className="placeholder-section">
              <div className="section-header">
                <span className="section-icon">📝</span>
                <span className="section-title">Notes</span>
              </div>
              <div className="notes-grid">
                <div className="note-item" title="Study guide">
                  <span className="note-icon">📚</span>
                  <span>Study guide</span>
                </div>
                <div className="note-item" title="Briefing doc">
                  <span className="note-icon">📄</span>
                  <span>Briefing doc</span>
                </div>
                <div className="note-item" title="FAQ">
                  <span className="note-icon">❓</span>
                  <span>FAQ</span>
                </div>
                <div className="note-item" title="Timeline">
                  <span className="note-icon">📅</span>
                  <span>Timeline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;
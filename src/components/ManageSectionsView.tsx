import { useState, useCallback } from 'react';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiCheck,
  mdiDeleteOutline,
  mdiDotsVertical,
  mdiAlertOutline,
} from '@mdi/js';
import type { Section } from '../data/interviewSections';
import { computeSectionMins } from '../data/interviewSections';

interface ManageSectionsViewProps {
  sections: Section[];
  onConfirm: (updated: Section[]) => void;
  onCancel: () => void;
}

export default function ManageSectionsView({ sections, onConfirm, onCancel }: ManageSectionsViewProps) {
  const [localSections, setLocalSections] = useState<Section[]>(() => JSON.parse(JSON.stringify(sections)));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDelete = useCallback((id: string) => {
    setLocalSections(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((toIndex: number) => {
    if (dragIndex === null) return;
    setLocalSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div className="manage-sections-view">
      <div className="manage-sections-header">
        <div className="manage-sections-header-left">
          <h3 className="content-title">Comprehensive evaluation</h3>
          <div className="content-tags">
            <span className="tag-accent">360° interview</span>
            <span className="tag-separator">·</span>
            <span className="tag-muted">John Doe (AI agent)</span>
            <span className="tag-separator">·</span>
            <span className="tag-check-group">
              <Icon path={mdiCheck} size={0.55} color="#69717F" />
              <span className="tag-muted">Evaluate language proficiency</span>
            </span>
          </div>
        </div>
        <div className="manage-sections-actions">
          <button className="manage-icon-btn cancel" onClick={onCancel} aria-label="Cancel">
            <Icon path={mdiClose} size={0.85} color="#69717F" />
          </button>
          <button className="manage-icon-btn confirm" onClick={() => onConfirm(localSections)} aria-label="Confirm">
            <Icon path={mdiCheck} size={0.85} color="#414996" />
          </button>
        </div>
      </div>

      <div className="manage-warning-banner">
        <Icon path={mdiAlertOutline} size={0.7} color="#9D6309" />
        <span>AI agent will ask questions in this order</span>
      </div>

      <div className="manage-sections-list">
        {localSections.map((section, idx) => {
          const mins = computeSectionMins(section);
          return (
            <div
              key={section.id}
              className={`manage-section-card ${dragOverIndex === idx ? 'drag-over' : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(idx, e)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle" aria-label="Drag to reorder">
                <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" />
                <Icon path={mdiDotsVertical} size={0.55} color="#9DA3AE" style={{ marginLeft: -14 }} />
              </div>
              <div className="manage-section-info">
                <div className="manage-section-title-row">
                  <span className="edit-section-title">{section.title}</span>
                  <span className="section-pill">{section.questions.length} questions</span>
                  <span className="section-pill">{mins} mins</span>
                </div>
                <span className="edit-section-desc">{section.description}</span>
              </div>
              <button
                className="delete-question-btn"
                onClick={() => handleDelete(section.id)}
                aria-label="Remove section"
              >
                <Icon path={mdiDeleteOutline} size={0.8} color="#69717F" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

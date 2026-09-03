import React from 'react'

export default function PageSkeleton({ rows = 3, compact = false }) {
  return (
    <div className="page-skeleton" style={compact ? { minHeight: '40vh' } : undefined} aria-hidden="true">
      {!compact && (
        <>
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line short" />
        </>
      )}
      <div className="skeleton-grid">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton--thumb" />
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--text short" />
          </div>
        ))}
      </div>
    </div>
  )
}

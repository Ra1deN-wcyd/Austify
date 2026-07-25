import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════════════════════
   CSS — scoped with "fr-" prefix, same conventions as
   FindTeammates.jsx (CSS-in-JS style block)
═══════════════════════════════════════════════════════════ */
const CSS = `
  .fr-page {
    background: #f0f2f5;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #333;
    padding-bottom: 80px; /* bottom nav clearance on mobile */
  }

  /* ── Hero / Top Bar ── */
  .fr-hero {
    background: #fff;
    padding: 60px 0 48px;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .fr-hero::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(72,187,120,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
  .fr-hero-badge {
    display: inline-block;
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 16px;
  }
  .fr-hero-title {
    font-size: 2.4rem;
    font-weight: 800;
    color: #111;
    letter-spacing: -0.03em;
    margin-bottom: 12px;
    line-height: 1.15;
  }
  .fr-hero-title span { color: #48bb78; }
  .fr-hero-sub {
    color: #555;
    font-size: 0.95rem;
    max-width: 500px;
    margin: 0 auto 28px;
    line-height: 1.65;
  }
  .fr-hero-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .fr-btn-primary {
    background: #48bb78;
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 11px 26px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    box-shadow: 0 4px 15px rgba(72,187,120,0.3);
    text-decoration: none;
  }
  .fr-btn-primary:hover { background: #38a169; transform: scale(1.04); color: #fff; }
  .fr-btn-secondary {
    background: transparent;
    color: #555;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 11px 26px;
    border-radius: 100px;
    border: 1px solid #ccc;
    cursor: pointer;
    transition: all 0.2s;
  }
  .fr-btn-secondary:hover { background: #f0f2f5; color: #222; border-color: #bbb; }
  .fr-btn-danger {
    background: transparent;
    color: #c53030;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 8px 18px;
    border-radius: 100px;
    border: 1px solid #feb2b2;
    cursor: pointer;
    transition: all 0.2s;
  }
  .fr-btn-danger:hover { background: #fed7d7; }

  /* ── Landing cards ── */
  .fr-landing-cards {
    display: flex;
    gap: 24px;
    justify-content: center;
    padding: 48px 20px;
    max-width: 860px;
    margin: 0 auto;
    flex-wrap: wrap;
  }
  .fr-lcard {
    flex: 1;
    min-width: 280px;
    max-width: 380px;
    background: #fff;
    border: 2px solid #e0e0e0;
    border-radius: 22px;
    padding: 40px 32px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
    position: relative;
    overflow: hidden;
  }
  .fr-lcard::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #48bb78, #38a169);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .fr-lcard:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(72,187,120,0.15);
    border-color: #48bb78;
  }
  .fr-lcard:hover::after { opacity: 1; }
  .fr-lcard-icon { font-size: 3rem; margin-bottom: 18px; line-height: 1; }
  .fr-lcard-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 10px;
  }
  .fr-lcard-sub {
    font-size: 0.875rem;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .fr-lcard-cta {
    display: inline-block;
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 9px 22px;
    border-radius: 100px;
    transition: background 0.2s;
  }
  .fr-lcard:hover .fr-lcard-cta { background: #48bb78; color: #fff; border-color: #48bb78; }

  .fr-browse-link {
    text-align: center;
    padding: 0 20px 48px;
  }

  /* ── Browse layout ── */
  .fr-browse-layout {
    display: flex;
    gap: 28px;
    max-width: 1160px;
    margin: 0 auto;
    padding: 32px 20px;
    align-items: flex-start;
  }

  /* Filter sidebar */
  .fr-filter-sidebar {
    width: 260px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 18px;
    padding: 24px 20px;
    position: sticky;
    top: 72px;
  }
  .fr-filter-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #888;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .fr-filter-clear {
    background: none;
    border: none;
    font-size: 0.75rem;
    color: #48bb78;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-transform: none;
    letter-spacing: 0;
  }
  .fr-filter-group { margin-bottom: 18px; }
  .fr-filter-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 7px;
  }
  .fr-filter-select,
  .fr-filter-input {
    width: 100%;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    color: #333;
    border-radius: 9px;
    padding: 8px 12px;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
    -webkit-appearance: none;
    appearance: none;
  }
  .fr-filter-select:focus,
  .fr-filter-input:focus { border-color: #48bb78; box-shadow: 0 0 0 2px rgba(72,187,120,0.1); }
  .fr-budget-row { display: flex; gap: 8px; }
  .fr-budget-row input { flex: 1; }

  /* Mobile filter drawer */
  .fr-mobile-filter-btn {
    display: none;
    width: 100%;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #333;
    cursor: pointer;
    margin-bottom: 16px;
    text-align: left;
    transition: border-color 0.2s;
  }
  .fr-mobile-filter-btn:hover { border-color: #48bb78; }
  .fr-filter-drawer {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    display: none;
  }
  .fr-filter-drawer.open { display: block; }

  /* Main content */
  .fr-main { flex: 1; min-width: 0; }
  .fr-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .fr-count-label { font-size: 0.85rem; color: #555; font-weight: 500; }
  .fr-count-label strong { color: #2e854b; font-weight: 700; }
  .fr-my-posts-toggle {
    background: none;
    border: 1px solid #e0e0e0;
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #555;
    cursor: pointer;
    transition: all 0.2s;
  }
  .fr-my-posts-toggle.active { background: #e6f4ea; border-color: #a8d5ba; color: #2e854b; }

  /* Post card grid */
  .fr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
    gap: 20px;
  }

  /* ── Post Card ── */
  .fr-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 18px;
    padding: 22px 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: transform 0.25s, box-shadow 0.25s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .fr-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #48bb78, #38a169);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .fr-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
  .fr-card:hover::before { opacity: 1; }
  .fr-card.fr-card--filled {
    border-color: #fbd38d;
    background: #fffaf0;
  }
  .fr-card.fr-card--filled::before {
    background: linear-gradient(90deg, #fc8181, #e53e3e);
    opacity: 1;
  }

  .fr-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .fr-card-badges { display: flex; flex-wrap: wrap; gap: 6px; }

  /* Badges */
  .fr-badge {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 100px;
    white-space: nowrap;
  }
  .fr-badge--room   { background: #ebf8ff; color: #2b6cb0; }
  .fr-badge--mate   { background: #faf5ff; color: #6b46c1; }
  .fr-badge--active { background: #e6f4ea; color: #2e854b; }
  .fr-badge--filled { background: #fed7d7; color: #c53030; }
  .fr-badge--owner  { background: #fef3c7; color: #92400e; }
  .fr-badge--neutral{ background: #f0f2f5; color: #555; border: 1px solid #e0e0e0; }

  .fr-card-location {
    font-size: 1rem;
    font-weight: 700;
    color: #222;
    margin: 0;
  }
  .fr-card-desc {
    font-size: 0.855rem;
    color: #555;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .fr-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .fr-tag {
    background: #f0f2f5;
    border: 1px solid #e0e0e0;
    color: #555;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 100px;
  }
  .fr-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    padding-top: 12px;
    border-top: 1px solid #e8e8e8;
    margin-top: auto;
  }
  .fr-creator { display: flex; align-items: center; gap: 8px; }
  .fr-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: #48bb78;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fr-creator-name { font-size: 0.8rem; color: #555; font-weight: 500; }
  .fr-budget { font-size: 0.82rem; font-weight: 700; color: #2e854b; }

  .fr-view-btn {
    width: 100%;
    padding: 9px;
    border-radius: 10px;
    font-size: 0.83rem;
    font-weight: 700;
    border: 1px solid #a8d5ba;
    background: #e6f4ea;
    color: #2e854b;
    cursor: pointer;
    transition: all 0.2s;
  }
  .fr-view-btn:hover { background: #48bb78; color: #fff; border-color: #48bb78; }

  /* ── Empty / Loading states ── */
  .fr-empty {
    text-align: center; padding: 80px 20px; color: #555;
    grid-column: 1 / -1;
  }
  .fr-empty-icon { font-size: 3.2rem; margin-bottom: 14px; }
  .fr-empty-title { font-size: 1.2rem; font-weight: 700; color: #222; margin-bottom: 8px; }
  .fr-spinner-wrap { text-align: center; padding: 80px 0; grid-column: 1 / -1; }

  /* ── Pagination ── */
  .fr-pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 32px;
    flex-wrap: wrap;
  }
  .fr-page-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1px solid #e0e0e0;
    background: #fff;
    color: #555;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .fr-page-btn:hover { border-color: #48bb78; color: #48bb78; }
  .fr-page-btn.active { background: #48bb78; border-color: #48bb78; color: #fff; }
  .fr-page-btn.arrow { width: auto; padding: 0 14px; border-radius: 100px; font-size: 0.82rem; }
  .fr-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Form ── */
  .fr-form-wrap {
    max-width: 680px;
    margin: 0 auto;
    padding: 32px 20px;
  }
  .fr-form-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 22px;
    padding: 36px;
  }
  .fr-form-title {
    font-size: 1.3rem;
    font-weight: 800;
    color: #111;
    margin: 0 0 28px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .fr-field { margin-bottom: 20px; }
  .fr-field label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 7px;
  }
  .fr-field input,
  .fr-field select,
  .fr-field textarea {
    width: 100%;
    background: #f8f9fa;
    border: 1px solid #ddd;
    color: #333;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
  }
  .fr-field input:focus,
  .fr-field select:focus,
  .fr-field textarea:focus {
    border-color: #48bb78;
    box-shadow: 0 0 0 2px rgba(72,187,120,0.1);
    background: #fff;
  }
  .fr-field textarea { resize: vertical; min-height: 100px; }
  .fr-field-row { display: flex; gap: 16px; }
  .fr-field-row .fr-field { flex: 1; }
  .fr-field-hint { font-size: 0.72rem; color: #888; margin-top: 5px; }
  .fr-field-error { font-size: 0.78rem; color: #c53030; margin-top: 5px; }
  .fr-form-error {
    background: #fed7d7;
    border: 1px solid #feb2b2;
    color: #c53030;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 0.85rem;
    margin-bottom: 20px;
  }
  .fr-divider { height: 1px; background: #e8e8e8; margin: 24px 0; }
  .fr-form-submit {
    width: 100%;
    background: #48bb78;
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 13px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    margin-top: 4px;
  }
  .fr-form-submit:hover:not(:disabled) { background: #38a169; transform: scale(1.01); }
  .fr-form-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .fr-form-cancel {
    width: 100%;
    background: transparent;
    color: #555;
    font-size: 0.88rem;
    padding: 11px;
    border-radius: 12px;
    border: 1px solid #ddd;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 10px;
  }
  .fr-form-cancel:hover { background: #f0f2f5; color: #222; }

  /* ── Detail View ── */
  .fr-detail-wrap {
    max-width: 760px;
    margin: 0 auto;
    padding: 32px 20px;
  }
  .fr-detail-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 22px;
    padding: 36px;
  }
  .fr-detail-header { margin-bottom: 24px; }
  .fr-detail-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 10px;
    line-height: 1.25;
  }
  .fr-detail-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .fr-detail-desc {
    font-size: 0.95rem;
    color: #444;
    line-height: 1.75;
    white-space: pre-wrap;
    margin-bottom: 0;
  }
  .fr-attrs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
    padding: 24px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin: 24px 0;
  }
  .fr-attr {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .fr-attr-label {
    font-size: 0.68rem;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .fr-attr-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #222;
  }
  .fr-poster-section {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 14px;
    margin-bottom: 20px;
  }
  .fr-poster-avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: #48bb78;
    color: #fff;
    font-size: 18px;
    font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fr-poster-name { font-weight: 700; color: #111; font-size: 1rem; margin-bottom: 2px; }
  .fr-poster-sub { font-size: 0.8rem; color: #666; }
  .fr-contact-box {
    padding: 16px;
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .fr-contact-label { font-size: 0.72rem; font-weight: 700; color: #2e854b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
  .fr-contact-value { font-size: 0.9rem; font-weight: 600; color: #1a5c35; }
  .fr-detail-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .fr-msg-btn {
    flex: 1;
    min-width: 140px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    background: #48bb78;
    color: #fff;
    transition: background 0.2s;
  }
  .fr-msg-btn:hover { background: #38a169; }
  .fr-edit-btn {
    flex: 1;
    min-width: 120px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 700;
    border: 1px solid #bee3f8;
    cursor: pointer;
    background: #ebf8ff;
    color: #2b6cb0;
    transition: background 0.2s;
  }
  .fr-edit-btn:hover { background: #bee3f8; }
  .fr-status-btn {
    flex: 1;
    min-width: 140px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 700;
    border: 1px solid #fbd38d;
    cursor: pointer;
    background: #fffaf0;
    color: #92400e;
    transition: background 0.2s;
  }
  .fr-status-btn:hover { background: #fbd38d; }

  /* ── Toast ── */
  .fr-toast {
    position: fixed;
    bottom: 88px;
    right: 20px;
    z-index: 9999;
    padding: 13px 20px;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    animation: frSlideIn 0.3s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    max-width: 320px;
  }
  .fr-toast.success { background: #e6f4ea; border: 1px solid #a8d5ba; color: #2e854b; }
  .fr-toast.error   { background: #fed7d7; border: 1px solid #feb2b2; color: #c53030; }
  @keyframes frSlideIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }

  /* ── Delete confirmation modal ── */
  .fr-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 4000;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .fr-modal {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 380px;
    padding: 36px 32px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.2);
    animation: frPop 0.28s cubic-bezier(0.34,1.56,0.64,1);
    text-align: center;
  }
  @keyframes frPop { from { opacity:0; transform: scale(0.88); } to { opacity:1; transform: scale(1); } }
  .fr-modal-icon { font-size: 2.8rem; margin-bottom: 16px; }
  .fr-modal-title { font-size: 1.1rem; font-weight: 800; color: #111; margin-bottom: 8px; }
  .fr-modal-sub { font-size: 0.875rem; color: #666; margin-bottom: 24px; }
  .fr-modal-actions { display: flex; gap: 10px; }
  .fr-modal-cancel-btn {
    flex: 1; padding: 11px;
    border-radius: 10px; border: 1px solid #ddd;
    background: #f0f2f5; color: #555; font-weight: 600;
    cursor: pointer; transition: background 0.2s; font-size: 0.88rem;
  }
  .fr-modal-cancel-btn:hover { background: #e0e0e0; }
  .fr-modal-delete-btn {
    flex: 1; padding: 11px;
    border-radius: 10px; border: none;
    background: #e53e3e; color: #fff; font-weight: 700;
    cursor: pointer; transition: background 0.2s; font-size: 0.88rem;
  }
  .fr-modal-delete-btn:hover { background: #c53030; }

  /* ── Back button ── */
  .fr-back-btn {
    background: none;
    border: none;
    color: #555;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 0;
    margin-bottom: 20px;
    transition: color 0.2s;
    font-family: inherit;
  }
  .fr-back-btn:hover { color: #48bb78; }

  /* ── Responsive ── */
  @media (max-width: 767px) {
    .fr-hero-title { font-size: 1.7rem; }
    .fr-hero { padding: 40px 0 32px; }
    .fr-lcard { min-width: 100%; max-width: 100%; }
    .fr-landing-cards { padding: 28px 16px; gap: 16px; }

    .fr-browse-layout { flex-direction: column; padding: 16px; gap: 0; }
    .fr-filter-sidebar { display: none; }
    .fr-mobile-filter-btn { display: block; }
    .fr-filter-drawer { display: none; }
    .fr-filter-drawer.open { display: block; }

    .fr-grid { grid-template-columns: 1fr; }

    .fr-form-wrap { padding: 16px 12px; }
    .fr-form-card { padding: 24px 18px; }
    .fr-field-row { flex-direction: column; gap: 0; }

    .fr-detail-wrap { padding: 16px 12px; }
    .fr-detail-card { padding: 22px 18px; }
    .fr-attrs { grid-template-columns: repeat(2, 1fr); }
    .fr-detail-actions { flex-direction: column; }
    .fr-detail-actions button { min-width: unset; }

    .fr-toast { right: 12px; left: 12px; max-width: unset; bottom: 80px; }

    .fr-budget-row { flex-direction: row; } /* keep side by side even on mobile */
  }
`;

/* ═══════════════════════════════════════════════════════════
   Constants / Helpers
═══════════════════════════════════════════════════════════ */
const TYPE_LABELS = {
    looking_for_room: 'Looking for Room',
    looking_for_roommate: 'Looking for Roommate',
};
const GENDER_LABELS = { male: 'Male', female: 'Female', any: 'Any' };
const ROOM_TYPE_LABELS = { single: 'Single', shared: 'Shared', sublet: 'Sublet', flat: 'Whole Flat' };
const SMOKER_LABELS = { smoker: 'Smoker', non_smoker: 'Non-Smoker', no_preference: 'No Preference' };
const GAMER_LABELS = { gamer: 'Gamer', mild_gamer: 'Mild Gamer', non_gamer: 'Non-Gamer', no_preference: 'No Preference' };

function formatBudget(min, max) {
    if (!min && !max) return 'Flexible';
    if (min && max) return `৳${min.toLocaleString()} – ৳${max.toLocaleString()}`;
    if (min) return `৳${min.toLocaleString()}+`;
    return `Up to ৳${max.toLocaleString()}`;
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY_FORM = {
    type: '',
    gender_preference: '',
    location: '',
    room_type: '',
    rent_budget_min: '',
    rent_budget_max: '',
    smoker: '',
    gamer_type: '',
    move_in_date: '',
    description: '',
    contact_info: '',
};

const EMPTY_FILTERS = {
    type: '', gender: '', location: '', room_type: '',
    budget_min: '', budget_max: '', smoker: '', gamer: '', status: 'active',
};

/* ═══════════════════════════════════════════════════════════
   Sub-components
═══════════════════════════════════════════════════════════ */

/* ── Filter Panel (shared between sidebar and mobile drawer) ── */
function FilterPanel({ filters, onChange, onClear }) {
    return (
        <>
            <div className="fr-filter-title">
                Filters
                <button className="fr-filter-clear" onClick={onClear}>Clear all</button>
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Post Type</label>
                <select className="fr-filter-select" value={filters.type} onChange={e => onChange('type', e.target.value)}>
                    <option value="">All Types</option>
                    <option value="looking_for_room">Looking for Room</option>
                    <option value="looking_for_roommate">Looking for Roommate</option>
                </select>
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Gender Preference</label>
                <select className="fr-filter-select" value={filters.gender} onChange={e => onChange('gender', e.target.value)}>
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Location / Area</label>
                <input
                    className="fr-filter-input"
                    type="text"
                    placeholder="e.g. Uttara, Mirpur…"
                    value={filters.location}
                    onChange={e => onChange('location', e.target.value)}
                />
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Room Type</label>
                <select className="fr-filter-select" value={filters.room_type} onChange={e => onChange('room_type', e.target.value)}>
                    <option value="">All</option>
                    <option value="single">Single</option>
                    <option value="shared">Shared</option>
                    <option value="sublet">Sublet</option>
                    <option value="flat">Whole Flat</option>
                </select>
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Budget (BDT)</label>
                <div className="fr-budget-row">
                    <input
                        className="fr-filter-input"
                        type="number"
                        placeholder="Min"
                        min="0"
                        value={filters.budget_min}
                        onChange={e => onChange('budget_min', e.target.value)}
                    />
                    <input
                        className="fr-filter-input"
                        type="number"
                        placeholder="Max"
                        min="0"
                        value={filters.budget_max}
                        onChange={e => onChange('budget_max', e.target.value)}
                    />
                </div>
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Smoker Preference</label>
                <select className="fr-filter-select" value={filters.smoker} onChange={e => onChange('smoker', e.target.value)}>
                    <option value="">Any</option>
                    <option value="smoker">Smoker</option>
                    <option value="non_smoker">Non-Smoker</option>
                    <option value="no_preference">No Preference</option>
                </select>
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Gaming Habit</label>
                <select className="fr-filter-select" value={filters.gamer} onChange={e => onChange('gamer', e.target.value)}>
                    <option value="">Any</option>
                    <option value="gamer">Gamer</option>
                    <option value="mild_gamer">Mild Gamer</option>
                    <option value="non_gamer">Non-Gamer</option>
                    <option value="no_preference">No Preference</option>
                </select>
            </div>

            <div className="fr-filter-group">
                <label className="fr-filter-label">Status</label>
                <select className="fr-filter-select" value={filters.status} onChange={e => onChange('status', e.target.value)}>
                    <option value="active">Active Only</option>
                    <option value="filled">Filled Only</option>
                    <option value="all">All</option>
                </select>
            </div>
        </>
    );
}

/* ── Post Card ── */
function PostCard({ post, currentUserId, onView }) {
    const isOwner = Number(post.user_id) === Number(currentUserId);
    const isFilled = post.status === 'filled';
    const isRoomSeeker = post.type === 'looking_for_room';
    const creatorName = post.user?.name ?? 'Unknown';

    return (
        <div className={`fr-card${isFilled ? ' fr-card--filled' : ''}`}>
            <div className="fr-card-top">
                <div className="fr-card-badges">
                    <span className={`fr-badge ${isRoomSeeker ? 'fr-badge--room' : 'fr-badge--mate'}`}>
                        {isRoomSeeker ? '🔍 Need Room' : '🏠 Have Room'}
                    </span>
                    <span className={`fr-badge ${isFilled ? 'fr-badge--filled' : 'fr-badge--active'}`}>
                        {isFilled ? 'Filled' : 'Active'}
                    </span>
                    {isOwner && <span className="fr-badge fr-badge--owner">Your Post</span>}
                </div>
            </div>

            <p className="fr-card-location">📍 {post.location}</p>
            <p className="fr-card-desc">{post.description}</p>

            <div className="fr-tags">
                <span className="fr-tag">{ROOM_TYPE_LABELS[post.room_type] ?? post.room_type}</span>
                <span className="fr-tag">{GENDER_LABELS[post.gender_preference] ?? post.gender_preference}</span>
                <span className="fr-tag">{SMOKER_LABELS[post.smoker] ?? post.smoker}</span>
                <span className="fr-tag">{GAMER_LABELS[post.gamer_type] ?? post.gamer_type}</span>
            </div>

            <div className="fr-card-meta">
                <div className="fr-creator">
                    <div className="fr-avatar">{creatorName.charAt(0).toUpperCase()}</div>
                    <span className="fr-creator-name">{creatorName}</span>
                </div>
                <span className="fr-budget">{formatBudget(post.rent_budget_min, post.rent_budget_max)}</span>
            </div>

            <button className="fr-view-btn" onClick={() => onView(post)}>
                View Details →
            </button>
        </div>
    );
}

/* ── Room Post Form ── */
function RoomPostForm({ initialData, editId, onDone, onCancel }) {
    const [form, setForm] = useState({ ...EMPTY_FORM, ...initialData });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isEditing = !!editId;

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
        setApiError('');
    }

    function validate() {
        const errs = {};
        if (!form.type) errs.type = 'Required.';
        if (!form.gender_preference) errs.gender_preference = 'Required.';
        if (!form.location.trim()) errs.location = 'Required.';
        if (!form.room_type) errs.room_type = 'Required.';
        if (!form.smoker) errs.smoker = 'Required.';
        if (!form.gamer_type) errs.gamer_type = 'Required.';
        if (!form.description.trim()) errs.description = 'Required.';
        else if (form.description.trim().length < 20) errs.description = 'Minimum 20 characters.';
        else if (form.description.trim().length > 1000) errs.description = 'Maximum 1000 characters.';
        if (!form.contact_info.trim()) errs.contact_info = 'Required.';
        if (form.rent_budget_min && form.rent_budget_max) {
            if (Number(form.rent_budget_min) > Number(form.rent_budget_max)) {
                errs.rent_budget_max = 'Max must be ≥ Min.';
            }
        }
        if (form.move_in_date) {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (new Date(form.move_in_date) < today) errs.move_in_date = 'Must be today or later.';
        }
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSubmitting(true);
        try {
            const payload = {
                ...form,
                rent_budget_min: form.rent_budget_min === '' ? null : Number(form.rent_budget_min),
                rent_budget_max: form.rent_budget_max === '' ? null : Number(form.rent_budget_max),
                move_in_date: form.move_in_date || null,
            };

            let res;
            if (isEditing) {
                res = await api.put(`/room-posts/${editId}`, payload);
            } else {
                res = await api.post('/room-posts', payload);
            }
            const post = res.data?.data ?? res.data;
            onDone(post, isEditing ? 'updated' : 'created');
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                // Laravel validation errors
                const mapped = {};
                Object.entries(data.errors).forEach(([k, msgs]) => { mapped[k] = msgs[0]; });
                setErrors(mapped);
            } else {
                setApiError(data?.message ?? 'Something went wrong. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fr-form-wrap">
            <button className="fr-back-btn" onClick={onCancel}>← Back</button>
            <div className="fr-form-card">
                <h2 className="fr-form-title">
                    {isEditing ? '✏️ Edit Room Post' : '📝 Create Room Post'}
                </h2>

                {apiError && <div className="fr-form-error">⚠ {apiError}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    {/* Post Type */}
                    <div className="fr-field">
                        <label htmlFor="fr-type">Post Type *</label>
                        <select id="fr-type" name="type" value={form.type} onChange={handleChange}>
                            <option value="">— Select —</option>
                            <option value="looking_for_room">🔍 I'm Looking for a Room</option>
                            <option value="looking_for_roommate">🏠 I Have a Room / Need a Roommate</option>
                        </select>
                        {errors.type && <div className="fr-field-error">{errors.type}</div>}
                    </div>

                    {/* Location + Room Type */}
                    <div className="fr-field-row">
                        <div className="fr-field">
                            <label htmlFor="fr-location">Location / Area *</label>
                            <input
                                id="fr-location"
                                name="location"
                                type="text"
                                placeholder="e.g. Uttara, Mirpur, Dhanmondi…"
                                value={form.location}
                                onChange={handleChange}
                            />
                            {errors.location && <div className="fr-field-error">{errors.location}</div>}
                        </div>
                        <div className="fr-field">
                            <label htmlFor="fr-room-type">Room Type *</label>
                            <select id="fr-room-type" name="room_type" value={form.room_type} onChange={handleChange}>
                                <option value="">— Select —</option>
                                <option value="single">Single Room</option>
                                <option value="shared">Shared Room</option>
                                <option value="sublet">Sublet</option>
                                <option value="flat">Whole Flat</option>
                            </select>
                            {errors.room_type && <div className="fr-field-error">{errors.room_type}</div>}
                        </div>
                    </div>

                    {/* Gender + Move-in */}
                    <div className="fr-field-row">
                        <div className="fr-field">
                            <label htmlFor="fr-gender">Gender Preference *</label>
                            <select id="fr-gender" name="gender_preference" value={form.gender_preference} onChange={handleChange}>
                                <option value="">— Select —</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="any">Any</option>
                            </select>
                            {errors.gender_preference && <div className="fr-field-error">{errors.gender_preference}</div>}
                        </div>
                        <div className="fr-field">
                            <label htmlFor="fr-move-in">Move-in Date</label>
                            <input
                                id="fr-move-in"
                                name="move_in_date"
                                type="date"
                                value={form.move_in_date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {errors.move_in_date && <div className="fr-field-error">{errors.move_in_date}</div>}
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="fr-field">
                        <label>Rent Budget (BDT) — optional</label>
                        <div className="fr-budget-row">
                            <input
                                name="rent_budget_min"
                                type="number"
                                placeholder="Min"
                                min="0"
                                value={form.rent_budget_min}
                                onChange={handleChange}
                            />
                            <input
                                name="rent_budget_max"
                                type="number"
                                placeholder="Max"
                                min="0"
                                value={form.rent_budget_max}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.rent_budget_max && <div className="fr-field-error">{errors.rent_budget_max}</div>}
                    </div>

                    {/* Lifestyle */}
                    <div className="fr-field-row">
                        <div className="fr-field">
                            <label htmlFor="fr-smoker">Smoker *</label>
                            <select id="fr-smoker" name="smoker" value={form.smoker} onChange={handleChange}>
                                <option value="">— Select —</option>
                                <option value="smoker">Smoker</option>
                                <option value="non_smoker">Non-Smoker</option>
                                <option value="no_preference">No Preference</option>
                            </select>
                            {errors.smoker && <div className="fr-field-error">{errors.smoker}</div>}
                        </div>
                        <div className="fr-field">
                            <label htmlFor="fr-gamer">Gaming Habit *</label>
                            <select id="fr-gamer" name="gamer_type" value={form.gamer_type} onChange={handleChange}>
                                <option value="">— Select —</option>
                                <option value="gamer">Gamer 🎮</option>
                                <option value="mild_gamer">Mild Gamer</option>
                                <option value="non_gamer">Non-Gamer</option>
                                <option value="no_preference">No Preference</option>
                            </select>
                            {errors.gamer_type && <div className="fr-field-error">{errors.gamer_type}</div>}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="fr-field">
                        <label htmlFor="fr-desc">Description *</label>
                        <textarea
                            id="fr-desc"
                            name="description"
                            placeholder="Tell others about yourself, your lifestyle preferences, what you're looking for in a room or roommate…"
                            value={form.description}
                            onChange={handleChange}
                            rows={5}
                        />
                        <div className="fr-field-hint">
                            {form.description.length}/1000 characters (min 20)
                        </div>
                        {errors.description && <div className="fr-field-error">{errors.description}</div>}
                    </div>

                    {/* Contact */}
                    <div className="fr-field">
                        <label htmlFor="fr-contact">Contact Info *</label>
                        <input
                            id="fr-contact"
                            name="contact_info"
                            type="text"
                            placeholder="Phone, WhatsApp, email, or Telegram…"
                            value={form.contact_info}
                            onChange={handleChange}
                        />
                        <div className="fr-field-hint">Visible only to logged-in users.</div>
                        {errors.contact_info && <div className="fr-field-error">{errors.contact_info}</div>}
                    </div>

                    <div className="fr-divider" />
                    <button className="fr-form-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Saving…' : isEditing ? '💾 Save Changes' : '🚀 Post Now'}
                    </button>
                    <button type="button" className="fr-form-cancel" onClick={onCancel}>Cancel</button>
                </form>
            </div>
        </div>
    );
}

/* ── Post Detail ── */
function PostDetail({ post: initialPost, currentUserId, onBack, onEdit, onDeleted, onChatStart }) {
    const [post, setPost] = useState(initialPost);
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(false);
    const [startingChat, setStartingChat] = useState(false);

    const isOwner = Number(post.user_id) === Number(currentUserId);
    const isFilled = post.status === 'filled';
    const isRoomSeeker = post.type === 'looking_for_room';

    async function handleDelete() {
        setDeleting(true);
        try {
            await api.delete(`/room-posts/${post.id}`);
            onDeleted();
        } catch {
            alert('Could not delete post. Please try again.');
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    }

    async function handleToggleStatus() {
        setTogglingStatus(true);
        try {
            const res = await api.patch(`/room-posts/${post.id}/status`);
            setPost(res.data?.data ?? res.data);
        } catch {
            alert('Could not update status. Please try again.');
        } finally {
            setTogglingStatus(false);
        }
    }

    async function handleMessage() {
        setStartingChat(true);
        try {
            await onChatStart(post.user_id);
        } finally {
            setStartingChat(false);
        }
    }

    return (
        <div className="fr-detail-wrap">
            <button className="fr-back-btn" onClick={onBack}>← Back to Browse</button>

            {showConfirm && (
                <div className="fr-backdrop" onClick={e => e.target === e.currentTarget && setShowConfirm(false)}>
                    <div className="fr-modal">
                        <div className="fr-modal-icon">⚠️</div>
                        <h3 className="fr-modal-title">Delete Post?</h3>
                        <p className="fr-modal-sub">This action cannot be undone. Your post will be permanently removed.</p>
                        <div className="fr-modal-actions">
                            <button className="fr-modal-cancel-btn" onClick={() => setShowConfirm(false)}>Cancel</button>
                            <button className="fr-modal-delete-btn" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fr-detail-card">
                {/* Header */}
                <div className="fr-detail-header">
                    <div className="fr-detail-badges">
                        <span className={`fr-badge ${isRoomSeeker ? 'fr-badge--room' : 'fr-badge--mate'}`}>
                            {isRoomSeeker ? '🔍 Looking for Room' : '🏠 Looking for Roommate'}
                        </span>
                        <span className={`fr-badge ${isFilled ? 'fr-badge--filled' : 'fr-badge--active'}`}>
                            {isFilled ? '✕ Filled' : '✓ Active'}
                        </span>
                    </div>
                    <h1 className="fr-detail-title">📍 {post.location}</h1>
                    <p className="fr-detail-desc">{post.description}</p>
                </div>

                {/* Attributes */}
                <div className="fr-attrs">
                    <div className="fr-attr">
                        <span className="fr-attr-label">Room Type</span>
                        <span className="fr-attr-value">{ROOM_TYPE_LABELS[post.room_type] ?? post.room_type}</span>
                    </div>
                    <div className="fr-attr">
                        <span className="fr-attr-label">Budget</span>
                        <span className="fr-attr-value">{formatBudget(post.rent_budget_min, post.rent_budget_max)}</span>
                    </div>
                    <div className="fr-attr">
                        <span className="fr-attr-label">Gender Preference</span>
                        <span className="fr-attr-value">{GENDER_LABELS[post.gender_preference] ?? post.gender_preference}</span>
                    </div>
                    <div className="fr-attr">
                        <span className="fr-attr-label">Move-in Date</span>
                        <span className="fr-attr-value">{formatDate(post.move_in_date)}</span>
                    </div>
                    <div className="fr-attr">
                        <span className="fr-attr-label">Smoker</span>
                        <span className="fr-attr-value">{SMOKER_LABELS[post.smoker] ?? post.smoker}</span>
                    </div>
                    <div className="fr-attr">
                        <span className="fr-attr-label">Gaming</span>
                        <span className="fr-attr-value">{GAMER_LABELS[post.gamer_type] ?? post.gamer_type}</span>
                    </div>
                    <div className="fr-attr">
                        <span className="fr-attr-label">Posted</span>
                        <span className="fr-attr-value">{formatDate(post.created_at)}</span>
                    </div>
                </div>

                {/* Poster */}
                <div className="fr-poster-section">
                    <div className="fr-poster-avatar">
                        {(post.user?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="fr-poster-name">{post.user?.name ?? 'Unknown User'}</div>
                        <div className="fr-poster-sub">Posted this listing</div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="fr-contact-box">
                    <div className="fr-contact-label">📞 Contact</div>
                    <div className="fr-contact-value">{post.contact_info}</div>
                </div>

                {/* Actions */}
                <div className="fr-detail-actions">
                    {isOwner ? (
                        <>
                            <button className="fr-edit-btn" onClick={() => onEdit(post)}>
                                ✏️ Edit Post
                            </button>
                            <button
                                className="fr-status-btn"
                                onClick={handleToggleStatus}
                                disabled={togglingStatus}
                            >
                                {togglingStatus ? 'Updating…' : isFilled ? '✓ Mark as Active' : '✕ Mark as Filled'}
                            </button>
                            <button
                                className="fr-btn-danger"
                                onClick={() => setShowConfirm(true)}
                            >
                                🗑 Delete
                            </button>
                        </>
                    ) : (
                        <button
                            className="fr-msg-btn"
                            onClick={handleMessage}
                            disabled={startingChat}
                        >
                            {startingChat ? 'Opening chat…' : '💬 Message'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Main FindRoom Page
═══════════════════════════════════════════════════════════ */
export default function FindRoom() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const currentUserId = user?.id ?? Number(localStorage.getItem('user_id') ?? 0);

    // View state: 'landing' | 'browse' | 'create' | 'edit' | 'detail'
    const [view, setView] = useState('landing');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [selectedPost, setSelectedPost] = useState(null);
    const [editPost, setEditPost] = useState(null);
    const [createType, setCreateType] = useState('');
    const [toast, setToast] = useState(null);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [myPostsOnly, setMyPostsOnly] = useState(false);

    /* ── Fetch posts ── */
    const fetchPosts = useCallback(async (page = 1, overrideFilters) => {
        setLoading(true);
        try {
            const activeFilters = overrideFilters ?? filters;
            const params = new URLSearchParams();
            Object.entries(activeFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
            params.set('page', page);

            const res = await api.get(`/room-posts?${params.toString()}`);
            const data = res.data;
            setPosts(data.data ?? []);
            setPagination({
                current_page: data.current_page ?? 1,
                last_page: data.last_page ?? 1,
                total: data.total ?? 0,
            });
        } catch (err) {
            showToast('Failed to load posts. Please refresh.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (view === 'browse') {
            fetchPosts(1);
        }
    }, [view]);

    /* ── Toast helper ── */
    function showToast(msg, type = 'success') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }

    /* ── Filter helpers ── */
    function handleFilterChange(key, value) {
        const updated = { ...filters, [key]: value };
        setFilters(updated);
        // Debounce-free: fetch immediately on dropdown changes, debounce text inputs
        if (key !== 'location' && key !== 'budget_min' && key !== 'budget_max') {
            fetchPosts(1, updated);
        }
    }

    function applyTextFilters() {
        fetchPosts(1, filters);
    }

    function clearFilters() {
        setFilters(EMPTY_FILTERS);
        fetchPosts(1, EMPTY_FILTERS);
    }

    /* ── Navigate to chat ── */
    async function handleChatStart(targetUserId) {
        try {
            const res = await api.post('/chat/conversations/start', { user_id: targetUserId });
            navigate('/chat');
        } catch (err) {
            showToast('Could not open chat. Please try again.', 'error');
        }
    }

    /* ── Filtered posts (my-posts toggle is client-side) ── */
    const displayedPosts = myPostsOnly
        ? posts.filter(p => Number(p.user_id) === Number(currentUserId))
        : posts;

    /* ── Render ── */
    return (
        <div className="fr-page">
            <style>{CSS}</style>

            {toast && (
                <div className={`fr-toast ${toast.type}`}>
                    {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.msg}
                </div>
            )}

            {/* ══ LANDING ══ */}
            {view === 'landing' && (
                <>
                    <section className="fr-hero">
                        <div className="container">
                            <div className="fr-hero-badge">🏠 Find Room — Austify</div>
                            <h1 className="fr-hero-title">
                                Find Your Perfect<br /><span>Room or Roommate</span>
                            </h1>
                            <p className="fr-hero-sub">
                                Connect with fellow AUST students looking for rooms or roommates across Dhaka.
                                Filter by location, budget, lifestyle, and more.
                            </p>
                            <div className="fr-hero-actions">
                                <button className="fr-btn-primary" onClick={() => { setView('browse'); }}>
                                    Browse All Listings
                                </button>
                                <button className="fr-btn-secondary" onClick={() => { setCreateType(''); setView('create'); }}>
                                    + Post a Listing
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="fr-landing-cards">
                        <div className="fr-lcard" onClick={() => { setCreateType('looking_for_room'); setView('create'); }}>
                            <div className="fr-lcard-icon">🔍</div>
                            <h2 className="fr-lcard-title">I Need a Room</h2>
                            <p className="fr-lcard-sub">
                                Looking for a place to stay? Post your requirements and let roommates find you.
                            </p>
                            <span className="fr-lcard-cta">Post as Room Seeker →</span>
                        </div>

                        <div className="fr-lcard" onClick={() => { setCreateType('looking_for_roommate'); setView('create'); }}>
                            <div className="fr-lcard-icon">🏠</div>
                            <h2 className="fr-lcard-title">I Have a Room</h2>
                            <p className="fr-lcard-sub">
                                Have a spare room or looking for someone to share your flat? Find the right match.
                            </p>
                            <span className="fr-lcard-cta">Post as Room Provider →</span>
                        </div>
                    </div>
                </>
            )}

            {/* ══ BROWSE ══ */}
            {view === 'browse' && (
                <>
                    <section className="fr-hero" style={{ padding: '36px 0 28px', textAlign: 'left' }}>
                        <div className="container">
                            <button className="fr-back-btn" onClick={() => setView('landing')}>← Home</button>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <h1 className="fr-hero-title" style={{ fontSize: '1.7rem', marginBottom: 4 }}>
                                        Browse Listings
                                    </h1>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                        {pagination.total} listing{pagination.total !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                                <button className="fr-btn-primary" onClick={() => { setCreateType(''); setView('create'); }}>
                                    + Post a Listing
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="fr-browse-layout">
                        {/* Desktop sidebar */}
                        <aside className="fr-filter-sidebar">
                            <FilterPanel
                                filters={filters}
                                onChange={handleFilterChange}
                                onClear={clearFilters}
                            />
                            <button
                                className="fr-btn-primary"
                                style={{ width: '100%', marginTop: 8, borderRadius: 10, fontSize: '0.85rem' }}
                                onClick={() => applyTextFilters()}
                            >
                                Apply Filters
                            </button>
                        </aside>

                        {/* Main */}
                        <main className="fr-main">
                            {/* Mobile filter toggle */}
                            <button
                                className="fr-mobile-filter-btn"
                                onClick={() => setShowMobileFilter(o => !o)}
                            >
                                {showMobileFilter ? '▲ Hide Filters' : '▼ Show Filters'} {Object.values(filters).filter(Boolean).length > 1 ? `(${Object.values(filters).filter(v => v && v !== 'active').length} active)` : ''}
                            </button>

                            <div className={`fr-filter-drawer${showMobileFilter ? ' open' : ''}`}>
                                <FilterPanel
                                    filters={filters}
                                    onChange={handleFilterChange}
                                    onClear={clearFilters}
                                />
                                <button
                                    className="fr-btn-primary"
                                    style={{ width: '100%', marginTop: 8, borderRadius: 10, fontSize: '0.85rem' }}
                                    onClick={() => { applyTextFilters(); setShowMobileFilter(false); }}
                                >
                                    Apply Filters
                                </button>
                            </div>

                            {/* Toolbar */}
                            <div className="fr-toolbar">
                                <span className="fr-count-label">
                                    <strong>{pagination.total}</strong> listing{pagination.total !== 1 ? 's' : ''}
                                </span>
                                <button
                                    className={`fr-my-posts-toggle${myPostsOnly ? ' active' : ''}`}
                                    onClick={() => setMyPostsOnly(o => !o)}
                                >
                                    {myPostsOnly ? '✓ My Posts' : 'My Posts'}
                                </button>
                            </div>

                            {/* Grid */}
                            <div className="fr-grid">
                                {loading ? (
                                    <div className="fr-spinner-wrap">
                                        <div className="spinner-border text-success" role="status" />
                                        <p style={{ marginTop: 16, color: '#555', fontWeight: 600 }}>Loading…</p>
                                    </div>
                                ) : displayedPosts.length === 0 ? (
                                    <div className="fr-empty">
                                        <div className="fr-empty-icon">🏠</div>
                                        <div className="fr-empty-title">No listings found</div>
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 20 }}>
                                            {myPostsOnly ? "You haven't posted any listings yet." : 'Try adjusting your filters or be the first to post!'}
                                        </p>
                                        <button className="fr-btn-primary" onClick={() => { setCreateType(''); setView('create'); }}>
                                            + Post a Listing
                                        </button>
                                    </div>
                                ) : (
                                    displayedPosts.map(post => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            currentUserId={currentUserId}
                                            onView={(p) => { setSelectedPost(p); setView('detail'); }}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && pagination.last_page > 1 && (
                                <div className="fr-pagination">
                                    <button
                                        className="fr-page-btn arrow"
                                        disabled={pagination.current_page === 1}
                                        onClick={() => fetchPosts(pagination.current_page - 1)}
                                    >
                                        ← Prev
                                    </button>
                                    {[...Array(pagination.last_page)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`fr-page-btn${pagination.current_page === i + 1 ? ' active' : ''}`}
                                            onClick={() => fetchPosts(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="fr-page-btn arrow"
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={() => fetchPosts(pagination.current_page + 1)}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </>
            )}

            {/* ══ CREATE / EDIT FORM ══ */}
            {(view === 'create' || view === 'edit') && (
                <RoomPostForm
                    initialData={view === 'edit' && editPost ? {
                        type: editPost.type,
                        gender_preference: editPost.gender_preference,
                        location: editPost.location,
                        room_type: editPost.room_type,
                        rent_budget_min: editPost.rent_budget_min ?? '',
                        rent_budget_max: editPost.rent_budget_max ?? '',
                        smoker: editPost.smoker,
                        gamer_type: editPost.gamer_type,
                        move_in_date: editPost.move_in_date
                            ? new Date(editPost.move_in_date).toISOString().split('T')[0]
                            : '',
                        description: editPost.description,
                        contact_info: editPost.contact_info,
                    } : { ...EMPTY_FORM, type: createType }}
                    editId={view === 'edit' ? editPost?.id : null}
                    onDone={(post, action) => {
                        showToast(action === 'created' ? 'Post created! 🎉' : 'Post updated! ✓');
                        setSelectedPost(post);
                        setView('detail');
                    }}
                    onCancel={() => setView(view === 'edit' && selectedPost ? 'detail' : 'browse')}
                />
            )}

            {/* ══ DETAIL ══ */}
            {view === 'detail' && selectedPost && (
                <PostDetail
                    post={selectedPost}
                    currentUserId={currentUserId}
                    onBack={() => setView('browse')}
                    onEdit={(p) => { setEditPost(p); setView('edit'); }}
                    onDeleted={() => { showToast('Post deleted.'); setView('browse'); fetchPosts(1); }}
                    onChatStart={handleChatStart}
                />
            )}
        </div>
    );
}

// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Modal from '../components/common/Modal';
import StatsBox from '../components/admin/StatsBox';
import FeaturedSlotCard from '../components/admin/FeaturedSlotCard';
import ReviewCard from '../components/admin/ReviewCard';
import { reviewsMock } from '../utils/constants';
import { escapeHtml } from '../utils/helpers';
import '../assets/css/dashboard.css';

/* ── localStorage helpers ── */
function getStoredProviders() {
  try { return JSON.parse(localStorage.getItem('sah_providers') || '[]'); }
  catch { return []; }
}
function saveStoredProviders(list) {
  try { localStorage.setItem('sah_providers', JSON.stringify(list)); }
  catch {}
}
function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem('sah_users') || '[]'); }
  catch { return []; }
}
function getAuthLogs() {
  try { return JSON.parse(localStorage.getItem('sah_auth_logs') || '[]'); }
  catch { return []; }
}
function getFeaturedSlots() {
  try {
    const s = localStorage.getItem('sah_featured_slots');
    if (s) {
      const slots = JSON.parse(s);
      // Ensure we always have exactly 4 slots
      while (slots.length < 4) {
        slots.push({ 
          id: slots.length + 1, 
          provider: null, 
          providerId: null, 
          addedDaysAgo: 0, 
          daysRemaining: 0 
        });
      }
      return slots.slice(0, 4); // Only return first 4
    }
    // default 4 empty slots
    return [
      { id: 1, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 },
      { id: 2, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 },
      { id: 3, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 },
      { id: 4, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 },
    ];
  } catch { 
    return [
      { id:1,provider:null,providerId:null,addedDaysAgo:0,daysRemaining:0 },
      { id:2,provider:null,providerId:null,addedDaysAgo:0,daysRemaining:0 },
      { id:3,provider:null,providerId:null,addedDaysAgo:0,daysRemaining:0 },
      { id:4,provider:null,providerId:null,addedDaysAgo:0,daysRemaining:0 }
    ]; 
  }
}
function saveFeaturedSlots(slots) {
  try { localStorage.setItem('sah_featured_slots', JSON.stringify(slots)); }
  catch {}
}
const MAX_FEATURED_SLOTS = 4;

/* ── Inline CSS ── */
const ADMIN_CSS = `
  /* ── Smaller filter-style stats cards ── */
  .admin-stats {
    display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .stat-filter-card {
    flex: 1; min-width: 140px; padding: 12px 16px; 
    background: #fff; border: 2px solid #e5e0d8; border-radius: 10px;
    cursor: pointer; transition: all 0.15s;
    display: flex; flex-direction: column; gap: 6px;
  }
  .stat-filter-card:hover {
    border-color: #c9621a; transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201,98,26,0.15);
  }
  .stat-filter-card.active {
    border-color: #c9621a; background: #fff8f2;
    box-shadow: 0 0 0 3px rgba(201,98,26,0.1);
  }
  .stat-filter-value {
    font-size: 1.6rem; font-weight: 800; color: #c9621a;
    font-family: 'Playfair Display', serif;
  }
  .stat-filter-label {
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; color: #888;
  }

  /* ── Expand rows ── */
  .adm-expand-row {
    border: 1px solid #e5e0d8; border-radius: 12px; overflow: hidden;
    margin-bottom: 12px; background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05); transition: box-shadow 0.15s;
  }
  .adm-expand-row:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.10); }
  .adm-expand-row.expanded { border-color: #c9621a; box-shadow: 0 4px 20px rgba(201,98,26,0.12); }

  .adm-row-header {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; cursor: pointer; background: #faf9f7;
    transition: background 0.12s; user-select: none;
  }
  .adm-row-header:hover { background: #f5f0e8; }
  .adm-expand-row.expanded .adm-row-header { background: #fff3e8; border-bottom: 1px solid #f0d4b8; }

  .adm-avatar {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #c9621a, #e07a35);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 1rem; font-weight: 800;
    flex-shrink: 0; box-shadow: 0 2px 8px rgba(201,98,26,0.3);
  }
  .adm-avatar.user-av { background: linear-gradient(135deg, #6366f1, #818cf8); }
  .adm-avatar.provider-av { background: linear-gradient(135deg, #c9621a, #e07a35); }
  .adm-avatar.admin-av  { background: linear-gradient(135deg, #1a1a1a, #555); }

  .adm-row-info { flex: 1; min-width: 0; }
  .adm-row-name { font-size: 0.92rem; font-weight: 700; color: #1a1a1a; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .adm-row-meta { font-size: 0.75rem; color: #888; margin-top: 2px; }

  .adm-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: 700;
  }
  .adm-badge.pending  { background: #fef3c7; color: #92400e; }
  .adm-badge.approved { background: #d1fae5; color: #065f46; }
  .adm-badge.rejected { background: #fee2e2; color: #991b1b; }
  .adm-badge.featured { background: #fffbeb; color: #d97706; }
  .adm-badge.pro      { background: #dbeafe; color: #1e3a8a; }
  .adm-badge.user     { background: #ede9fe; color: #5b21b6; }

  .adm-expand-icon { color: #aaa; font-size: 0.8rem; transition: transform 0.2s; flex-shrink: 0; }
  .adm-expand-row.expanded .adm-expand-icon { transform: rotate(180deg); color: #c9621a; }

  .adm-row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .adm-btn-approve {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 7px; cursor: pointer; font-size: 0.8rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #d1fae5; color: #065f46; transition: all 0.15s;
  }
  .adm-btn-approve:hover { background: #a7f3d0; }

  .adm-btn-reject {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 7px; cursor: pointer; font-size: 0.8rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #fee2e2; color: #991b1b; transition: all 0.15s;
  }
  .adm-btn-reject:hover { background: #fecaca; }

  /* ── Expand detail panel ── */
  .adm-detail-panel { padding: 0; animation: adm-slide-in 0.2s ease; }
  @keyframes adm-slide-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .adm-detail-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
    border-bottom: 1px solid #f0ece5;
  }
  .adm-detail-section { padding: 18px 20px; border-right: 1px solid #f0ece5; }
  .adm-detail-section:last-child { border-right: none; }
  .adm-detail-section-title {
    font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.9px;
    color: #c9621a; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
  }
  .adm-detail-field { margin-bottom: 10px; }
  .adm-detail-label { font-size: 0.66rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #aaa; margin-bottom: 3px; }
  .adm-detail-val { font-size: 0.83rem; color: #1a1a1a; font-weight: 500; word-break: break-word; }
  .adm-detail-val.empty { color: #bbb; font-style: italic; }

  .adm-detail-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
  .adm-detail-tag {
    padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
    background: #fef3e8; color: #c9621a; border: 1px solid #f0c89a;
  }

  .adm-detail-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; background: #faf9f7; flex-wrap: wrap; gap: 12px;
  }
  .adm-detail-footer-note { font-size: 0.75rem; color: #888; display: flex; align-items: center; gap: 6px; }

  /* ── All listings ── */
  .adm-listing-row {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 18px; border: 1px solid #e5e0d8; border-radius: 10px;
    background: #fff; margin-bottom: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: box-shadow 0.15s;
  }
  .adm-listing-row:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.08); }

  .adm-promote-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 6px; cursor: pointer; font-size: 0.77rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #dbeafe; color: #1e40af; transition: all 0.15s;
  }
  .adm-promote-btn:hover { background: #bfdbfe; }
  .adm-demote-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 6px; cursor: pointer; font-size: 0.77rem;
    font-weight: 700; border: none; font-family: inherit;
    background: #f3f4f6; color: #4b5563; transition: all 0.15s;
  }
  .adm-demote-btn:hover { background: #e5e7eb; }

  .adm-badge-opt {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 0.72rem; font-weight: 700;
    transition: all 0.14s; border: 1.5px solid transparent;
  }
  .adm-badge-opt.community { background: #f9fafb; color: #6b7280; border-color: #e5e7eb; }
  .adm-badge-opt.community.selected { background: #e5e7eb; color: #374151; border-color: #9ca3af; }
  .adm-badge-opt.trusted  { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  .adm-badge-opt.trusted.selected  { background: #dbeafe; }
  .adm-badge-opt.featured { background: #fffbeb; color: #d97706; border-color: #fde68a; }
  .adm-badge-opt.featured.selected { background: #fde68a; }
  .adm-badge-opt:hover { transform: translateY(-1px); }

  /* ── Featured slots ── */
  .adm-featured-slots-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 20px; }
  .adm-slot-card {
    border: 2px solid #e5e0d8; border-radius: 12px; overflow: hidden;
    background: #fff; transition: all 0.15s;
  }
  .adm-slot-card.filled { border-color: #c9621a; }
  .adm-slot-card-head {
    padding: 14px 16px; background: #faf9f7;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #f0ece5;
  }
  .adm-slot-card.filled .adm-slot-card-head { background: #fff3e8; }
  .adm-slot-num { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #aaa; }
  .adm-slot-card.filled .adm-slot-num { color: #c9621a; }
  .adm-slot-status {
    font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 4px;
    background: #f3f4f6; color: #9ca3af;
  }
  .adm-slot-card.filled .adm-slot-status { background: #fef3c7; color: #92400e; }
  .adm-slot-body { padding: 14px 16px; }
  .adm-slot-empty { text-align: center; padding: 18px 0; }
  .adm-slot-empty i { font-size: 1.5rem; color: #ddd; margin-bottom: 6px; display: block; }
  .adm-slot-empty p { font-size: 0.8rem; color: #bbb; }
  .adm-slot-provider-name { font-weight: 700; font-size: 0.92rem; color: #1a1a1a; margin-bottom: 4px; }
  .adm-slot-meta { font-size: 0.75rem; color: #888; margin-bottom: 12px; }
  .adm-slot-actions { display: flex; gap: 6px; }
  .adm-slot-btn {
    flex: 1; padding: 7px 10px; border-radius: 6px; cursor: pointer; font-size: 0.76rem;
    font-weight: 700; border: none; font-family: inherit; display: inline-flex;
    align-items: center; justify-content: center; gap: 5px; transition: all 0.14s;
  }
  .adm-slot-btn.remove { background: #fee2e2; color: #991b1b; }
  .adm-slot-btn.remove:hover { background: #fecaca; }
  .adm-slot-btn.rotate { background: #dbeafe; color: #1e40af; }
  .adm-slot-btn.rotate:hover { background: #bfdbfe; }

  /* ── Users registry ── */
  .adm-user-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 18px; border: 1px solid #e5e0d8; border-radius: 10px;
    background: #fff; margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .adm-user-info { flex: 1; min-width: 0; }
  .adm-user-email { font-size: 0.88rem; font-weight: 700; color: #1a1a1a; }
  .adm-user-meta  { font-size: 0.73rem; color: #888; margin-top: 2px; display: flex; gap: 12px; flex-wrap: wrap; }
  .adm-user-meta span { display: flex; align-items: center; gap: 4px; }

  /* ── Auth logs ── */
  .adm-log-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 18px; border-bottom: 1px solid #f5f0e8;
    font-size: 0.8rem; color: #555;
  }
  .adm-log-row:last-child { border-bottom: none; }
  .adm-log-event {
    padding: 2px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: 700;
    flex-shrink: 0; min-width: 72px; text-align: center;
  }
  .adm-log-event.REGISTER { background: #d1fae5; color: #065f46; }
  .adm-log-event.LOGIN    { background: #dbeafe; color: #1e3a8a; }
  .adm-log-event.LOGOUT   { background: #f3f4f6; color: #4b5563; }
  .adm-log-email { flex: 1; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adm-log-role  { font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; flex-shrink: 0; }
  .adm-log-role.USER     { background: #ede9fe; color: #5b21b6; }
  .adm-log-role.PROVIDER { background: #fef3c7; color: #92400e; }
  .adm-log-role.ADMIN    { background: #1a1a1a; color: #fff; }
  .adm-log-time { font-size: 0.72rem; color: #aaa; flex-shrink: 0; white-space: nowrap; }

  /* ── Section search/filter ── */
  .adm-search-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .adm-search-input {
    flex: 1; min-width: 180px; padding: 9px 14px;
    border: 1.5px solid rgba(0,0,0,0.10); border-radius: 7px;
    font-family: inherit; font-size: 0.85rem; color: #333; outline: none;
    background: #fff; transition: border-color 0.15s;
  }
  .adm-search-input:focus { border-color: #c9621a; }
  .adm-filter-select {
    padding: 9px 14px; border: 1.5px solid rgba(0,0,0,0.10); border-radius: 7px;
    font-family: inherit; font-size: 0.85rem; color: #555; background: #fff;
    outline: none; cursor: pointer;
  }

  /* ── Error banner ── */
  .adm-err-banner {
    background: #fff0f0; border: 1.5px solid #f5b3b3; border-radius: 8px;
    padding: 12px 18px; color: #a00c2c; font-size: 0.85rem; font-weight: 600;
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
    animation: adm-slide-in 0.2s ease;
  }

  /* Modal field styles */
  .modal-field { margin-bottom: 0.75rem; }
  .modal-field label { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 3px; }
  .modal-field .value { font-size: 0.88rem; color: #1a1a1a; font-weight: 500; }

  @media (max-width: 900px) {
    .adm-featured-slots-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 800px) {
    .adm-detail-grid { grid-template-columns: 1fr 1fr; }
    .adm-detail-section { border-right: none; border-bottom: 1px solid #f0ece5; }
  }
  @media (max-width: 600px) {
    .adm-featured-slots-grid { grid-template-columns: 1fr; }
    .adm-detail-grid { grid-template-columns: 1fr; }
    .adm-row-actions { flex-wrap: wrap; }
  }
`;

/* ── Expandable Pending Provider Row ── */
const ExpandablePendingRow = ({ provider, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const initial = (provider.name || '?')[0].toUpperCase();
  const regDate = provider.registered
    ? new Date(provider.registered).toLocaleDateString('en-ZA') : '—';
  const val    = (v) => v ? String(v) : null;

  return (
    <div className={`adm-expand-row ${expanded ? 'expanded' : ''}`}>
      <div className="adm-row-header" onClick={() => setExpanded(e => !e)}>
        <div className="adm-avatar">{initial}</div>
        <div className="adm-row-info">
          <div className="adm-row-name">
            {provider.name}
            <span className="adm-badge pending">Pending</span>
            {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> Featured Plan</span>}
            {provider.tier === 'pro'      && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> Pro Plan</span>}
          </div>
          <div className="adm-row-meta">
            {provider.email} &nbsp;·&nbsp; {provider.city || '—'}, {provider.province || '—'} &nbsp;·&nbsp;
            {provider.listingPlan || provider.tier || 'free'} plan &nbsp;·&nbsp; Registered: {regDate}
          </div>
        </div>
        <i className="fas fa-chevron-down adm-expand-icon"></i>
        <div className="adm-row-actions" onClick={e => e.stopPropagation()}>
          <button className="adm-btn-approve" onClick={() => onApprove(provider.id)}>
            <i className="fas fa-check"></i> Approve
          </button>
          <button className="adm-btn-reject" onClick={() => onReject(provider.id)}>
            <i className="fas fa-times"></i> Reject
          </button>
        </div>
      </div>

      {expanded && (
        <div className="adm-detail-panel">
          <div className="adm-detail-grid">
            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-user"></i> Account &amp; Contact</div>
              {[
                { label: 'Full Name / Business', val: val(provider.name) },
                { label: 'Account Type',         val: val(provider.accountType) },
                { label: 'Email',                val: val(provider.email) },
                { label: 'Phone',                val: val(provider.phone) },
                { label: 'WhatsApp',             val: val(provider.whatsapp) },
                { label: 'Enquiry Email',        val: val(provider.contactEmail) },
                { label: 'Website',              val: val(provider.website || provider.social) },
                { label: 'Plan',                 val: val(provider.listingPlan || provider.tier) },
                { label: 'Registered',           val: regDate },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
            </div>
            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-briefcase"></i> Bio &amp; Services</div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Bio</div>
                <div className={`adm-detail-val ${!val(provider.bio) ? 'empty' : ''}`} style={{ lineHeight: 1.6, fontSize: '0.8rem' }}>
                  {val(provider.bio) || '—'}
                </div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Primary Category</div>
                <div className="adm-detail-val">{val(provider.primaryCategory || provider.category) || '—'}</div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Tags / Subjects</div>
                {provider.tags?.length > 0
                  ? <div className="adm-detail-tags">{provider.tags.map((t, i) => <span key={i} className="adm-detail-tag">{t}</span>)}</div>
                  : <div className="adm-detail-val empty">—</div>}
              </div>
              {provider.services?.length > 0 && (
                <div className="adm-detail-field">
                  <div className="adm-detail-label">Services ({provider.services.length})</div>
                  {provider.services.map((svc, i) => (
                    <div key={i} style={{ padding: '6px 10px', background: '#faf9f7', borderRadius: 6, marginTop: 5, fontSize: '0.8rem' }}>
                      {svc.title && <div style={{ fontWeight: 700 }}>{svc.title}</div>}
                      {svc.description && <div style={{ color: '#666', marginTop: 2 }}>{svc.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-map-marker-alt"></i> Location &amp; Credentials</div>
              {[
                { label: 'City',         val: val(provider.city) },
                { label: 'Province',     val: val(provider.province) },
                { label: 'Service Area', val: val(provider.serviceAreaType) },
                { label: 'Radius',       val: provider.radius ? val(provider.radius) : null },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
              <div className="adm-detail-section-title" style={{ marginTop: 14 }}><i className="fas fa-graduation-cap"></i> Qualifications</div>
              {[
                { label: 'Degrees',        val: val(provider.degrees) },
                { label: 'Certifications', val: val(provider.certifications) },
                { label: 'Memberships',    val: val(provider.memberships) },
                { label: 'Clearance',      val: val(provider.clearance) },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
              <div className="adm-detail-section-title" style={{ marginTop: 14 }}><i className="fas fa-tag"></i> Pricing</div>
              {[
                { label: 'Model',  val: val(provider.pricingModel) },
                { label: 'Price',  val: val(provider.startingPrice || provider.priceFrom) },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="adm-detail-footer">
            <div className="adm-detail-footer-note">
              <i className="fas fa-info-circle" style={{ color: '#c9621a' }}></i>
              Admin review on {new Date().toLocaleDateString('en-ZA')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="adm-btn-approve" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={() => onApprove(provider.id)}>
                <i className="fas fa-check-circle"></i> Approve &amp; Go Live
              </button>
              <button className="adm-btn-reject" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={() => onReject(provider.id)}>
                <i className="fas fa-times-circle"></i> Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Featured Slot Card ── */
const InlineFeaturedSlotCard = ({ slot, onRemove, onRotate }) => {
  const filled = !!slot.provider;
  return (
    <div className={`adm-slot-card ${filled ? 'filled' : ''}`}>
      <div className="adm-slot-card-head">
        <span className="adm-slot-num">Slot #{slot.id}</span>
        <span className="adm-slot-status">{filled ? 'Occupied' : 'Empty'}</span>
      </div>
      <div className="adm-slot-body">
        {!filled ? (
          <div className="adm-slot-empty">
            <i className="fas fa-star" />
            <p>No provider assigned</p>
          </div>
        ) : (
          <>
            <div className="adm-slot-provider-name">{slot.provider}</div>
            <div className="adm-slot-meta">
              <i className="fas fa-clock" style={{ marginRight: 4, color: '#c9621a' }} />
              {slot.daysRemaining > 0 ? `${slot.daysRemaining} days remaining` : 'Duration ended'}
              {slot.addedDaysAgo > 0 && ` · added ${slot.addedDaysAgo}d ago`}
            </div>
            <div className="adm-slot-actions">
              <button className="adm-slot-btn remove" onClick={() => onRemove(slot.id, slot.provider)}>
                <i className="fas fa-times" /> Remove
              </button>
              <button className="adm-slot-btn rotate" onClick={() => onRotate(slot.id)}>
                <i className="fas fa-sync" /> Rotate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const EMPTY_MODAL = { title: '', body: '' };

/* ════════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]           = useState('all'); // Changed default to 'all'
  const [providers, setProviders]           = useState([]);
  const [featuredSlots, setFeaturedSlots]   = useState([]);
  const [reviews, setReviews]               = useState(reviewsMock || []);
  const [modalOpen, setModalOpen]           = useState(false);
  const [modalContent, setModalContent]     = useState(EMPTY_MODAL);
  const [featuredError, setFeaturedError]   = useState('');

  // All listings filters
  const [listingSearch, setListingSearch]   = useState('');
  const [filterType, setFilterType]         = useState('all');

  // Users registry state
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [authLogs, setAuthLogs]               = useState([]);
  const [userSearch, setUserSearch]           = useState('');
  const [userRoleFilter, setUserRoleFilter]   = useState('ALL');
  const [logSearch, setLogSearch]             = useState('');
  const [logEventFilter, setLogEventFilter]   = useState('ALL');

  // Inject CSS
  useEffect(() => {
    if (!document.getElementById('adm-styles')) {
      const style = document.createElement('style');
      style.id = 'adm-styles';
      style.textContent = ADMIN_CSS;
      document.head.appendChild(style);
    }
  }, []);

  // Load data
  useEffect(() => {
    const loadedProviders = getStoredProviders();
    setProviders(loadedProviders);
    setFeaturedSlots(getFeaturedSlots());
    
    const storedUsers = getStoredUsers();
    const providerUsers = loadedProviders.map(p => ({
      id: p.id,
      email: p.email || p.contactEmail || '',
      name: p.name || '',
      role: 'PROVIDER',
      registered: p.registered || '',
      lastLogin: p.lastLogin || p.registered || '',
      status: p.status || 'pending',
      plan: p.plan || p.listingPlan || p.tier || 'free',
    }));
    const seen = new Set();
    const merged = [...storedUsers.map(u => ({ ...u, role: u.role || 'USER' })), ...providerUsers]
      .filter(u => {
        const k = u.email?.toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k); return true;
      });
    setRegisteredUsers(merged);
    setAuthLogs(getAuthLogs());
  }, []);

  const pendingProviders  = providers.filter(p => p.status === 'pending');
  const approvedProviders = providers.filter(p => p.status === 'approved');
  const rejectedProviders = providers.filter(p => p.status === 'rejected');
  const featuredCount     = featuredSlots.filter(s => !!s.provider).length;
  const pendingReviews    = (reviews || []).filter(r => r.status === 'pending');

  // Count only actual USER role entries, not providers
  const actualUsers = registeredUsers.filter(u => u.role === 'USER');

  const stats = {
    totalProviders:   providers.length,
    pendingApproval:  pendingProviders.length,
    approved:         approvedProviders.length,
    rejected:         rejectedProviders.length,
    featuredSlots:    featuredCount,
    pendingReviews:   pendingReviews.length,
    totalUsers:       actualUsers.length,
  };

  /* ── Provider approve / reject ── */
  const handleApprove = (providerId) => {
    const updated = providers.map(p => p.id === providerId ? { ...p, status: 'approved' } : p);
    setProviders(updated);
    saveStoredProviders(updated);
    const provider = providers.find(p => p.id === providerId);
    showNotification(`✅ ${provider?.name || 'Provider'} approved and is now live.`, 'success');
  };

  const handleReject = (providerId) => {
    const updated = providers.map(p => p.id === providerId ? { ...p, status: 'rejected' } : p);
    setProviders(updated);
    saveStoredProviders(updated);
    const provider = providers.find(p => p.id === providerId);
    showNotification(`${provider?.name || 'Provider'} registration rejected.`, 'info');
  };

  /* ── Badge selection — "Featured" badge → auto-assign to featured slot ── */
  const handleBadgeSelect = (providerId, badgeType) => {
    setFeaturedError('');
    const tierMap = { community: 'free', trusted: 'pro', featured: 'featured' };
    const provider = providers.find(p => p.id === providerId);

    if (badgeType === 'featured') {
      const alreadyInSlot = featuredSlots.some(s => s.providerId === providerId);
      if (alreadyInSlot) {
        showNotification(`${provider?.name || 'Provider'} is already in a featured slot.`, 'info');
      } else {
        const emptySlot = featuredSlots.find(s => !s.provider);
        if (!emptySlot) {
          setFeaturedError(
            `All ${MAX_FEATURED_SLOTS} featured slots are occupied. Remove a provider from a slot before assigning a new one. Go to the "Featured Slots" tab to manage slots.`
          );
          setActiveTab('featured');
          return;
        }
        const updatedSlots = featuredSlots.map(s =>
          s.id === emptySlot.id
            ? { ...s, provider: provider?.name || 'Unknown', providerId, addedDaysAgo: 0, daysRemaining: 7 }
            : s
        );
        setFeaturedSlots(updatedSlots);
        saveFeaturedSlots(updatedSlots);
        showNotification(`⭐ ${provider?.name || 'Provider'} assigned to Featured Slot #${emptySlot.id}!`, 'success');
      }
    }

    const updated = providers.map(p =>
      p.id === providerId ? { ...p, badge: badgeType, tier: tierMap[badgeType] || p.tier } : p
    );
    setProviders(updated);
    saveStoredProviders(updated);
    if (badgeType !== 'featured') {
      showNotification(`Badge "${badgeType}" assigned to ${provider?.name || providerId}.`, 'success');
    }
  };

  const handlePromote = (providerId) => {
    const updated = providers.map(p => 
      p.id === providerId ? { ...p, promoted: true, demoted: false } : p
    );
    setProviders(updated);
    saveStoredProviders(updated);
    const provider = providers.find(p => p.id === providerId);
    showNotification(`"${provider?.name}" promoted — listing will move up in search results.`, 'success');
  };

  const handleDemote = (providerId) => {
    const updated = providers.map(p => 
      p.id === providerId ? { ...p, demoted: true, promoted: false } : p
    );
    setProviders(updated);
    saveStoredProviders(updated);
    const provider = providers.find(p => p.id === providerId);
    showNotification(`"${provider?.name}" demoted — listing will move down in search results.`, 'info');
  };

  /* ── Featured slot management ── */
  const handleRemoveFeatured = (slotId, providerName) => {
    setFeaturedError('');
    const slot = featuredSlots.find(s => s.id === slotId);
    const updatedSlots = featuredSlots.map(s =>
      s.id === slotId ? { ...s, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 } : s
    );
    setFeaturedSlots(updatedSlots);
    saveFeaturedSlots(updatedSlots);
    
    // Also update provider tier back to pro if they were featured
    if (slot?.providerId) {
      const updated = providers.map(p =>
        p.id === slot.providerId ? { ...p, tier: 'pro', badge: 'verified' } : p
      );
      setProviders(updated);
      saveStoredProviders(updated);
    }
    
    showNotification(`Removed ${providerName} from featured slot #${slotId}`, 'info');
  };

  const handleRotateFeatured = (slotId) => {
    const available = approvedProviders.map(p => p.name).filter(Boolean);
    const current = featuredSlots.find(s => s.id === slotId)?.provider;
    const others  = available.filter(n => n !== current);
    const picked  = others.length ? others[Math.floor(Math.random() * others.length)]
                  : available.length ? available[Math.floor(Math.random() * available.length)]
                  : 'STEM Mastery Tutors';
    const pickedProvider = providers.find(p => p.name === picked);
    const updatedSlots = featuredSlots.map(s =>
      s.id === slotId
        ? { ...s, provider: picked, providerId: pickedProvider?.id || null, addedDaysAgo: 0, daysRemaining: 7 }
        : s
    );
    setFeaturedSlots(updatedSlots);
    saveFeaturedSlots(updatedSlots);
    showNotification(`Rotated slot #${slotId} to ${picked}`, 'success');
  };

  const handleModerateReview = (reviewId, action) => {
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
    ));
  };

  /* ── Profile modal ── */
  const showProfileModal = (provider) => {
    if (!provider) return;
    const p = typeof provider === 'string' ? providers.find(x => x.id === provider) || {} : provider;
    const body = `
      <div style="border-top:1px solid #e5e0d8;margin:1.25rem 0 0.75rem;padding-top:0.75rem;">
        <p style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#c9621a;">Account Information</p>
      </div>
      <div class="modal-field"><label>Full name / Business</label><div class="value">${escapeHtml(p.name || '—')}</div></div>
      <div class="modal-field"><label>Email address</label><div class="value">${escapeHtml(p.email || '—')}</div></div>
      <div class="modal-field"><label>Primary category</label><div class="value">${escapeHtml(p.primaryCategory || p.category || '—')}</div></div>
      <div class="modal-field"><label>Status</label><div class="value">${escapeHtml(p.status || '—')}</div></div>
      <div class="modal-field"><label>Listing plan</label><div class="value">${escapeHtml(p.listingPlan || p.tier || '—')}</div></div>
      <div style="border-top:1px solid #e5e0d8;margin:1.25rem 0 0.75rem;padding-top:0.75rem;">
        <p style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#c9621a;">Bio &amp; Services</p>
      </div>
      <div class="modal-field"><label>Bio</label><div class="value">${escapeHtml(p.bio || '—')}</div></div>
      <div class="modal-field"><label>Tags / Subjects</label><div class="value">${escapeHtml((p.tags || []).join(', ') || '—')}</div></div>
      <div class="modal-field"><label>Age groups</label><div class="value">${escapeHtml((p.ageGroups || []).join(', ') || '—')}</div></div>
      <div class="modal-field"><label>Delivery mode</label><div class="value">${escapeHtml(p.deliveryMode || p.delivery || '—')}</div></div>
      <div style="border-top:1px solid #e5e0d8;margin:1.25rem 0 0.75rem;padding-top:0.75rem;">
        <p style="font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#c9621a;">Location &amp; Contact</p>
      </div>
      <div class="modal-field"><label>City / Province</label><div class="value">${escapeHtml(p.city || '')} ${escapeHtml(p.province || '')}</div></div>
      <div class="modal-field"><label>Phone</label><div class="value">${escapeHtml(p.phone || '—')}</div></div>
      <div class="modal-field"><label>Contact email</label><div class="value">${escapeHtml(p.contactEmail || p.email || '—')}</div></div>
      <div class="modal-field"><label>Pricing</label><div class="value">${escapeHtml(p.pricingModel || '—')} — ${escapeHtml(p.startingPrice || p.priceFrom || '—')}</div></div>
      <div class="modal-field"><label>Registered</label><div class="value">${p.registered ? new Date(p.registered).toLocaleDateString('en-ZA') : '—'}</div></div>
    `;
    setModalContent({ title: `${p.name || 'Provider'} — Registration Details`, body });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalContent(EMPTY_MODAL), 300);
  };

  /* ── Filtered listings - SHOWS ALL PROVIDERS with status filters ── */
  const getFilteredListings = () => {
    let filtered = providers;

    // Search
    if (listingSearch) {
      const term = listingSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term)
      );
    }

    // Filter by type (All, Featured, Trusted, Community, Promoted, Demoted, Approved, Pending, Rejected)
    if (filterType !== 'all') {
      filtered = filtered.filter(p => {
        switch(filterType) {
          case 'featured':
            return p.tier === 'featured';
          case 'trusted':
            return p.tier === 'pro';
          case 'community':
            return p.tier === 'free' || !p.tier;
          case 'promoted':
            return p.promoted === true;
          case 'demoted':
            return p.demoted === true;
          case 'approved':
            return p.status === 'approved';
          case 'pending':
            return p.status === 'pending';
          case 'rejected':
            return p.status === 'rejected';
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredListings = getFilteredListings();

  /* ── Filtered users / logs ── */
  const filteredUsers = registeredUsers.filter(u => {
    const matchSearch = !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.name?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole   = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredLogs = authLogs.filter(l => {
    const matchSearch = !logSearch || l.email?.toLowerCase().includes(logSearch.toLowerCase());
    const matchEvent  = logEventFilter === 'ALL' || l.event === logEventFilter;
    return matchSearch && matchEvent;
  });

  const fmtDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-ZA', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch { return iso; }
  };

  return (
    <>
      <Header userType="admin" />
      <main className="dash-wrapper">
        <div className="page-headline">
          <h1>Admin Control Panel</h1>
          <p>Manage listings, approvals, featured slots, provider badges, users, and review moderation</p>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="fas fa-shield-halved"></i>
            <h2>Directory Oversight</h2>
            <span className="badge"><i className="fas fa-lock"></i> admin</span>
          </div>

          {/* Stats - Now as clickable cards that navigate */}
          <div className="admin-stats" role="region" aria-label="Dashboard statistics">
            <div 
              className={`stat-filter-card${activeTab === 'all' ? ' active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <div className="stat-filter-value">{stats.totalProviders}</div>
              <div className="stat-filter-label">Total Providers</div>
            </div>
            <div 
              className={`stat-filter-card${activeTab === 'pending' ? ' active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <div className="stat-filter-value">{stats.pendingApproval}</div>
              <div className="stat-filter-label">Pending Approval</div>
            </div>
            <div 
              className={`stat-filter-card${activeTab === 'featured' ? ' active' : ''}`}
              onClick={() => setActiveTab('featured')}
            >
              <div className="stat-filter-value">{featuredCount}/{MAX_FEATURED_SLOTS}</div>
              <div className="stat-filter-label">Featured Slots</div>
            </div>
            <div 
              className={`stat-filter-card${activeTab === 'reviews' ? ' active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <div className="stat-filter-value">{stats.pendingReviews}</div>
              <div className="stat-filter-label">Reviews Pending</div>
            </div>
            <div 
              className={`stat-filter-card${activeTab === 'users' ? ' active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <div className="stat-filter-value">{stats.totalUsers}</div>
              <div className="stat-filter-label">Registered Users</div>
            </div>
          </div>

          {/* Tabs - Reordered with All Listings first, Pending Approvals second */}
          <div className="admin-tabs" role="tablist">
            {[
              { id:'all',       icon:'fa-list',           label:'All Listings', badge: stats.totalProviders },
              { id:'pending',   icon:'fa-hourglass-half', label:'Pending Approvals', badge: pendingProviders.length },
              { id:'featured',  icon:'fa-star',           label:'Featured Slots', badge: featuredCount },
              { id:'reviews',   icon:'fa-star-half-alt',  label:'Review Moderation', badge: pendingReviews.length },
              { id:'users',     icon:'fa-users',          label:'Users & Providers', badge: registeredUsers.length },
              { id:'logs',      icon:'fa-clock-rotate-left', label:'Auth Logs', badge: authLogs.length > 0 ? authLogs.length : undefined },
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id !== 'featured') setFeaturedError(''); }}
              >
                <i className={`fas ${tab.icon}`}></i> {tab.label}
                {tab.badge > 0 && <span className="pending-badge">{tab.badge}</span>}
              </button>
            ))}
          </div>

          {/* ── PENDING APPROVALS ── */}
          {activeTab === 'pending' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-hourglass-half"></i>
                Pending Approval ({pendingProviders.length}) — click a row to expand full details
              </p>
              {pendingProviders.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'var(--ink-3)' }}>
                  <i className="fas fa-check-circle" style={{ fontSize:'2rem', marginBottom:'0.5rem', display:'block', color:'var(--success)' }}></i>
                  No pending registrations at this time.
                </div>
              ) : (
                pendingProviders.map(provider => (
                  <ExpandablePendingRow key={provider.id} provider={provider} onApprove={handleApprove} onReject={handleReject} />
                ))
              )}
            </div>
          )}

          {/* ── ALL LISTINGS with Search and Filters - SHOWS ALL PROVIDERS ── */}
          {activeTab === 'all' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-list"></i>
                All Providers ({filteredListings.length} of {providers.length}) — click on any listing to view all details
              </p>

              {/* Search & Filter Controls */}
              <div className="adm-search-row">
                <input
                  className="adm-search-input"
                  type="text" 
                  placeholder="Search by name, email, or city…"
                  value={listingSearch} 
                  onChange={e => setListingSearch(e.target.value)}
                />
                <select 
                  className="adm-filter-select" 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="all">All Listings</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="featured">Featured</option>
                  <option value="trusted">Trusted</option>
                  <option value="community">Community</option>
                  <option value="promoted">Promoted</option>
                  <option value="demoted">Demoted</option>
                </select>
              </div>

              {featuredError && (
                <div className="adm-err-banner">
                  <i className="fas fa-exclamation-triangle"></i> {featuredError}
                </div>
              )}

              {filteredListings.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'var(--ink-3)' }}>No providers match your filters.</div>
              ) : (
                filteredListings.map(provider => (
                  <div 
                    className="adm-listing-row" 
                    key={provider.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => showProfileModal(provider)}
                  >
                    <div className="adm-avatar" style={{ fontSize:'0.9rem' }}>
                      {(provider.name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <strong style={{ fontSize:'0.9rem', color:'#1a1a1a' }}>{provider.name}</strong>
                        <span className={`adm-badge ${provider.status}`}>{provider.status}</span>
                        {provider.promoted && <span className="adm-badge" style={{ background:'#dcfce7', color:'#166534' }}>Promoted</span>}
                        {provider.demoted && <span className="adm-badge" style={{ background:'#fee2e2', color:'#991b1b' }}>Demoted</span>}
                        {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> featured</span>}
                        {provider.tier === 'pro'      && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> trusted</span>}
                        {featuredSlots.some(s => s.providerId === provider.id) && (
                          <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:4, background:'#fde68a', color:'#92400e' }}>
                            <i className="fas fa-star" style={{ marginRight:3 }}></i>In Slot #{featuredSlots.find(s => s.providerId === provider.id)?.id}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'#888', marginTop:2 }}>
                        {provider.city}, {provider.province} · {provider.email}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, flexWrap:'wrap' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="adm-promote-btn" onClick={() => handlePromote(provider.id)}>
                          <i className="fas fa-arrow-up"></i> Promote
                        </button>
                        <button className="adm-demote-btn" onClick={() => handleDemote(provider.id)}>
                          <i className="fas fa-arrow-down"></i> Demote
                        </button>
                      </div>
                      <div style={{ display:'flex', gap:4 }}>
                        {['community','trusted','featured'].map(b => {
                          const isSelected = provider.tier === (b==='community'?'free':b==='trusted'?'pro':'featured');
                          const inSlot = b === 'featured' && featuredSlots.some(s => s.providerId === provider.id);
                          return (
                            <span
                              key={b}
                              className={`adm-badge-opt ${b} ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleBadgeSelect(provider.id, b)}
                              role="button" tabIndex="0"
                              title={b==='featured' ? (inSlot ? 'Already in a slot' : 'Assign to next available featured slot') : `Set badge to ${b}`}
                            >
                              {b === 'featured' && <i className="fas fa-star" style={{ fontSize:'0.65rem' }}></i>}
                              {b.charAt(0).toUpperCase() + b.slice(1)}
                              {inSlot && <i className="fas fa-check" style={{ fontSize:'0.6rem', marginLeft:2 }}></i>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── FEATURED SLOTS - ALL 4 SLOTS VISIBLE ── */}
          {activeTab === 'featured' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-star"></i>
                Featured Slots ({featuredCount}/{MAX_FEATURED_SLOTS} occupied) — these providers appear first on the homepage
              </p>
              {featuredError && (
                <div className="adm-err-banner">
                  <i className="fas fa-exclamation-triangle"></i> {featuredError}
                </div>
              )}
              <div className="adm-featured-slots-grid">
                {featuredSlots.map(slot => (
                  <InlineFeaturedSlotCard
                    key={slot.id}
                    slot={slot}
                    onRemove={handleRemoveFeatured}
                    onRotate={handleRotateFeatured}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEW MODERATION ── */}
          {activeTab === 'reviews' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-star-half-alt"></i>
                Moderate Reviews ({pendingReviews.length} pending)
              </p>
              {pendingReviews.map(review => (
                <ReviewCard key={review.id} review={review} onModerate={handleModerateReview} />
              ))}
              <div className="info-block">
                <i className="fas fa-circle-info"></i>
                <p><strong>Review Moderation:</strong> Only approved reviews appear on client profile pages.</p>
              </div>
            </div>
          )}

          {/* ── USERS & PROVIDERS REGISTRY ── */}
          {activeTab === 'users' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-users"></i>
                All Registered Accounts ({filteredUsers.length} of {registeredUsers.length})
              </p>
              <div className="adm-search-row">
                <input
                  className="adm-search-input"
                  type="text" placeholder="Search by email or name…"
                  value={userSearch} onChange={e => setUserSearch(e.target.value)}
                />
                <select className="adm-filter-select" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                  <option value="ALL">All Roles</option>
                  <option value="USER">Users only</option>
                  <option value="PROVIDER">Providers only</option>
                  <option value="ADMIN">Admins only</option>
                </select>
              </div>

              {filteredUsers.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'#aaa' }}>
                  <i className="fas fa-users" style={{ fontSize:'1.8rem', display:'block', marginBottom:8, opacity:0.3 }}></i>
                  No accounts found.
                </div>
              ) : (
                filteredUsers.map((u, i) => (
                  <div key={u.id || i} className="adm-user-row">
                    <div className={`adm-avatar ${u.role === 'USER' ? 'user-av' : u.role === 'ADMIN' ? 'admin-av' : 'provider-av'}`} style={{ fontSize:'0.85rem' }}>
                      {(u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="adm-user-info">
                      <div className="adm-user-email">
                        {u.email}
                        {u.name && <span style={{ fontWeight:500, color:'#888', marginLeft:8, fontSize:'0.82rem' }}>({u.name})</span>}
                      </div>
                      <div className="adm-user-meta">
                        <span><i className="fas fa-clock"></i> Registered: {fmtDate(u.registered)}</span>
                        {u.lastLogin && <span><i className="fas fa-sign-in-alt"></i> Last login: {fmtDate(u.lastLogin)}</span>}
                        {u.status && u.role === 'PROVIDER' && <span><i className="fas fa-circle"></i> Status: {u.status}</span>}
                        {u.plan && u.role === 'PROVIDER' && <span><i className="fas fa-layer-group"></i> Plan: {u.plan}</span>}
                      </div>
                    </div>
                    <span className={`adm-badge ${u.role === 'USER' ? 'user' : u.role === 'ADMIN' ? '' : 'pro'}`}
                      style={u.role === 'ADMIN' ? { background:'#1a1a1a', color:'#fff' } : {}}>
                      {u.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── AUTH LOGS ── */}
          {activeTab === 'logs' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-clock-rotate-left"></i>
                Authentication Logs ({filteredLogs.length} entries)
              </p>
              <div className="adm-search-row">
                <input
                  className="adm-search-input"
                  type="text" placeholder="Search by email…"
                  value={logSearch} onChange={e => setLogSearch(e.target.value)}
                />
                <select className="adm-filter-select" value={logEventFilter} onChange={e => setLogEventFilter(e.target.value)}>
                  <option value="ALL">All Events</option>
                  <option value="REGISTER">Register</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                </select>
              </div>
              <div style={{ border:'1px solid #f0ece5', borderRadius:10, overflow:'hidden', background:'#fff' }}>
                {filteredLogs.length === 0 ? (
                  <div style={{ padding:'2rem', textAlign:'center', color:'#aaa' }}>
                    <i className="fas fa-scroll" style={{ fontSize:'1.8rem', display:'block', marginBottom:8, opacity:0.25 }}></i>
                    No authentication events logged yet.
                    <p style={{ fontSize:'0.8rem', marginTop:6 }}>Events are recorded when users register and log in.</p>
                  </div>
                ) : (
                  filteredLogs.map((log, i) => (
                    <div key={i} className="adm-log-row">
                      <span className={`adm-log-event ${log.event}`}>{log.event}</span>
                      <span className="adm-log-email">{log.email}</span>
                      <span className={`adm-log-role ${log.role}`}>{log.role}</span>
                      <span className="adm-log-time">{fmtDate(log.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <hr />
          <div className="audit-row">
            <span className="audit-chip"><i className="fas fa-clock-rotate-left"></i> audit log</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', fontSize:'0.82rem', color:'var(--ink-3)' }}>
              <i className="fas fa-toggle-on" style={{ color:'var(--success)' }}></i>
              manual verification override active
            </span>
          </div>
        </div>
      </main>

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={closeModal} title={modalContent.title}>
          <div dangerouslySetInnerHTML={{ __html: modalContent.body }} />
        </Modal>
      )}

      <Footer />
    </>
  );
};

export default AdminDashboard;
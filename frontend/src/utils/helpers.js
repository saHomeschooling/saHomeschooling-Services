// frontend/src/utils/helpers.js
import { PLAN_LIMITS } from './constants';

export const getMultiSelectValues = (select) => {
  return Array.from(select.options).filter(o => o.selected).map(o => o.value);
};

export const setMultiSelectValues = (select, values) => {
  if (!select) return;
  Array.from(select.options).forEach(o => {
    o.selected = values.includes(o.value);
  });
};

export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const getPlanLimits = (plan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

export const formatPrice = (price, plan) => {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  if (limits.price === 0) return 'R0';
  return `R${limits.price}`;
};

export const getPlanName = (plan) => {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  return limits.name || 'Free Listing';
};
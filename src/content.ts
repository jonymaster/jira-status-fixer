// Jira Status Field Fixer - Content Script
const SELECTOR_STATUS = '[data-testid="issue.views.issue-base.foundation.status.status-field-wrapper"]';
const SELECTOR_TARGET = '[data-testid="issue.views.issue-base.context.status-and-approvals-wrapper.status-and-approval"]';
const RESOLUTION_SELECTORS: string[] = [
  '[data-testid="issue-field-resolution"]',
  '[data-testid*="resolution"]',
  '[data-test-id*="resolution"]',
  '[aria-label="Resolution"]'
];

let lastResolutionText = "";

async function moveStatus() {
  const status = document.querySelector(SELECTOR_STATUS) as HTMLElement | null;
  const target = document.querySelector(SELECTOR_TARGET) as HTMLElement | null;
  
  if (!status || !target) {
    return;
  }

  let slot = target.querySelector("#jira-status-fixer-extension") as HTMLElement | null;
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "jira-status-fixer-extension";
    slot.style.paddingTop = "8px";
    slot.style.paddingLeft = "4px";
    target.insertBefore(slot, target.firstChild);
  }

  if (!slot.contains(status)) {
    slot.appendChild(status);
  }

  syncResolutionBadge(slot);
}

let debounceTimer: number | null = null;

function init() {
  moveStatus();
  setTimeout(() => moveStatus(), 1000);

  const obs = new MutationObserver(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      moveStatus();
      debounceTimer = null;
    }, 100);
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

function findResolutionElement(): HTMLElement | null {
  for (const sel of RESOLUTION_SELECTORS) {
    try {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) return el;
    } catch (_) {
      // ignore errors
    }
  }
  const all = Array.from(document.querySelectorAll('[aria-label], [data-testid], [data-test-id]')) as HTMLElement[];
  const candidate = all.find(el => {
    const al = (el.getAttribute('aria-label') || '').toLowerCase();
    const dt = (el.getAttribute('data-testid') || el.getAttribute('data-test-id') || '').toLowerCase();
    return al.includes('resolution') || dt.includes('resolution');
  });
  return candidate || null;
}

function shouldShowResolution(resolutionEl: HTMLElement): boolean {
  const text = (resolutionEl.innerText || resolutionEl.textContent || '').trim();
  if (!text) return false;
  if (/^unresolved$/i.test(text)) return false;
  return true;
}

function getResolutionText(resolutionEl: HTMLElement): string {
  const statusLabel = resolutionEl.querySelector('[data-testid="issue-field-resolution.ui.read.resolution-status-label"]');
  if (statusLabel) {
    const text = (statusLabel.textContent || '').trim();
    return sanitizeResolutionText(text);
  }
  
  const button = resolutionEl.querySelector('button, [role="button"]');
  if (button) {
    const buttonText = (button.textContent || '').trim();
    if (buttonText && !buttonText.includes('\n')) {
      return sanitizeResolutionText(buttonText);
    }
  }
  
  const spans = resolutionEl.querySelectorAll('span');
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const text = (span.textContent || '').trim();
    if (text && !text.includes('\n') && text.length < 50 && !text.includes('Resolution')) {
      return sanitizeResolutionText(text);
    }
  }
  
  const text = (resolutionEl.innerText || resolutionEl.textContent || '').trim();
  return sanitizeResolutionText(text);
}

function sanitizeResolutionText(text: string): string {
  if (!text) return '';
  
  let clean = text.replace(/\s+/g, ' ').trim();
  clean = clean.replace(/^resolution\s*/i, '');
  
  const words = clean.split(' ');
  if (words.length > 3) {
    clean = words[0];
  }
  
  return clean.trim();
}

function syncResolutionBadge(slot: HTMLElement): void {
  const source = findResolutionElement();
  const shouldShow = shouldShowResolutionStrict();
  
  const isDropdownOpen = isResolutionDropdownOpen();
  if (isDropdownOpen) {
    return;
  }
  
  const value = source && shouldShow ? getResolutionText(source) : '';

  let badge = slot.querySelector('#jira-status-fixer-resolution') as HTMLElement | null;
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'jira-status-fixer-resolution';
    slot.appendChild(badge);
  }

  if (shouldShow && value) {
    if (lastResolutionText !== value || badge.innerHTML.length === 0) {
      badge.innerHTML = `
        <span class="jira-resolution-badge">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style="margin-right: 4px;">
            <path fill="currentColor" d="m13.959 3.97-7.25 9a.75.75 0 0 1-1.163.007l-3.5-4.25 1.158-.954 2.914 3.539 6.673-8.283z"/>
          </svg>
          ${value}
        </span>
      `;
      lastResolutionText = value;
    }
    badge.style.display = 'inline-flex';
    
    if (source && isReadOnlyResolution(source)) {
      source.style.display = 'none';
    }
  } else {
    if (lastResolutionText !== '') {
      badge.innerHTML = '';
      lastResolutionText = '';
    }
    badge.style.display = 'none';
    if (source) {
      source.style.display = '';
    }
  }
}

function shouldShowResolutionStrict(): boolean {
  const resolvedDate = document.querySelector('[data-testid="resolved-date.ui.read.meta-date"], [data-testid*="resolved-date"]');
  if (resolvedDate) {
    return true;
  }
  
  const dateSpan = document.querySelector('span.erd76u-0.ZPEnO[role="button"]');
  if (dateSpan && dateSpan.textContent && dateSpan.textContent.trim()) {
    return true;
  }
  
  const source = findResolutionElement();
  if (source) {
    const value = getResolutionText(source);
    if (value && value !== 'Unresolved' && value.trim()) {
      return true;
    }
  }
  
  return false;
}

function isReadOnlyResolution(resolutionEl: HTMLElement): boolean {
  const hasReadOnlyClass = resolutionEl.classList.contains('read-only') || 
                          !!resolutionEl.querySelector('.read-only');
  const hasReadOnlyAttr = resolutionEl.hasAttribute('readonly') || 
                         !!resolutionEl.querySelector('[readonly]');
  const hasReadOnlyTestId = resolutionEl.getAttribute('data-testid')?.includes('read') || 
                           !!resolutionEl.querySelector('[data-testid*="read"]');
  
  return hasReadOnlyClass || hasReadOnlyAttr || hasReadOnlyTestId;
}

function isResolutionDropdownOpen(): boolean {
  const dropdownSelectors = [
    '[data-testid*="dropdown"][aria-expanded="true"]',
    '[role="listbox"][aria-expanded="true"]',
    '.ak-dropdown-menu[style*="display: block"]',
    '[data-testid*="resolution"][aria-expanded="true"]',
    '[aria-expanded="true"][data-testid*="select"]',
    '.ak-select__menu[style*="display: block"]',
    '[data-testid*="popup"][style*="display: block"]',
    '[data-testid*="resolution"] [aria-expanded="true"]',
    '[data-testid*="resolution"] .ak-dropdown-menu',
    '[data-testid*="resolution"]:has(button[aria-expanded="true"])'
  ];
  
  for (const selector of dropdownSelectors) {
    try {
      if (document.querySelector(selector)) {
        return true;
      }
    } catch (e) {
      // ignore errors
    }
  }
  
  const resolutionEl = findResolutionElement();
  if (resolutionEl) {
    const text = resolutionEl.innerText || '';
    if (text.includes('\n') || (text.match(/\b(done|fixed|wontfix|duplicate|incomplete)\b/gi) || []).length > 1) {
      return true;
    }
  }
  
  return false;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

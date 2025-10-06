/**
 * Jira Status Field Fixer - Popup Script
 * Handles the popup interface interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh');
  const settingsBtn = document.getElementById('settings');
  const feedbackLink = document.getElementById('feedback');
  const helpLink = document.getElementById('help');

  // Refresh page button
  refreshBtn?.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.reload(tab.id);
        window.close();
      }
    } catch (error) {
      console.error('Error refreshing page:', error);
    }
  });

  // Settings button
  settingsBtn?.addEventListener('click', () => {
    // Open options page or show settings
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
  });

  // Feedback link
  feedbackLink?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ 
      url: 'https://github.com/yourusername/jira-status-fixer/issues' 
    });
  });

  // Help link
  helpLink?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ 
      url: 'https://github.com/yourusername/jira-status-fixer#readme' 
    });
  });

  // Check if we're on a Jira page
  checkJiraPage();
});

async function checkJiraPage(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url && (tab.url.includes('atlassian.net') || tab.url.includes('jira.com'))) {
      // We're on a Jira page
      updateStatus('active', 'The extension is working on this Jira page.');
    } else {
      // Not on a Jira page
      updateStatus('inactive', 'Please navigate to a Jira page to use this extension.');
    }
  } catch (error) {
    console.error('Error checking page:', error);
    updateStatus('error', 'Unable to determine page status.');
  }
}

function updateStatus(status: 'active' | 'inactive' | 'error', message: string): void {
  const statusElement = document.querySelector('.status h3');
  const messageElement = document.querySelector('.status p');
  
  if (statusElement && messageElement) {
    const icons = {
      active: '✅',
      inactive: '⚠️',
      error: '❌'
    };
    
    statusElement.textContent = `${icons[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    messageElement.textContent = message;
  }
}

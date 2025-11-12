/**
 * LevCode Application Controller
 * Coordinates file explorer, editor, and compilation functionality
 */

import { initializeExplorer } from './file_explorer.js';
import { initializeEditor, loadFile, saveCurrentFile, getEditorState, setupKeyboardShortcuts } from './editor.js';

// Application state
const appState = {
    initialized: false,
    outputVisible: false
};

/**
 * Initialize the application
 * Sets up all components and event listeners
 */
async function initializeApp() {
    if (appState.initialized) {
        console.log('App already initialized');
        return;
    }
    
    console.log('Initializing LevCode...');
    
    // Initialize editor component
    initializeEditor();
    
    // Initialize file explorer with current directory
    await initializeExplorer('.');
    
    // Set up global keyboard shortcuts
    setupGlobalKeyboardShortcuts();
    
    // Set up toolbar button handlers
    setupToolbarHandlers();
    
    // Set up custom event listeners
    setupCustomEventListeners();
    
    // Set up output panel handlers
    setupOutputPanel();
    
    appState.initialized = true;
    
    console.log('LevCode initialized successfully');
    showNotification('LevCode ready', 'success');
}

/**
 * Set up global keyboard shortcuts
 */
function setupGlobalKeyboardShortcuts() {
    // Set up editor keyboard shortcuts (Ctrl+S for save)
    setupKeyboardShortcuts();
    
    // Additional global shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+R or Cmd+R for run (prevent browser refresh)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            handleRunClick();
        }
        
        // Ctrl+, or Cmd+, for settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            openSettings();
        }
        
        // Escape to close settings
        if (e.key === 'Escape') {
            const modal = document.getElementById('settings-modal');
            if (modal && !modal.classList.contains('hidden')) {
                closeSettings();
            }
        }
    });
}

/**
 * Set up toolbar button handlers
 */
function setupToolbarHandlers() {
    // Run button
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.addEventListener('click', handleRunClick);
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
    
    // Navigation tabs
    setupNavigationTabs();
    
    // Settings modal handlers
    setupSettingsModal();
}

/**
 * Set up custom event listeners for component communication
 */
function setupCustomEventListeners() {
    // Listen for file selection from file explorer
    document.addEventListener('fileSelected', handleFileSelected);
    
    // Listen for notification requests
    document.addEventListener('showNotification', handleNotificationRequest);
}

/**
 * Set up navigation tabs functionality
 */
function setupNavigationTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            // Remove active class from all tabs
            navTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Handle tab-specific functionality
            const tabData = tab.getAttribute('data-tab');
            await handleNavTabClick(tabData);
        });
    });
}

/**
 * Handle navigation tab clicks
 * @param {string} tabData - Data attribute of the clicked tab
 */
async function handleNavTabClick(tabData) {
    const filePanel = document.querySelector('.file-panel');
    const panelHeader = filePanel?.querySelector('.panel-header');
    const fileExplorer = document.getElementById('file-explorer');
    
    if (!filePanel || !panelHeader || !fileExplorer) return;
    
    switch(tabData) {
        case 'files':
            panelHeader.textContent = 'PROJECT';
            // Reload the file explorer
            const { initializeExplorer } = await import('./file_explorer.js');
            await initializeExplorer('.');
            showNotification('Files view active', 'info');
            break;
            
        case 'search':
            panelHeader.textContent = 'SEARCH';
            fileExplorer.innerHTML = `
                <div style="padding: 12px;">
                    <input type="text" id="search-input" placeholder="Search in files..." 
                           style="width: 100%; padding: 8px; background: var(--topbar-bg); 
                                  border: 1px solid var(--border); border-radius: 6px; 
                                  color: var(--text-primary); font-size: 12px; font-family: var(--font-primary); margin-bottom: 12px;">
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <label style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); cursor: pointer;">
                            <input type="checkbox" id="search-case-sensitive" style="cursor: pointer;">
                            <span>Case sensitive</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-secondary); cursor: pointer;">
                            <input type="checkbox" id="search-regex" style="cursor: pointer;">
                            <span>Regex</span>
                        </label>
                    </div>
                    <div id="search-results" style="margin-top: 12px; max-height: 400px; overflow-y: auto;">
                        <div style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 20px;">
                            Enter search term to find in files
                        </div>
                    </div>
                </div>
            `;
            
            // Set up search functionality
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                const searchResults = document.getElementById('search-results');
                const caseSensitive = document.getElementById('search-case-sensitive');
                const useRegex = document.getElementById('search-regex');
                
                if (searchInput) {
                    searchInput.focus();
                    
                    let searchTimeout;
                    searchInput.addEventListener('input', () => {
                        clearTimeout(searchTimeout);
                        searchTimeout = setTimeout(async () => {
                            const query = searchInput.value.trim();
                            if (!query) {
                                searchResults.innerHTML = '<div style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 20px;">Enter search term to find in files</div>';
                                return;
                            }
                            
                            searchResults.innerHTML = '<div style="color: var(--text-secondary); font-size: 11px; padding: 12px;">Searching...</div>';
                            
                            try {
                                const result = await eel.search_in_files(query, caseSensitive.checked, useRegex.checked)();
                                displaySearchResults(result, searchResults);
                            } catch (error) {
                                searchResults.innerHTML = `<div style="color: var(--text-muted); font-size: 11px; padding: 12px;">Error: ${error.message}</div>`;
                            }
                        }, 300);
                    });
                }
            }, 100);
            showNotification('Search panel opened', 'info');
            break;
            
        case 'git':
            panelHeader.textContent = 'GIT';
            fileExplorer.innerHTML = `
                <div style="padding: 12px;">
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Branch</div>
                        <div id="git-branch-info" style="padding: 8px; background: var(--topbar-bg); border-radius: 6px; 
                                    display: flex; align-items: center; gap: 8px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="6" y1="3" x2="6" y2="15"></line>
                                <circle cx="18" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <path d="M18 9a9 9 0 0 1-9 9"></path>
                            </svg>
                            <span style="color: var(--text-primary); font-size: 12px;">Loading...</span>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Changes</div>
                        <div id="git-changes" style="color: var(--text-muted); font-size: 12px; padding: 8px;">
                            Loading...
                        </div>
                    </div>
                    <div style="margin-top: 16px; display: flex; gap: 8px;">
                        <button id="git-refresh" style="flex: 1; padding: 6px 12px; background: var(--hover-bg); 
                                border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); 
                                font-size: 11px; cursor: pointer; transition: background 0.15s ease;">
                            Refresh
                        </button>
                        <button id="git-commit" style="flex: 1; padding: 6px 12px; background: var(--hover-bg); 
                                border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); 
                                font-size: 11px; cursor: pointer; transition: background 0.15s ease;">
                            Commit
                        </button>
                    </div>
                </div>
            `;
            
            // Load git status
            setTimeout(async () => {
                await loadGitStatus();
                
                // Set up button handlers
                const refreshBtn = document.getElementById('git-refresh');
                const commitBtn = document.getElementById('git-commit');
                
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', loadGitStatus);
                    refreshBtn.addEventListener('mouseover', () => refreshBtn.style.background = 'var(--selected-bg)');
                    refreshBtn.addEventListener('mouseout', () => refreshBtn.style.background = 'var(--hover-bg)');
                }
                
                if (commitBtn) {
                    commitBtn.addEventListener('click', handleGitCommit);
                    commitBtn.addEventListener('mouseover', () => commitBtn.style.background = 'var(--selected-bg)');
                    commitBtn.addEventListener('mouseout', () => commitBtn.style.background = 'var(--hover-bg)');
                }
            }, 100);
            
            showNotification('Git panel opened', 'info');
            break;
            
        case 'history':
            panelHeader.textContent = 'HISTORY';
            fileExplorer.innerHTML = `
                <div style="padding: 12px;">
                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Recent Files</div>
                    <div style="color: var(--text-muted); font-size: 12px;">
                        <div style="padding: 8px; margin-bottom: 4px; background: var(--hover-bg); 
                                    border-radius: 6px; cursor: pointer; transition: background 0.15s ease;"
                             onmouseover="this.style.background='var(--selected-bg)'"
                             onmouseout="this.style.background='var(--hover-bg)'">
                            <div style="color: var(--text-primary); font-size: 12px;">example.lvl</div>
                            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
                                2 minutes ago
                            </div>
                        </div>
                        <div style="padding: 8px; margin-bottom: 4px; background: var(--hover-bg); 
                                    border-radius: 6px; cursor: pointer; transition: background 0.15s ease;"
                             onmouseover="this.style.background='var(--selected-bg)'"
                             onmouseout="this.style.background='var(--hover-bg)'">
                            <div style="color: var(--text-primary); font-size: 12px;">test.js</div>
                            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
                                15 minutes ago
                            </div>
                        </div>
                    </div>
                </div>
            `;
            showNotification('History panel opened', 'info');
            break;
    }
}

/**
 * Set up output panel handlers
 */
function setupOutputPanel() {
    const closeBtn = document.getElementById('close-output');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideOutputPanel);
    }
}

/**
 * Handle file selection from file explorer
 * @param {CustomEvent} event - File selection event
 */
async function handleFileSelected(event) {
    const { path, name } = event.detail;
    
    console.log('File selected:', path);
    
    // Load the file into the editor
    await loadFile(path);
}

/**
 * Handle save button click
 */
async function handleSaveClick() {
    const state = getEditorState();
    
    if (!state.currentFile) {
        showNotification('No file is currently open', 'error');
        return;
    }
    
    await saveCurrentFile();
}

/**
 * Handle run button click
 * Compiles and runs the current LevLang file
 */
async function handleRunClick() {
    const state = getEditorState();
    
    if (!state.currentFile) {
        showNotification('No file is currently open', 'error');
        return;
    }
    
    // Visual feedback - disable button
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.disabled = true;
        runBtn.style.opacity = '0.5';
    }
    
    try {
        // Check for unsaved changes
        if (state.isModified) {
            showNotification('Saving file before running...', 'info');
            const saved = await saveCurrentFile();
            
            if (!saved) {
                showNotification('Failed to save file. Cannot run.', 'error');
                return;
            }
        }
        
        // Show loading state
        showNotification('Compiling and running...', 'info');
        
        // Call backend to compile and run
        const result = await eel.compile_and_run(state.currentFile)();
        
        if (!result.success) {
            // Show error in output panel
            showOutputPanel(result.error || 'Compilation failed', 'error');
            showNotification('Compilation failed', 'error');
            return;
        }
        
        // Show output in output panel
        showOutputPanel(result.output, 'success');
        showNotification('Compilation successful', 'success');
        
    } catch (error) {
        console.error('Error running file:', error);
        showOutputPanel('Error: ' + error.message, 'error');
        showNotification('Failed to run file', 'error');
    } finally {
        // Re-enable button
        if (runBtn) {
            runBtn.disabled = false;
            runBtn.style.opacity = '1';
        }
    }
}

/**
 * Show the output panel with compilation results
 * @param {string} content - Output content to display
 * @param {string} type - Output type ('success' or 'error')
 */
function showOutputPanel(content, type = 'success') {
    const outputPanel = document.getElementById('output-panel');
    const outputContent = document.getElementById('output-content');
    
    if (!outputPanel || !outputContent) {
        console.error('Output panel elements not found');
        return;
    }
    
    // Set content
    outputContent.textContent = content;
    
    // Set type class for styling
    outputPanel.classList.remove('output-success', 'output-error');
    outputPanel.classList.add(`output-${type}`);
    
    // Show panel
    outputPanel.classList.remove('hidden');
    appState.outputVisible = true;
}

/**
 * Hide the output panel
 */
function hideOutputPanel() {
    const outputPanel = document.getElementById('output-panel');
    
    if (outputPanel) {
        outputPanel.classList.add('hidden');
        appState.outputVisible = false;
    }
}

/**
 * Handle notification request from other components
 * @param {CustomEvent} event - Notification event
 */
function handleNotificationRequest(event) {
    const { message, type } = event.detail;
    showNotification(message, type);
}

/**
 * Show notification to the user
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'info')
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    if (!notification) {
        console.error('Notification element not found');
        return;
    }
    
    // Set message
    notification.textContent = message;
    
    // Set type class for styling
    notification.classList.remove('notification-success', 'notification-error', 'notification-info');
    notification.classList.add(`notification-${type}`);
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

/**
 * Display search results
 * @param {Object} results - Search results from backend
 * @param {HTMLElement} container - Container element for results
 */
function displaySearchResults(results, container) {
    if (!results || !results.success) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 11px; padding: 12px;">Search failed</div>';
        return;
    }
    
    if (!results.matches || results.matches.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 11px; padding: 12px;">No results found</div>';
        return;
    }
    
    let html = `<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; padding: 0 4px;">
        Found ${results.matches.length} result${results.matches.length !== 1 ? 's' : ''}
    </div>`;
    
    results.matches.forEach(match => {
        html += `
            <div style="padding: 8px; margin-bottom: 4px; background: var(--hover-bg); 
                        border-radius: 6px; cursor: pointer; transition: background 0.15s ease;"
                 onclick="handleSearchResultClick('${match.file}', ${match.line})"
                 onmouseover="this.style.background='var(--selected-bg)'"
                 onmouseout="this.style.background='var(--hover-bg)'">
                <div style="color: var(--text-primary); font-size: 11px; margin-bottom: 2px;">${match.file}</div>
                <div style="color: var(--text-secondary); font-size: 10px; margin-bottom: 4px;">Line ${match.line}</div>
                <div style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono); 
                            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escapeHtml(match.text)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Handle search result click
 * @param {string} file - File path
 * @param {number} line - Line number
 */
async function handleSearchResultClick(file, line) {
    try {
        await loadFile(file);
        showNotification(`Opened ${file} at line ${line}`, 'success');
        
        // TODO: Scroll to line number
    } catch (error) {
        showNotification('Failed to open file', 'error');
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Load git status
 */
async function loadGitStatus() {
    const branchInfo = document.getElementById('git-branch-info');
    const changesDiv = document.getElementById('git-changes');
    
    if (!branchInfo || !changesDiv) return;
    
    try {
        const result = await eel.get_git_status()();
        
        if (!result.success) {
            branchInfo.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="6" y1="3" x2="6" y2="15"></line>
                    <circle cx="18" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M18 9a9 9 0 0 1-9 9"></path>
                </svg>
                <span style="color: var(--text-muted); font-size: 12px;">Not a git repository</span>
            `;
            changesDiv.innerHTML = '<div style="text-align: center;">Initialize git to track changes</div>';
            return;
        }
        
        // Update branch info
        branchInfo.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
            <span style="color: var(--text-primary); font-size: 12px;">${result.branch || 'main'}</span>
        `;
        
        // Update changes
        if (result.changes && result.changes.length > 0) {
            let changesHtml = '';
            result.changes.forEach(change => {
                const statusColor = change.status === 'M' ? 'var(--text-primary)' : 
                                  change.status === 'A' ? 'var(--text-primary)' : 
                                  'var(--text-muted)';
                changesHtml += `
                    <div style="padding: 6px 8px; margin-bottom: 2px; background: var(--topbar-bg); 
                                border-radius: 4px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: ${statusColor}; font-weight: 600; font-size: 10px; width: 16px;">${change.status}</span>
                        <span style="color: var(--text-primary); font-size: 11px; flex: 1; 
                                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${change.file}</span>
                    </div>
                `;
            });
            changesDiv.innerHTML = changesHtml;
        } else {
            changesDiv.innerHTML = '<div style="text-align: center;">No changes detected</div>';
        }
        
    } catch (error) {
        console.error('Error loading git status:', error);
        branchInfo.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
            <span style="color: var(--text-muted); font-size: 12px;">Error loading git info</span>
        `;
        changesDiv.innerHTML = '<div style="text-align: center;">Failed to load changes</div>';
    }
}

/**
 * Handle git commit
 */
async function handleGitCommit() {
    const message = prompt('Enter commit message:');
    if (!message) return;
    
    try {
        showNotification('Committing changes...', 'info');
        const result = await eel.git_commit(message)();
        
        if (result.success) {
            showNotification('Changes committed successfully', 'success');
            await loadGitStatus();
        } else {
            showNotification(result.error || 'Commit failed', 'error');
        }
    } catch (error) {
        showNotification('Failed to commit changes', 'error');
    }
}

/**
 * Settings management
 */
const defaultSettings = {
    fontSize: 12,
    tabSize: 4,
    wordWrap: false,
    lineNumbers: true,
    theme: 'dark'
};

let currentSettings = { ...defaultSettings };

/**
 * Load settings from localStorage
 */
function loadSettings() {
    try {
        const saved = localStorage.getItem('levcode-settings');
        if (saved) {
            currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
        }
        applySettings();
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    try {
        localStorage.setItem('levcode-settings', JSON.stringify(currentSettings));
        applySettings();
        showNotification('Settings saved', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Failed to save settings', 'error');
    }
}

/**
 * Apply settings to the editor
 */
function applySettings() {
    const editor = document.getElementById('editor');
    const highlighting = document.getElementById('highlighting');
    const gutter = document.querySelector('.gutter');
    
    if (editor) {
        editor.style.fontSize = `${currentSettings.fontSize}px`;
        editor.style.tabSize = currentSettings.tabSize;
        editor.style.whiteSpace = currentSettings.wordWrap ? 'pre-wrap' : 'pre';
    }
    
    if (highlighting) {
        highlighting.style.fontSize = `${currentSettings.fontSize}px`;
        highlighting.style.whiteSpace = currentSettings.wordWrap ? 'pre-wrap' : 'pre';
    }
    
    if (gutter) {
        gutter.style.display = currentSettings.lineNumbers ? 'block' : 'none';
    }
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', currentSettings.theme);
}

/**
 * Setup settings modal
 */
function setupSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('close-settings');
    const saveBtn = document.getElementById('save-settings');
    const resetBtn = document.getElementById('reset-settings');
    const overlay = modal?.querySelector('.modal-overlay');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSettings);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSettings);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveSettings);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', handleResetSettings);
    }
    
    // Load settings on startup
    loadSettings();
}

/**
 * Open settings modal
 */
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    
    // Populate form with current settings
    const fontSizeSelect = document.getElementById('font-size');
    const tabSizeSelect = document.getElementById('tab-size');
    const wordWrapCheck = document.getElementById('word-wrap');
    const lineNumbersCheck = document.getElementById('line-numbers');
    const themeSelect = document.getElementById('theme');
    
    if (fontSizeSelect) fontSizeSelect.value = currentSettings.fontSize;
    if (tabSizeSelect) tabSizeSelect.value = currentSettings.tabSize;
    if (wordWrapCheck) wordWrapCheck.checked = currentSettings.wordWrap;
    if (lineNumbersCheck) lineNumbersCheck.checked = currentSettings.lineNumbers;
    if (themeSelect) themeSelect.value = currentSettings.theme;
    
    modal.classList.remove('hidden');
}

/**
 * Close settings modal
 */
function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Handle save settings
 */
function handleSaveSettings() {
    const fontSizeSelect = document.getElementById('font-size');
    const tabSizeSelect = document.getElementById('tab-size');
    const wordWrapCheck = document.getElementById('word-wrap');
    const lineNumbersCheck = document.getElementById('line-numbers');
    const themeSelect = document.getElementById('theme');
    
    currentSettings = {
        fontSize: parseInt(fontSizeSelect?.value || '12'),
        tabSize: parseInt(tabSizeSelect?.value || '4'),
        wordWrap: wordWrapCheck?.checked || false,
        lineNumbers: lineNumbersCheck?.checked || true,
        theme: themeSelect?.value || 'dark'
    };
    
    saveSettings();
    closeSettings();
}

/**
 * Handle reset settings
 */
function handleResetSettings() {
    if (confirm('Reset all settings to defaults?')) {
        currentSettings = { ...defaultSettings };
        saveSettings();
        openSettings(); // Reopen to show reset values
        showNotification('Settings reset to defaults', 'info');
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

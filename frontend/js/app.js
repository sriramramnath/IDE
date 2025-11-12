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
    });
}

/**
 * Set up toolbar button handlers
 */
function setupToolbarHandlers() {
    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveClick);
    }
    
    // Run button
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.addEventListener('click', handleRunClick);
    }
    
    // Navigation tabs
    setupNavigationTabs();
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
                                  color: var(--text-primary); font-size: 12px; font-family: var(--font-primary);">
                    <div style="margin-top: 12px; color: var(--text-secondary); font-size: 11px;">
                        <p style="margin-bottom: 8px;">Search features:</p>
                        <ul style="margin-top: 8px; padding-left: 20px; line-height: 1.8;">
                            <li>Full text search</li>
                            <li>Regex support</li>
                            <li>Case sensitive</li>
                            <li>Whole word match</li>
                        </ul>
                    </div>
                </div>
            `;
            // Focus the search input
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.focus();
            }, 100);
            showNotification('Search panel opened', 'info');
            break;
            
        case 'git':
            panelHeader.textContent = 'GIT';
            fileExplorer.innerHTML = `
                <div style="padding: 12px;">
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Branch</div>
                        <div style="padding: 8px; background: var(--topbar-bg); border-radius: 6px; 
                                    display: flex; align-items: center; gap: 8px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="6" y1="3" x2="6" y2="15"></line>
                                <circle cx="18" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <path d="M18 9a9 9 0 0 1-9 9"></path>
                            </svg>
                            <span style="color: var(--text-primary); font-size: 12px;">main</span>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Changes</div>
                        <div style="color: var(--text-muted); font-size: 12px; padding: 8px; text-align: center;">
                            No changes detected
                        </div>
                    </div>
                </div>
            `;
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

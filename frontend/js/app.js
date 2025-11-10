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
    
    try {
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

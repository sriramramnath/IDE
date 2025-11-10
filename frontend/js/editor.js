/**
 * Editor Component
 * Handles code editor initialization, file loading, saving, and change tracking
 */

// Editor state management
const editorState = {
    currentFile: null,
    content: '',
    isModified: false,
    isSaving: false,
    editor: null,
    openTabs: [],
    activeTab: null
};

/**
 * Initialize the code editor
 * Uses a simple textarea for now (can be upgraded to CodeMirror later)
 */
export function initializeEditor() {
    editorState.editor = document.getElementById('editor');
    
    if (!editorState.editor) {
        console.error('Editor element not found');
        return;
    }
    
    // Set up editor event listeners
    setupEditorListeners();
    
    // Initialize line numbers
    updateLineNumbers();
    
    console.log('Editor initialized');
}

/**
 * Set up event listeners for the editor
 */
function setupEditorListeners() {
    // Track changes in the editor
    editorState.editor.addEventListener('input', handleEditorChange);
    
    // Handle tab key for proper indentation
    editorState.editor.addEventListener('keydown', handleTabKey);
    
    // Update line numbers on scroll
    editorState.editor.addEventListener('scroll', syncLineNumbersScroll);
    
    // Update line numbers on input
    editorState.editor.addEventListener('input', updateLineNumbers);
    
    // Update cursor position
    editorState.editor.addEventListener('click', updateCursorPosition);
    editorState.editor.addEventListener('keyup', updateCursorPosition);
}

/**
 * Handle editor content changes
 */
function handleEditorChange() {
    if (editorState.currentFile && !editorState.isModified) {
        markAsModified();
    }
}

/**
 * Update line numbers display
 */
function updateLineNumbers() {
    const lineNumbersEl = document.getElementById('line-numbers');
    if (!lineNumbersEl || !editorState.editor) return;
    
    const lines = editorState.editor.value.split('\n');
    const lineCount = lines.length;
    
    let lineNumbersHtml = '';
    for (let i = 1; i <= lineCount; i++) {
        lineNumbersHtml += i + '\n';
    }
    
    lineNumbersEl.textContent = lineNumbersHtml;
}

/**
 * Sync line numbers scroll with editor
 */
function syncLineNumbersScroll() {
    const lineNumbersEl = document.getElementById('line-numbers');
    if (!lineNumbersEl || !editorState.editor) return;
    
    lineNumbersEl.scrollTop = editorState.editor.scrollTop;
}

/**
 * Update cursor position in status bar
 */
function updateCursorPosition() {
    const lineColEl = document.getElementById('line-col');
    if (!lineColEl || !editorState.editor) return;
    
    const pos = editorState.editor.selectionStart;
    const text = editorState.editor.value.substring(0, pos);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    
    lineColEl.textContent = `Ln ${line}, Col ${col}`;
}

/**
 * Handle tab key press for proper indentation
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleTabKey(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        
        const start = editorState.editor.selectionStart;
        const end = editorState.editor.selectionEnd;
        const value = editorState.editor.value;
        
        // Insert tab character (4 spaces)
        editorState.editor.value = value.substring(0, start) + '    ' + value.substring(end);
        
        // Move cursor after the inserted spaces
        editorState.editor.selectionStart = editorState.editor.selectionEnd = start + 4;
    }
}

/**
 * Mark the current file as modified
 */
function markAsModified() {
    editorState.isModified = true;
    updateFileStatus();
}

/**
 * Mark the current file as saved
 */
function markAsSaved() {
    editorState.isModified = false;
    updateFileStatus();
}

/**
 * Update the file status indicator in the UI
 */
function updateFileStatus() {
    // Update breadcrumb
    const breadcrumbEl = document.getElementById('breadcrumb');
    if (breadcrumbEl && editorState.currentFile) {
        breadcrumbEl.textContent = editorState.currentFile;
    }
    
    // Update active tab
    updateActiveTab();
}

/**
 * Get the current editor state
 * @returns {Object} Current editor state
 */
export function getEditorState() {
    return {
        currentFile: editorState.currentFile,
        content: editorState.editor ? editorState.editor.value : '',
        isModified: editorState.isModified,
        isSaving: editorState.isSaving
    };
}

/**
 * Check if there are unsaved changes
 * @returns {boolean} True if there are unsaved changes
 */
export function hasUnsavedChanges() {
    return editorState.isModified;
}

/**
 * Load file content into the editor
 * @param {string} filePath - Path of the file to load
 * @param {string} content - File content to display
 */
export function loadFileContent(filePath, content) {
    if (!editorState.editor) {
        console.error('Editor not initialized');
        return;
    }
    
    // Update editor state
    editorState.currentFile = filePath;
    editorState.content = content;
    editorState.isModified = false;
    
    // Set editor content
    editorState.editor.value = content;
    
    // Add or activate tab
    addOrActivateTab(filePath);
    
    // Update UI
    updateFileStatus();
    updateLineNumbers();
    updateCursorPosition();
    
    // Focus the editor
    editorState.editor.focus();
    
    console.log('Loaded file:', filePath);
}

/**
 * Add or activate a tab for the given file
 * @param {string} filePath - Path of the file
 */
function addOrActivateTab(filePath) {
    // Check if tab already exists
    const existingTab = editorState.openTabs.find(tab => tab.path === filePath);
    
    if (existingTab) {
        // Activate existing tab
        editorState.activeTab = filePath;
        renderTabs();
        return;
    }
    
    // Add new tab
    const fileName = filePath.split('/').pop();
    editorState.openTabs.push({
        path: filePath,
        name: fileName,
        modified: false
    });
    
    editorState.activeTab = filePath;
    renderTabs();
}

/**
 * Render tabs in the tab bar
 */
function renderTabs() {
    const tabsContainer = document.getElementById('editor-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    editorState.openTabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = 'editor-tab';
        if (tab.path === editorState.activeTab) {
            tabEl.classList.add('active');
        }
        
        const nameEl = document.createElement('span');
        nameEl.textContent = tab.name + (tab.modified ? ' •' : '');
        tabEl.appendChild(nameEl);
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-tab';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab.path);
        });
        tabEl.appendChild(closeBtn);
        
        tabEl.addEventListener('click', () => {
            switchToTab(tab.path);
        });
        
        tabsContainer.appendChild(tabEl);
    });
}

/**
 * Switch to a different tab
 * @param {string} filePath - Path of the file to switch to
 */
async function switchToTab(filePath) {
    if (filePath === editorState.activeTab) return;
    
    // Load the file
    await loadFile(filePath);
}

/**
 * Close a tab
 * @param {string} filePath - Path of the file to close
 */
function closeTab(filePath) {
    const tabIndex = editorState.openTabs.findIndex(tab => tab.path === filePath);
    if (tabIndex === -1) return;
    
    // Remove tab
    editorState.openTabs.splice(tabIndex, 1);
    
    // If closing active tab, switch to another
    if (filePath === editorState.activeTab) {
        if (editorState.openTabs.length > 0) {
            const newActiveIndex = Math.max(0, tabIndex - 1);
            switchToTab(editorState.openTabs[newActiveIndex].path);
        } else {
            clearEditor();
        }
    }
    
    renderTabs();
}

/**
 * Update active tab modified state
 */
function updateActiveTab() {
    const tab = editorState.openTabs.find(tab => tab.path === editorState.activeTab);
    if (tab) {
        tab.modified = editorState.isModified;
        renderTabs();
    }
}

/**
 * Load a file from the backend and display it in the editor
 * @param {string} filePath - Path of the file to load
 */
export async function loadFile(filePath) {
    try {
        // Call backend to load file
        const result = await eel.load_file(filePath)();
        
        if (!result.success) {
            console.error('Failed to load file:', result.error);
            showNotification(result.error || 'Failed to load file', 'error');
            return;
        }
        
        // Load content into editor
        loadFileContent(result.path, result.content);
        
        showNotification(`Opened ${filePath.split('/').pop()}`, 'success');
        
    } catch (error) {
        console.error('Error loading file:', error);
        showNotification('Failed to load file', 'error');
    }
}

/**
 * Clear the editor and reset state
 */
export function clearEditor() {
    if (editorState.editor) {
        editorState.editor.value = '';
    }
    
    editorState.currentFile = null;
    editorState.content = '';
    editorState.isModified = false;
    
    updateFileStatus();
}

/**
 * Save the current file to disk
 * @returns {Promise<boolean>} True if save was successful
 */
export async function saveCurrentFile() {
    if (!editorState.currentFile) {
        showNotification('No file is currently open', 'error');
        return false;
    }
    
    if (editorState.isSaving) {
        console.log('Save already in progress');
        return false;
    }
    
    try {
        editorState.isSaving = true;
        
        // Get current editor content
        const content = editorState.editor.value;
        
        // Call backend to save file
        const result = await eel.save_file(editorState.currentFile, content)();
        
        if (!result.success) {
            console.error('Failed to save file:', result.error);
            showNotification(result.error || 'Failed to save file', 'error');
            return false;
        }
        
        // Update state
        editorState.content = content;
        markAsSaved();
        
        const fileName = editorState.currentFile.split('/').pop();
        showNotification(`Saved ${fileName}`, 'success');
        
        return true;
        
    } catch (error) {
        console.error('Error saving file:', error);
        showNotification('Failed to save file', 'error');
        return false;
    } finally {
        editorState.isSaving = false;
    }
}

/**
 * Set up keyboard shortcuts for the editor
 */
export function setupKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyboardShortcut);
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardShortcut(e) {
    // Ctrl+S or Cmd+S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
    }
}

/**
 * Show notification to the user
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success' or 'error')
 */
function showNotification(message, type = 'success') {
    const event = new CustomEvent('showNotification', {
        detail: {
            message: message,
            type: type
        }
    });
    document.dispatchEvent(event);
}

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
    activeTab: null,
    highlightTimeout: null
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
    
    // Sync highlighting scroll
    editorState.editor.addEventListener('scroll', syncHighlightingScroll);
    
    // Update line numbers on input
    editorState.editor.addEventListener('input', updateLineNumbers);
    
    // Update syntax highlighting on input
    editorState.editor.addEventListener('input', updateSyntaxHighlighting);
    
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
    const gutterEl = document.querySelector('.gutter');
    if (!gutterEl || !editorState.editor) return;
    
    gutterEl.scrollTop = editorState.editor.scrollTop;
}

/**
 * Sync highlighting scroll with editor
 */
function syncHighlightingScroll() {
    const highlightingEl = document.getElementById('highlighting');
    if (!highlightingEl || !editorState.editor) return;
    
    highlightingEl.scrollTop = editorState.editor.scrollTop;
    highlightingEl.scrollLeft = editorState.editor.scrollLeft;
}

/**
 * Get Prism language based on file extension
 * @param {string} fileName - Name of the file
 * @returns {string} Prism language identifier
 */
function getPrismLanguage(fileName) {
    if (!fileName) return 'javascript';
    
    const ext = fileName.split('.').pop().toLowerCase();
    
    const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'kt': 'kotlin',
        'rs': 'rust',
        'go': 'go',
        'json': 'json',
        'html': 'markup',
        'htm': 'markup',
        'xml': 'markup',
        'css': 'css',
        'scss': 'css',
        'sass': 'css',
        'md': 'markdown',
        'markdown': 'markdown',
        'lvl': 'javascript', // Default to JavaScript for LevLang
    };
    
    return languageMap[ext] || 'javascript';
}

/**
 * Update syntax highlighting (debounced for performance)
 */
function updateSyntaxHighlighting() {
    // Clear existing timeout
    if (editorState.highlightTimeout) {
        clearTimeout(editorState.highlightTimeout);
    }
    
    // Debounce highlighting for better performance
    editorState.highlightTimeout = setTimeout(() => {
        const highlightingContent = document.getElementById('highlighting-content');
        if (!highlightingContent || !editorState.editor) return;
        
        const code = editorState.editor.value;
        const language = getPrismLanguage(editorState.currentFile);
        
        // Update language class
        highlightingContent.className = `language-${language}`;
        
        // Set content and highlight
        highlightingContent.textContent = code;
        
        // Apply Prism highlighting if available
        if (window.Prism) {
            Prism.highlightElement(highlightingContent);
        }
    }, 50); // 50ms debounce
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
    // Ensure the view starts at the top for large files and cursor at start
    try {
        editorState.editor.selectionStart = editorState.editor.selectionEnd = 0;
        editorState.editor.scrollTop = 0;
        const lineNumbersEl = document.getElementById('line-numbers');
        if (lineNumbersEl) lineNumbersEl.scrollTop = 0;
    } catch (e) {
        // ignore if not supported
    }
    
    // Add or activate tab
    addOrActivateTab(filePath);
    
    // Update UI
    updateFileStatus();
    updateLineNumbers();
    updateCursorPosition();
    updateSyntaxHighlighting();
    
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
        modified: false,
        pinned: false
    });
    
    editorState.activeTab = filePath;
    renderTabs();
}

/**
 * Get file icon based on extension (SVG icons)
 * @param {string} fileName - Name of the file
 * @returns {string} Icon SVG
 */
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    
    // Common icon template
    const iconTemplate = (paths) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
    
    switch (ext) {
        case 'lvl':
        case 'txt':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>');
        case 'js':
        case 'jsx':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12h4"/><path d="M10 16h4"/>');
        case 'ts':
        case 'tsx':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 12h6"/><path d="M9 16h6"/>');
        case 'py':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="14" r="2"/>');
        case 'java':
        case 'kt':
        case 'scala':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 12h8"/><path d="M8 16h8"/>');
        case 'json':
        case 'xml':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12l-2 2 2 2"/><path d="M14 12l2 2-2 2"/>');
        case 'md':
        case 'markdown':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h5"/>');
        case 'html':
        case 'htm':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 12l2 2-2 2"/><path d="M16 12l-2 2 2 2"/>');
        case 'css':
        case 'scss':
        case 'sass':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect x="9" y="12" width="6" height="6" rx="1"/>');
        case 'rs':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/>');
        case 'go':
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="3"/>');
        default:
            return iconTemplate('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>');
    }
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
        if (tab.pinned) tabEl.classList.add('pinned');
        if (tab.path === editorState.activeTab) {
            tabEl.classList.add('active');
        }
        
        // Add file icon
        const iconEl = document.createElement('span');
        iconEl.className = 'file-icon';
        iconEl.innerHTML = getFileIcon(tab.name);
        tabEl.appendChild(iconEl);
        
        // Pin indicator (visible when pinned)
        if (tab.pinned) {
            const pin = document.createElement('span');
            pin.className = 'pin-indicator';
            tabEl.insertBefore(pin, iconEl);
        }
        
        const nameEl = document.createElement('span');
        nameEl.textContent = tab.name + (tab.modified ? ' •' : '');
        tabEl.appendChild(nameEl);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-tab';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Do not allow closing pinned tabs
            if (tab.pinned) return;
            closeTab(tab.path);
        });
        tabEl.appendChild(closeBtn);

        // Right-click to toggle pinned state
        tabEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePinTab(tab.path);
        });
        
        tabEl.addEventListener('click', () => {
            switchToTab(tab.path);
        });
        
        tabsContainer.appendChild(tabEl);
    });
}

/**
 * Toggle pin/unpin state for a tab
 * @param {string} filePath - Path of the tab to toggle
 */
function togglePinTab(filePath) {
    const tab = editorState.openTabs.find(t => t.path === filePath);
    if (!tab) return;

    tab.pinned = !tab.pinned;

    // If pinned, move to the left (beginning), if unpinned leave order as-is
    if (tab.pinned) {
        // move item to front
        editorState.openTabs = editorState.openTabs.filter(t => t.path !== filePath);
        editorState.openTabs.unshift(tab);
    }

    renderTabs();
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
    const tab = editorState.openTabs[tabIndex];
    // Prevent closing pinned tabs
    if (tab && tab.pinned) return;

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

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
    editor: null
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
    const statusElement = document.getElementById('file-status');
    
    if (!statusElement) return;
    
    if (editorState.currentFile) {
        const fileName = editorState.currentFile.split('/').pop();
        statusElement.textContent = fileName;
        
        if (editorState.isModified) {
            statusElement.classList.add('modified');
        } else {
            statusElement.classList.remove('modified');
        }
    } else {
        statusElement.textContent = '';
        statusElement.classList.remove('modified');
    }
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
    
    // Update UI
    updateFileStatus();
    
    // Focus the editor
    editorState.editor.focus();
    
    console.log('Loaded file:', filePath);
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

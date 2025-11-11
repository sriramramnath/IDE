/**
 * File Explorer Component
 * Handles directory navigation, file tree rendering, and file selection
 */

// State management
const explorerState = {
    expandedDirs: new Set(),
    selectedFile: null,
    rootPath: null
};

/**
 * Initialize the file explorer with a root directory
 * @param {string} rootPath - Initial directory to load
 */
export async function initializeExplorer(rootPath) {
    explorerState.rootPath = rootPath || await getHomeDirectory();
    await loadDirectory(explorerState.rootPath);
}

/**
 * Get the user's home directory from backend
 * @returns {Promise<string>} Home directory path
 */
async function getHomeDirectory() {
    // For now, use a default path - this can be enhanced with a backend function
    return '.';
}

/**
 * Load directory contents from backend and render the file tree
 * @param {string} path - Directory path to load
 * @param {HTMLElement} parentElement - Parent DOM element to render into
 */
export async function loadDirectory(path, parentElement = null) {
    try {
        const result = await eel.list_directory(path)();
        
        if (!result.success) {
            console.error('Failed to load directory:', result.error);
            showError(result.error);
            return;
        }
        
        // If no parent element specified, render to root file explorer
        const container = parentElement || document.getElementById('file-explorer');
        
        // Clear container if rendering root
        if (!parentElement) {
            container.innerHTML = '';
        }
        
        renderFileTree(result.items, container, path);
        
    } catch (error) {
        console.error('Error loading directory:', error);
        showError('Failed to load directory');
    }
}

/**
 * Render file tree structure in the DOM
 * @param {Array} items - Array of file/directory items
 * @param {HTMLElement} parentElement - Parent DOM element
 * @param {string} parentPath - Path of the parent directory
 */
export function renderFileTree(items, parentElement, parentPath) {
    items.forEach(item => {
        const itemElement = createFileTreeItem(item, parentPath);
        parentElement.appendChild(itemElement);
        
        // If it's a directory and it's expanded, load its contents
        if (item.type === 'dir' && explorerState.expandedDirs.has(item.path)) {
            const childContainer = document.createElement('div');
            childContainer.className = 'file-tree-children';
            childContainer.dataset.path = item.path;
            parentElement.appendChild(childContainer);
            loadDirectory(item.path, childContainer);
        }
    });
}

/**
 * Create a single file tree item element
 * @param {Object} item - File or directory item
 * @param {string} parentPath - Path of the parent directory
 * @returns {HTMLElement} File tree item element
 */
function createFileTreeItem(item, parentPath) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'file-tree-item';
    itemDiv.dataset.path = item.path;
    itemDiv.dataset.type = item.type;
    
    if (item.type === 'dir') {
        itemDiv.classList.add('directory');
    }
    
    // Add icon
    const icon = document.createElement('span');
    icon.className = 'file-icon';
    icon.innerHTML = getFileIcon(item); // Use innerHTML for SVG icons
    itemDiv.appendChild(icon);
    
    // Add file/directory name
    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = item.name;
    itemDiv.appendChild(name);
    
    // Add click handler
    if (item.type === 'dir') {
        itemDiv.addEventListener('click', (e) => handleDirectoryClick(e, item));
    } else {
        itemDiv.addEventListener('click', (e) => handleFileClick(e, item));
    }
    
    // Highlight if this is the selected file
    if (item.path === explorerState.selectedFile) {
        itemDiv.classList.add('selected');
    }
    
    return itemDiv;
}

/**
 * Get icon for file or directory
 * @param {Object} item - File or directory item
 * @returns {string} Icon character or SVG
 */
function getFileIcon(item) {
    if (item.type === 'dir') {
        return explorerState.expandedDirs.has(item.path) ? '&#9662;' : '&#9656;'; // Down/Right arrows
    }
    
    const ext = item.extension || '';
    switch (ext) {
        case '.lvl':
            return '&#128196;'; // Page with curl
        case '.kt':
            return '&#128300;'; // Diamond
        case '.java':
            return '&#9749;'; // Coffee cup
        case '.js':
            return '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="#f7df1e" d="M0 0h16v16H0z"/><path d="M4.32 11.36c.32.64.8 1.12 1.52 1.44.72.32 1.52.32 2.24 0 .72-.32 1.28-.8 1.6-1.44.32-.64.4-1.36.24-2.08-.16-.72-.48-1.36-.96-1.92-.48-.56-1.12-.96-1.84-1.2-1.44-.48-2.88.32-3.36 1.6-.48 1.28.32 2.72 1.6 3.2zm1.28-2.08c-.16-.48.16-.96.64-1.12.48-.16.96.16 1.12.64.16.48-.16.96-.64 1.12-.48.16-.96-.16-1.12-.64z"/></svg>';
        case '.ts':
            return '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="#3178c6" d="M0 0h16v16H0z"/><path fill="#fff" d="M4.4 11.36h1.92v-1.2H7.6v-1.2h-1.28V4.4H4.4v7.96zm3.84-3.92c.32-.16.56-.4.72-.72.16-.32.24-.64.24-1.04 0-.4-.08-.72-.24-1.04-.16-.32-.4-.56-.72-.72-.32-.16-.64-.24-1.04-.24-.4 0-.72.08-1.04.24-.32.16-.56.4-.72.72-.16.32-.24.64-.24 1.04 0 .4.08.72.24 1.04.16.32.4.56.72.72.32.16.64.24 1.04.24.4 0 .72-.08 1.04-.24zm-.4-1.2c-.16-.08-.24-.24-.24-.48 0-.24.08-.4.24-.48.16-.08.32-.16.48-.16.16 0 .32.08.48.16.16.08.24.24.24.48 0 .24-.08.4-.24.48-.16.08-.32.16-.48.16-.16 0-.32-.08-.48-.16z"/></svg>';
        case '.py':
            return '&#128013;'; // Snake
        case '.json':
            return '{ }';
        case '.md':
            return '&#128221;'; // Memo
        default:
            return '&#128195;'; // File folder
    }
}

/**
 * Handle directory click - toggle expansion/collapse
 * @param {Event} e - Click event
 * @param {Object} item - Directory item
 */
function handleDirectoryClick(e, item) {
    e.stopPropagation();
    
    const isExpanded = explorerState.expandedDirs.has(item.path);
    
    if (isExpanded) {
        // Collapse directory
        collapseDirectory(item.path);
    } else {
        // Expand directory
        expandDirectory(item.path);
    }
}

/**
 * Expand a directory and load its contents
 * @param {string} dirPath - Directory path to expand
 */
async function expandDirectory(dirPath) {
    explorerState.expandedDirs.add(dirPath);
    
    // Find the directory element
    const dirElement = document.querySelector(`.file-tree-item[data-path="${CSS.escape(dirPath)}"]`);
    if (!dirElement) return;
    
    // Update icon
    const icon = dirElement.querySelector('.file-icon');
    if (icon) {
        icon.innerHTML = getFileIcon({ type: 'dir', path: dirPath });
    }
    
    // Check if children container already exists
    let childContainer = dirElement.nextElementSibling;
    if (childContainer && childContainer.classList.contains('file-tree-children')) {
        // Already exists, just make it visible
        childContainer.style.display = 'block';
    } else {
        // Create new children container
        childContainer = document.createElement('div');
        childContainer.className = 'file-tree-children';
        childContainer.dataset.path = dirPath;
        
        // Insert after the directory element
        dirElement.parentNode.insertBefore(childContainer, dirElement.nextSibling);
        
        // Load directory contents
        await loadDirectory(dirPath, childContainer);
    }
}

/**
 * Collapse a directory and hide its contents
 * @param {string} dirPath - Directory path to collapse
 */
function collapseDirectory(dirPath) {
    explorerState.expandedDirs.delete(dirPath);
    
    // Find the directory element
    const dirElement = document.querySelector(`.file-tree-item[data-path="${CSS.escape(dirPath)}"]`);
    if (!dirElement) return;
    
    // Update icon
    const icon = dirElement.querySelector('.file-icon');
    if (icon) {
        icon.innerHTML = getFileIcon({ type: 'dir', path: dirPath });
    }
    
    // Hide children container
    const childContainer = dirElement.nextElementSibling;
    if (childContainer && childContainer.classList.contains('file-tree-children')) {
        childContainer.remove();
    }
}

/**
 * Handle file click - select file and trigger loading
 * @param {Event} e - Click event
 * @param {Object} item - File item
 */
function handleFileClick(e, item) {
    e.stopPropagation();
    
    // Update selected file state
    setSelectedFile(item.path);
    
    // Dispatch custom event for file selection
    const event = new CustomEvent('fileSelected', {
        detail: {
            path: item.path,
            name: item.name
        }
    });
    document.dispatchEvent(event);
}

/**
 * Set the currently selected file and update UI
 * @param {string} filePath - Path of the selected file
 */
export function setSelectedFile(filePath) {
    // Remove previous selection
    const previousSelected = document.querySelector('.file-tree-item.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Update state
    explorerState.selectedFile = filePath;
    
    // Add selection to new file
    const fileElement = document.querySelector(`.file-tree-item[data-path="${CSS.escape(filePath)}"]`);
    if (fileElement) {
        fileElement.classList.add('selected');
    }
}

/**
 * Get the currently selected file path
 * @returns {string|null} Selected file path or null
 */
export function getSelectedFile() {
    return explorerState.selectedFile;
}

/**
 * Show error notification
 * @param {string} message - Error message to display
 */
function showError(message) {
    const event = new CustomEvent('showNotification', {
        detail: {
            message: message,
            type: 'error'
        }
    });
    document.dispatchEvent(event);
}
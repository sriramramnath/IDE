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
        if (explorerState.expandedDirs.has(item.path)) {
            itemDiv.classList.add('expanded');
        }
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
        const isExpanded = explorerState.expandedDirs.has(item.path);
        return `<svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    }
    
    const ext = item.extension || '';
    switch (ext) {
        case '.lvl':
            return '📄';
        case '.kt':
            return '💎';
        case '.java':
            return '☕';
        case '.js':
            return '📜';
        case '.ts':
            return '📘';
        case '.py':
            return '🐍';
        case '.json':
            return '⚙️';
        case '.md':
            return '📝';
        case '.rs':
            return '⚙️';
        default:
            return '📄';
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
    
    // Add expanded class for chevron rotation
    dirElement.classList.add('expanded');
    
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
    
    // Remove expanded class for chevron rotation
    dirElement.classList.remove('expanded');
    
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
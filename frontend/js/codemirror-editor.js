/**
 * CodeMirror 6 Editor Implementation
 * Simple syntax highlighting with proper text selection
 */

// Import from CDN
const CM_VERSION = '6.0.1';
const CDN_BASE = 'https://cdn.jsdelivr.net/npm';

// Load CodeMirror modules dynamically
let EditorView, EditorState, basicSetup, javascript, python, rust, json, html, css, markdown;

async function loadCodeMirror() {
    try {
        // Load core modules
        const codemirror = await import(`${CDN_BASE}/codemirror@${CM_VERSION}/dist/index.js`);
        EditorView = codemirror.EditorView;
        EditorState = codemirror.EditorState;
        
        // Load basic setup
        const setup = await import(`${CDN_BASE}/codemirror@${CM_VERSION}/dist/index.js`);
        basicSetup = setup.basicSetup;
        
        // Load language modes
        const jsLang = await import(`${CDN_BASE}/@codemirror/lang-javascript@${CM_VERSION}/dist/index.js`);
        javascript = jsLang.javascript;
        
        return true;
    } catch (error) {
        console.error('Failed to load CodeMirror:', error);
        return false;
    }
}

// Simple syntax highlighting without CodeMirror
export function createSimpleEditor(container) {
    // Create a simple contenteditable div with basic highlighting
    const editorDiv = document.createElement('div');
    editorDiv.className = 'simple-editor';
    editorDiv.contentEditable = 'true';
    editorDiv.spellcheck = false;
    
    container.appendChild(editorDiv);
    
    return {
        getValue: () => editorDiv.textContent,
        setValue: (text) => {
            editorDiv.textContent = text;
            highlightSyntax(editorDiv);
        },
        focus: () => editorDiv.focus(),
        getElement: () => editorDiv
    };
}

function highlightSyntax(element) {
    const text = element.textContent;
    const highlighted = text
        .replace(/\b(function|const|let|var|if|else|return|import|export|class|extends)\b/g, '<span class="keyword">$1</span>')
        .replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
        .replace(/\/\/.*/g, '<span class="comment">$&</span>')
        .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
    
    // Preserve cursor position
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const offset = range.startOffset;
    
    element.innerHTML = highlighted;
    
    // Restore cursor
    try {
        const newRange = document.createRange();
        newRange.setStart(element.firstChild || element, Math.min(offset, element.textContent.length));
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    } catch (e) {
        // Ignore cursor restoration errors
    }
}

export { loadCodeMirror };

"""
File system operations for LevCode editor.
Handles directory listing, file loading, and file saving with proper error handling.
"""

import eel
from pathlib import Path
from typing import Dict, List, Any


@eel.expose
def list_directory(path: str) -> Dict[str, Any]:
    """
    Read directory contents and return structured data.
    
    Args:
        path: Directory path to list
        
    Returns:
        Dictionary with:
        - success: bool indicating operation success
        - items: list of file/directory items with name, type, and path
        - error: error message if operation failed
    """
    try:
        dir_path = Path(path).resolve()
        
        # Check if path exists and is a directory
        if not dir_path.exists():
            return {
                'success': False,
                'error': f'Path does not exist: {path}',
                'items': []
            }
        
        if not dir_path.is_dir():
            return {
                'success': False,
                'error': f'Path is not a directory: {path}',
                'items': []
            }
        
        # List directory contents
        items = []
        for item in sorted(dir_path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
            try:
                item_type = 'dir' if item.is_dir() else 'file'
                items.append({
                    'name': item.name,
                    'type': item_type,
                    'path': str(item),
                    'extension': item.suffix if item.is_file() else ''
                })
            except PermissionError:
                # Skip items we don't have permission to access
                continue
        
        return {
            'success': True,
            'items': items
        }
        
    except PermissionError as e:
        return {
            'success': False,
            'error': f'Permission denied: {path}',
            'details': str(e),
            'items': []
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error listing directory: {str(e)}',
            'details': str(e),
            'items': []
        }


@eel.expose
def load_file(file_path: str) -> Dict[str, Any]:
    """
    Load file contents from disk.
    
    Args:
        file_path: Path to the file to load
        
    Returns:
        Dictionary with:
        - success: bool indicating operation success
        - content: file contents as string
        - path: normalized file path
        - error: error message if operation failed
    """
    try:
        path = Path(file_path).resolve()
        
        # Check if file exists
        if not path.exists():
            return {
                'success': False,
                'error': f'File not found: {file_path}',
                'path': str(path)
            }
        
        # Check if it's a file (not a directory)
        if not path.is_file():
            return {
                'success': False,
                'error': f'Path is not a file: {file_path}',
                'path': str(path)
            }
        
        # Read file contents with UTF-8 encoding
        content = path.read_text(encoding='utf-8')
        
        return {
            'success': True,
            'content': content,
            'path': str(path)
        }
        
    except FileNotFoundError:
        return {
            'success': False,
            'error': f'File not found: {file_path}',
            'path': file_path
        }
    except PermissionError:
        return {
            'success': False,
            'error': f'Permission denied: {file_path}',
            'path': file_path
        }
    except UnicodeDecodeError as e:
        return {
            'success': False,
            'error': f'Unable to decode file as UTF-8: {file_path}',
            'details': str(e),
            'path': file_path
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error loading file: {str(e)}',
            'details': str(e),
            'path': file_path
        }


@eel.expose
def save_file(file_path: str, content: str) -> Dict[str, Any]:
    """
    Save content to disk.
    
    Args:
        file_path: Path where the file should be saved
        content: Content to write to the file
        
    Returns:
        Dictionary with:
        - success: bool indicating operation success
        - path: normalized file path
        - error: error message if operation failed
    """
    try:
        path = Path(file_path).resolve()
        
        # Ensure parent directory exists
        path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write content to file with UTF-8 encoding
        # This preserves the original line endings in the content
        path.write_text(content, encoding='utf-8')
        
        return {
            'success': True,
            'path': str(path)
        }
        
    except PermissionError:
        return {
            'success': False,
            'error': f'Permission denied: {file_path}',
            'path': file_path
        }
    except OSError as e:
        return {
            'success': False,
            'error': f'Error saving file: {str(e)}',
            'details': str(e),
            'path': file_path
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error saving file: {str(e)}',
            'details': str(e),
            'path': file_path
        }

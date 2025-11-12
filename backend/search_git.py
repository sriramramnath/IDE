"""
Search and Git functionality for LevCode.
"""

import eel
import os
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Any


@eel.expose
def search_in_files(query: str, case_sensitive: bool = False, use_regex: bool = False) -> Dict[str, Any]:
    """
    Search for text in files within the current directory.
    
    Args:
        query: Search query string
        case_sensitive: Whether to perform case-sensitive search
        use_regex: Whether to treat query as regex pattern
        
    Returns:
        Dictionary with success status and list of matches
    """
    try:
        matches = []
        current_dir = Path.cwd()
        
        # Compile regex pattern if needed
        if use_regex:
            try:
                pattern = re.compile(query, 0 if case_sensitive else re.IGNORECASE)
            except re.error as e:
                return {
                    'success': False,
                    'error': f'Invalid regex pattern: {str(e)}',
                    'matches': []
                }
        else:
            # Escape special regex characters for literal search
            escaped_query = re.escape(query)
            pattern = re.compile(escaped_query, 0 if case_sensitive else re.IGNORECASE)
        
        # Search through files
        for root, dirs, files in os.walk(current_dir):
            # Skip hidden directories and common ignore patterns
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'build', 'dist']]
            
            for file in files:
                # Skip binary and hidden files
                if file.startswith('.') or file.endswith(('.pyc', '.pyo', '.so', '.dll', '.exe')):
                    continue
                
                file_path = Path(root) / file
                relative_path = file_path.relative_to(current_dir)
                
                try:
                    # Try to read as text file
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_num, line in enumerate(f, 1):
                            if pattern.search(line):
                                matches.append({
                                    'file': str(relative_path),
                                    'line': line_num,
                                    'text': line.strip()[:100]  # Limit to 100 chars
                                })
                                
                                # Limit total matches to prevent overwhelming UI
                                if len(matches) >= 100:
                                    break
                    
                    if len(matches) >= 100:
                        break
                        
                except (UnicodeDecodeError, PermissionError):
                    # Skip files that can't be read
                    continue
            
            if len(matches) >= 100:
                break
        
        return {
            'success': True,
            'matches': matches,
            'total': len(matches)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'matches': []
        }


@eel.expose
def get_git_status() -> Dict[str, Any]:
    """
    Get the current git status including branch and changes.
    
    Returns:
        Dictionary with git status information
    """
    try:
        current_dir = Path.cwd()
        
        # Check if git is available
        try:
            subprocess.run(['git', '--version'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            return {
                'success': False,
                'error': 'Git is not installed or not in PATH'
            }
        
        # Check if current directory is a git repository
        result = subprocess.run(
            ['git', 'rev-parse', '--git-dir'],
            cwd=current_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            return {
                'success': False,
                'error': 'Not a git repository'
            }
        
        # Get current branch
        branch_result = subprocess.run(
            ['git', 'branch', '--show-current'],
            cwd=current_dir,
            capture_output=True,
            text=True,
            check=True
        )
        branch = branch_result.stdout.strip() or 'main'
        
        # Get status
        status_result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=current_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse status output
        changes = []
        for line in status_result.stdout.strip().split('\n'):
            if line:
                status = line[:2].strip()
                file_path = line[3:].strip()
                
                # Map git status codes to readable format
                if status == 'M' or status == 'MM':
                    status_text = 'M'  # Modified
                elif status == 'A':
                    status_text = 'A'  # Added
                elif status == 'D':
                    status_text = 'D'  # Deleted
                elif status == '??':
                    status_text = 'U'  # Untracked
                else:
                    status_text = status
                
                changes.append({
                    'status': status_text,
                    'file': file_path
                })
        
        return {
            'success': True,
            'branch': branch,
            'changes': changes
        }
        
    except subprocess.CalledProcessError as e:
        return {
            'success': False,
            'error': f'Git command failed: {e.stderr if e.stderr else str(e)}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


@eel.expose
def git_commit(message: str) -> Dict[str, Any]:
    """
    Commit all changes with the given message.
    
    Args:
        message: Commit message
        
    Returns:
        Dictionary with success status
    """
    try:
        current_dir = Path.cwd()
        
        # Add all changes
        subprocess.run(
            ['git', 'add', '-A'],
            cwd=current_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Commit changes
        result = subprocess.run(
            ['git', 'commit', '-m', message],
            cwd=current_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        return {
            'success': True,
            'message': 'Changes committed successfully',
            'output': result.stdout
        }
        
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr if e.stderr else str(e)
        if 'nothing to commit' in error_msg:
            return {
                'success': False,
                'error': 'No changes to commit'
            }
        return {
            'success': False,
            'error': f'Git commit failed: {error_msg}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

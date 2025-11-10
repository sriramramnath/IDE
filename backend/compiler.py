"""
LevLang compiler interface for LevCode editor.
Handles compilation and execution of LevLang source files.
"""

import eel
import subprocess
from pathlib import Path
from typing import Dict, Any


@eel.expose
def compile_and_run(file_path: str, compiler_command: str = 'levlang') -> Dict[str, Any]:
    """
    Compile and execute a LevLang source file.
    
    Executes the LevLang compiler as a subprocess and captures output.
    Falls back to mock output if compiler is not available.
    
    Args:
        file_path: Path to the LevLang source file to compile
        compiler_command: Command to invoke the LevLang compiler (default: 'levlang')
        
    Returns:
        Dictionary with:
        - success: bool indicating operation success
        - output: compilation/execution output (stdout + stderr)
        - error: error message if operation failed
    """
    try:
        path = Path(file_path).resolve()
        
        # Validate file exists
        if not path.exists():
            return {
                'success': False,
                'output': '',
                'error': f'File not found: {file_path}'
            }
        
        # Validate it's a file
        if not path.is_file():
            return {
                'success': False,
                'output': '',
                'error': f'Path is not a file: {file_path}'
            }
        
        # Attempt to execute the LevLang compiler
        try:
            # Run the compiler with a timeout to prevent hanging
            result = subprocess.run(
                [compiler_command, str(path)],
                capture_output=True,
                text=True,
                timeout=30,  # 30 second timeout
                cwd=path.parent  # Run in the file's directory
            )
            
            # Combine stdout and stderr for complete output
            output = result.stdout
            if result.stderr:
                output += '\n' + result.stderr
            
            # Check if compilation was successful (return code 0)
            if result.returncode == 0:
                return {
                    'success': True,
                    'output': output or 'Compilation completed successfully.',
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'output': output,
                    'error': f'Compilation failed with exit code {result.returncode}'
                }
                
        except FileNotFoundError:
            # Compiler not found - return mock output as fallback
            mock_output = f"""Compiling {path.name}...
[LevLang compiler not found in PATH]

Mock compilation output:
- File: {path.name}
- Status: Compiler not installed

To use actual compilation, ensure the LevLang compiler is installed and available in your system PATH.
"""
            return {
                'success': False,
                'output': mock_output,
                'error': 'LevLang compiler not found. Please install the compiler or add it to your PATH.'
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': 'Compilation timed out after 30 seconds'
            }
        
    except Exception as e:
        return {
            'success': False,
            'output': '',
            'error': f'Error during compilation: {str(e)}',
            'details': str(e)
        }

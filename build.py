"""
LevCode Build Script
Uses PyInstaller to create standalone executables for Windows, macOS, and Linux.
"""

import PyInstaller.__main__
import sys
import platform
from pathlib import Path


def build_executable():
    """
    Build LevCode executable using PyInstaller.
    
    Configures PyInstaller to:
    - Use backend/main.py as entry point
    - Bundle frontend directory as data
    - Create windowed application (no console)
    - Generate single-file executable
    - Include all dependencies
    """
    
    # Determine platform-specific settings
    system = platform.system()
    
    # Base PyInstaller arguments
    args = [
        'backend/main.py',              # Entry point
        '--name=LevCode',                # Application name
        '--windowed',                    # No console window
        '--onefile',                     # Single executable file
        '--clean',                       # Clean PyInstaller cache
        '--noconfirm',                   # Replace output directory without confirmation
    ]
    
    # Add frontend directory to bundled data
    # Format: --add-data=source:destination
    if system == 'Windows':
        args.append('--add-data=frontend;frontend')
    else:  # macOS and Linux use colon separator
        args.append('--add-data=frontend:frontend')
    
    # Add icon if available (platform-specific)
    icon_path = Path('icon.ico') if system == 'Windows' else Path('icon.icns')
    if icon_path.exists():
        args.append(f'--icon={icon_path}')
    
    # Platform-specific configurations
    if system == 'Darwin':  # macOS
        args.extend([
            '--osx-bundle-identifier=com.levcode.editor',
            # Note: universal2 requires all dependencies to be universal binaries
            # Uncomment the line below if all your dependencies support it:
            # '--target-arch=universal2',
        ])
    
    # Hidden imports that PyInstaller might miss
    args.extend([
        '--hidden-import=eel',
        '--hidden-import=backend.file_manager',
        '--hidden-import=backend.compiler',
    ])
    
    # Collect all data files from eel package
    args.append('--collect-all=eel')
    
    print(f"Building LevCode for {system}...")
    print(f"PyInstaller arguments: {' '.join(args)}")
    print("-" * 60)
    
    try:
        # Run PyInstaller
        PyInstaller.__main__.run(args)
        
        print("-" * 60)
        print(f"Build complete! Executable location:")
        print(f"  dist/LevCode{'.exe' if system == 'Windows' else ''}")
        print()
        print("Next steps:")
        print("  1. Test the executable on this platform")
        print("  2. Test on a system without Python installed")
        print("  3. Verify file operations and compilation work correctly")
        
    except Exception as e:
        print(f"Build failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    # Check if PyInstaller is installed
    try:
        import PyInstaller
    except ImportError:
        print("Error: PyInstaller is not installed.")
        print("Install it with: pip install pyinstaller")
        sys.exit(1)
    
    build_executable()

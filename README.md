# LevCode

A lightweight, cross-platform desktop application for editing and running LevLang source files.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Using LevCode](#using-levcode)
- [Building Standalone Executables](#building-standalone-executables)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

LevCode is built with Python and Eel, providing an IDE-like environment for LevLang development. It combines a Python backend for file operations and compilation with a modern HTML/CSS/JavaScript frontend for a clean, responsive user interface.

### Features

- **File System Browser**: Navigate local directories and open .lvl files
- **Code Editor**: Clean text editor with syntax support for LevLang
- **Integrated Compilation**: Run LevLang code directly from the editor
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Standalone Executables**: Distribute as single-file applications
- **Minimal Design**: Flat, distraction-free interface focused on coding
- **Local Operation**: No internet connection or cloud services required
- **Keyboard Shortcuts**: Standard shortcuts for save, copy, paste, etc.

## Requirements

- Python 3.8 or higher
- pip (Python package manager)
- Chrome, Chromium, or Edge browser (required by Eel)

## Quick Start

### For End Users

Download the pre-built executable for your platform from the releases page:
- **Windows**: `LevCode.exe`
- **macOS**: `LevCode.app`
- **Linux**: `LevCode`

Double-click to run. No Python installation required.

### For Developers

See the [Development Setup](#development-setup) section below.

## Development Setup

### 1. Clone or download the project

```bash
git clone <repository-url>
cd levcode
```

### 2. Create a virtual environment (recommended)

Creating a virtual environment isolates project dependencies from your system Python.

```bash
python -m venv venv
```

Or using Python 3 explicitly:
```bash
python3 -m venv venv
```

### 3. Activate the virtual environment

**Windows (Command Prompt):**
```bash
venv\Scripts\activate
```

**Windows (PowerShell):**
```bash
venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal prompt when activated.

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `eel` - Python-JavaScript bridge
- `pyinstaller` - For building executables

### 5. Run the application in development mode

```bash
python backend/main.py
```

The application window should open automatically. If it doesn't, check the [Troubleshooting](#troubleshooting) section.

### 6. Making changes

- **Backend code**: Edit files in `backend/` directory
- **Frontend code**: Edit files in `frontend/` directory
- **Styles**: Edit `frontend/css/style.css`
- **JavaScript**: Edit files in `frontend/js/`

Changes to frontend files (HTML/CSS/JS) are reflected immediately on page refresh. Backend changes require restarting the application.

## Using LevCode

### Opening Files

1. **Launch the application** (double-click executable or run `python backend/main.py`)
2. **Navigate the file explorer** on the left sidebar
3. **Click on a directory** to expand/collapse it
4. **Click on a .lvl file** to open it in the editor

### Editing Code

1. **Type directly** in the editor pane
2. **Use standard shortcuts**:
   - `Ctrl+C` / `Cmd+C` - Copy
   - `Ctrl+V` / `Cmd+V` - Paste
   - `Ctrl+X` / `Cmd+X` - Cut
   - `Ctrl+Z` / `Cmd+Z` - Undo
   - `Ctrl+Y` / `Cmd+Y` - Redo
3. **Modified indicator** appears when file has unsaved changes

### Saving Files

- **Keyboard shortcut**: Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (macOS)
- **Save button**: Click the "Save" button in the toolbar
- **Confirmation**: A notification appears when save is successful

### Running Code

1. **Open a LevLang file** in the editor
2. **Click the "Run" button** in the toolbar
3. **View output** in the output panel (compilation results or errors)

**Note**: The LevLang compiler must be installed and accessible for the Run feature to work.

### Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Save file | `Ctrl+S` | `Cmd+S` |
| Copy | `Ctrl+C` | `Cmd+C` |
| Paste | `Ctrl+V` | `Cmd+V` |
| Cut | `Ctrl+X` | `Cmd+X` |
| Undo | `Ctrl+Z` | `Cmd+Z` |
| Redo | `Ctrl+Y` | `Cmd+Y` |
| Select all | `Ctrl+A` | `Cmd+A` |

## Project Structure

```
levcode/
├── backend/              # Python backend code
│   ├── __init__.py
│   ├── main.py          # Application entry point (Eel initialization)
│   ├── file_manager.py  # File system operations (list, load, save)
│   └── compiler.py      # LevLang compilation interface
├── frontend/            # HTML/CSS/JavaScript frontend
│   ├── index.html       # Main application layout
│   ├── css/
│   │   └── style.css    # Application styles (flat design)
│   └── js/
│       ├── app.js           # Main application controller
│       ├── editor.js        # Code editor component
│       └── file_explorer.js # File browser component
├── tests/               # Test files
│   ├── test_end_to_end.py
│   ├── test_path_handling.py
│   └── run_all_tests.py
├── .kiro/               # Kiro spec files
│   └── specs/
│       └── levcode-editor/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── build.py             # PyInstaller build script
├── test_build.py        # Build verification script
├── levcode.spec         # Advanced PyInstaller configuration
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── BUILD.md            # Detailed build instructions
└── TESTING.md          # Testing procedures and checklists
```

### Key Files

- **backend/main.py**: Entry point that initializes Eel and starts the application
- **backend/file_manager.py**: Handles all file system operations (list directories, load/save files)
- **backend/compiler.py**: Interfaces with the LevLang compiler to run code
- **frontend/index.html**: Main UI layout with sidebar and editor pane
- **frontend/js/app.js**: Coordinates components and handles global events
- **frontend/js/editor.js**: Manages the code editor and file state
- **frontend/js/file_explorer.js**: Renders directory tree and handles navigation
- **build.py**: Automated build script for creating executables
- **requirements.txt**: Lists all Python dependencies (Eel, PyInstaller)

## Building Standalone Executables

LevCode can be packaged as a standalone executable for distribution using PyInstaller.

### Prerequisites

1. Complete the [Development Setup](#development-setup)
2. Ensure the application runs correctly in development mode
3. PyInstaller should already be installed (included in requirements.txt)

### Quick Build

```bash
python build.py
```

This script automatically:
- Detects your operating system
- Configures PyInstaller with appropriate settings
- Bundles all frontend assets
- Creates a single-file executable in the `dist/` directory

### Build Output

The executable will be created in the `dist/` directory:

- **Windows**: `dist/LevCode.exe` (single .exe file)
- **macOS**: `dist/LevCode` (single executable)
- **Linux**: `dist/LevCode` (single executable)

### Platform-Specific Build Instructions

#### Windows

```bash
# Build
python build.py

# The executable is ready to use
dist\LevCode.exe
```

**Optional**: Add an icon by placing `icon.ico` in the project root before building.

#### macOS

```bash
# Build
python build.py

# Run the executable
./dist/LevCode

# Or create an .app bundle using the spec file
pyinstaller levcode.spec
open dist/LevCode.app
```

**Note**: For distribution, you may need to code sign the application:
```bash
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" dist/LevCode.app
```

#### Linux

```bash
# Build
python build.py

# Make executable (if needed)
chmod +x dist/LevCode

# Run
./dist/LevCode
```

### Testing the Build

After building, verify the executable works correctly:

```bash
# Run automated build verification
python test_build.py

# Manually test the executable
# Windows:
dist\LevCode.exe

# macOS:
./dist/LevCode

# Linux:
./dist/LevCode
```

**Important**: Test the executable on a clean system without Python installed to ensure all dependencies are properly bundled.

### Advanced Build Options

For more control over the build process, edit `build.py` or use the `levcode.spec` file:

```bash
# Use the spec file for advanced configuration
pyinstaller levcode.spec
```

The spec file allows you to:
- Add hidden imports for missing modules
- Include additional data files
- Configure platform-specific options
- Adjust compression and optimization settings

### Build Troubleshooting

**"Module not found" errors:**
Add missing modules to the `hiddenimports` list in `build.py`:
```python
'--hidden-import=missing_module_name',
```

**Frontend files not loading:**
Verify the `--add-data` argument includes the frontend directory correctly.

**Large executable size:**
- Use `--onedir` instead of `--onefile` to create a directory with dependencies
- Remove unused dependencies from `requirements.txt`

For comprehensive build instructions, see [BUILD.md](BUILD.md).

## Documentation

- **[BUILD.md](BUILD.md)** - Detailed build instructions for all platforms
- **[TESTING.md](TESTING.md)** - Comprehensive testing procedures and checklists
- **levcode.spec** - Advanced PyInstaller configuration file

## Troubleshooting

### Development Mode Issues

#### Application doesn't start

**Problem**: Running `python backend/main.py` shows errors or nothing happens.

**Solutions**:
1. Verify Python version: `python --version` (should be 3.8+)
2. Ensure virtual environment is activated (you should see `(venv)` in prompt)
3. Reinstall dependencies: `pip install -r requirements.txt`
4. Check if a browser is installed (Chrome, Chromium, or Edge required by Eel)

#### "Module not found" errors

**Problem**: `ModuleNotFoundError: No module named 'eel'` or similar.

**Solutions**:
1. Activate virtual environment: `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate` (Windows)
2. Install dependencies: `pip install -r requirements.txt`
3. Verify installation: `pip list` should show `eel` and `pyinstaller`

#### Browser window doesn't open

**Problem**: Application runs but no window appears.

**Solutions**:
1. Check if Chrome, Chromium, or Edge is installed
2. Look for error messages in the terminal
3. Try specifying a browser in `backend/main.py`:
   ```python
   eel.start('index.html', mode='chrome')  # or 'edge', 'chromium'
   ```

#### Port already in use

**Problem**: `OSError: [Errno 48] Address already in use`

**Solutions**:
1. Close any other running instances of LevCode
2. Kill the process using the port: 
   - macOS/Linux: `lsof -ti:8000 | xargs kill`
   - Windows: `netstat -ano | findstr :8000` then `taskkill /PID <pid> /F`
3. Restart the application

### File Operations Issues

#### Cannot open files

**Problem**: Clicking files in the explorer doesn't load them.

**Solutions**:
1. Check file permissions (ensure you have read access)
2. Verify the file path is correct
3. Check browser console for JavaScript errors (F12)
4. Ensure the file is a text file (binary files may cause issues)

#### Cannot save files

**Problem**: Save operation fails or shows errors.

**Solutions**:
1. Check write permissions for the file and directory
2. Ensure the file isn't open in another application
3. Verify disk space is available
4. Check if the file path is valid

#### Files not showing in explorer

**Problem**: File explorer is empty or doesn't show expected files.

**Solutions**:
1. Verify you have permission to read the directory
2. Check if the directory actually contains files
3. Refresh the file explorer (reload the application)
4. Look for error messages in the terminal

### Build Issues

#### PyInstaller build fails

**Problem**: `python build.py` shows errors.

**Solutions**:
1. Ensure PyInstaller is installed: `pip install pyinstaller`
2. Clear previous build artifacts: `rm -rf build dist` (macOS/Linux) or `rmdir /s build dist` (Windows)
3. Try building with verbose output: Add `--log-level=DEBUG` to build.py
4. Check for missing dependencies in requirements.txt

#### Executable doesn't run

**Problem**: Built executable fails to start or crashes immediately.

**Solutions**:
1. Test on the same machine where you built it first
2. Check if antivirus is blocking the executable
3. Run from terminal to see error messages:
   - Windows: `dist\LevCode.exe`
   - macOS/Linux: `./dist/LevCode`
4. Verify all dependencies are bundled: `python test_build.py`

#### "Frontend files not found" in executable

**Problem**: Executable runs but shows blank window or errors about missing files.

**Solutions**:
1. Verify `frontend/` directory exists in project root
2. Check the `--add-data` argument in `build.py` is correct
3. Rebuild with clean build: `python build.py`
4. Ensure frontend files are included in the spec file

#### Executable is too large

**Problem**: Executable file size is unexpectedly large (>200 MB).

**Solutions**:
1. Use `--onedir` mode instead of `--onefile` (creates directory with dependencies)
2. Remove unused dependencies from requirements.txt
3. Enable UPX compression (usually enabled by default)
4. Consider excluding unnecessary modules

### Platform-Specific Issues

#### Windows: "Windows protected your PC" warning

**Problem**: Windows SmartScreen blocks the executable.

**Solutions**:
1. Click "More info" then "Run anyway"
2. For distribution, code sign the executable with a valid certificate
3. Build reputation by having users download and run the app

#### macOS: "Cannot be opened because the developer cannot be verified"

**Problem**: macOS Gatekeeper blocks the application.

**Solutions**:
1. Right-click the app and select "Open" (first time only)
2. Or: System Preferences > Security & Privacy > "Open Anyway"
3. For distribution, code sign and notarize the application:
   ```bash
   codesign --deep --force --verify --verbose --sign "Developer ID" dist/LevCode.app
   xcrun notarytool submit dist/LevCode.app --wait
   ```

#### Linux: "Permission denied"

**Problem**: Cannot execute the built application.

**Solutions**:
1. Make the file executable: `chmod +x dist/LevCode`
2. Ensure you have execute permissions for the directory
3. Try running with `./dist/LevCode` instead of just `dist/LevCode`

### Compilation Issues

#### "Compiler not found" when clicking Run

**Problem**: Run button shows error about missing compiler.

**Solutions**:
1. Ensure the LevLang compiler is installed and in your PATH
2. Update `backend/compiler.py` with the correct compiler path
3. Check compiler installation: `levlang --version` (or appropriate command)

#### Compilation output not displaying

**Problem**: Run button works but no output is shown.

**Solutions**:
1. Check browser console for JavaScript errors (F12)
2. Verify `backend/compiler.py` returns output correctly
3. Check if the output display element exists in `frontend/index.html`

### Performance Issues

#### Application is slow or unresponsive

**Solutions**:
1. Close other applications to free up memory
2. Avoid opening very large files (>10 MB)
3. Check for infinite loops or errors in browser console (F12)
4. Restart the application

#### High memory usage

**Solutions**:
1. Close and reopen files periodically
2. Avoid keeping many large files open
3. Check for memory leaks in browser console
4. Restart the application

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**: Look for error messages in the terminal
2. **Browser console**: Press F12 and check the Console tab for JavaScript errors
3. **Verify setup**: Ensure all steps in [Development Setup](#development-setup) were completed
4. **Test in development**: If the executable fails, test in development mode first
5. **Review documentation**: See [BUILD.md](BUILD.md) and [TESTING.md](TESTING.md) for detailed information
6. **Report bugs**: Include your platform, Python version, error messages, and steps to reproduce

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError: No module named 'eel'` | Dependencies not installed | Run `pip install -r requirements.txt` |
| `Address already in use` | Port 8000 is occupied | Kill the process or restart your computer |
| `Permission denied` | No execute permission (Linux) | Run `chmod +x dist/LevCode` |
| `Cannot find frontend files` | Frontend not bundled | Check `--add-data` in build.py |
| `Browser not found` | No compatible browser | Install Chrome, Chromium, or Edge |

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Ensure code follows the existing style
5. Test on multiple platforms if possible
6. Submit a pull request with a clear description

## License

[Add your license information here]

# LevCode Testing Guide

This document provides comprehensive testing procedures for LevCode packaged executables across different platforms.

## Pre-Build Testing

Before building executables, ensure the application works in development mode:

```bash
# Install dependencies
pip install -r requirements.txt

# Run in development mode
python backend/main.py
```

Verify all functionality works before proceeding to build.

## Build Testing

### Step 1: Build the Executable

```bash
python build.py
```

### Step 2: Verify Build Artifacts

```bash
python test_build.py
```

This script will:
- Check that dist/ directory exists
- Verify executable was created
- Display file sizes and permissions
- List bundled resources

## Platform-Specific Testing

### Windows Testing

**Build Environment:**
- Windows 10 or 11
- Python 3.8+ installed
- PyInstaller installed

**Build Command:**
```cmd
python build.py
```

**Expected Output:**
- `dist/LevCode.exe` (single executable file)
- Size: ~50-100 MB (depending on dependencies)

**Testing Checklist:**

- [ ] **Launch Test**
  - Double-click `LevCode.exe`
  - Application window opens without console
  - No error messages displayed

- [ ] **File Explorer Test**
  - File explorer sidebar displays
  - Can navigate directories
  - Can expand/collapse folders
  - Files are listed correctly

- [ ] **File Operations Test**
  - Click on a .lvl file to open
  - File content loads in editor
  - Can type and edit content
  - Save file (Ctrl+S)
  - Verify changes persist (close and reopen file)

- [ ] **Path Handling Test**
  - Test with files on C:\ drive
  - Test with files on other drives (D:\, E:\, etc.)
  - Test with paths containing spaces
  - Test with long file paths

- [ ] **Compilation Test**
  - Click Run button
  - Compilation output displays (or error if compiler not available)
  - No crashes or freezes

- [ ] **Clean System Test**
  - Copy executable to Windows machine WITHOUT Python
  - Run executable
  - Verify all functionality works

### macOS Testing

**Build Environment:**
- macOS 10.15+ (Catalina or later)
- Python 3.8+ installed
- PyInstaller installed

**Build Command:**
```bash
python build.py
```

**Expected Output:**
- `dist/LevCode` (single executable) OR
- `dist/LevCode.app` (application bundle, if using spec file)

**Testing Checklist:**

- [ ] **Launch Test**
  - Run `./dist/LevCode` or open `LevCode.app`
  - Application window opens
  - No Gatekeeper warnings (or can bypass with right-click > Open)

- [ ] **File Explorer Test**
  - File explorer sidebar displays
  - Can navigate directories
  - Can expand/collapse folders
  - Files are listed correctly

- [ ] **File Operations Test**
  - Click on a .lvl file to open
  - File content loads in editor
  - Can type and edit content
  - Save file (Cmd+S)
  - Verify changes persist

- [ ] **Path Handling Test**
  - Test with files in /Users/username/
  - Test with files in /Applications/
  - Test with paths containing spaces
  - Test with Unicode characters in filenames

- [ ] **Compilation Test**
  - Click Run button
  - Compilation output displays
  - No crashes or freezes

- [ ] **Clean System Test**
  - Copy executable to Mac WITHOUT Python
  - Run executable
  - Verify all functionality works

- [ ] **Code Signing Test** (for distribution)
  - Sign the application
  - Verify signature: `codesign -v dist/LevCode.app`
  - Test on another Mac

### Linux Testing

**Build Environment:**
- Ubuntu 20.04+ or equivalent
- Python 3.8+ installed
- PyInstaller installed

**Build Command:**
```bash
python build.py
chmod +x dist/LevCode
```

**Expected Output:**
- `dist/LevCode` (single executable file)

**Testing Checklist:**

- [ ] **Launch Test**
  - Run `./dist/LevCode`
  - Application window opens
  - No permission errors

- [ ] **File Explorer Test**
  - File explorer sidebar displays
  - Can navigate directories
  - Can expand/collapse folders
  - Files are listed correctly

- [ ] **File Operations Test**
  - Click on a .lvl file to open
  - File content loads in editor
  - Can type and edit content
  - Save file (Ctrl+S)
  - Verify changes persist

- [ ] **Path Handling Test**
  - Test with files in /home/username/
  - Test with files in /tmp/
  - Test with paths containing spaces
  - Test with symbolic links

- [ ] **Compilation Test**
  - Click Run button
  - Compilation output displays
  - No crashes or freezes

- [ ] **Clean System Test**
  - Copy executable to Linux machine WITHOUT Python
  - Run executable
  - Verify all functionality works

- [ ] **Distribution Test**
  - Create .deb package (optional)
  - Create AppImage (optional)
  - Test installation and removal

## Functional Testing

These tests should be performed on ALL platforms:

### Core Functionality

- [ ] **Application Startup**
  - Application launches within 5 seconds
  - Window displays at correct size (1200x800)
  - UI elements render correctly

- [ ] **File Explorer**
  - Initial directory loads (user home directory)
  - Directory tree renders correctly
  - Icons distinguish files from folders
  - Click to expand/collapse directories
  - Scroll works for long directory lists

- [ ] **Code Editor**
  - Editor pane displays correctly
  - Text is readable and properly formatted
  - Cursor blinks and moves correctly
  - Can type and delete text
  - Can select text (mouse and keyboard)
  - Can copy/paste text
  - Undo/redo works (Ctrl+Z / Ctrl+Y)

- [ ] **File Operations**
  - Open file: content loads correctly
  - Edit file: changes appear in real-time
  - Save file: changes persist to disk
  - Modified indicator: shows when file has unsaved changes
  - Save indicator: clears after successful save

- [ ] **Keyboard Shortcuts**
  - Ctrl+S / Cmd+S: saves current file
  - Standard editor shortcuts work (Ctrl+C, Ctrl+V, etc.)

- [ ] **Compilation**
  - Run button is visible and clickable
  - Clicking Run triggers compilation
  - Output displays to user
  - Errors are shown clearly

### Error Handling

- [ ] **Invalid File Paths**
  - Try to open non-existent file
  - Error message displays
  - Application doesn't crash

- [ ] **Permission Errors**
  - Try to open file without read permission
  - Try to save file without write permission
  - Appropriate error messages display

- [ ] **Large Files**
  - Open file > 1 MB
  - Editor handles it gracefully (or shows warning)

- [ ] **Empty Files**
  - Open empty .lvl file
  - Editor displays empty content
  - Can type and save

### Performance Testing

- [ ] **Startup Time**
  - Application launches in < 5 seconds
  - UI is responsive immediately

- [ ] **File Loading**
  - Small files (< 10 KB) load instantly
  - Medium files (10-100 KB) load in < 1 second
  - Large files (> 100 KB) load in < 3 seconds

- [ ] **Editor Performance**
  - Typing is responsive (no lag)
  - Scrolling is smooth
  - No memory leaks during extended use

### UI/UX Testing

- [ ] **Visual Design**
  - Flat design aesthetic (no shadows/gradients)
  - Consistent spacing and alignment
  - Clear visual hierarchy
  - Readable text (good contrast)

- [ ] **Responsiveness**
  - Window can be resized
  - UI adapts to different window sizes
  - Minimum window size is usable

- [ ] **User Feedback**
  - Save success notification appears
  - Error messages are clear and helpful
  - Loading indicators show for long operations

## Dependency Testing

Verify all dependencies are bundled correctly:

- [ ] **Eel Library**
  - Application communicates with backend
  - No "module not found" errors

- [ ] **Frontend Assets**
  - HTML, CSS, JavaScript files load
  - UI renders correctly
  - No 404 errors in console

- [ ] **Python Standard Library**
  - File operations work (os, pathlib)
  - JSON parsing works
  - All imports succeed

## Regression Testing

After any changes to the codebase:

1. Rebuild the executable
2. Run through core functionality tests
3. Verify no existing features broke
4. Test new features specifically

## Automated Testing

For continuous integration:

```bash
# Run unit tests
python -m pytest tests/

# Build executable
python build.py

# Verify build
python test_build.py

# Run end-to-end tests (if available)
python tests/test_end_to_end.py
```

## Bug Reporting

When reporting issues, include:

1. **Platform**: Windows/macOS/Linux version
2. **Build**: Output of `python build.py`
3. **Steps to reproduce**: Exact steps that cause the issue
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots**: If applicable
7. **Logs**: Any error messages or console output

## Test Results Documentation

After testing, document results:

```markdown
## Test Results - [Date]

**Platform**: [Windows 10 / macOS 13 / Ubuntu 22.04]
**Build**: [Build command and version]
**Tester**: [Name]

### Results Summary
- Total Tests: X
- Passed: Y
- Failed: Z

### Failed Tests
1. [Test name]: [Description of failure]
2. [Test name]: [Description of failure]

### Notes
[Any additional observations]
```

## Known Issues

Document any known issues or limitations:

- [ ] Issue 1: Description and workaround
- [ ] Issue 2: Description and workaround

## Next Steps

After successful testing:

1. Document test results
2. Fix any identified issues
3. Prepare for distribution
4. Create installation instructions
5. Prepare release notes

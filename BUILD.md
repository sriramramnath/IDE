# LevCode Build Instructions

This document provides instructions for building LevCode standalone executables for Windows, macOS, and Linux.

## Prerequisites

1. **Python 3.8 or higher** installed on your system
2. **All dependencies** installed: `pip install -r requirements.txt`
3. **PyInstaller** installed: `pip install pyinstaller` (included in requirements.txt)

## Quick Build

The simplest way to build LevCode is using the `build.py` script:

```bash
python build.py
```

This will:
- Detect your platform automatically
- Configure PyInstaller with appropriate settings
- Bundle the frontend directory
- Create a single-file executable in the `dist/` directory

## Platform-Specific Instructions

### Windows

**Building:**
```bash
python build.py
```

**Output:**
- `dist/LevCode.exe` - Single executable file

**Optional - Add Icon:**
1. Place `icon.ico` in the project root
2. Run `python build.py` (icon will be automatically included)

**Testing:**
1. Navigate to `dist/` directory
2. Double-click `LevCode.exe` to launch
3. Test on a Windows machine without Python installed

### macOS

**Building:**
```bash
python build.py
```

**Output:**
- `dist/LevCode` - Executable (when using build.py)
- `dist/LevCode.app` - Application bundle (when using levcode.spec)

**Optional - Add Icon:**
1. Place `icon.icns` in the project root
2. Run `python build.py` (icon will be automatically included)

**Creating .app Bundle:**
For a proper macOS application bundle, use the spec file:
```bash
pyinstaller levcode.spec
```

**Code Signing (for distribution):**
```bash
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" dist/LevCode.app
```

**Testing:**
1. Navigate to `dist/` directory
2. Double-click `LevCode.app` to launch
3. Test on a Mac without Python installed

### Linux

**Building:**
```bash
python build.py
```

**Output:**
- `dist/LevCode` - Single executable file

**Making Executable:**
```bash
chmod +x dist/LevCode
```

**Testing:**
1. Navigate to `dist/` directory
2. Run `./LevCode` from terminal
3. Test on a Linux machine without Python installed

## Advanced Build Options

### Using the Spec File

For more control over the build process, use the `levcode.spec` file:

```bash
pyinstaller levcode.spec
```

The spec file allows you to:
- Customize hidden imports
- Add additional data files
- Configure platform-specific options
- Adjust compression settings

### Build Flags

Common PyInstaller flags you can add to `build.py`:

- `--debug=all` - Enable debug output
- `--log-level=DEBUG` - Verbose logging
- `--noupx` - Disable UPX compression (faster build, larger file)
- `--onedir` - Create directory with dependencies instead of single file

### Clean Build

To perform a clean build (removes cache):

```bash
python build.py
```

The `--clean` flag is already included in `build.py`.

## Troubleshooting

### "Module not found" errors

If PyInstaller misses dependencies, add them to the `hiddenimports` list in `build.py` or `levcode.spec`:

```python
args.extend([
    '--hidden-import=missing_module',
])
```

### Frontend files not found

Verify the frontend directory is being bundled correctly:
- Check the `--add-data` argument in `build.py`
- Ensure `frontend/` directory exists in project root

### Eel connection errors

If the executable fails to start:
1. Check that Eel is properly bundled: `--collect-all=eel`
2. Verify Chrome/Edge is installed (Eel requires a browser)
3. Try running with `--debug=all` flag for detailed logs

### Large executable size

To reduce executable size:
1. Use `--onedir` instead of `--onefile` (creates directory with dependencies)
2. Remove unused dependencies from requirements.txt
3. Use UPX compression (enabled by default)

### macOS Gatekeeper issues

If macOS blocks the app:
1. Right-click the app and select "Open"
2. Or disable Gatekeeper temporarily: `sudo spctl --master-disable`
3. For distribution, code sign the application

## Testing Checklist

After building, verify the following:

- [ ] Application launches without errors
- [ ] File explorer displays directory structure
- [ ] Files can be opened in the editor
- [ ] Editor allows typing and editing
- [ ] Save functionality works correctly
- [ ] Run button triggers compilation (if compiler is available)
- [ ] Application works on system without Python installed
- [ ] All UI elements render correctly
- [ ] Keyboard shortcuts work (Ctrl+S / Cmd+S)

## Distribution

### Windows
- Distribute `LevCode.exe` directly
- Optionally create installer using NSIS or Inno Setup

### macOS
- Distribute `LevCode.app` in a DMG file
- Code sign for distribution outside App Store
- Notarize for macOS 10.15+

### Linux
- Distribute executable directly
- Create .deb package: `dpkg-deb --build`
- Create AppImage for universal compatibility

## Build Artifacts

After building, you'll find:

```
dist/
  LevCode[.exe]     # Executable (Windows/Linux)
  LevCode.app/      # Application bundle (macOS, with spec file)

build/              # Temporary build files (can be deleted)
  
*.spec              # PyInstaller spec file (optional)
```

## Continuous Integration

For automated builds, use the following commands:

```bash
# Install dependencies
pip install -r requirements.txt

# Build
python build.py

# Test (basic smoke test)
./dist/LevCode --version  # If version flag is implemented
```

## Additional Resources

- [PyInstaller Documentation](https://pyinstaller.org/en/stable/)
- [Eel Documentation](https://github.com/python-eel/Eel)
- [Code Signing Guide (macOS)](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

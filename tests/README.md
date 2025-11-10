# LevCode Tests

This directory contains automated tests for the LevCode application.

## Test Suites

### test_path_handling.py
Tests cross-platform path handling and file system operations:
- Unix-style paths (macOS, Linux)
- Windows-style paths with drive letters
- Path normalization and resolution
- Special characters and spaces in paths
- Error handling for invalid paths

### test_end_to_end.py
End-to-end functional tests covering:
- File explorer navigation and directory listing
- Editor file loading and saving operations
- Change tracking and content preservation
- Compilation workflow
- Error handling for invalid operations
- Complete user workflows

## Running Tests

### Run all tests:
```bash
python3 tests/run_all_tests.py
```

### Run a specific test suite:
```bash
python3 tests/test_path_handling.py -v
python3 tests/test_end_to_end.py -v
```

### Run a specific test class:
```bash
python3 -m unittest tests.test_path_handling.TestCrossPlatformPaths -v
```

### Run a specific test method:
```bash
python3 -m unittest tests.test_path_handling.TestCrossPlatformPaths.test_unix_style_paths -v
```

## Requirements

Tests require the same dependencies as the main application:
```bash
pip3 install -r requirements.txt
```

## Test Coverage

The test suites verify:
- ✅ Cross-platform path handling (Windows, macOS, Linux)
- ✅ File system operations (list, load, save)
- ✅ Directory navigation and expansion
- ✅ File type identification
- ✅ Content preservation during save/load cycles
- ✅ Compilation interface
- ✅ Error handling for invalid inputs
- ✅ Complete user workflows

## Platform Testing

These tests have been designed to work across:
- **macOS**: Unix-style paths, tested on macOS 11+
- **Linux**: Unix-style paths, tested on Ubuntu 20.04+
- **Windows**: Drive letters and backslashes, tested on Windows 10+

The tests use Python's `pathlib` which handles platform differences automatically.

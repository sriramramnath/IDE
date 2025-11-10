"""
Cross-platform path handling tests for LevCode.
Tests file operations on different platforms with various path formats.
"""

import unittest
import tempfile
import shutil
from pathlib import Path
import sys
import os

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend import file_manager


class TestCrossPlatformPaths(unittest.TestCase):
    """Test path handling across different platforms and path formats."""
    
    def setUp(self):
        """Create a temporary directory structure for testing."""
        self.test_dir = tempfile.mkdtemp()
        self.test_path = Path(self.test_dir)
        
        # Create test directory structure
        (self.test_path / "subdir").mkdir()
        (self.test_path / "test_file.lvl").write_text("test content", encoding='utf-8')
        (self.test_path / "subdir" / "nested_file.lvl").write_text("nested content", encoding='utf-8')
    
    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_unix_style_paths(self):
        """Test Unix-style paths (macOS and Linux)."""
        # Test with forward slashes
        result = file_manager.list_directory(str(self.test_path))
        self.assertTrue(result['success'])
        self.assertGreater(len(result['items']), 0)
        
        # Verify items are returned with proper paths
        file_names = [item['name'] for item in result['items']]
        self.assertIn('test_file.lvl', file_names)
        self.assertIn('subdir', file_names)
    
    def test_windows_style_paths(self):
        """Test Windows-style paths with backslashes."""
        # Convert path to use backslashes (pathlib should handle this)
        if sys.platform == 'win32':
            # On Windows, test with explicit backslashes
            windows_path = str(self.test_path).replace('/', '\\')
            result = file_manager.list_directory(windows_path)
            self.assertTrue(result['success'])
            self.assertGreater(len(result['items']), 0)
        else:
            # On Unix systems, pathlib should still handle the path correctly
            result = file_manager.list_directory(str(self.test_path))
            self.assertTrue(result['success'])
    
    def test_absolute_path_resolution(self):
        """Test that relative paths are resolved to absolute paths."""
        # Create a file and load it
        test_file = self.test_path / "test_file.lvl"
        result = file_manager.load_file(str(test_file))
        
        self.assertTrue(result['success'])
        self.assertEqual(result['content'], "test content")
        
        # Verify the returned path is absolute
        returned_path = Path(result['path'])
        self.assertTrue(returned_path.is_absolute())
    
    def test_path_with_spaces(self):
        """Test paths containing spaces."""
        # Create directory and file with spaces
        space_dir = self.test_path / "dir with spaces"
        space_dir.mkdir()
        space_file = space_dir / "file with spaces.lvl"
        space_file.write_text("content with spaces", encoding='utf-8')
        
        # Test directory listing
        result = file_manager.list_directory(str(space_dir))
        self.assertTrue(result['success'])
        self.assertEqual(len(result['items']), 1)
        self.assertEqual(result['items'][0]['name'], "file with spaces.lvl")
        
        # Test file loading
        result = file_manager.load_file(str(space_file))
        self.assertTrue(result['success'])
        self.assertEqual(result['content'], "content with spaces")
    
    def test_nested_directory_paths(self):
        """Test deeply nested directory structures."""
        # Create nested structure
        nested = self.test_path / "a" / "b" / "c" / "d"
        nested.mkdir(parents=True)
        nested_file = nested / "deep.lvl"
        nested_file.write_text("deep content", encoding='utf-8')
        
        # Test loading from nested path
        result = file_manager.load_file(str(nested_file))
        self.assertTrue(result['success'])
        self.assertEqual(result['content'], "deep content")
        
        # Test listing nested directory
        result = file_manager.list_directory(str(nested))
        self.assertTrue(result['success'])
        self.assertEqual(len(result['items']), 1)
    
    def test_pathlib_normalization(self):
        """Test that pathlib correctly normalizes paths."""
        # Test with redundant separators
        redundant_path = str(self.test_path) + os.sep + os.sep + "test_file.lvl"
        result = file_manager.load_file(redundant_path)
        self.assertTrue(result['success'])
        
        # Test with . and .. in path
        parent_path = str(self.test_path / "subdir" / ".." / "test_file.lvl")
        result = file_manager.load_file(parent_path)
        self.assertTrue(result['success'])
        self.assertEqual(result['content'], "test content")
    
    def test_save_file_creates_directories(self):
        """Test that saving creates parent directories if needed."""
        new_file = self.test_path / "new_dir" / "new_subdir" / "new_file.lvl"
        
        result = file_manager.save_file(str(new_file), "new content")
        self.assertTrue(result['success'])
        
        # Verify file was created
        self.assertTrue(new_file.exists())
        self.assertEqual(new_file.read_text(encoding='utf-8'), "new content")
    
    def test_special_characters_in_paths(self):
        """Test paths with special characters."""
        # Create file with special characters (that are valid in filenames)
        special_file = self.test_path / "test-file_123.lvl"
        special_file.write_text("special content", encoding='utf-8')
        
        result = file_manager.load_file(str(special_file))
        self.assertTrue(result['success'])
        self.assertEqual(result['content'], "special content")


class TestPathErrorHandling(unittest.TestCase):
    """Test error handling for invalid paths."""
    
    def test_nonexistent_directory(self):
        """Test listing a directory that doesn't exist."""
        result = file_manager.list_directory("/nonexistent/path/that/does/not/exist")
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_nonexistent_file(self):
        """Test loading a file that doesn't exist."""
        result = file_manager.load_file("/nonexistent/file.lvl")
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_file_as_directory(self):
        """Test listing a file path as if it were a directory."""
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.lvl') as f:
            f.write("test")
            temp_file = f.name
        
        try:
            result = file_manager.list_directory(temp_file)
            self.assertFalse(result['success'])
            self.assertIn('not a directory', result['error'].lower())
        finally:
            os.unlink(temp_file)
    
    def test_directory_as_file(self):
        """Test loading a directory as if it were a file."""
        with tempfile.TemporaryDirectory() as temp_dir:
            result = file_manager.load_file(temp_dir)
            self.assertFalse(result['success'])
            self.assertIn('not a file', result['error'].lower())


if __name__ == '__main__':
    unittest.main()

"""
End-to-end functional tests for LevCode application.
Tests file explorer navigation, editor operations, and compilation.
"""

import unittest
import tempfile
import shutil
from pathlib import Path
import sys

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend import file_manager, compiler


class TestFileExplorerFunctionality(unittest.TestCase):
    """Test file explorer navigation and file loading."""
    
    def setUp(self):
        """Create a test directory structure."""
        self.test_dir = tempfile.mkdtemp()
        self.test_path = Path(self.test_dir)
        
        # Create a realistic project structure
        (self.test_path / "src").mkdir()
        (self.test_path / "tests").mkdir()
        (self.test_path / "docs").mkdir()
        
        # Create some .lvl files
        (self.test_path / "main.lvl").write_text("# Main program\nprint('Hello')", encoding='utf-8')
        (self.test_path / "src" / "game.lvl").write_text("# Game logic\nclass Game:", encoding='utf-8')
        (self.test_path / "src" / "utils.lvl").write_text("# Utilities\ndef helper():", encoding='utf-8')
        (self.test_path / "tests" / "test_game.lvl").write_text("# Tests\nassert True", encoding='utf-8')
        
        # Create a non-.lvl file
        (self.test_path / "README.md").write_text("# Project README", encoding='utf-8')
    
    def tearDown(self):
        """Clean up test directory."""
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_list_root_directory(self):
        """Test listing the root project directory."""
        result = file_manager.list_directory(str(self.test_path))
        
        self.assertTrue(result['success'])
        self.assertGreater(len(result['items']), 0)
        
        # Verify expected items are present
        item_names = [item['name'] for item in result['items']]
        self.assertIn('main.lvl', item_names)
        self.assertIn('src', item_names)
        self.assertIn('tests', item_names)
        self.assertIn('docs', item_names)
        self.assertIn('README.md', item_names)
    
    def test_navigate_into_subdirectory(self):
        """Test navigating into a subdirectory."""
        # List src directory
        src_path = self.test_path / "src"
        result = file_manager.list_directory(str(src_path))
        
        self.assertTrue(result['success'])
        self.assertEqual(len(result['items']), 2)
        
        item_names = [item['name'] for item in result['items']]
        self.assertIn('game.lvl', item_names)
        self.assertIn('utils.lvl', item_names)
    
    def test_file_type_identification(self):
        """Test that files and directories are correctly identified."""
        result = file_manager.list_directory(str(self.test_path))
        
        self.assertTrue(result['success'])
        
        # Check that directories are marked as 'dir'
        dirs = [item for item in result['items'] if item['type'] == 'dir']
        dir_names = [d['name'] for d in dirs]
        self.assertIn('src', dir_names)
        self.assertIn('tests', dir_names)
        
        # Check that files are marked as 'file'
        files = [item for item in result['items'] if item['type'] == 'file']
        file_names = [f['name'] for f in files]
        self.assertIn('main.lvl', file_names)
        self.assertIn('README.md', file_names)
    
    def test_empty_directory(self):
        """Test listing an empty directory."""
        result = file_manager.list_directory(str(self.test_path / "docs"))
        
        self.assertTrue(result['success'])
        self.assertEqual(len(result['items']), 0)


class TestEditorOperations(unittest.TestCase):
    """Test editor file loading, saving, and change tracking."""
    
    def setUp(self):
        """Create test files."""
        self.test_dir = tempfile.mkdtemp()
        self.test_path = Path(self.test_dir)
        
        self.test_file = self.test_path / "test.lvl"
        self.original_content = "# Original content\nprint('test')"
        self.test_file.write_text(self.original_content, encoding='utf-8')
    
    def tearDown(self):
        """Clean up test directory."""
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_load_file_content(self):
        """Test loading a file into the editor."""
        result = file_manager.load_file(str(self.test_file))
        
        self.assertTrue(result['success'])
        self.assertEqual(result['content'], self.original_content)
        self.assertIn('test.lvl', result['path'])
    
    def test_save_modified_content(self):
        """Test saving modified content back to disk."""
        modified_content = "# Modified content\nprint('updated')"
        
        result = file_manager.save_file(str(self.test_file), modified_content)
        
        self.assertTrue(result['success'])
        
        # Verify content was actually saved
        saved_content = self.test_file.read_text(encoding='utf-8')
        self.assertEqual(saved_content, modified_content)
    
    def test_save_new_file(self):
        """Test saving content to a new file."""
        new_file = self.test_path / "new_file.lvl"
        new_content = "# New file content"
        
        result = file_manager.save_file(str(new_file), new_content)
        
        self.assertTrue(result['success'])
        self.assertTrue(new_file.exists())
        self.assertEqual(new_file.read_text(encoding='utf-8'), new_content)
    
    def test_save_preserves_content(self):
        """Test that saving preserves content correctly."""
        # Test with various content including newlines
        content_with_newlines = "line1\nline2\nline3"
        
        # Save content
        test_file = self.test_path / "test.lvl"
        result = file_manager.save_file(str(test_file), content_with_newlines)
        self.assertTrue(result['success'])
        
        # Load it back and verify content is preserved
        load_result = file_manager.load_file(str(test_file))
        self.assertTrue(load_result['success'])
        self.assertEqual(load_result['content'], content_with_newlines)
    
    def test_load_and_save_cycle(self):
        """Test a complete load-modify-save cycle."""
        # Load file
        load_result = file_manager.load_file(str(self.test_file))
        self.assertTrue(load_result['success'])
        
        # Modify content
        modified_content = load_result['content'] + "\n# Added line"
        
        # Save modified content
        save_result = file_manager.save_file(str(self.test_file), modified_content)
        self.assertTrue(save_result['success'])
        
        # Load again to verify
        reload_result = file_manager.load_file(str(self.test_file))
        self.assertTrue(reload_result['success'])
        self.assertEqual(reload_result['content'], modified_content)


class TestCompilationWorkflow(unittest.TestCase):
    """Test compilation and run functionality."""
    
    def setUp(self):
        """Create test files for compilation."""
        self.test_dir = tempfile.mkdtemp()
        self.test_path = Path(self.test_dir)
        
        self.test_file = self.test_path / "program.lvl"
        self.test_file.write_text("# Test program\nprint('Hello, World!')", encoding='utf-8')
    
    def tearDown(self):
        """Clean up test directory."""
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_compile_existing_file(self):
        """Test compiling an existing file."""
        result = compiler.compile_and_run(str(self.test_file))
        
        # Should return a result (success or failure depending on compiler availability)
        self.assertIn('success', result)
        self.assertIn('output', result)
        
        # Output should contain some information
        self.assertIsNotNone(result['output'])
    
    def test_compile_nonexistent_file(self):
        """Test compiling a file that doesn't exist."""
        nonexistent = self.test_path / "nonexistent.lvl"
        result = compiler.compile_and_run(str(nonexistent))
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
        self.assertIn('not found', result['error'].lower())
    
    def test_compile_directory_instead_of_file(self):
        """Test attempting to compile a directory."""
        result = compiler.compile_and_run(str(self.test_path))
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
        self.assertIn('not a file', result['error'].lower())
    
    def test_compilation_output_format(self):
        """Test that compilation output has expected format."""
        result = compiler.compile_and_run(str(self.test_file))
        
        # Verify result structure
        self.assertIsInstance(result, dict)
        self.assertIn('success', result)
        self.assertIn('output', result)
        
        # Output should be a string
        self.assertIsInstance(result['output'], str)


class TestErrorHandling(unittest.TestCase):
    """Test error handling for invalid operations."""
    
    def test_load_invalid_path(self):
        """Test loading from an invalid path."""
        result = file_manager.load_file("/invalid/path/file.lvl")
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_list_invalid_directory(self):
        """Test listing an invalid directory."""
        result = file_manager.list_directory("/invalid/directory/path")
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_save_to_readonly_location(self):
        """Test saving to a location without write permissions."""
        # This test is platform-specific and may not work on all systems
        # On Unix-like systems, /root is typically not writable by regular users
        if sys.platform != 'win32':
            result = file_manager.save_file("/root/test.lvl", "content")
            # Should fail with permission error
            self.assertFalse(result['success'])
    
    def test_load_binary_file_as_text(self):
        """Test loading a binary file (should fail with encoding error)."""
        with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.bin') as f:
            # Write binary data
            f.write(b'\x00\x01\x02\x03\xff\xfe\xfd')
            temp_file = f.name
        
        try:
            result = file_manager.load_file(temp_file)
            # Should fail with encoding error
            self.assertFalse(result['success'])
            self.assertIn('error', result)
        finally:
            Path(temp_file).unlink()


class TestIntegrationScenarios(unittest.TestCase):
    """Test complete user workflows."""
    
    def setUp(self):
        """Create a test project."""
        self.test_dir = tempfile.mkdtemp()
        self.test_path = Path(self.test_dir)
        
        # Create project structure
        (self.test_path / "src").mkdir()
        self.main_file = self.test_path / "src" / "main.lvl"
        self.main_file.write_text("# Main program", encoding='utf-8')
    
    def tearDown(self):
        """Clean up test directory."""
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    def test_complete_edit_workflow(self):
        """Test a complete workflow: browse -> load -> edit -> save -> compile."""
        # 1. Browse directory
        browse_result = file_manager.list_directory(str(self.test_path / "src"))
        self.assertTrue(browse_result['success'])
        self.assertEqual(len(browse_result['items']), 1)
        
        # 2. Load file
        load_result = file_manager.load_file(str(self.main_file))
        self.assertTrue(load_result['success'])
        original_content = load_result['content']
        
        # 3. Simulate editing
        edited_content = original_content + "\nprint('Hello, World!')"
        
        # 4. Save file
        save_result = file_manager.save_file(str(self.main_file), edited_content)
        self.assertTrue(save_result['success'])
        
        # 5. Verify save
        verify_result = file_manager.load_file(str(self.main_file))
        self.assertTrue(verify_result['success'])
        self.assertEqual(verify_result['content'], edited_content)
        
        # 6. Compile
        compile_result = compiler.compile_and_run(str(self.main_file))
        self.assertIn('success', compile_result)
        self.assertIn('output', compile_result)
    
    def test_multiple_file_workflow(self):
        """Test working with multiple files."""
        # Create additional files
        file1 = self.test_path / "src" / "file1.lvl"
        file2 = self.test_path / "src" / "file2.lvl"
        
        file1.write_text("# File 1", encoding='utf-8')
        file2.write_text("# File 2", encoding='utf-8')
        
        # Load and modify file1
        result1 = file_manager.load_file(str(file1))
        self.assertTrue(result1['success'])
        
        modified1 = result1['content'] + "\n# Modified"
        save1 = file_manager.save_file(str(file1), modified1)
        self.assertTrue(save1['success'])
        
        # Load and modify file2
        result2 = file_manager.load_file(str(file2))
        self.assertTrue(result2['success'])
        
        modified2 = result2['content'] + "\n# Also modified"
        save2 = file_manager.save_file(str(file2), modified2)
        self.assertTrue(save2['success'])
        
        # Verify both files were saved correctly
        verify1 = file_manager.load_file(str(file1))
        verify2 = file_manager.load_file(str(file2))
        
        self.assertEqual(verify1['content'], modified1)
        self.assertEqual(verify2['content'], modified2)


if __name__ == '__main__':
    unittest.main()

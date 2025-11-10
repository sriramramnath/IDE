# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create directory structure with backend/ and frontend/ folders
  - Create requirements.txt with Eel and other Python dependencies
  - Create basic README.md with setup instructions
  - _Requirements: 8.1, 8.2_

- [x] 2. Implement backend file system manager
  - [x] 2.1 Create file_manager.py with list_directory function
    - Implement list_directory() to read directory contents and return structured data
    - Add error handling for permission errors and invalid paths
    - Use pathlib for cross-platform path handling
    - _Requirements: 2.1, 2.2, 8.3, 8.4_
  
  - [x] 2.2 Add load_file function to file_manager.py
    - Implement load_file() to read file contents from disk
    - Handle UTF-8 encoding and file not found errors
    - Return structured response with success status and content
    - _Requirements: 3.2, 8.3, 8.4_
  
  - [x] 2.3 Add save_file function to file_manager.py
    - Implement save_file() to write content to disk
    - Preserve file encoding and handle write permissions
    - Return success/error response
    - _Requirements: 4.2, 4.3, 4.4, 8.3, 8.4_

- [x] 3. Implement backend compiler interface
  - [x] 3.1 Create compiler.py with compile_and_run function
    - Implement compile_and_run() as a placeholder that returns mock output
    - Add structure for future subprocess integration
    - Handle errors and return structured response
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [x] 3.2 Add subprocess execution for actual compilation
    - Integrate subprocess.run() to execute LevLang compiler
    - Capture stdout and stderr from compilation process
    - Handle compilation errors and timeouts
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 4. Create backend main application entry point
  - Create main.py with Eel initialization
  - Configure Eel to serve frontend directory
  - Set up application window properties (size, title)
  - Add start_app() function to launch the application
  - Expose all backend functions through Eel decorators
  - _Requirements: 1.5, 8.3, 8.4, 8.5_

- [ ] 5. Build frontend HTML structure with IDE-inspired layout
  - [ ] 5.1 Create index.html with enhanced application layout
    - Add title bar with window controls and app title
    - Add tab bar container for multiple open files
    - Create HTML structure with sidebar and main editor pane
    - Add toolbar with Save and Run buttons
    - Add status bar at bottom with line/col, encoding, file type sections
    - Include script tags for JavaScript modules
    - _Requirements: 6.2, 6.3, 6.6, 6.7_
  
  - [ ] 5.2 Create style.css with dark IDE theme
    - Implement dark theme with high contrast colors
    - Create layout styles for title bar, tab bar, sidebar, editor, and status bar
    - Add consistent spacing using 8px grid system
    - Style buttons with flat design and hover states
    - Style file explorer items with icons and chevrons
    - Style tabs with active/inactive states and close buttons
    - Add smooth transitions for hover and selection states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 6. Implement enhanced frontend file explorer component
  - [ ] 6.1 Create file_explorer.js with icon-based directory tree
    - Implement loadDirectory() to call backend list_directory
    - Create renderFileTree() to display directory structure with proper indentation
    - Add folder icons (📁) and file icons (📄) to tree items
    - Add chevron indicators (▶ for collapsed, ▼ for expanded) to folders
    - Add click handlers for files and directories
    - Implement directory expansion/collapse functionality with chevron updates
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 6.2 Add file selection and hover states
    - Track currently selected file in explorer
    - Highlight selected file with accent color background
    - Add hover states for all file tree items
    - Trigger tab opening when file is clicked
    - _Requirements: 2.3, 2.4, 7.6, 7.7_

- [ ] 7. Implement frontend code editor component with status tracking
  - [ ] 7.1 Create editor.js with editor initialization and cursor tracking
    - Initialize CodeMirror or simple textarea editor
    - Configure editor for LevLang syntax (or plain text initially)
    - Set up editor container and styling
    - Add event listeners for cursor movement
    - Implement updateStatusBar() to show line/column position
    - _Requirements: 3.1, 3.4, 6.5, 6.6_
  
  - [ ] 7.2 Add file loading functionality with tab integration
    - Implement loadFileContent() to populate editor with file content
    - Update editor state with current file path
    - Clear modified flag when new file loads
    - Update active tab state
    - _Requirements: 3.2, 3.4, 6.7_
  
  - [ ] 7.3 Add save functionality and change tracking with tab updates
    - Implement saveCurrentFile() to call backend save_file
    - Track editor modifications and update tab modified indicator
    - Add keyboard shortcut handler for Ctrl+S / Cmd+S
    - Display save success/error notifications
    - Update tab state when saved
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 6.7_

- [ ] 8. Implement tab management system
  - [ ] 8.1 Create tabs.js for tab management
    - Implement createTab() to add new tab to tab bar
    - Implement switchTab() to change active tab
    - Implement closeTab() with unsaved changes warning
    - Implement updateTabState() to show modified indicator
    - Track all open tabs and active tab state
    - Render tab bar with tab elements
    - _Requirements: 6.7_
  
  - [ ] 8.2 Add tab UI interactions
    - Add click handlers for tab switching
    - Add close button (×) to each tab with click handler
    - Style active tab differently from inactive tabs
    - Show modified indicator (dot) on tabs with unsaved changes
    - Limit tab display and add scroll if needed
    - _Requirements: 6.7_

- [ ] 9. Implement status bar component
  - Create status bar update functionality
  - Display current line and column number
  - Display file encoding (UTF-8)
  - Display file type based on extension
  - Update status bar on cursor movement
  - Style status bar with proper spacing
  - _Requirements: 6.6_

- [ ] 10. Implement frontend application controller with tab coordination
  - Update app.js to coordinate components including tabs
  - Initialize file explorer, editor, tabs, and status bar on app load
  - Set up global keyboard shortcuts (save, run)
  - Implement notification system for user feedback
  - Wire up Run button to call backend compile_and_run
  - Display compilation output to user
  - Coordinate file opening through tab system
  - _Requirements: 5.1, 5.2, 5.5, 6.7_

- [ ] 11. Add cross-platform compatibility and testing
  - [ ] 11.1 Verify path handling across platforms
    - Test file operations on Windows with drive letters
    - Test on macOS with Unix-style paths
    - Test on Linux with Unix-style paths
    - Ensure pathlib handles all cases correctly
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 11.2 Test enhanced UI functionality end-to-end
    - Test file explorer navigation with icons and chevrons
    - Test tab opening, switching, and closing
    - Test editor typing, saving, and change tracking
    - Test status bar updates on cursor movement
    - Test Run button and compilation output display
    - Verify error handling for invalid files and paths
    - Test multiple tabs with unsaved changes
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.4, 4.1, 4.2, 5.1, 5.2, 6.7, 7.1-7.7_

- [ ] 12. Create PyInstaller packaging configuration
  - [ ] 12.1 Create build.py script for PyInstaller
    - Configure PyInstaller with main.py entry point
    - Add frontend directory to bundled data
    - Set windowed mode and application icon
    - Configure for single-file executable
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 12.2 Test packaged executables on target platforms
    - Build and test .exe on Windows
    - Build and test .app on macOS
    - Build and test executable on Linux
    - Verify all dependencies are bundled correctly
    - Test on systems without Python installed
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13. Create documentation and setup instructions
  - Add development setup instructions to README.md
  - Document how to run the application in development mode
  - Document PyInstaller packaging process for each platform
  - Add troubleshooting section for common issues
  - _Requirements: 8.5_

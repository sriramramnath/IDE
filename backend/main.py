"""
LevCode - Main application entry point.
Initializes Eel and launches the desktop application.
"""

import eel
import sys
from pathlib import Path

# Add project root to Python path to allow imports when running as script
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Import backend modules to register their @eel.expose decorated functions
import backend.file_manager
import backend.compiler


def get_initial_directory() -> str:
    """
    Get the initial directory to display in the file explorer.
    
    Returns the user's home directory as the starting point.
    
    Returns:
        str: Path to the initial directory
    """
    return str(Path.home())


@eel.expose
def get_initial_dir() -> str:
    """
    Exposed function for frontend to get the initial directory.
    
    Returns:
        str: Path to the initial directory
    """
    return get_initial_directory()


def start_app():
    """
    Initialize and launch the LevCode application.
    
    Sets up Eel with the frontend directory, configures window properties,
    and starts the application.
    """
    # Get the directory containing this script
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent
    frontend_dir = project_root / 'frontend'
    
    # Verify frontend directory exists
    if not frontend_dir.exists():
        print(f"Error: Frontend directory not found at {frontend_dir}")
        sys.exit(1)
    
    # Initialize Eel with the frontend directory
    eel.init(str(frontend_dir))
    
    # Configure and start the application
    try:
        eel.start(
            'index.html',           # Main HTML file
            size=(1200, 800),       # Window size (width, height)
            position=(100, 100),    # Window position (x, y)
            mode='chrome',          # Use Chrome app mode (or 'edge', 'firefox', etc.)
            port=8080,              # Port for the local server
            host='localhost',       # Host for the local server
            block=True,             # Block until window is closed
            cmdline_args=[
                '--disable-http-cache',  # Disable caching for development
                '--disable-dev-shm-usage'
            ]
        )
    except EnvironmentError as e:
        # If Chrome is not available, try other browsers
        print(f"Chrome not available, trying default browser: {e}")
        try:
            eel.start(
                'index.html',
                size=(1200, 800),
                mode='default',  # Use default system browser
                port=8080,
                host='localhost',
                block=True
            )
        except Exception as e:
            print(f"Error starting application: {e}")
            sys.exit(1)


if __name__ == '__main__':
    start_app()

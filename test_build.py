"""
Test script to verify LevCode build artifacts.
Run this after building with build.py to verify the executable was created correctly.
"""

import sys
import platform
from pathlib import Path


def test_build():
    """
    Verify that the build completed successfully and artifacts exist.
    """
    print("=" * 60)
    print("LevCode Build Verification")
    print("=" * 60)
    print()
    
    system = platform.system()
    print(f"Platform: {system}")
    print()
    
    # Check for dist directory
    dist_dir = Path('dist')
    if not dist_dir.exists():
        print("❌ FAIL: dist/ directory not found")
        print("   Run 'python build.py' first to create the executable")
        return False
    
    print("✓ dist/ directory exists")
    
    # Check for executable based on platform
    if system == 'Windows':
        executable = dist_dir / 'LevCode.exe'
    elif system == 'Darwin':  # macOS
        # Check for both possible outputs
        executable = dist_dir / 'LevCode'
        app_bundle = dist_dir / 'LevCode.app'
        if app_bundle.exists():
            print(f"✓ Found application bundle: {app_bundle}")
            print(f"  Size: {get_size(app_bundle)}")
            return True
    else:  # Linux
        executable = dist_dir / 'LevCode'
    
    if not executable.exists():
        print(f"❌ FAIL: Executable not found at {executable}")
        print(f"   Contents of dist/:")
        for item in dist_dir.iterdir():
            print(f"     - {item.name}")
        return False
    
    print(f"✓ Executable found: {executable}")
    print(f"  Size: {get_size(executable)}")
    print(f"  Permissions: {oct(executable.stat().st_mode)[-3:]}")
    
    # Check if executable is actually executable
    if system != 'Windows':
        if not executable.stat().st_mode & 0o111:
            print("⚠ WARNING: Executable does not have execute permissions")
            print(f"   Run: chmod +x {executable}")
    
    # Check for frontend directory in build
    print()
    print("Checking bundled resources...")
    
    # List all files in dist
    print(f"\nContents of dist/:")
    for item in sorted(dist_dir.rglob('*')):
        if item.is_file():
            rel_path = item.relative_to(dist_dir)
            print(f"  {rel_path}")
    
    print()
    print("=" * 60)
    print("Build verification complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Run the executable to test it:")
    if system == 'Windows':
        print(f"     dist\\LevCode.exe")
    elif system == 'Darwin':
        if (dist_dir / 'LevCode.app').exists():
            print(f"     open dist/LevCode.app")
        else:
            print(f"     ./dist/LevCode")
    else:
        print(f"     ./dist/LevCode")
    print("  2. Test file operations (open, edit, save)")
    print("  3. Test compilation functionality")
    print("  4. Test on a system without Python installed")
    
    return True


def get_size(path: Path) -> str:
    """Get human-readable size of file or directory."""
    if path.is_file():
        size = path.stat().st_size
    else:
        size = sum(f.stat().st_size for f in path.rglob('*') if f.is_file())
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"


if __name__ == '__main__':
    success = test_build()
    sys.exit(0 if success else 1)

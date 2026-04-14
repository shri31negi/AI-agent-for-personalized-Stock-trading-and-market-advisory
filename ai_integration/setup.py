#!/usr/bin/env python3
"""
Setup script for TradeMind AI Integration Module
Handles dependency installation with protobuf compatibility
"""

import subprocess
import sys

def install_dependencies():
    """Install dependencies with proper protobuf version"""
    print("Installing TradeMind AI dependencies...")
    
    # Core dependencies
    packages = [
        "numpy>=1.21.0",
        "pandas>=1.3.0",
        "scikit-learn>=0.24.0",
        "pyyaml>=5.4.0"
    ]
    
    # Install core packages first
    for package in packages:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    # Install TensorFlow (which will install its preferred protobuf)
    print("Installing TensorFlow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflow>=2.6.0"])
    
    print("\n" + "="*60)
    print("Installation complete!")
    print("="*60)
    print("\nNote: You may see protobuf version warnings from Google packages.")
    print("These warnings can be safely ignored for this module.")
    print("\nTo test the installation, run:")
    print("  python example_usage.py")
    print("="*60)

if __name__ == "__main__":
    try:
        install_dependencies()
    except Exception as e:
        print(f"Error during installation: {e}")
        sys.exit(1)

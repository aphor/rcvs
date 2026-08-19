# Ensures the repo root is on sys.path so `from backend...` imports resolve when
# pytest is invoked from anywhere.
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

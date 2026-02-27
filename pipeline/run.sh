#!/bin/bash
# Wrapper to ensure UTF-8 encoding for Python on all platforms
export PYTHONIOENCODING=utf-8
export LC_ALL=C.UTF-8
export LANG=C.UTF-8
exec python3 pipeline/inject.py "$@"

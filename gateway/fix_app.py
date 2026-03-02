#!/usr/bin/env python3
"""Script to fix the corrupted gateway/app.py file."""

import os

def fix_app_py():
    filepath = 'gateway/app.py'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Original file has {len(lines)} lines")
    
    # Find where the real code starts (Structured JSON logging comment)
    real_code_start = -1
    for i, line in enumerate(lines):
        if 'Structured JSON logging' in line:
            real_code_start = i
            break
    
    if real_code_start == -1:
        print("ERROR: Could not find 'Structured JSON logging' marker")
        return False
    
    print(f"Real code starts at line {real_code_start + 1}")
    
    # Keep first 48 lines (header with imports)
    header = lines[0:48]
    # Keep from real_code_start to end
    real_code = lines[real_code_start:]
    
    # Combine with a blank line in between
    new_lines = header + ['\n'] + real_code
    
    # Write the fixed file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Fixed file now has {len(new_lines)} lines")
    print("SUCCESS: File fixed!")
    return True

if __name__ == '__main__':
    fix_app_py()

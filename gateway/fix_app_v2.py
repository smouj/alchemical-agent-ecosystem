#!/usr/bin/env python3
"""Script to fix the corrupted gateway/app.py file."""
import os

def fix_app_py():
    filepath = 'gateway/app.py'
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Original file has {len(lines)} lines")
    
    # Keep first 48 lines (header with docstring and initial imports)
    header = lines[0:48]
    print(f"Header: 48 lines")
    
    # Find where the real code starts (Structured JSON logging comment)
    real_code_start = -1
    for i, line in enumerate(lines):
        if i < 48:
            continue
        if line.strip() == "# Structured JSON logging":
            real_code_start = i
            print(f"Found real code start at line {i + 1}: {line.strip()}")
            break
    
    if real_code_start == -1:
        print("ERROR: Could not find '# Structured JSON logging' marker")
        return False
    
    # Keep from real_code_start to end
    real_code = lines[real_code_start:]
    print(f"Real code: {len(real_code)} lines (from line {real_code_start + 1})")
    
    # Combine with a blank line in between
    new_lines = header + ['\n'] + real_code
    
    # Write the fixed file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Fixed file now has {len(new_lines)} lines")
    print(f"Removed {len(lines) - len(new_lines)} duplicate lines")
    return True

if __name__ == "__main__":
    success = fix_app_py()
    exit(0 if success else 1)

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
    
    # Find where the real code starts (the actual Structured JSON logging section)
    # Look for the pattern with the dashes that appears in the real code
    real_code_start = -1
    for i, line in enumerate(lines):
        if i < 48:
            continue
        # Look for the pattern "# --..." followed by "# Structured JSON logging"
        if line.strip().startswith('# ---') and i + 1 < len(lines):
            next_line = lines[i + 1]
            if 'Structured JSON logging' in next_line and 'manual formatter' in next_line:
                real_code_start = i
                print(f"Found real code start at line {i + 1}: {line.strip()}")
                print(f"Next line {i + 2}: {next_line.strip()}")
                break
    
    if real_code_start == -1:
        print("ERROR: Could not find real code marker")
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

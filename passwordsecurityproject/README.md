# Password Security Project (C)

## Overview
This project implements a password security system written in C. It focuses on securely handling user credentials by using safe input methods, password validation, and secure storage concepts.

## Features
- Secure password input and validation
- Simple credential storage (e.g., text file)
- Basic user authentication by matching username and password
- Demonstrates fundamental password security principles in C

## Technologies Used
- Programming Language: C
- Standard Libraries: `<stdio.h>`, `<stdlib.h>`, `<string.h>`, `<ctype.h>`
- User-defined Libraries: '<admin.h>','<brute.h>','<strength.h>','<generator.h>'

# Hashcat Integration
# --------------------
# This project integrates Hashcat to demonstrate password weakness.
# Steps:
# 1. Generate SHA-256 hash using Python.
# 2. Export hash to hashes.txt.
# 3. Run Hashcat using:
#       hashcat -m 1400 hashes.txt wordlist.txt --force
# This educates users on why simple hashing is not secure.

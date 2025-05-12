# Text Mode Core Wise

A reimplementation of text-mode-core striving for simplicity.

Knowledge is anticipating all complexities and handling them carefully.

Wisdom is finding a way to avoid the mess and keep it simple.

## Main Differences (Planned)

1. Never go to a full AST. Just stick with tokens where possible, though parentheses/fractions/sqrt may need their own thing.
   - This saves a layer of processing, avoids the large variety of node types, and removes needing to think about precedence for the most part.
2. Don't mess around with defaults for metadata. Just pass through values

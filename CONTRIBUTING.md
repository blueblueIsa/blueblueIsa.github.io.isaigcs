# Contributing to IGCSE Key Terms

## Q&A Verification Process

To ensure high quality and alignment with the Cambridge IGCSE Computer Science (0478) syllabus, all Q&A data updates must adhere to the following peer-review and validation process.

### 1. Data Collection
- **Source**: Only use official Past Papers and Mark Schemes (MS) from 2023 onwards.
- **Reference**: Each Q&A item must include the paper code (e.g., "2024 May/June Paper 11").

### 2. Quality Control & Formatting
All answers must follow the strict Mark Scheme format:
- **Lists**: Use "Any [n] from:" followed by newline-separated points.
- **Comparisons**: Use clear headers (e.g., "HTTP:", "HTTPS:") to separate concepts.
- **Punctuation**: Preserve original MS punctuation; use `...` to indicate continuation of a point.
- **Keywords**: Ensure `tags` and `keywords` arrays are accurate for searchability.

### 3. Peer Review Checklist
Before merging changes, a reviewer must verify:
- [ ] Answer points match the official Mark Scheme exactly.
- [ ] Formatting uses correct newline separators (`\n`) and bullet styles.
- [ ] No out-of-scope content (pre-2023 syllabus) is included.
- [ ] Links to source papers are valid.

### 4. Versioning
- Document all changes in `CHANGELOG.md`.
- Semantic versioning is encouraged for major data updates.

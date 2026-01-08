# English-only Language Standardization Rules

1. UI Components
- Use English-only labels, headers, buttons, tooltips across all modules.
- Replace legacy brand references with “CS LAB”.
- Remove non-English phrases from alt text and aria labels.

2. Visual Design
- Apply dark theme consistently: background `--bg`, surface `--surface`, text `--text`, accent `--accent`.
- Term cards, flashcards, QA blocks use `--surface` with `--border`.

3. Code and Content
- Replace Chinese comments with English equivalents.
- Render examples using code blocks `<pre><code>` with monospace fonts.

4. System Messages
- Standardize notifications and errors in English, sentence case, concise.
- Use consistent structure for status updates.

5. Verification
- Run `npm run check:language` to detect CJK characters; fix any findings.
- Validate UI manually for visual consistency after changes.

6. Metadata and Config
- Ensure titles, descriptions, and tags are English-only in configuration and data files.


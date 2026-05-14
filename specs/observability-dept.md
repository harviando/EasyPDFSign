# Observability Department

## Phase 2 Interview

**Q: If the app crashes or encounters an error (like a corrupted PDF that pdf-lib can't read), how do you want to be notified? Should the app silently send error reports to a service (like Sentry), or should it just show a friendly error message to the user and rely on them to tell you if something goes wrong?**
**A:** Use Sentry to silently send error reports.

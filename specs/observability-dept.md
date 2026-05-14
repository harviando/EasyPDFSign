# Observability Department

## Phase 2 Interview

**Q: If the app crashes or encounters an error (like a corrupted PDF that pdf-lib can't read), how do you want to be notified? Should the app silently send error reports to a service (like Sentry), or should it just show a friendly error message to the user and rely on them to tell you if something goes wrong?**
**A:** Use Sentry to silently send error reports.

**Q: Do you also want to track basic usage analytics (like how many people visit the site, how many PDFs are signed, etc.) using a privacy-friendly tool like Plausible or Umami, or is error tracking enough for a portfolio project?**
**A:** No need for other analytics. Error tracking with Sentry is enough.

## Error Prevention Integration
- Sentry will capture all error prevention events (pre-validation failures, corrupted local storage, invalid inputs) as low-priority warnings, to help track common user pain points without triggering urgent error alerts.
- All defensive try/catch blocks will include `Sentry.captureException` with full context (action attempted, current state, user input type) to aid debugging.
- React Error Boundary will send unhandled exceptions to Sentry, along with component stack and state snapshot for full reproducibility.
- Sentry will capture fidelity discrepancy events (mismatch between editor signature data and exported PDF embedded signature data) as high-priority errors, with full context: expected vs actual coordinates, scaling factor, signature type, and PDF details.
- All scaling factor calculations and coordinate conversions are logged to Sentry as debug events to aid fidelity issue debugging.

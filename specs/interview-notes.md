# Phase 0: Dynamic Foundational Interview Notes

## Zone A: The Problem & The Pain

**Q: What are you trying to solve or automate?**
**A:** Make signing a PDF easy.

**Q: How do you sign a PDF today? Walk me through the step-by-step process you currently use. What is the most painful part about it?**
**A:** Don't sign PDFs regularly today. When needed, the painful part is finding a free online page to do it and being able to download the signed file cleanly (without watermarks, paywalls, or hassle).

## Zone B: The Environment & Constraints

**Q: Where does this live? (Your laptop, a server, cloud, embedded device?)**
**A:** Wants it to live in the browser, but ultimately other people should be able to access it as well. So it needs to be a web application hosted somewhere accessible.

**Q: Who are "other people"? Is this for your team, friends, or the general public?**
**A:** General public on the internet.

**Q: Where do you want to host this?**
**A:** Vercel.

## Zone C: The Desired Future State

**Q: When a user signs a PDF, what does the actual signature look like? (Draw, type, upload image?)**
**A:** Wants all options: Draw with mouse/finger, type name with a font, and upload an image of their signature.

**Q: Once the user has their signature ready, how do they place it on the PDF?**
**A:** Drag and drop, like placing an element on Canva.

**Status:** In progress. Awaiting details on post-signing workflow and operational reality.

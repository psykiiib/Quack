<p align="center">
  <img src="icon/icon128.png" width="128" height="128" alt="Quack Logo">
</p>

# Quack

**Universal, lightning-fast rich text expansion. Quack it anywhere.**

Quack is a productivity-focused browser extension designed to help you expand short triggers into full, rich-text signatures or snippets—complete with images and formatting. Built with a focus on stability, security, and "unlimited" storage for high-resolution content.

---

### Features
* **Rich Text Support:** Powered by Quill.js for bold, italics, links, and images.
* **Smart Sanitization:** Automatically strips malicious code from pasted content.
* **Unlimited Storage:** Handles large signatures and images without hitting default browser limits.
* **Universal Reach:** Works across all websites, including Gmail, Outlook, and LinkedIn.
* **Audio Feedback:** A satisfying *quack* whenever you open the dashboard.

---

### Installation
1. **Download:** Click the green **Code** button and select **Download ZIP**.
2. **Extract:** Unzip the folder to a permanent location on your computer.
3. **Brave/Chrome Setup:**
   * Go to `brave://extensions` or `chrome://extensions`.
   * Enable **Developer mode** (top right toggle).
   * Click **Load unpacked**.
   * Select the `Quack` folder you just extracted.
4. **Usage:** Click the 🦆 icon in your toolbar, set a trigger (like `;sig`), and you're ready to Quack!

---

### Tech Stack
* **Frontend:** HTML5, CSS3 (Modern Flat Design)
* **Editor Engine:** Quill.js (Bundled locally for security)
* **Storage:** Chrome Storage API (unlimitedStorage)
* **Logic:** Vanilla JavaScript / Browser Extensions API v3
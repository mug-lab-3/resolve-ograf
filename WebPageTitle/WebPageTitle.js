/**
 * WebPageTitle.js
 * 
 * A sample demonstrating that OGraf is essentially a web page.
 * Designed like a modern landing page hero section with a loading sequence.
 */

const styles = `
:host {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
  --accent-color: #2563eb;
  /* Default Theme (Dark) */
  --bg-color: rgba(10, 15, 25, 0.85);
  --text-color: #ffffff;
  --sub-text-color: rgba(255, 255, 255, 0.6);
  --border-color: rgba(255, 255, 255, 0.1);
}

/* Loading Spinner Style */
#loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--bg-color);
  z-index: 100;
  pointer-events: none;
}

#spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
}

#loading-text {
  margin-top: 20px;
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--sub-text-color);
  text-transform: uppercase;
}

#root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 80px;
  box-sizing: border-box;
  opacity: 0;
  visibility: hidden;
  background: var(--bg-color);
  color: var(--text-color);
}

/* Content Styles */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
}

#logo {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text-color);
}

nav ul {
  display: flex;
  gap: 40px;
  list-style: none;
  margin: 0;
  padding: 0;
}

nav li {
  font-size: 18px;
  font-weight: 500;
  color: var(--sub-text-color);
  cursor: default;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.badge {
  display: inline-block;
  background: var(--border-color);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 24px;
  align-self: flex-start;
  color: var(--accent-color);
}

h1 {
  font-size: 120px;
  line-height: 0.95;
  font-weight: 900;
  margin: 0;
  letter-spacing: -4px;
  background: linear-gradient(to bottom right, var(--text-color) 40%, var(--sub-text-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p.subtext {
  font-size: 32px;
  color: var(--sub-text-color);
  max-width: 800px;
  margin: 32px 0 48px 0;
  line-height: 1.4;
}

.cta-button {
  background: var(--accent-color);
  color: white;
  padding: 20px 40px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  width: fit-content;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid var(--border-color);
}

.stat-box h3 {
  font-size: 14px;
  color: var(--sub-text-color);
  text-transform: uppercase;
  margin: 0 0 8px 0;
  opacity: 0.7;
}

.stat-box p {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}
`;

class WebPageTitle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      
      <div id="loading-overlay">
        <div id="spinner"></div>
        <div id="loading-text">Connecting...</div>
      </div>

      <div id="root">
        <header id="site-header">
          <div id="logo">WEB GRAPHICS</div>
          <nav>
            <ul>
              <li>Semantic HTML</li>
              <li>Modern CSS</li>
              <li>GPU Rendering</li>
            </ul>
          </nav>
        </header>

        <main>
          <div class="badge">BROADCAST MEETS WEB</div>
          <h1 id="hero-title">BUILT WITH HTML & CSS</h1>
          <p id="hero-subtext" class="subtext">Rendered by Chromium, powered by OGraf. Seamlessly integrated into the DaVinci Resolve timeline.</p>
          <div class="cta-button">Get Started</div>
        </main>

        <footer>
          <div class="stat-box">
            <h3>Framework</h3>
            <p>HTML5 / CSS3</p>
          </div>
          <div class="stat-box">
            <h3>Performance</h3>
            <p>GPU Accelerated</p>
          </div>
          <div class="stat-box">
            <h3>Compatibility</h3>
            <p>DaVinci Resolve</p>
          </div>
        </footer>
      </div>
    `;

    this._elements = {
      root: this.shadowRoot.getElementById("root"),
      overlay: this.shadowRoot.getElementById("loading-overlay"),
      spinner: this.shadowRoot.getElementById("spinner"),
      logo: this.shadowRoot.getElementById("logo"),
      header: this.shadowRoot.getElementById("site-header"),
      title: this.shadowRoot.getElementById("hero-title"),
      subtext: this.shadowRoot.getElementById("hero-subtext")
    };
  }

  _applyState(state) {
    if (state.logoName) this._elements.logo.textContent = state.logoName;
    if (state.heroTitle) this._elements.title.textContent = state.heroTitle;
    if (state.heroSubText) this._elements.subtext.textContent = state.heroSubText;
    
    if (state.accentColor) {
      this.style.setProperty("--accent-color", state.accentColor);
    }

    if (state.showNavigation !== undefined) {
      this._elements.header.style.display = state.showNavigation ? "flex" : "none";
    }

    if (state.darkTheme !== undefined) {
      if (state.darkTheme) {
        // Dark Mode
        this.style.setProperty("--bg-color", "rgba(10, 15, 25, 0.85)");
        this.style.setProperty("--text-color", "#ffffff");
        this.style.setProperty("--sub-text-color", "rgba(255, 255, 255, 0.6)");
        this.style.setProperty("--border-color", "rgba(255, 255, 255, 0.1)");
      } else {
        // Light Mode
        this.style.setProperty("--bg-color", "rgba(245, 245, 250, 0.85)");
        this.style.setProperty("--text-color", "#1a1a1a");
        this.style.setProperty("--sub-text-color", "rgba(0, 0, 0, 0.6)");
        this.style.setProperty("--border-color", "rgba(0, 0, 0, 0.1)");
      }
    }
  }

  // --- OGraf Lifecycle Methods ---

  async load(params) {
    this._applyState(params.data || {});
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._applyState(params.data || {});
    return { statusCode: 200 };
  }

  async goToTime(time) {
    const timestamp = time?.timestamp ?? 0;
    const seconds = timestamp / 1000;
    this._setFrame(seconds);
    return { statusCode: 200 };
  }

  _setFrame(seconds) {
    const duration = 5;
    
    // Deterministic Loading sequence
    if (seconds < 0.6) {
      // Loading State
      this._elements.overlay.style.opacity = "1";
      this._elements.root.style.visibility = "hidden";
      // Manually rotate the spinner based on time (2 rotations per second)
      const rotation = (seconds * 360 * 2) % 360;
      this._elements.spinner.style.transform = `rotate(${rotation}deg)`;
    } else if (seconds < 0.8) {
      // Transition State (fade out overlay, fade in content)
      const transitionProgress = (seconds - 0.6) / 0.2;
      this._elements.overlay.style.opacity = String(1 - transitionProgress);
      this._elements.root.style.visibility = "visible";
      this._elements.root.style.opacity = String(transitionProgress);
      this._elements.root.style.transform = `translateY(${(10 * (1 - transitionProgress)).toFixed(1)}px)`;
    } else if (seconds <= 4.2) {
      // Fully Loaded State
      this._elements.overlay.style.opacity = "0";
      this._elements.root.style.visibility = "visible";
      this._elements.root.style.opacity = "1";
      this._elements.root.style.transform = "translateY(0)";
    } else {
      // Outro
      const outroProgress = Math.min((seconds - 4.2) / 0.8, 1);
      this._elements.root.style.opacity = String(1 - outroProgress);
      this._elements.root.style.transform = `translateY(${(-10 * outroProgress).toFixed(1)}px)`;
    }
  }
}

export default WebPageTitle;

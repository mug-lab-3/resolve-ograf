/**
 * YouTubePolaroid.js
 * 
 * A OGraf sample demonstrating:
 * 1. Web API Integration (YouTube oEmbed)
 * 2. Multi-stage state-driven animations
 * 3. Dynamic layout handling (1-line vs 2-line title detection)
 * 4. Realistic CSS-based visual effects (Development & Handwriting)
 */

const styles = `
:host {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
  overflow: hidden;
  background: transparent;
}

/* Main Polaroid Card */
#polaroid {
  width: 838px;
  background: #fefef2;
  padding: 35px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.2);
  border: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  transform: translateX(-1000px) rotate(-15deg);
  opacity: 0;
}

/* Image Display Area */
#thumbnail-container {
  width: 768px;
  height: 432px;
  background: #050505; /* Deep black for the development effect */
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.8);
  border: 1px solid rgba(0,0,0,0.2);
}

#thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  filter: brightness(0.2) contrast(0.5) blur(10px) saturate(0.5);
}

/* Handwriting Area */
#title-area {
  width: 768px;
  height: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#title {
  font-family: "Brush Script MT", "Comic Sans MS", cursive;
  font-size: 38px;
  line-height: 1.2;
  color: #222;
  text-align: center;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  opacity: 0;
}

#status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #bbb;
  font-family: sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
}
`;

class YouTubePolaroid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${styles}</style>
      <div id="polaroid">
        <div id="thumbnail-container">
          <div id="status">Ready to Fetch</div>
          <img id="thumbnail" />
        </div>
        <div id="title-area">
          <div id="title"></div>
        </div>
      </div>`;

    this._elements = {
      polaroid: this.shadowRoot.getElementById("polaroid"),
      thumbnail: this.shadowRoot.getElementById("thumbnail"),
      title: this.shadowRoot.getElementById("title"),
      status: this.shadowRoot.getElementById("status")
    };

    this._lastUrl = "";
    this._lastAngle = -5;
    this._isTwoLines = false;
    this._isFirstUpdate = true; // Flag to detect the initial updateAction from Resolve
  }

  // --- Helpers ---

  async _fetchYouTubeData(url, force = false) {
    const now = Date.now();
    if (!force && this._lastFetchTime && (now - this._lastFetchTime < 5000)) {
      this._elements.status.textContent = "Please wait...";
      return;
    }

    this._lastFetchTime = now;
    this._elements.status.textContent = "Fetching...";
    this._elements.status.style.display = "block";
    this._elements.title.textContent = "";
    this._elements.thumbnail.style.opacity = "0";

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);
      if (!response.ok) throw new Error("Failed");

      const data = await response.json();

      const imgLoad = new Promise((resolve) => {
        this._elements.thumbnail.onload = () => {
          this._elements.status.style.display = "none";
          resolve();
        };
        this._elements.thumbnail.onerror = () => {
          this._elements.status.textContent = "Thumbnail Error";
          resolve();
        };
      });

      this._elements.thumbnail.src = data.thumbnail_url;
      this._elements.title.textContent = data.title;

      // Update layout state
      this._isTwoLines = this._elements.title.offsetHeight > 60;

      await imgLoad;
    } catch (err) {
      this._elements.status.textContent = "Error: Video Not Found";
    }
  }

  _applyState(state) {
    if (state.youtubeUrl && state.youtubeUrl !== this._lastUrl) {
      this._lastUrl = state.youtubeUrl;
      this._elements.status.textContent = "Press Fetch Button";
      this._elements.status.style.display = "block";
      this._elements.thumbnail.style.opacity = "0";
      this._elements.title.textContent = "";
    }
    if (state.polaroidAngle !== undefined) {
      this._lastAngle = state.polaroidAngle;
    }
  }

  // --- OGraf Lifecycle ---

  async load(params) {
    this._applyState(params.data || {});
    if (this._lastUrl) {
      // Synchronize fetch with a timeout for stable rendering in Resolve
      try {
        await Promise.race([
          this._fetchYouTubeData(this._lastUrl, true),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]);
      } catch (e) {
        console.warn("YouTube metadata fetch failed or timed out during load:", e);
      }
    }
    return { statusCode: 200 };
  }

  async updateAction(params) {
    const urlBefore = this._lastUrl;
    this._applyState(params.data || {});
    const urlAfter = this._lastUrl;

    // Auto-fetch only on the very first updateAction if the URL changed from the default in load()
    if (this._isFirstUpdate) {
      this._isFirstUpdate = false;
      if (urlAfter && urlAfter !== urlBefore) {
        await this._fetchYouTubeData(urlAfter, true);
      }
    }
    return { statusCode: 200 };
  }

  async customAction(params) {
    if (params.id === "fetch" && this._lastUrl) {
      await this._fetchYouTubeData(this._lastUrl);
    }
    return { statusCode: 200 };
  }

  /**
   * Main Animation Loop
   * Total Duration: 8s (0-0.8: Entry, 0.8-3.5: Dev, 3.5-4.5: Write, 4.5-7.5: Linger, 7.5-8.0: Outro)
   */
  async goToTime(time) {
    const seconds = (time?.timestamp ?? 0) / 1000;

    // Stage 1: Polaroid Entry (0.0s - 0.8s)
    const entryProgress = Math.min(seconds / 0.8, 1);
    const easeEntry = 1 - Math.pow(1 - entryProgress, 4);
    const rotation = (this._lastAngle - 15) + (15 * easeEntry);

    this._elements.polaroid.style.opacity = String(Math.min(easeEntry * 2, 1));
    this._elements.polaroid.style.transform = `translateX(${-1000 * (1 - easeEntry)}px) rotate(${rotation}deg) scale(${0.8 + 0.2 * easeEntry})`;

    // Stage 2: Image Development (0.8s - 3.5s)
    if (seconds > 0.8) {
      const devProgress = Math.min((seconds - 0.8) / 2.7, 1);
      const easeDev = Math.pow(devProgress, 1.5);
      const blur = (10 * (1 - easeDev)).toFixed(1);
      const contrast = (0.5 + 0.5 * easeDev).toFixed(2);
      const brightness = (0.2 + 0.8 * easeDev).toFixed(2);

      this._elements.thumbnail.style.opacity = String(easeDev);
      this._elements.thumbnail.style.filter = `blur(${blur}px) contrast(${contrast}) brightness(${brightness}) saturate(${contrast})`;
    } else {
      this._elements.thumbnail.style.opacity = "0";
    }

    // Stage 3: Sequential Writing (3.5s - 4.5s)
    if (seconds > 3.5) {
      const writeProgress = Math.min((seconds - 3.5) / 1.0, 1);
      this._elements.title.style.opacity = "1";

      if (!this._isTwoLines) {
        // Single Line Sweep
        const right = (writeProgress * 100).toFixed(1);
        this._elements.title.style.clipPath = `polygon(0 0, ${right}% 0, ${right}% 100%, 0 100%)`;
      } else {
        // Two Lines Sweep
        if (writeProgress < 0.5) {
          const right = (writeProgress * 2 * 100).toFixed(1);
          this._elements.title.style.clipPath = `polygon(0 0, ${right}% 0, ${right}% 50%, 0 50%)`;
        } else {
          const right = ((writeProgress - 0.5) * 2 * 100).toFixed(1);
          this._elements.title.style.clipPath = `polygon(0 0, 100% 0, 100% 50%, ${right}% 50%, ${right}% 100%, 0 100%)`;
        }
      }
    } else {
      this._elements.title.style.opacity = "0";
      this._elements.title.style.clipPath = "polygon(0 0, 0 0, 0 0, 0 0)";
    }

    // Stage 4: Outro (7.5s - 8.0s)
    if (seconds > 7.5) {
      const outroProgress = (seconds - 7.5) / 0.5;
      this._elements.polaroid.style.opacity = String(1 - outroProgress);
    }

    return { statusCode: 200 };
  }
}

export default YouTubePolaroid;

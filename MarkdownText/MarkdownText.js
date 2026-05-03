import { marked } from './marked.js';

export default class MarkdownText extends HTMLElement {
  constructor() {
    super();

    const root = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      /* GitHub-style Markdown CSS (Dark Mode optimized) */
      :host {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        --text-color: #c9d1d9; /* GitHub Dark Mode Text Default */
        --border-color: rgba(255, 255, 255, 0.2);
        --link-color: #58a6ff;
        --background-color: transparent;
        --border-radius: 0px;
        --code-bg: rgba(110, 118, 129, 0.4);
        --scale-all: 1;
        --font-scale: 3vh;
        --background-scale-x: 1;
        --background-scale-y: 1;
        --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        color: var(--text-color);
        font-family: var(--font-family);
        line-height: 1.5;
        word-wrap: break-word;
      }
      .container {
        position: relative;
        transform: scale(var(--scale-all));
        width: 100%;
        max-width: 100vw;
      }
      .background {
        position: absolute;
        inset: 0;
        background-color: var(--background-color);
        border-radius: var(--border-radius);
        transform: scale(var(--background-scale-x), var(--background-scale-y));
        z-index: 0;
      }
      .content {
        position: relative;
        z-index: 1;
        width: 100%;
        box-sizing: border-box;
        padding: 3vh;
        text-align: left;
        font-size: var(--font-scale);
      }
      .content > *:first-child { margin-top: 0; }
      .content > *:last-child { margin-bottom: 0; }
      a { color: var(--link-color); text-decoration: none; }
      a:hover { text-decoration: underline; }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 1em;
        font-weight: 600;
        line-height: 1.25;
      }
      h1 { font-size: 2em; border-bottom: 0.05em solid var(--border-color); padding-bottom: .3em; }
      h2 { font-size: 1.5em; border-bottom: 0.05em solid var(--border-color); padding-bottom: .3em; }
      h3 { font-size: 1.25em; }
      p, blockquote, ul, ol, dl, table, pre, details {
        margin-top: 0;
        margin-bottom: 1em;
      }
      blockquote {
        padding: 0 1em;
        color: rgba(255, 255, 255, 0.6);
        border-left: .25em solid var(--border-color);
      }
      ul, ol { padding-left: 2em; }
      table {
        border-spacing: 0;
        border-collapse: collapse;
      }
      table th, table td {
        padding: 0.4em 0.8em;
        border: 0.05em solid var(--border-color);
      }
      table tr:nth-child(2n) {
        background-color: rgba(255, 255, 255, 0.05);
      }
      code, tt {
        padding: .2em .4em;
        margin: 0;
        font-size: 85%;
        background-color: var(--code-bg);
        border-radius: 0.4em;
        font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
      }
      pre {
        padding: 1em;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: var(--code-bg);
        border-radius: 0.4em;
      }
      pre code {
        padding: 0;
        margin: 0;
        font-size: 100%;
        word-break: normal;
        white-space: pre;
        background: transparent;
        border: 0;
      }
      hr {
        height: .25em;
        padding: 0;
        margin: 1.5em 0;
        background-color: var(--border-color);
        border: 0;
      }
    `;

    this._container = document.createElement("div");
    this._container.className = "container";

    this._bg = document.createElement("div");
    this._bg.className = "background";

    this._content = document.createElement("div");
    this._content.className = "content";

    this._container.append(this._bg, this._content);
    root.append(style, this._container);

    this._state = {
      mdText: "",
      textColor: "#ffffff",
      bgColor: "transparent",
      borderRadius: 0,
      scaleAll: 1.0,
      fontScale: 1.0,
      bgScaleX: 1.0,
      bgScaleY: 1.0
    };
  }

  async load(params) {
    this._state = { ...this._state, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._state = { ...this._state, ...(params.data || {}) };
    this._applyState();
    return { statusCode: 200 };
  }

  async goToTime(params) {
    return { statusCode: 200 };
  }

  async playAction(params) { return { statusCode: 200 }; }
  async stopAction(params) { return { statusCode: 200 }; }
  async dispose() { return { statusCode: 200 }; }
  async customAction(params) { return { statusCode: 200 }; }
  async setActionsSchedule(schedule) { return { statusCode: 200 }; }

  _applyState() {
    if (this._state.markdownText) {
      this._content.innerHTML = marked.parse(this._state.markdownText);
    }
    if (this._state.fontFamily !== undefined) {
      const fallbackFonts = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
      const fontValue = this._state.fontFamily.trim() ? `${this._state.fontFamily}, ${fallbackFonts}` : fallbackFonts;
      this.style.setProperty("--font-family", fontValue);
    }
    if (this._state.textColor) {
      this.style.setProperty("--text-color", this._state.textColor);
    }
    if (this._state.backgroundColor !== undefined) {
      this.style.setProperty("--background-color", this._state.backgroundColor);
    }
    if (this._state.borderRadius !== undefined) {
      this.style.setProperty("--border-radius", (this._state.borderRadius * 50) + "vh");
    }
    if (this._state.scaleAll !== undefined) {
      this.style.setProperty("--scale-all", this._state.scaleAll * 0.5);
    }
    if (this._state.fontScale !== undefined) {
      this.style.setProperty("--font-scale", (3 * this._state.fontScale) + "vh");
    }
    if (this._state.backgroundScaleX !== undefined) {
      this.style.setProperty("--background-scale-x", this._state.backgroundScaleX);
    }
    if (this._state.backgroundScaleY !== undefined) {
      this.style.setProperty("--background-scale-y", this._state.backgroundScaleY);
    }
  }
}
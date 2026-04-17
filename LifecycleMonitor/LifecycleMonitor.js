/**
 * LifecycleMonitor.js
 * 
 * A straightforward debug tool to visualize OGraf lifecycle events.
 * This version uses plain, explicit code for maximum readability as a sample.
 */

const styles = `
:host {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  --accent-load: #00ffaa;
  --accent-update: #00aaff;
  --accent-goto: #ff00ff;
  --accent-custom: #ffcc00;
  --accent-info: #ff9900;
  color: #ffffff;
  background: transparent;
  pointer-events: none;
  overflow: hidden;
}

#container {
  position: absolute;
  top: 20px;
  left: 20px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  background: rgba(10, 15, 25, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 5px 20px;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
              inset 0 0 20px rgba(255, 255, 255, 0.02);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

#header h1 {
  margin: 0;
  font-size: 54px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

#notice-box {
  background: rgba(255, 153, 0, 0.1);
  border: 1px solid rgba(255, 153, 0, 0.4);
  border-radius: 6px;
  padding: 6px 12px;
  margin: 10px 0 20px 0;
  font-size: 18px;
  line-height: 1.3;
  color: #ffcc00;
}

#notice-box b {
  color: #ff9900;
  text-transform: uppercase;
  margin-right: 10px;
}

#monitor-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  min-height: 0;
}

.monitor-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.monitor-box.load { border-left: 3px solid var(--accent-load); }
.monitor-box.update { border-left: 3px solid var(--accent-update); }
.monitor-box.goto { border-left: 3px solid var(--accent-goto); }
.monitor-box.custom { border-left: 3px solid var(--accent-custom); }

.monitor-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 3px;
}

.monitor-title { font-size: 42px; font-weight: bold; text-transform: uppercase; }
.monitor-box.load .monitor-title { color: var(--accent-load); }
.monitor-box.update .monitor-title { color: var(--accent-update); }
.monitor-box.goto .monitor-title { color: var(--accent-goto); }
.monitor-box.custom .monitor-title { color: var(--accent-custom); }

.monitor-info { font-size: 32px; color: var(--accent-info); font-weight: bold; }
.monitor-content { 
  flex: 1;
  font-size: 36px; 
  white-space: pre-wrap; 
  word-break: break-all;
  overflow-y: auto;
  color: rgba(255, 255, 255, 0.9);
  scrollbar-width: none;
}
.monitor-content::-webkit-scrollbar { display: none; }
`;

class LifecycleMonitor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // Track call counts for each event
    this._counts = { load: 0, update: 0, goto: 0, custom: 0 };

    // Explicit HTML structure
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div id="container">
        <div id="header">
          <h1>OGraf Lifecycle Monitor</h1>
        </div>
        
        <div id="notice-box">
          <b>IMPORTANT:</b> OGraf specification requires that the same timestamp MUST always produce identical visual output. This monitor is stateful and does not follow this rule.
        </div>

        <div id="monitor-grid">
          <!-- panel: load -->
          <div class="monitor-box load">
            <div class="monitor-header">
              <span id="load-info" class="monitor-info">Count: 0 | Time: -</span>
              <span class="monitor-title">load()</span>
            </div>
            <div id="load-content" class="monitor-content">Waiting...</div>
          </div>

          <!-- panel: updateAction -->
          <div class="monitor-box update">
            <div class="monitor-header">
              <span id="update-info" class="monitor-info">Count: 0 | Time: -</span>
              <span class="monitor-title">updateAction()</span>
            </div>
            <div id="update-content" class="monitor-content">Waiting...</div>
          </div>

          <!-- panel: goToTime -->
          <div class="monitor-box goto">
            <div class="monitor-header">
              <span id="goto-info" class="monitor-info">Count: 0 | Time: -</span>
              <span class="monitor-title">goToTime()</span>
            </div>
            <div id="goto-content" class="monitor-content">Waiting...</div>
          </div>

          <!-- panel: customAction -->
          <div class="monitor-box custom">
            <div class="monitor-header">
              <span id="custom-info" class="monitor-info">Count: 0 | Time: -</span>
              <span class="monitor-title">customAction()</span>
            </div>
            <div id="custom-content" class="monitor-content">Waiting...</div>
          </div>
        </div>
      </div>
    `;

    // Direct element references
    this._elements = {
      loadInfo: this.shadowRoot.getElementById("load-info"),
      loadContent: this.shadowRoot.getElementById("load-content"),
      updateInfo: this.shadowRoot.getElementById("update-info"),
      updateContent: this.shadowRoot.getElementById("update-content"),
      gotoInfo: this.shadowRoot.getElementById("goto-info"),
      gotoContent: this.shadowRoot.getElementById("goto-content"),
      customInfo: this.shadowRoot.getElementById("custom-info"),
      customContent: this.shadowRoot.getElementById("custom-content")
    };
  }

  // Returns current time string
  _getNow() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  }

  // Updates specific panel with new data
  _updateMonitor(type, params) {
    const time = this._getNow();
    this._counts[type]++;
    const infoText = `Count: ${this._counts[type]} | Time: ${time}`;
    const contentText = JSON.stringify(params, null, 2);

    if (type === "load") {
      this._elements.loadInfo.textContent = infoText;
      this._elements.loadContent.textContent = contentText;
    } else if (type === "update") {
      this._elements.updateInfo.textContent = infoText;
      this._elements.updateContent.textContent = contentText;
    } else if (type === "goto") {
      this._elements.gotoInfo.textContent = infoText;
      this._elements.gotoContent.textContent = contentText;
    } else if (type === "custom") {
      this._elements.customInfo.textContent = infoText;
      this._elements.customContent.textContent = contentText;
    }
  }

  // Route incoming events
  _log(event, params = {}) {
    if (event === "load") {
      this._updateMonitor("load", params);
    } else if (event === "updateAction") {
      this._updateMonitor("update", params);
    } else if (event === "goToTime") {
      this._updateMonitor("goto", params);
    } else if (event === "customAction") {
      this._updateMonitor("custom", params);
    }
  }

  // --- OGraf Lifecycle Methods ---

  async load(params) {
    this._log("load", params);
    return { statusCode: 200 };
  }

  async dispose() {
    this._log("dispose");
    return { statusCode: 200 };
  }

  async playAction(params) {
    this._log("playAction", params);
    return { statusCode: 200, currentStep: 1 };
  }

  async stopAction(params) {
    this._log("stopAction", params);
    return { statusCode: 200 };
  }

  async updateAction(params) {
    this._log("updateAction", params);
    return { statusCode: 200 };
  }

  async customAction(params) {
    this._log("customAction", params);
    return { statusCode: 200 };
  }

  async goToTime(time) {
    this._log("goToTime", time);
    return { statusCode: 200 };
  }

  async setActionsSchedule(schedule) {
    this._log("setActionsSchedule", schedule);
    return { statusCode: 200 };
  }
}

export default LifecycleMonitor;

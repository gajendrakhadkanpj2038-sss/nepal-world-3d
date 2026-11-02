<!doctype html>
<html lang="ne">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>NEPAL WORLD 3D</title>
  <style>
    :root {
      --bg-deep: #050d0a;
      --panel: rgba(10, 18, 17, 0.78);
      --panel-strong: rgba(17, 24, 22, 0.92);
      --gold: #ffc107;
      --gold-2: #ffdb6a;
      --red: #ff4d5c;
      --green: #2ce08b;
      --sky-top: #8ecbff;
      --sky-mid: #dbefff;
      --sky-low: #7bc0ff;
      --text: #f3f7f5;
      --muted: #dfe5e2;
      --line: rgba(255,255,255,0.12);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background:
        radial-gradient(circle at top, rgba(60, 112, 94, 0.38), transparent 26%),
        linear-gradient(180deg, #061712 0%, #050d0a 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: var(--text);
      cursor: none;
      touch-action: none;
    }

    body.quest-menu-open {
      cursor: auto;
    }

    #game {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      z-index: 1;
      cursor: none;
      background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 40%, var(--sky-low) 100%);
      filter: contrast(1.08) saturate(1.2) brightness(1.02);
      box-shadow: inset 0 0 80px rgba(0,0,0,0.12);
    }

    #scene-glow {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2;
      background:
        radial-gradient(circle at 50% 30%, rgba(255,255,255,0.58), transparent 18%),
        radial-gradient(circle at center, transparent 0%, rgba(10, 22, 18, 0.07) 50%, rgba(0, 0, 0, 0.34) 100%);
    }

    #scanlines {
      position: fixed;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      background: repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,0.06),
        rgba(255,255,255,0.06) 1px,
        transparent 2px,
        transparent 4px
      );
      mix-blend-mode: soft-light;
      opacity: 0.7;
    }

    #vignette {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 4;
      background: radial-gradient(circle at center, transparent 58%, rgba(0, 0, 0, 0.44) 100%);
    }

    #splash-screen {
      position: fixed;
      inset: 0;
      background:
        radial-gradient(circle at center, rgba(20, 64, 51, 0.95) 0%, rgba(5, 12, 10, 0.98) 46%, rgba(3, 7, 6, 1) 100%);
      z-index: 100;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      transition: opacity 0.85s ease, visibility 0.85s ease;
      overflow: hidden;
      isolation: isolate;
    }

    #splash-screen::before,
    #splash-screen::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    #splash-screen::before {
      background:
        radial-gradient(circle at 20% 30%, rgba(255, 193, 7, 0.18), transparent 18%),
        radial-gradient(circle at 80% 20%, rgba(40, 167, 69, 0.15), transparent 17%),
        radial-gradient(circle at 50% 82%, rgba(255, 77, 92, 0.12), transparent 24%);
    }

    #splash-screen::after {
      background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.12) 45%, transparent 100%);
      transform: translateX(-110%);
      animation: shimmer 5.2s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-110%); }
      30% { transform: translateX(100%); }
      100% { transform: translateX(100%); }
    }

    .splash-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 28px 24px;
      gap: 16px;
      text-shadow: 0 12px 26px rgba(0,0,0,0.25);
    }

    #splash-screen.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .gta-title {
      font-size: clamp(2.7rem, 6vw, 5.7rem);
      font-weight: 900;
      letter-spacing: 5px;
      color: #ff465a;
      text-shadow: 0 0 26px rgba(255, 70, 90, 0.8), 4px 4px 0 rgba(0,0,0,0.8);
      text-transform: uppercase;
      line-height: 0.92;
      position: relative;
    }

    .gta-subtitle {
      font-size: clamp(0.95rem, 2.4vw, 1.8rem);
      font-weight: 800;
      color: #f8f9fa;
      letter-spacing: 3px;
      text-transform: uppercase;
      opacity: 0.96;
    }

    .credits-box {
      border-top: 2px solid var(--red);
      border-bottom: 2px solid var(--red);
      padding: 16px 30px;
      background: rgba(0, 0, 0, 0.38);
      margin: 8px 0 18px;
      box-shadow: inset 0 0 18px rgba(255, 77, 92, 0.1);
      backdrop-filter: blur(4px);
    }

    .credits-text {
      font-size: 1rem;
      color: #dae0e5;
      font-weight: 700;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }

    .author-name {
      color: var(--gold);
      font-size: clamp(1.08rem, 1.5vw, 1.5rem);
      font-weight: 800;
      margin-top: 5px;
      letter-spacing: 0.06em;
      text-shadow: 0 8px 24px rgba(255, 193, 7, 0.18);
    }

    .start-btn {
      position: relative;
      padding: 16px 44px;
      font-size: 1.15rem;
      font-weight: 900;
      color: #102a22;
      background: linear-gradient(135deg, var(--gold) 0%, #ffd76d 46%, #fff4bf 100%);
      border: none;
      border-radius: 50px;
      cursor: pointer;
      box-shadow: 0 0 30px rgba(255, 193, 7, 0.45), 0 18px 30px rgba(0,0,0,0.28);
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      overflow: hidden;
    }

    .start-btn::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.8) 45%, transparent 100%);
      transform: translateX(-130%);
      transition: transform 0.7s ease;
    }

    .start-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 0 34px rgba(255, 193, 7, 0.58), 0 22px 36px rgba(0,0,0,0.32);
      filter: brightness(1.04);
    }

    .start-btn:hover::before {
      transform: translateX(130%);
    }

    #hud {
      position: fixed;
      top: 15px;
      left: 15px;
      right: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
      z-index: 10;
      gap: 15px;
    }

    .pill {
      background: rgba(10, 25, 20, 0.72);
      border: 1px solid rgba(255,255,255,0.14);
      color: white;
      padding: 10px 18px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0,0,0,0.18);
      backdrop-filter: blur(6px);
      letter-spacing: 0.03em;
      text-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }

    .pill:last-child {
      background: rgba(18, 32, 28, 0.72);
    }

    #quest-tracker {
      position: fixed;
      top: 76px;
      left: 15px;
      background: linear-gradient(135deg, rgba(14, 22, 18, 0.88), rgba(24, 36, 30, 0.82));
      border-left: 4px solid var(--gold);
      border-radius: 0 14px 14px 0;
      padding: 12px 18px;
      z-index: 10;
      max-width: 360px;
      pointer-events: none;
      box-shadow: 0 18px 40px rgba(0,0,0,0.22);
      backdrop-filter: blur(8px);
    }

    #quest-tracker h4 {
      color: var(--gold);
      margin-bottom: 6px;
      font-size: 14px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    #quest-tracker p {
      font-size: 13px;
      color: #ddd;
      line-height: 1.45;
      opacity: 0.96;
    }

    #quest-menu {
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      width: min(720px, calc(100vw - 30px));
      padding: 18px 20px 20px;
      background: rgba(9, 14, 13, 0.93);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 18px;
      box-shadow: 0 22px 52px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.05);
      display: none;
      z-index: 30;
      backdrop-filter: blur(10px);
    }

    #quest-menu.open { display: block; }

    .quest-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .quest-menu-title {
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--gold);
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }

    .close-btn {
      background: rgba(255,255,255,0.08);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 7px 12px;
      cursor: pointer;
      font-weight: 700;
      transition: background 0.2s ease;
    }

    .close-btn:hover { background: rgba(255,255,255,0.12); }

    #quest-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      color: #d8e2d9;
      margin-bottom: 14px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    #quest-list {
      display: grid;
      gap: 10px;
      max-height: 420px;
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,193,7,0.55) transparent;
    }

    .quest-item {
      width: 100%;
      text-align: left;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      color: white;
      padding: 12px 14px;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }

    .quest-item:hover {
      background: rgba(255,255,255,0.05);
      transform: translateY(-1px);
    }

    .quest-item.active {
      border-color: rgba(255, 193, 7, 0.9);
      background: rgba(255, 193, 7, 0.12);
      box-shadow: inset 0 0 0 1px rgba(255, 193, 7, 0.28);
    }

    .quest-item-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .quest-name { font-size: 15px; font-weight: 800; }

    .quest-state {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.1);
      color: #dfeaf4;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .quest-state.accepted { background: rgba(40,167,69,0.22); color: #7ee7a6; }
    .quest-state.completed { background: rgba(255,193,7,0.2); color: #ffd76d; }
    .quest-state.pending { background: rgba(220,53,69,0.18); color: #ff9ca6; }

    .quest-desc {
      font-size: 12px;
      color: #dfe2e7;
      line-height: 1.5;
      opacity: 0.94;
    }

    #mini-map-container {
      position: fixed;
      right: 18px;
      bottom: 22px;
      width: 182px;
      height: 182px;
      background: rgba(9, 18, 15, 0.82);
      border: 2px solid rgba(255,255,255,0.14);
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 10px 28px rgba(0,0,0,0.52), inset 0 0 28px rgba(255,255,255,0.03);
      z-index: 16;
      pointer-events: none;
    }

    #mini-map {
      width: 100%;
      height: 100%;
      display: block;
      background: rgba(66, 112, 88, 0.26);
    }

    #dialogue-modal {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      width: min(90%, 600px);
      background: linear-gradient(180deg, rgba(15, 23, 20, 0.97), rgba(10,18,16,0.94));
      border: 2px solid rgba(40, 167, 69, 0.88);
      padding: 20px;
      border-radius: 16px;
      display: none;
      z-index: 20;
      box-shadow: 0 16px 36px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter: blur(8px);
    }

    #dialogue-title {
      color: var(--gold);
      font-size: 1.18rem;
      margin-bottom: 8px;
      letter-spacing: 0.04em;
    }

    #dialogue-text {
      font-size: 1rem;
      color: #eee;
      margin-bottom: 15px;
      line-height: 1.55;
    }

    .action-btn {
      background: linear-gradient(135deg, #2bb673, #28a745);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 22px rgba(40,167,69,0.33);
      transition: transform 0.2s ease;
    }

    .action-btn:hover { transform: translateY(-1px); }

    #controls-hint {
      position: fixed;
      bottom: 15px;
      right: 15px;
      background: rgba(0,0,0,0.62);
      padding: 9px 14px;
      border-radius: 10px;
      font-size: 12px;
      color: #c8d0cf;
      pointer-events: none;
      z-index: 10;
      box-shadow: 0 12px 24px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.06);
      line-height: 1.5;
      backdrop-filter: blur(4px);
    }

    #mobile-controls {
      position: fixed;
      left: 18px;
      bottom: 22px;
      z-index: 18;
      display: none;
      pointer-events: none;
    }

    .joystick {
      position: relative;
      width: 146px;
      height: 146px;
      border-radius: 50%;
      background: rgba(13, 24, 19, 0.34);
      border: 2px solid rgba(255,255,255,0.16);
      box-shadow: inset 0 0 20px rgba(255,255,255,0.04), 0 16px 28px rgba(0,0,0,0.26);
      backdrop-filter: blur(8px);
      pointer-events: auto;
      touch-action: none;
    }

    .joystick::before {
      content: "";
      position: absolute;
      inset: 18px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.02);
    }

    .joystick-knob {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 52px;
      height: 52px;
      margin-left: -26px;
      margin-top: -26px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,193,7,0.82) 28%, rgba(255,173,0,0.94) 62%, rgba(255,129,0,0.78) 100%);
      border: 2px solid rgba(255,255,255,0.5);
      box-shadow: 0 12px 18px rgba(0,0,0,0.28);
      transition: transform 0.04s linear;
    }

    @media (max-width: 900px) {
      #controls-hint {
        display: none;
      }

      #quest-tracker {
        max-width: 280px;
        top: 72px;
      }

      #mini-map-container {
        width: 140px;
        height: 140px;
        bottom: 180px;
      }
    }

    @media (max-width: 720px) {
      #quest-tracker {
        max-width: 300px;
        top: 68px;
      }

      #hud {
        top: 10px;
        left: 10px;
        right: 10px;
        gap: 8px;
      }

      .pill {
        padding: 9px 12px;
        font-size: 11px;
      }

      #mini-map-container {
        width: 120px;
        height: 120px;
      }
    }

    @media (max-width: 720px) and (orientation: portrait) {
      #quest-tracker {
        top: 82px;
        left: 12px;
        max-width: 230px;
      }

      #hud {
        flex-direction: column;
        align-items: flex-start;
      }

      #mini-map-container {
        right: 12px;
        bottom: 174px;
      }

      #mobile-controls {
        display: block;
      }

      #dialogue-modal {
        width: calc(100% - 18px);
        bottom: 170px;
      }
    }
  </style>

  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
</head>
<body>
  <div id="splash-screen">
    <div class="splash-content">
      <div class="gta-title">NEPAL WORLD 3D</div>
      <div class="gta-subtitle">REALISTIC MOUNTAIN ADVENTURE</div>
      <div class="credits-box">
        <div class="credits-text">Created By</div>
        <div class="author-name">GAJENDRA KUMAR KHADKA</div>
        <div class="credits-text" style="font-size: 0.9rem; margin-top:8px; letter-spacing:2px;">&</div>
        <div class="author-name">SHRIJAN KHADKA</div>
      </div>
      <button class="start-btn" onclick="launchGame()">Start Game</button>
    </div>
  </div>

  <canvas id="game"></canvas>
  <div id="scene-glow"></div>
  <div id="scanlines"></div>
  <div id="vignette"></div>

  <div id="hud">
    <div class="pill">🇳🇵 बागेश्वरी & नेपालगन्ज भ्याली</div>
    <div class="pill">स्थान: नेपाल</div>
  </div>

  <div id="quest-tracker">
    <h4 id="q-title">मुख्य मिसन (Main Quest)</h4>
    <p id="q-desc">बागेश्वरी मन्दिरमा पुजारीसँग भेट्नुहोस् र आशीर्वाद लिनुहोस्।</p>
  </div>

  <div id="quest-menu">
    <div class="quest-menu-header">
      <div class="quest-menu-title">Quest Journal</div>
      <button id="close-quest-menu" class="close-btn">Close</button>
    </div>
    <div id="quest-summary">0 accepted / 0 remaining</div>
    <div id="quest-list"></div>
  </div>

  <div id="mini-map-container">
    <canvas id="mini-map" width="180" height="180"></canvas>
  </div>

  <div id="mobile-controls" aria-label="Movement joystick">
    <div id="move-joystick" class="joystick">
      <div class="joystick-knob"></div>
    </div>
  </div>

  <div id="dialogue-modal">
    <h3 id="dialogue-title">NPC Dialogue</h3>
    <p id="dialogue-text">नमस्ते!</p>
    <button class="action-btn" onclick="closeDialogue()">कुराकानी बन्द गर्नुहोस् (E)</button>
  </div>

  <div id="controls-hint">W, A, S, D = हिँड्नुहोस् | E = Interact | Tab = Quest Menu | Q = Unlock Cursor</div>

  <script src="main.js"></script>
  <script>
    function launchGame() {
      const splash = document.getElementById('splash-screen');
      splash.classList.add('hidden');

      if (typeof window.initGame === 'function') {
        window.initGame();
      } else {
        console.warn('main.js failed to load.');
        alert('Game engine failed to load. Please refresh the page.');
      }
    }

    (function () {
      function stabilizeView() {
        if (typeof window.camera === 'undefined' || !window.camera) return;

        const minimumCameraY = 2.8;
        if (window.camera.position.y < minimumCameraY) {
          window.camera.position.y = minimumCameraY;
        }

        if (typeof window.cameraPitch !== 'undefined') {
          window.cameraPitch = Math.max(-0.72, Math.min(1.15, window.cameraPitch));
        }

        if (typeof window.cameraYaw !== 'undefined') {
          window.cameraYaw = ((window.cameraYaw % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
        }
      }

      setInterval(stabilizeView, 50);
    })();
  </script>
</body>
</html>

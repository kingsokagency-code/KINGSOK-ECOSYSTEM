/**
 * KINGSOK WhatsApp Web Auto-Pilot & Campaign Runner Generator
 * 
 * Generates self-contained, browser-executable scripts and batch payloads
 * to automate dispatching personalized messages through WhatsApp Web safely.
 */

import { ContactRecord, MessageTemplate } from './types';
import { personalizeMessage } from './templates';

export interface AutoPilotContact {
  id: string;
  name: string;
  firstName: string;
  phone: string;
  rawPhone: string;
  message: string;
}

export interface AutoPilotPayload {
  batchNumber: number;
  batchName: string;
  templateTitle: string;
  delaySeconds: number;
  totalContacts: number;
  contacts: AutoPilotContact[];
}

/**
 * Builds the structured payload for a specific batch and message template
 */
export function buildAutoPilotPayload(
  batchContacts: ContactRecord[],
  batchNumber: number,
  template: MessageTemplate,
  delaySeconds: number = 6
): AutoPilotPayload {
  const contacts: AutoPilotContact[] = batchContacts
    .filter((c) => c.isValid && !c.isDuplicate && c.consentStatus !== 'opted_out')
    .map((c) => {
      const cleanPhone = (c.normalizedPhone || c.rawPhone).replace(/[^0-9]/g, '');
      const personalizedMsg = personalizeMessage(template.content, c, {
        batchNumber,
      });

      return {
        id: c.id,
        name: c.displayName,
        firstName: c.firstName || 'there',
        phone: cleanPhone,
        rawPhone: c.rawPhone,
        message: personalizedMsg,
      };
    });

  return {
    batchNumber,
    batchName: `Batch ${batchNumber}`,
    templateTitle: template.title,
    delaySeconds,
    totalContacts: contacts.length,
    contacts,
  };
}

/**
 * Generates a self-contained, tamper-proof JavaScript snippet that can be pasted
 * directly into the Chrome DevTools Console on https://web.whatsapp.com.
 * 
 * Features:
 * - Floating HUD on WhatsApp Web with Progress Bar & Controls
 * - Anti-ban randomized delays (e.g. 5-8s jitter)
 * - Safe detection of WhatsApp Web send button
 * - Graceful skipping of numbers not on WhatsApp
 * - Pause, Resume, and Stop controls
 */
export function generateWhatsAppWebAutoPilotScript(payload: AutoPilotPayload): string {
  const jsonPayload = JSON.stringify(payload);

  return `/**
 * KINGSOK WhatsApp Web Auto-Pilot Campaign Runner
 * Target: ${payload.batchName} (${payload.totalContacts} contacts)
 * Template: ${payload.templateTitle}
 */
(function() {
  if (!window.location.hostname.includes('web.whatsapp.com')) {
    alert('Please run this script only on https://web.whatsapp.com');
    return;
  }

  // Remove existing HUD if already present
  const existingHud = document.getElementById('kingsok-hud');
  if (existingHud) existingHud.remove();

  const campaign = ${jsonPayload};
  let currentIndex = 0;
  let isRunning = false;
  let isPaused = false;
  let successCount = 0;
  let skippedCount = 0;
  let timerId = null;

  // Create HUD element
  const hud = document.createElement('div');
  hud.id = 'kingsok-hud';
  hud.style.cssText = \`
    position: fixed;
    top: 15px;
    right: 20px;
    width: 360px;
    background: #0f172a;
    border: 2px solid #10b981;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    z-index: 999999;
    padding: 16px;
    font-size: 13px;
    transition: all 0.3s ease;
  \`;

  hud.innerHTML = \`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="background:#10b981; color:#0f172a; font-weight:bold; font-size:11px; padding:2px 8px; rounded:6px; border-radius:6px;">KINGSOK</span>
        <strong style="font-size:14px; color:#fff;">\${campaign.batchName} Auto-Pilot</strong>
      </div>
      <button id="ks-close-btn" style="background:transparent; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:0 4px;">&times;</button>
    </div>

    <div style="background:#1e293b; padding:10px; border-radius:10px; margin-bottom:12px; border:1px solid #334155;">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-bottom:4px;">
        <span>Progress</span>
        <span id="ks-progress-text">0 / \${campaign.totalContacts} (0%)</span>
      </div>
      <div style="width:100%; height:8px; background:#0f172a; border-radius:999px; overflow:hidden;">
        <div id="ks-progress-bar" style="width:0%; height:100%; background:#10b981; transition:width 0.3s ease;"></div>
      </div>
    </div>

    <div id="ks-status-card" style="font-size:12px; color:#cbd5e1; margin-bottom:14px; background:#020617; padding:8px 10px; border-radius:8px; min-height:42px; border:1px solid #1e293b;">
      <div style="color:#10b981; font-weight:600;" id="ks-contact-name">Ready to start campaign</div>
      <div style="color:#64748b; font-size:11px;" id="ks-contact-phone">Pacing: \${campaign.delaySeconds}s safe anti-ban delay</div>
    </div>

    <div style="display:flex; gap:8px;">
      <button id="ks-start-btn" style="flex:1; background:#10b981; color:#020617; border:none; padding:8px 12px; border-radius:8px; font-weight:700; cursor:pointer; font-size:12px;">START BATCH</button>
      <button id="ks-pause-btn" style="display:none; flex:1; background:#f59e0b; color:#020617; border:none; padding:8px 12px; border-radius:8px; font-weight:700; cursor:pointer; font-size:12px;">PAUSE</button>
      <button id="ks-stop-btn" style="display:none; background:#ef4444; color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:700; cursor:pointer; font-size:12px;">STOP</button>
    </div>
  \`;

  document.body.appendChild(hud);

  const startBtn = document.getElementById('ks-start-btn');
  const pauseBtn = document.getElementById('ks-pause-btn');
  const stopBtn = document.getElementById('ks-stop-btn');
  const closeBtn = document.getElementById('ks-close-btn');
  const progressBar = document.getElementById('ks-progress-bar');
  const progressText = document.getElementById('ks-progress-text');
  const contactNameEl = document.getElementById('ks-contact-name');
  const contactPhoneEl = document.getElementById('ks-contact-phone');

  closeBtn.onclick = () => {
    if (isRunning && !confirm('Stop active campaign and close KINGSOK HUD?')) return;
    isRunning = false;
    clearTimeout(timerId);
    hud.remove();
  };

  startBtn.onclick = () => {
    if (isPaused) {
      isPaused = false;
      isRunning = true;
      startBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
      contactNameEl.innerText = 'Resuming campaign...';
      dispatchNext();
      return;
    }
    isRunning = true;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
    stopBtn.style.display = 'block';
    dispatchNext();
  };

  pauseBtn.onclick = () => {
    isPaused = true;
    isRunning = false;
    clearTimeout(timerId);
    pauseBtn.style.display = 'none';
    startBtn.style.display = 'block';
    startBtn.innerText = 'RESUME';
    contactNameEl.innerText = 'Campaign Paused';
    contactPhoneEl.innerText = 'Click Resume when ready';
  };

  stopBtn.onclick = () => {
    if (!confirm('Are you sure you want to stop this campaign?')) return;
    isRunning = false;
    clearTimeout(timerId);
    startBtn.style.display = 'block';
    startBtn.innerText = 'RESTART';
    pauseBtn.style.display = 'none';
    stopBtn.style.display = 'none';
    contactNameEl.innerText = 'Campaign Stopped';
    contactPhoneEl.innerText = \`Sent: \${successCount} | Skipped: \${skippedCount}\`;
  };

  function updateProgress() {
    const pct = Math.round((currentIndex / campaign.totalContacts) * 100);
    progressBar.style.width = pct + '%';
    progressText.innerText = \`\${currentIndex} / \${campaign.totalContacts} (\${pct}%)\`;
  }

  function getRandomDelay() {
    // Add 1-2.5s jitter to avoid robotic pattern detection
    const jitter = Math.random() * 2000;
    return (campaign.delaySeconds * 1000) + jitter;
  }

  async function dispatchNext() {
    if (!isRunning || isPaused) return;

    if (currentIndex >= campaign.totalContacts) {
      isRunning = false;
      startBtn.style.display = 'none';
      pauseBtn.style.display = 'none';
      stopBtn.style.display = 'none';
      contactNameEl.innerText = 'CAMPAIGN COMPLETED!';
      contactPhoneEl.innerText = \`Successfully sent: \${successCount} messages.\`;
      alert(\`🎉 KINGSOK Auto-Pilot Finished!\\n\\nBatch \${campaign.batchNumber} completed.\\nTotal Sent: \${successCount}\\nSkipped / Invalid: \${skippedCount}\`);
      return;
    }

    const contact = campaign.contacts[currentIndex];
    contactNameEl.innerText = \`Sending [\${currentIndex + 1}/\${campaign.totalContacts}]: \${contact.name}\`;
    contactPhoneEl.innerText = \`Phone: +\${contact.phone}\`;

    try {
      // Navigate WhatsApp Web to this contact's chat with message pre-filled
      const sendUrl = \`https://web.whatsapp.com/send?phone=\${contact.phone}&text=\${encodeURIComponent(contact.message)}\`;
      
      // Use hidden anchor click to trigger WhatsApp router without full refresh
      let anchor = document.getElementById('ks-router-anchor');
      if (!anchor) {
        anchor = document.createElement('a');
        anchor.id = 'ks-router-anchor';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
      }
      anchor.href = sendUrl;
      anchor.click();

      // Poll for Send Button or "Invalid Number" popup
      let attempts = 0;
      const maxAttempts = 35; // wait up to ~14s
      const pollInterval = setInterval(() => {
        if (!isRunning || isPaused) {
          clearInterval(pollInterval);
          return;
        }

        attempts++;

        // 1. Check for invalid number dialog
        const okPopupBtn = document.querySelector('div[role="button"][data-animate-modal-popup="true"] button, div[data-testid="popup-contents"] button');
        if (okPopupBtn && okPopupBtn.innerText.toLowerCase().includes('ok')) {
          clearInterval(pollInterval);
          okPopupBtn.click();
          skippedCount++;
          currentIndex++;
          updateProgress();
          contactNameEl.innerText = \`Skipped: \${contact.name} (Not on WhatsApp)\`;
          timerId = setTimeout(dispatchNext, 2500);
          return;
        }

        // 2. Check for Send Button (data-testid="send" or aria-label="Send")
        const sendBtn = document.querySelector('button[aria-label="Send"], span[data-icon="send"]')?.closest('button');
        if (sendBtn && !sendBtn.disabled) {
          clearInterval(pollInterval);
          sendBtn.click();
          successCount++;
          currentIndex++;
          updateProgress();

          const delay = getRandomDelay();
          contactNameEl.innerText = \`Sent to \${contact.name}! Next in \${Math.round(delay/1000)}s...\`;
          contactPhoneEl.innerText = \`Pacing naturally to keep your account safe...\`;
          timerId = setTimeout(dispatchNext, delay);
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          // Timeout - advance to next contact
          skippedCount++;
          currentIndex++;
          updateProgress();
          contactNameEl.innerText = \`Timed out for \${contact.name}. Moving next...\`;
          timerId = setTimeout(dispatchNext, 3000);
        }
      }, 400);

    } catch (err) {
      console.error('Error sending to contact:', err);
      currentIndex++;
      updateProgress();
      timerId = setTimeout(dispatchNext, 3000);
    }
  }

  console.log('KINGSOK Auto-Pilot loaded for', campaign.batchName);
})();
`;
}

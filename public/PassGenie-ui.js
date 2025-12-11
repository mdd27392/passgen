export function initPassGenie(options = {}) {
  const { isMini = false } = options;

  const envBadge = document.getElementById("env-badge");
  const subtitle = document.getElementById("subtitle");
  const lengthInput = document.getElementById("length");
  const lengthLabel = document.getElementById("length-label");
  const toggles = Array.from(document.querySelectorAll(".toggle"));
  const passwordOutput = document.getElementById("password-output");
  const copyBtn = document.getElementById("copy-btn");
  const generateBtn = document.getElementById("generate-btn");
  const strengthDot = document.getElementById("strength-dot");
  const strengthLabel = document.getElementById("strength-label");
  const historyList = document.getElementById("history-list");
  const toast = document.getElementById("toast");

  if (envBadge) {
    envBadge.textContent = isMini ? "Mini app" : "Web";
  }
  if (subtitle && isMini) {
    subtitle.textContent = "Always-with-you password magic inside Base.";
  }

  let history = [];

  lengthInput?.addEventListener("input", () => {
    lengthLabel.textContent = lengthInput.value;
  });

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const activeCount = toggles.filter((t) => t.classList.contains("active")).length;
      if (activeCount === 1 && btn.classList.contains("active")) {
        pulseElement(btn);
        return;
      }
      btn.classList.toggle("active");
    });
  });

  generateBtn?.addEventListener("click", () => {
    const length = parseInt(lengthInput.value, 10);
    const activeTypes = toggles
      .filter((t) => t.classList.contains("active"))
      .map((t) => t.dataset.type);

    if (activeTypes.length === 0) {
      showToast("Select at least one character set");
      return;
    }

    const password = generatePassword(length, activeTypes);
    passwordOutput.value = password;
    updateStrength(password, activeTypes.length);
    pushHistory(password);
  });

  copyBtn?.addEventListener("click", async () => {
    const value = passwordOutput.value || "";
    if (!value || value === "Tap Generate") {
      showToast("Generate a password first");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        passwordOutput.select();
        document.execCommand("copy");
        passwordOutput.blur();
      }
      showToast("Copied to clipboard");
    } catch (e) {
      console.warn("Copy failed", e);
      showToast("Could not copy");
    }
  });

  setTimeout(() => {
    if (generateBtn) {
      generateBtn.click();
    }
  }, 180);

  function generatePassword(length, activeTypes) {
    const pools = {
      lower: "abcdefghijklmnopqrstuvwxyz",
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      digits: "0123456789",
      symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|~",
    };

    let chars = [];
    activeTypes.forEach((type) => {
      const pool = pools[type] || "";
      if (pool.length > 0) {
        chars.push(randomChar(pool));
      }
    });

    const allPool = activeTypes
      .map((type) => pools[type] || "")
      .join("");

    while (chars.length < length) {
      chars.push(randomChar(allPool));
    }

    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
  }

  function randomChar(pool) {
    if (window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      const idx = arr[0] % pool.length;
      return pool.charAt(idx);
    }
    const idx = Math.floor(Math.random() * pool.length);
    return pool.charAt(idx);
  }

  function updateStrength(password, varietyCount) {
    const lengthScore = password.length;
    let score = 0;

    if (lengthScore >= 12) score += 1;
    if (lengthScore >= 16) score += 1;
    if (lengthScore >= 20) score += 1;

    if (varietyCount >= 2) score += 1;
    if (varietyCount >= 3) score += 1;
    if (varietyCount === 4) score += 1;

    let level = "weak";
    let label = "Weak";

    if (score >= 4 && score <= 5) {
      level = "medium";
      label = "Good";
    } else if (score >= 6) {
      level = "strong";
      label = "Strong";
    }

    strengthDot.classList.remove("weak", "medium", "strong");
    strengthDot.classList.add(level);
    strengthLabel.textContent = `Strength: ${label}`;
  }

  function pushHistory(password) {
    history.unshift(password);
    history = history.slice(0, 4);
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    history.forEach((pwd, index) => {
      const li = document.createElement("li");
      li.className = "history-item";
      const label = index === 0 ? "Latest" : `#${index + 1}`;
      li.innerHTML = `<span>${escapeHtml(pwd)}</span><span class="pill-label">${label}</span>`;
      historyList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  let toastTimeout;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("visible");
    }, 1700);
  }

  function pulseElement(el) {
    if (!el) return;
    el.style.transform = "scale(0.97)";
    el.style.boxShadow = "0 0 0 1px rgba(248,113,113,0.7)";
    setTimeout(() => {
      el.style.transform = "";
      el.style.boxShadow = "";
    }, 180);
  }
}

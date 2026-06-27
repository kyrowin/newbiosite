/* ===== SOUND MODULE (real Windows XP mp3) ===== */
const Sound = (() => {
    const FILES = {
        startup: 'Windows XP Startup.mp3',
        logon: 'Windows XP Logon Sound.mp3',
        logoff: 'Windows XP Logoff Sound.mp3',
        shutdown: 'Windows XP Shutdown.mp3',
        start: 'Windows XP Start.mp3',
        click: 'Windows XP Menu Command.mp3',
        minimize: 'Windows XP Minimize.mp3',
        restore: 'Windows XP Restore.mp3',
        error: 'Windows XP Error.mp3',
        recycle: 'Windows XP Recycle.mp3',
        ding: 'Windows XP Ding.mp3',
        pcStart: 'pcStart.mp3',
    };

    const SRC = {};
    Object.keys(FILES).forEach(k => { SRC[k] = 'sounds/' + encodeURIComponent(FILES[k]); });

    let masterVolume = 0.75;
    let muted = false;
    let unlocked = false;
    let powerAudio = null;

    function preload() {
        Object.values(SRC).forEach(url => {
            const a = new Audio();
            a.preload = 'auto';
            a.src = url;
        });
    }

    function play(key) {
        const url = SRC[key];
        if (!url || muted || masterVolume <= 0) return null;
        const a = new Audio(url);
        a.volume = masterVolume;
        const p = a.play();
        if (p && p.catch) p.catch(() => {});
        return a;
    }

    function setVolume(v) { masterVolume = Math.max(0, Math.min(1, v)); }
    function getVolume() { return masterVolume; }
    function setMuted(m) { muted = !!m; }
    function isMuted() { return muted; }

    function unlock() {
        if (unlocked) return;
        unlocked = true;
        preload();
    }

    function powerOn() {
        if (muted || masterVolume <= 0) return;
        try {
            if (powerAudio) { powerAudio.pause(); }
            powerAudio = new Audio(SRC.pcStart);
            powerAudio.loop = true;
            powerAudio.volume = masterVolume;
            const p = powerAudio.play();
            if (p && p.catch) p.catch(() => {});
        } catch (_) {}
    }

    function powerOnFadeOut(ms) {
        const a = powerAudio;
        if (!a) return;
        powerAudio = null;
        const dur = ms || 600;
        const steps = 24;
        const start = a.volume;
        let i = 0;
        const iv = setInterval(() => {
            i++;
            a.volume = Math.max(0, start * (1 - i / steps));
            if (i >= steps) {
                clearInterval(iv);
                try { a.pause(); a.currentTime = 0; } catch (_) {}
            }
        }, dur / steps);
    }

    return {
        play, setVolume, getVolume, setMuted, isMuted, unlock, preload, powerOn, powerOnFadeOut,
        click: () => play('click'),
        error: () => play('error'),
        startMenu: () => play('start'),
        windowOpen: () => play('restore'),
        windowMinimize: () => play('minimize'),
        startup: () => play('startup'),
        logon: () => play('logon'),
        logoff: () => play('logoff'),
        shutdown: () => play('shutdown'),
        recycle: () => play('recycle'),
        ding: () => play('ding'),
    };
})();

/* ===== BOOT & LOGIN FLOW ===== */
const Boot = (() => {
    const biosScreen = () => document.getElementById('bios-screen');
    const bootScreen = () => document.getElementById('boot-screen');
    const loginScreen = () => document.getElementById('login-screen');
    const welcomeScreen = () => document.getElementById('welcome-screen');
    const shutdownProgress = () => document.getElementById('shutdown-progress');
    const shutdownScreen = () => document.getElementById('shutdown-screen');
    const desktop = () => document.getElementById('desktop');
    const taskbar = () => document.getElementById('taskbar');

    const FADE = 0; // abrupt XP-style hard cuts between screens

    function show(el) { el.classList.remove('hidden'); }
    function hide(el) { el.classList.add('hidden'); }
    function setBusy(on) { document.body.classList.toggle('busy', on); }

    function fadeIn(el) {
        el.classList.remove('fade-out');
        el.classList.add('fade-in');
        setTimeout(() => el.classList.remove('fade-in'), FADE);
    }

    function fadeOutHide(el, cb) {
        el.classList.add('fade-out');
        setTimeout(() => {
            el.classList.remove('fade-out');
            hide(el);
            if (cb) cb();
        }, FADE);
    }

    // Short black pause between stages (screen is black because nothing is shown)
    function blackGap(ms, cb) { setTimeout(cb, ms); }

    // CRT monitor power-on flash on a screen element
    function crtFlash(el) {
        if (!el) return;
        el.classList.remove('crt-on');
        void el.offsetWidth; // force reflow to restart the animation
        el.classList.add('crt-on');
        setTimeout(() => el.classList.remove('crt-on'), 650);
    }

    function countMemory(el, cb) {
        if (!el) { if (cb) cb(); return; }
        const total = 524288, step = 8192;
        let cur = 0;
        const t = setInterval(() => {
            cur += step;
            if (cur >= total) {
                clearInterval(t);
                el.textContent = 'Memory Testing : ' + total + 'K OK';
                setTimeout(() => { if (cb) cb(); }, 350);
            } else {
                el.textContent = 'Memory Testing : ' + cur + 'K';
            }
        }, 18);
    }

    // Reveal POST lines one by one, like a real slow boot
    function runPost(done) {
        const screen = biosScreen();
        screen.classList.add('post-progressive');
        const items = Array.from(screen.querySelectorAll('.bios-head, .bios-line'));
        items.forEach(el => el.classList.add('pending'));
        const memEl = document.getElementById('bios-mem');
        if (memEl) memEl.textContent = 'Memory Testing : ';

        let idx = 0;
        function next() {
            if (idx >= items.length) {
                setTimeout(() => {
                    screen.classList.remove('post-progressive');
                    if (done) done();
                }, 900);
                return;
            }
            const el = items[idx++];
            el.classList.remove('pending');
            if (el.id === 'bios-mem') {
                countMemory(el, next);
            } else {
                setTimeout(next, 210 + Math.random() * 140);
            }
        }
        next();
    }

    function bootSequence() {
        const b = bootScreen();
        show(b);
        Sound.startup();
        setTimeout(() => {
            hide(b);
            blackGap(700, () => {
                setBusy(false);
                show(loginScreen());
            });
        }, 6000);
    }

    function startBoot() {
        setBusy(true);
        const bios = biosScreen();
        crtFlash(bios);
        runPost(() => {
            Sound.powerOnFadeOut(700);
            hide(bios);
            blackGap(700, () => bootSequence());
        });
    }

    function login() {
        setBusy(true);
        fadeOutHide(loginScreen(), () => {
            const w = welcomeScreen();
            show(w);
            fadeIn(w);
            Sound.logon();
            setTimeout(() => {
                fadeOutHide(w, () => {
                    setBusy(false);
                    show(desktop());
                    show(taskbar());
                    fadeIn(desktop());
                    if (window.onDesktopReady) window.onDesktopReady();
                    if (window.onDesktopLogin) window.onDesktopLogin();
                });
            }, 2200);
        });
    }

    function logoff() {
        closeAllMenus();
        setBusy(true);
        Sound.logoff();
        fadeOutHide(desktop(), () => {
            setBusy(false);
            hide(taskbar());
            show(loginScreen());
            fadeIn(loginScreen());
        });
    }

    function shutdown() {
        closeAllMenus();
        setBusy(true);
        Sound.shutdown();
        hide(desktop());
        hide(taskbar());
        hide(loginScreen());
        const sp = shutdownProgress();
        show(sp);
        fadeIn(sp);
        setTimeout(() => {
            try {
                window.open('', '_self');
                window.close();
            } catch (_) { /* browser blocks programmatic close of normal tabs */ }
            fadeOutHide(sp, () => {
                show(shutdownScreen());
                fadeIn(shutdownScreen());
            });
        }, 2600);
    }

    function restart() {
        hide(shutdownScreen());
        setBusy(true);
        const bios = biosScreen();
        show(bios);
        crtFlash(bios);
        Sound.powerOn();
        runPost(() => {
            Sound.powerOnFadeOut(700);
            hide(bios);
            blackGap(700, () => bootSequence());
        });
    }

    function closeAllMenus() {
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('volume-flyout').classList.add('hidden');
        document.getElementById('network-flyout').classList.add('hidden');
        document.getElementById('context-menu').classList.add('hidden');
        const im = document.getElementById('icon-context-menu');
        if (im) im.classList.add('hidden');
        document.getElementById('start-btn').classList.remove('active');
    }

    return { startBoot, login, logoff, shutdown, restart, closeAllMenus };
})();

/* ===== START MENU ===== */
const StartMenu = (() => {
    const menu = () => document.getElementById('start-menu');
    const startBtn = () => document.getElementById('start-btn');

    function toggle() {
        const m = menu();
        if (m.classList.contains('hidden')) open();
        else close();
    }

    function open() {
        Boot.closeAllMenus();
        menu().classList.remove('hidden');
        startBtn().classList.add('active');
        Sound.startMenu();
    }

    function close() {
        menu().classList.add('hidden');
        startBtn().classList.remove('active');
    }

    function handleAction(action) {
        Sound.click();
        close();
        runAction(action);
    }

    return { toggle, open, close, handleAction };
})();

/* ===== SHARED ACTION ROUTER ===== */
function runAction(action) {
    switch (action) {
        case 'open-bio':
            WindowManager.show();
            break;
        case 'open-tg':
            window.open('https://t.me/kyrowin', '_blank', 'noopener');
            break;
        case 'open-gh':
            window.open('https://github.com/kyrowin', '_blank', 'noopener');
            break;
        case 'recycle':
            Sound.recycle();
            break;
        case 'logoff':
            Boot.logoff();
            break;
        case 'shutdown':
            Boot.shutdown();
            break;
        default:
            MsgBox.show();
    }
}

/* ===== TRAY ===== */
const Tray = (() => {
    let volumeOpen = false;
    let networkOpen = false;
    let tooltip = null;

    function closeAll() {
        document.getElementById('volume-flyout').classList.add('hidden');
        document.getElementById('network-flyout').classList.add('hidden');
        volumeOpen = false;
        networkOpen = false;
        hideTooltip();
    }

    function toggleVolume() {
        const flyout = document.getElementById('volume-flyout');
        if (volumeOpen) {
            flyout.classList.add('hidden');
            volumeOpen = false;
        } else {
            closeAll();
            flyout.classList.remove('hidden');
            volumeOpen = true;
            Sound.click();
        }
    }

    function toggleNetwork() {
        const flyout = document.getElementById('network-flyout');
        if (networkOpen) {
            flyout.classList.add('hidden');
            networkOpen = false;
        } else {
            closeAll();
            flyout.classList.remove('hidden');
            networkOpen = true;
            Sound.click();
        }
    }

    function showTooltip(text, x, y) {
        hideTooltip();
        tooltip = document.createElement('div');
        tooltip.className = 'clock-tooltip';
        tooltip.textContent = text;
        tooltip.style.left = x + 'px';
        tooltip.style.top = (y - 30) + 'px';
        document.body.appendChild(tooltip);
    }

    function hideTooltip() {
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
    }

    return { closeAll, toggleVolume, toggleNetwork, showTooltip, hideTooltip };
})();

/* ===== VOLUME CONTROL ===== */
const VolumeControl = (() => {
    function updateIcon() {
        const btn = document.getElementById('volume-btn');
        if (!btn) return;
        if (Sound.isMuted() || Sound.getVolume() <= 0) {
            btn.style.filter = 'grayscale(1)';
            btn.style.opacity = '0.55';
            btn.title = 'Volume (Muted)';
        } else {
            btn.style.filter = '';
            btn.style.opacity = '';
            btn.title = 'Volume';
        }
    }

    function init() {
        const slider = document.getElementById('volume-slider');
        const mute = document.getElementById('mute-check');
        const balance = document.getElementById('balance-slider');

        if (slider) {
            slider.value = Math.round(Sound.getVolume() * 100);
            slider.addEventListener('input', () => {
                Sound.setVolume(slider.value / 100);
                if (Sound.getVolume() > 0 && mute && mute.checked) {
                    mute.checked = false;
                    Sound.setMuted(false);
                }
                updateIcon();
            });
            slider.addEventListener('change', () => Sound.click());
        }

        if (mute) {
            mute.checked = Sound.isMuted();
            mute.addEventListener('change', () => {
                Sound.setMuted(mute.checked);
                updateIcon();
                if (!mute.checked) Sound.click();
            });
        }

        if (balance) {
            balance.addEventListener('change', () => Sound.click());
        }

        updateIcon();
    }

    return { init, updateIcon };
})();

/* ===== TOOLTIPS ===== */
const Tooltip = (() => {
    let el = null, timer = null, current = null, mx = 0, my = 0;

    function remove() {
        if (timer) { clearTimeout(timer); timer = null; }
        if (el) { el.remove(); el = null; }
    }

    function build(text) {
        remove();
        el = document.createElement('div');
        el.className = 'clock-tooltip xp-tooltip';
        text.split('\n').forEach((line, i) => {
            if (i) el.appendChild(document.createElement('br'));
            el.appendChild(document.createTextNode(line));
        });
        document.body.appendChild(el);
        let x = mx + 12, y = my + 18;
        const r = el.getBoundingClientRect();
        if (x + r.width > window.innerWidth - 4) x = window.innerWidth - r.width - 4;
        if (y + r.height > window.innerHeight - 4) y = my - r.height - 8;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
    }

    function init() {
        document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
        document.addEventListener('mouseover', (e) => {
            const t = e.target.closest('[data-tip]');
            if (!t || t === current) return;
            current = t;
            remove();
            const tip = t.getAttribute('data-tip');
            if (!tip) return;
            timer = setTimeout(() => build(tip), 600);
        });
        document.addEventListener('mouseout', (e) => {
            const t = e.target.closest('[data-tip]');
            if (!t) return;
            const to = e.relatedTarget;
            if (to && to.closest && to.closest('[data-tip]') === t) return;
            current = null;
            remove();
        });
        document.addEventListener('mousedown', remove, true);
        window.addEventListener('blur', remove);
    }

    return { init, remove };
})();

/* ===== CONTEXT MENU ===== */
const ContextMenu = (() => {
    const menu = () => document.getElementById('context-menu');

    function show(x, y) {
        Boot.closeAllMenus();
        const m = menu();
        m.classList.remove('hidden');
        m.style.left = x + 'px';
        m.style.top = y + 'px';

        const rect = m.getBoundingClientRect();
        if (rect.right > window.innerWidth) m.style.left = (x - rect.width) + 'px';
        if (rect.bottom > window.innerHeight - 30) m.style.top = (y - rect.height) + 'px';
    }

    function close() {
        menu().classList.add('hidden');
    }

    function handleAction(action) {
        Sound.click();
        close();
        if (action === 'properties') MsgBox.show();
    }

    return { show, close, handleAction };
})();

/* ===== ICON CONTEXT MENU ===== */
const IconMenu = (() => {
    const menu = () => document.getElementById('icon-context-menu');
    let targetIcon = null;

    function show(x, y, icon) {
        Boot.closeAllMenus();
        targetIcon = icon;
        const m = menu();
        m.classList.remove('hidden');
        m.style.left = x + 'px';
        m.style.top = y + 'px';
        const rect = m.getBoundingClientRect();
        if (rect.right > window.innerWidth) m.style.left = (x - rect.width) + 'px';
        if (rect.bottom > window.innerHeight - 30) m.style.top = (y - rect.height) + 'px';
    }

    function close() { menu().classList.add('hidden'); }

    function handleAction(action) {
        Sound.click();
        close();
        if (action === 'open' && targetIcon) {
            runAction(targetIcon.dataset.action);
        } else if (action === 'properties') {
            MsgBox.show();
        }
    }

    return { show, close, handleAction };
})();

/* ===== DESKTOP SELECTION BOX ===== */
function initSelection() {
    const desktop = document.getElementById('desktop');
    const box = document.getElementById('selection-box');
    let active = false, ox = 0, oy = 0;

    desktop.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('.desktop-icon') || e.target.closest('.card')) return;
        active = true;
        ox = e.clientX;
        oy = e.clientY;
        box.style.left = ox + 'px';
        box.style.top = oy + 'px';
        box.style.width = '0px';
        box.style.height = '0px';
        box.classList.remove('hidden');
        document.querySelectorAll('.desktop-icon').forEach(b => b.classList.remove('selected'));
    });

    document.addEventListener('mousemove', (e) => {
        if (!active) return;
        const maxY = window.innerHeight - 30;
        const cx = Math.max(0, Math.min(e.clientX, window.innerWidth));
        const cy = Math.max(0, Math.min(e.clientY, maxY));
        const x = Math.min(ox, cx), y = Math.min(oy, cy);
        const w = Math.abs(cx - ox), h = Math.abs(cy - oy);
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.width = w + 'px';
        box.style.height = h + 'px';
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            const r = icon.getBoundingClientRect();
            const hit = !(r.right < x || r.left > x + w || r.bottom < y || r.top > y + h);
            icon.classList.toggle('selected', hit);
        });
    });

    document.addEventListener('mouseup', () => {
        if (!active) return;
        active = false;
        box.classList.add('hidden');
    });
}

/* ===== MESSAGE BOX ===== */
const MsgBox = (() => {
    const DEFAULT_MSG = '\u0422\u0443\u0442 \u0435\u0449\u0435 \u043d\u0435\u0442 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u0430, \u043f\u043e\u0442\u043e\u043c \u0434\u043e\u0431\u0430\u0432\u043b\u044e';
    const overlay = () => document.getElementById('msgbox-overlay');
    const boxEl = () => document.getElementById('msgbox');
    let initialized = false;

    function isOpen() { return !overlay().classList.contains('hidden'); }

    function init() {
        if (initialized) return;
        initialized = true;
        document.getElementById('msgbox-ok').addEventListener('click', close);
        document.getElementById('msgbox-x').addEventListener('click', close);
        overlay().addEventListener('mousedown', (e) => {
            if (e.target === overlay()) Sound.ding();
        });
        document.addEventListener('keydown', (e) => {
            if (!isOpen()) return;
            if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close(); }
        });
        makeDraggable();
    }

    function makeDraggable() {
        const bar = document.getElementById('msgbox-titlebar');
        const box = boxEl();
        let dragging = false, ox = 0, oy = 0;
        bar.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.closest('.msgbox-x')) return;
            dragging = true;
            const r = box.getBoundingClientRect();
            box.style.transform = 'none';
            box.style.left = r.left + 'px';
            box.style.top = r.top + 'px';
            ox = e.clientX - r.left;
            oy = e.clientY - r.top;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            box.style.left = Math.max(0, Math.min(e.clientX - ox, window.innerWidth - box.offsetWidth)) + 'px';
            box.style.top = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - 30 - box.offsetHeight)) + 'px';
        });
        document.addEventListener('mouseup', () => { dragging = false; document.body.style.userSelect = ''; });
    }

    function center() {
        const b = boxEl();
        b.style.left = '50%';
        b.style.top = '42%';
        b.style.transform = 'translate(-50%, -50%)';
    }

    function show(message, title) {
        init();
        document.getElementById('msgbox-text').textContent = message || DEFAULT_MSG;
        document.getElementById('msgbox-title').textContent = title || 'Biography';
        overlay().classList.remove('hidden');
        center();
        Sound.error();
        setTimeout(() => document.getElementById('msgbox-ok').focus(), 0);
    }

    function close() {
        if (!isOpen()) return;
        overlay().classList.add('hidden');
        Sound.click();
    }

    return { show, close, isOpen };
})();

/* ===== WINDOW MANAGER ===== */
const WindowManager = (() => {
    let card, appBtn, maximizeBtn, maximizeIcon, restoreIcon;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let savedX = null;
    let savedY = null;
    let isMaximized = false;
    let initialized = false;
    const TASKBAR_H = 30;

    function init() {
        if (initialized) return;
        initialized = true;
        card = document.getElementById('bio-window');
        appBtn = document.getElementById('app-btn');
        maximizeBtn = document.querySelector('.maximize-btn');
        maximizeIcon = maximizeBtn.querySelector('.max-glyph');
        restoreIcon = maximizeBtn.querySelector('.restore-glyph');
        const windowTitlebar = document.querySelector('.window-titlebar');

        windowTitlebar.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || isMaximized) return;
            isDragging = true;
            clearTransform();
            const rect = card.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const maxX = window.innerWidth - card.offsetWidth;
            const maxY = window.innerHeight - TASKBAR_H - card.offsetHeight;
            const x = Math.max(0, Math.min(e.clientX - dragOffsetX, maxX));
            const y = Math.max(0, Math.min(e.clientY - dragOffsetY, maxY));
            setCardPosition(x, y);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = '';
        });

        windowTitlebar.addEventListener('touchstart', (e) => {
            if (isMaximized) return;
            isDragging = true;
            const touch = e.touches[0];
            const rect = card.getBoundingClientRect();
            dragOffsetX = touch.clientX - rect.left;
            dragOffsetY = touch.clientY - rect.top;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging || isMaximized) return;
            const touch = e.touches[0];
            const maxX = window.innerWidth - card.offsetWidth;
            const maxY = window.innerHeight - TASKBAR_H - card.offsetHeight;
            const x = Math.max(0, Math.min(touch.clientX - dragOffsetX, maxX));
            const y = Math.max(0, Math.min(touch.clientY - dragOffsetY, maxY));
            setCardPosition(x, y);
        }, { passive: true });

        document.addEventListener('touchend', () => { isDragging = false; });

        windowTitlebar.addEventListener('dblclick', toggleMaximize);

        document.querySelector('.minimize-btn').addEventListener('click', hide);
        document.querySelector('.close-btn').addEventListener('click', closeWindow);
        maximizeBtn.addEventListener('click', toggleMaximize);
        appBtn.addEventListener('click', () => {
            if (card.classList.contains('hidden')) show();
            else hide();
        });

        centerCard();
        animateIn();
        startTypewriter();
    }

    function onLogoff() {
        if (!initialized) return;
        if (isMaximized) toggleMaximize();
        card.classList.remove('hidden', 'minimized');
        appBtn.classList.remove('hidden');
        appBtn.classList.add('active');
        card.style.opacity = '1';
        centerCard();
    }

    function onLogin() {
        if (!initialized) return;
        onLogoff();
    }

    function animateIn() {
        card.style.opacity = '0';
        card.style.transform = 'translate(-50%, calc(-50% + 20px))';
        requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translate(-50%, -50%)';
        });
    }

    function clearTransform() { card.style.transform = 'none'; }

    function setCardPosition(x, y) {
        clearTransform();
        card.style.left = x + 'px';
        card.style.top = y + 'px';
        savedX = x;
        savedY = y;
    }

    function centerCard() {
        savedX = null;
        savedY = null;
        card.style.left = '50%';
        card.style.top = '50%';
        card.style.transform = 'translate(-50%, -50%)';
    }

    function restoreCardPosition() {
        if (savedX !== null && savedY !== null) setCardPosition(savedX, savedY);
        else centerCard();
    }

    function show() {
        const wasHidden = card.classList.contains('hidden');
        card.classList.remove('hidden', 'minimized', 'inactive');
        appBtn.classList.remove('hidden');
        appBtn.classList.add('active');
        if (wasHidden) Sound.windowOpen();
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            if (isMaximized) card.style.transform = 'none';
            else restoreCardPosition();
        });
    }

    function hide() {
        if (isMaximized) toggleMaximize();
        Sound.windowMinimize();
        appBtn.classList.remove('active');
        card.classList.add('hidden');
    }

    // Close hides the window and its taskbar button without closing the site.
    function closeWindow() {
        if (isMaximized) toggleMaximize();
        Sound.windowMinimize();
        card.classList.add('hidden');
        appBtn.classList.add('hidden');
        appBtn.classList.remove('active');
    }

    function toggleMaximize() {
        isMaximized = !isMaximized;
        card.classList.toggle('maximized', isMaximized);
        maximizeIcon.hidden = isMaximized;
        restoreIcon.hidden = !isMaximized;
        maximizeBtn.title = isMaximized ? 'Restore' : 'Maximize';
        Sound.click();

        if (isMaximized) {
            clearTransform();
            card.style.left = '0';
            card.style.top = '0';
        } else {
            restoreCardPosition();
        }
    }

    function startTypewriter() {
        const desc = document.querySelector('.desc');
        const fullText = '\u2008Live in Russia. Love computers <3';
        desc.textContent = '\u2008';
        let i = 0;
        function typeWriter() {
            if (i <= fullText.length) {
                desc.textContent = fullText.slice(0, i);
                i++;
                setTimeout(typeWriter, 35);
            }
        }
        setTimeout(typeWriter, 900);
    }

    return { init, show, hide, onLogin };
})();

/* ===== DESKTOP ICONS (drag + persistence) ===== */
function initDesktopIcons() {
    const desktop = document.getElementById('desktop');
    const icons = Array.from(document.querySelectorAll('.desktop-icon'));
    const STORE = 'xp-desktop-icons';
    const THRESH = 4;

    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE)) || {}; } catch (_) { saved = {}; }

    icons.forEach((icon, i) => {
        const key = icon.dataset.action;
        const pos = saved[key];
        if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
            icon.style.left = pos.x + 'px';
            icon.style.top = pos.y + 'px';
        } else {
            icon.style.left = '8px';
            icon.style.top = (8 + i * 84) + 'px';
        }
    });

    function save() {
        const data = {};
        icons.forEach(icon => {
            data[icon.dataset.action] = {
                x: parseInt(icon.style.left, 10) || 0,
                y: parseInt(icon.style.top, 10) || 0,
            };
        });
        localStorage.setItem(STORE, JSON.stringify(data));
    }

    let active = null, startX = 0, startY = 0, offX = 0, offY = 0, moved = false;

    function onMove(e) {
        if (!active) return;
        if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) < THRESH) return;
        if (!moved) { moved = true; active.classList.add('dragging'); }
        const deskRect = desktop.getBoundingClientRect();
        let x = e.clientX - deskRect.left - offX;
        let y = e.clientY - deskRect.top - offY;
        x = Math.max(0, Math.min(x, deskRect.width - active.offsetWidth));
        y = Math.max(0, Math.min(y, deskRect.height - active.offsetHeight));
        active.style.left = x + 'px';
        active.style.top = y + 'px';
    }

    function onUp() {
        if (!active) return;
        const wasMoved = moved;
        active.classList.remove('dragging');
        if (wasMoved) save();
        const el = active;
        active = null;
        moved = false;
        // swallow the click that follows a real drag
        if (wasMoved) {
            const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
            el.addEventListener('click', swallow, { capture: true, once: true });
            setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 0);
        }
    }

    icons.forEach(icon => {
        icon.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            active = icon;
            const rect = icon.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            offX = e.clientX - rect.left;
            offY = e.clientY - rect.top;
            moved = false;
        });
    });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

/* ===== CLOCK ===== */
function initClock() {
    const clockEl = document.getElementById('taskbar-clock');

    function update() {
        const now = new Date();
        let h = now.getHours();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        const m = now.getMinutes().toString().padStart(2, '0');
        clockEl.textContent = `${h}:${m} ${ampm}`;
    }

    clockEl.addEventListener('mouseenter', (e) => {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const text = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        Tray.showTooltip(text, e.clientX - 70, e.clientY);
    });

    clockEl.addEventListener('mouseleave', () => Tray.hideTooltip());

    setInterval(update, 1000);
    update();
}

/* ===== TITLE TYPEWRITER (easter egg) ===== */
function initTitleTypewriter() {
    setTimeout(() => {
        const fullTitle = 'Kyrowin / Bio';
        let i = 0;
        function typeWriter() {
            if (i <= fullTitle.length) {
                document.title = fullTitle.slice(0, i);
                i++;
                setTimeout(typeWriter, 250);
            }
        }
        typeWriter();
    }, 10000);
}

/* ===== GLOBAL EVENTS ===== */
function initGlobalEvents() {
    document.getElementById('login-btn').addEventListener('click', () => Boot.login());
    document.getElementById('turn-off-btn').addEventListener('click', () => Boot.shutdown());
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', () => Boot.restart());

    document.getElementById('start-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        StartMenu.toggle();
    });

    document.querySelectorAll('.start-item, .start-all, .sm-right-item, .start-footer-btn').forEach(btn => {
        btn.addEventListener('click', () => StartMenu.handleAction(btn.dataset.action));
    });

    document.querySelectorAll('.desktop-icon').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.desktop-icon').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        btn.addEventListener('dblclick', () => {
            Sound.click();
            runAction(btn.dataset.action);
        });
    });

    document.getElementById('desktop').addEventListener('mousedown', (e) => {
        if (!e.target.closest('.desktop-icon')) {
            document.querySelectorAll('.desktop-icon').forEach(b => b.classList.remove('selected'));
        }
    });

    document.getElementById('volume-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        Tray.toggleVolume();
    });

    document.getElementById('network-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        Tray.toggleNetwork();
    });

    VolumeControl.init();

    document.querySelectorAll('#context-menu .ctx-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.disabled) ContextMenu.handleAction(btn.dataset.action);
        });
    });
    document.querySelectorAll('#icon-context-menu .ctx-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.disabled) IconMenu.handleAction(btn.dataset.iaction);
        });
    });

    document.getElementById('desktop').addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const icon = e.target.closest('.desktop-icon');
        if (icon) {
            document.querySelectorAll('.desktop-icon').forEach(b => b.classList.remove('selected'));
            icon.classList.add('selected');
            IconMenu.show(e.clientX, e.clientY, icon);
        } else {
            ContextMenu.show(e.clientX, e.clientY);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
            StartMenu.close();
        }
        if (!e.target.closest('#volume-flyout') && !e.target.closest('#network-flyout') &&
            !e.target.closest('#volume-btn') && !e.target.closest('#network-btn')) {
            Tray.closeAll();
        }
        if (!e.target.closest('#context-menu')) {
            ContextMenu.close();
        }
        if (!e.target.closest('#icon-context-menu')) {
            IconMenu.close();
        }
    });

    document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });

    Tooltip.init();
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
    initGlobalEvents();

    const powerScreen = document.getElementById('power-screen');
    const powerBtn = document.getElementById('power-btn');
    if (powerBtn) {
        powerBtn.addEventListener('click', () => {
            Sound.unlock();
            Sound.powerOn();
            if (powerScreen) powerScreen.classList.add('hidden');
            document.getElementById('bios-screen').classList.remove('hidden');
            Boot.startBoot();
        }, { once: true });
    } else {
        Boot.startBoot();
    }

    let desktopInitialized = false;
    let clockInitialized = false;

    window.onDesktopReady = () => {
        WindowManager.init();
        if (!desktopInitialized) { initDesktopIcons(); initSelection(); desktopInitialized = true; }
        if (!clockInitialized) { initClock(); initTitleTypewriter(); clockInitialized = true; }
    };

    window.onDesktopLogin = () => {
        WindowManager.onLogin();
    };
});

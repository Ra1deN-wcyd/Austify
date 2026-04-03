@extends('layouts.app')

@section('content')

<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<style>
    :root {
        --bg:      #0d1f14;
        --forest:  #1a4731;
        --leaf:    #4ade80;
        --leaf2:   #22c55e;
        --glow:    #4ade8033;
        --card:    #f5f2eb;
        --ink:     #0f1a12;
        --muted:   #7a8c80;
        --sand:    #ede8df;
        --border:  #e0dbd0;
        --danger:  #ef4444;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        background: var(--bg);
        font-family: 'Instrument Sans', sans-serif;
        min-height: 100vh;
    }

    .page-wrap {
        min-height: 100vh;
        background:
            radial-gradient(ellipse 70% 50% at 50% 0%, #1a473188, transparent),
            radial-gradient(ellipse 40% 40% at 90% 80%, #4ade801a, transparent),
            var(--bg);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 64px 16px 80px;
    }

    /* ── CARD ─────────────────────────────────────────── */
    .pcard {
        width: 100%;
        max-width: 560px;
        background: var(--card);
        border-radius: 28px;
        overflow: hidden;
        box-shadow:
            0 0 0 1px rgba(74,222,128,.12),
            0 32px 80px rgba(0,0,0,.45),
            0 8px 20px rgba(0,0,0,.3);
        animation: cardIn .5s cubic-bezier(.22,.68,0,1.2) both;
    }
    @keyframes cardIn {
        from { opacity:0; transform:translateY(32px) scale(.97); }
        to   { opacity:1; transform:none; }
    }

    /* ── BANNER ───────────────────────────────────────── */
    .banner {
        height: 130px;
        background: linear-gradient(135deg, #0a2e1b 0%, #1a4731 45%, #2d6a4f 75%, #4ade8030 100%);
        position: relative; overflow: hidden;
    }
    .banner::after {
        content:''; position:absolute; inset:0;
        background: repeating-linear-gradient(
            -55deg, transparent 0px, transparent 18px,
            rgba(255,255,255,.025) 18px, rgba(255,255,255,.025) 19px
        );
    }
    .b-orb {
        position:absolute; border-radius:50%;
        filter:blur(28px); pointer-events:none;
    }
    .b-orb-1 { width:120px; height:120px; background:#4ade8030; top:-30px; right:60px; }
    .b-orb-2 { width:80px;  height:80px;  background:#22c55e20; bottom:-20px; right:20px; }

    /* ── IDENTITY ─────────────────────────────────────── */
    .identity {
        padding: 0 32px 28px;
        display: flex; align-items: flex-end; gap: 20px;
    }

    /* ── AVATAR ───────────────────────────────────────── */
    .av-wrap { position:relative; flex-shrink:0; margin-top:-44px; }
    .av-ring {
        width:88px; height:88px; border-radius:50%;
        border:4px solid var(--card);
        background:var(--forest);
        display:flex; align-items:center; justify-content:center;
        font-family:'Bricolage Grotesque',sans-serif;
        font-size:2rem; font-weight:800; color:var(--leaf);
        overflow:hidden;
        box-shadow: 0 0 0 2px var(--leaf2), 0 8px 24px rgba(0,0,0,.25);
        transition: box-shadow .3s;
    }
    .av-ring:hover { box-shadow: 0 0 0 3px var(--leaf), 0 0 20px var(--glow), 0 8px 24px rgba(0,0,0,.25); }
    .av-ring img { width:100%; height:100%; object-fit:cover; display:none; }
    .av-cam {
        position:absolute; bottom:2px; right:0;
        width:26px; height:26px;
        background:var(--forest); border:2.5px solid var(--card);
        border-radius:50%; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        font-size:11px;
        box-shadow: 0 2px 8px rgba(0,0,0,.2);
        transition: background .2s, transform .15s;
    }
    .av-cam:hover { background:var(--leaf2); transform:scale(1.1); }

    /* ── NAME + BADGE ─────────────────────────────────── */
    .id-meta { padding-bottom:4px; flex:1; }
    .id-name {
        font-family:'Bricolage Grotesque',sans-serif;
        font-size:1.55rem; font-weight:800;
        color:var(--ink); line-height:1.1; margin-bottom:8px;
    }
    .role-pill {
        display:inline-flex; align-items:center; gap:5px;
        padding:3px 11px 3px 8px; border-radius:999px;
        font-size:0.68rem; font-weight:600;
        letter-spacing:1px; text-transform:uppercase;
    }
    .pill-admin  { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
    .pill-member { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }

    /* ── DIVIDER ──────────────────────────────────────── */
    .divider { height:1px; background:var(--border); margin: 0 32px; }

    /* ── POINTS BAND ──────────────────────────────────── */
    .points-band {
        margin: 24px 32px;
        background: var(--forest);
        border-radius: 18px;
        padding: 20px 28px;
        display: flex; align-items: center; gap: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.06);
        position: relative; overflow: hidden;
    }
    .points-band::before {
        content:''; position:absolute; inset:0;
        background: radial-gradient(ellipse 80% 80% at 110% 50%, #4ade8018, transparent);
    }
    .points-star { font-size:2rem; flex-shrink:0; }
    .points-num {
        font-family:'Bricolage Grotesque',sans-serif;
        font-size:2.4rem; font-weight:800; color:var(--leaf); line-height:1;
    }
    .points-lbl {
        font-size:0.7rem; font-weight:600;
        letter-spacing:2px; text-transform:uppercase;
        color:rgba(255,255,255,.4); margin-top:3px;
    }
    .points-right { margin-left:auto; opacity:.2; font-size:3.5rem; line-height:1; }

    /* ── INFO FIELDS ──────────────────────────────────── */
    .info-section { padding: 0 32px 28px; }
    .section-title {
        font-size:0.65rem; font-weight:600;
        letter-spacing:2.5px; text-transform:uppercase;
        color:var(--muted); margin-bottom:12px;
    }

    .field {
        display:flex; align-items:center; gap:14px;
        padding:14px 16px; border-radius:14px; margin-bottom:8px;
        background:var(--sand); border:1px solid transparent;
        transition: border-color .2s, background .2s, box-shadow .2s;
    }
    .field.editable-active {
        background:#fff; border-color:var(--leaf2);
        box-shadow: 0 0 0 3px #4ade8018;
    }
    .field-icon {
        width:36px; height:36px; background:rgba(26,71,49,.1);
        border-radius:10px; display:flex; align-items:center;
        justify-content:center; font-size:1rem; flex-shrink:0;
    }
    .field-body { flex:1; min-width:0; }
    .field-label {
        font-size:0.6rem; font-weight:600;
        letter-spacing:2px; text-transform:uppercase; color:var(--muted);
    }
    .field-val { font-size:0.92rem; font-weight:500; color:var(--ink); margin-top:1px; }
    .field-val a { color:var(--forest); text-decoration:none; }
    .field-val a:hover { text-decoration:underline; }
    .field-input {
        display:none; border:none; outline:none; background:transparent;
        font-size:0.92rem; font-weight:500; color:var(--ink);
        width:100%; font-family:'Instrument Sans',sans-serif; margin-top:2px;
    }
    .lock-icon { font-size:0.75rem; color:var(--muted); opacity:.4; margin-left:4px; flex-shrink:0; }

    /* ── ACTIONS ──────────────────────────────────────── */
    .actions { padding: 0 32px 32px; display:flex; gap:10px; }

    .btn-p {
        flex:1; background:var(--forest); color:#fff;
        border:none; border-radius:12px; padding:13px 24px;
        font-family:'Bricolage Grotesque',sans-serif;
        font-weight:700; font-size:0.82rem; letter-spacing:.5px;
        cursor:pointer; transition: background .2s, transform .15s, box-shadow .2s;
        display:inline-flex; align-items:center; justify-content:center; gap:7px;
    }
    .btn-p:hover { background:#2d6a4f; transform:translateY(-1px); box-shadow:0 6px 20px rgba(26,71,49,.3); }

    .btn-s {
        flex:1; background:var(--leaf2); color:var(--forest);
        border:none; border-radius:12px; padding:13px 24px;
        font-family:'Bricolage Grotesque',sans-serif;
        font-weight:700; font-size:0.82rem; letter-spacing:.5px;
        cursor:pointer; transition: background .2s, transform .15s;
        display:none; align-items:center; justify-content:center; gap:7px;
    }
    .btn-s:hover { background:#16a34a; }

    .btn-g {
        background:transparent; color:var(--muted);
        border:1.5px solid var(--border); border-radius:12px; padding:13px 20px;
        font-family:'Instrument Sans',sans-serif;
        font-weight:500; font-size:0.82rem;
        cursor:pointer; transition: border-color .2s, color .2s;
        display:none; align-items:center; justify-content:center;
    }
    .btn-g:hover { border-color:var(--danger); color:var(--danger); }

    /* ── TOAST ────────────────────────────────────────── */
    #toast {
        position:fixed; bottom:28px; left:50%;
        transform: translateX(-50%) translateY(12px);
        z-index:9999; background:var(--forest); color:#fff;
        padding:11px 22px; border-radius:999px;
        font-size:0.84rem; font-weight:500;
        box-shadow:0 8px 32px rgba(0,0,0,.3);
        opacity:0; pointer-events:none;
        transition: opacity .3s, transform .3s;
        white-space:nowrap;
    }
    #toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
    #toast.error { background:var(--danger); }

    .spin {
        display:inline-block; width:14px; height:14px;
        border:2px solid rgba(255,255,255,.3);
        border-top-color:currentColor; border-radius:50%;
        animation:sp .6s linear infinite;
    }
    @keyframes sp { to { transform:rotate(360deg); } }
</style>

<div class="page-wrap">
    <div class="pcard">

        <!-- Banner -->
        <div class="banner">
            <div class="b-orb b-orb-1"></div>
            <div class="b-orb b-orb-2"></div>
        </div>

        <!-- Identity row -->
        <div class="identity">
            <div class="av-wrap">
                <div class="av-ring" id="avRing">
                    <img id="avImg" src="" alt="">
                    <span id="avInitial">?</span>
                </div>
                <button class="av-cam" title="Change photo" onclick="document.getElementById('avInput').click()">📷</button>
                <input type="file" id="avInput" accept="image/*" style="display:none" onchange="previewAvatar(event)">
            </div>
            <div class="id-meta">
                <div class="id-name" id="profileName">Loading…</div>
                <span id="roleBadge" class="role-pill pill-member">👤 Member</span>
            </div>
        </div>

        <div class="divider"></div>

        <!-- Points -->
        <div class="points-band">
            <div class="points-star">⭐</div>
            <div>
                <div class="points-num" id="statPoints">—</div>
                <div class="points-lbl"> Points</div>
            </div>
            <div class="points-right">✦</div>
        </div>

        <!-- Fields -->
        <div class="info-section">
            <div class="section-title">Profile Details</div>

            <div class="field" id="fieldName">
                <div class="field-icon">👤</div>
                <div class="field-body">
                    <div class="field-label">Full Name</div>
                    <div class="field-val" id="displayName">—</div>
                    <input class="field-input" id="inputName" type="text" placeholder="Your name">
                </div>
            </div>

            <div class="field">
                <div class="field-icon">📧</div>
                <div class="field-body">
                    <div class="field-label">Email Address</div>
                    <div class="field-val" id="displayEmail">—</div>
                </div>
                <span class="lock-icon">🔒</span>
            </div>

            <div class="field" id="fieldGithub">
                <div class="field-icon">🐙</div>
                <div class="field-body">
                    <div class="field-label">GitHub Profile</div>
                    <div class="field-val" id="displayGithub">Not provided</div>
                    <input class="field-input" id="inputGithub" type="url" placeholder="https://github.com/username">
                </div>
            </div>

            <div class="field">
                <div class="field-icon">🛡️</div>
                <div class="field-body">
                    <div class="field-label">Role</div>
                    <div class="field-val" id="displayRole">—</div>
                </div>
                <span class="lock-icon">🔒</span>
            </div>
        </div>

        <!-- Buttons -->
        <div class="actions">
            <button class="btn-p" id="btnEdit"   onclick="enterEditMode()">✏️ Edit Profile</button>
            <button class="btn-s" id="btnSave"   onclick="saveProfile()">💾 Save Changes</button>
            <button class="btn-g" id="btnCancel" onclick="exitEditMode()">Cancel</button>
        </div>

    </div>
</div>

<div id="toast"></div>

<script>
    const TOKEN = localStorage.getItem('austify_token');

    async function loadProfile() {
        try {
            const res    = await fetch('/api/accounts/my-profile', {
                headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/json' }
            });
            const result = await res.json();
            if (!res.ok) return showToast('Could not load profile.', true);
            const u = result.data;
            localStorage.setItem('user_name',   u.name        || '');
            localStorage.setItem('user_email',  u.email       || '');
            localStorage.setItem('user_github', u.github_link || '');
            localStorage.setItem('user_role',   u.role        || 'member');
            localStorage.setItem('user_points', u.points ?? u.bonus_points ?? 0);
            renderProfile(u);
        } catch { showToast('Network error.', true); }
    }

    function renderProfile(u) {
        const name   = u.name        || localStorage.getItem('user_name')   || '?';
        const email  = u.email       || localStorage.getItem('user_email')  || '—';
        const github = u.github_link || localStorage.getItem('user_github') || '';
        const role   = u.role        || localStorage.getItem('user_role')   || 'member';
        const points = u.points      ?? u.bonus_points ?? localStorage.getItem('user_points') ?? '—';

        document.getElementById('profileName').textContent  = name;
        document.getElementById('avInitial').textContent    = name.charAt(0).toUpperCase();
        document.getElementById('displayName').textContent  = name;
        document.getElementById('displayEmail').textContent = email;
        document.getElementById('displayRole').textContent  = role.charAt(0).toUpperCase() + role.slice(1);
        document.getElementById('statPoints').textContent   = points;

        const badge = document.getElementById('roleBadge');
        if (role === 'admin') {
            badge.className   = 'role-pill pill-admin';
            badge.textContent = '👑 Admin';
        } else {
            badge.className   = 'role-pill pill-member';
            badge.textContent = '👤 Member';
        }

        document.getElementById('displayGithub').innerHTML = github
            ? `<a href="${github}" target="_blank">${github}</a>`
            : 'Not provided';

        document.getElementById('inputName').value   = name;
        document.getElementById('inputGithub').value = github;
    }

    function enterEditMode() {
        swap('fieldName',   'displayName',   'inputName',   true);
        swap('fieldGithub', 'displayGithub', 'inputGithub', true);
        vis('btnEdit', false); vis('btnSave', true); vis('btnCancel', true);
        document.getElementById('inputName').focus();
    }

    function exitEditMode() {
        swap('fieldName',   'displayName',   'inputName',   false);
        swap('fieldGithub', 'displayGithub', 'inputGithub', false);
        vis('btnEdit', true); vis('btnSave', false); vis('btnCancel', false);
    }

    function swap(fId, dId, iId, editing) {
        document.getElementById(fId).classList.toggle('editable-active', editing);
        document.getElementById(dId).style.display = editing ? 'none' : '';
        document.getElementById(iId).style.display = editing ? 'block' : 'none';
    }

    function vis(id, show) {
        document.getElementById(id).style.display = show ? 'inline-flex' : 'none';
    }

    async function saveProfile() {
        const name   = document.getElementById('inputName').value.trim();
        const github = document.getElementById('inputGithub').value.trim();
        if (!name) return showToast('Name cannot be empty.', true);

        const btn = document.getElementById('btnSave');
        btn.innerHTML = '<span class="spin"></span> Saving…';
        btn.disabled  = true;

        try {
            const res    = await fetch('/api/accounts/update-profile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, github_link: github || null })
            });
            const result = await res.json();
            if (!res.ok) { showToast(result.message || 'Update failed.', true); }
            else { renderProfile(result.data); exitEditMode(); showToast('✅ Profile updated!'); }
        } catch { showToast('Network error.', true); }
        finally  { btn.innerHTML = '💾 Save Changes'; btn.disabled = false; }
    }

    function previewAvatar(e) {
        const file = e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = ev => {
            const img = document.getElementById('avImg');
            img.src = ev.target.result;
            img.style.display = 'block';
            document.getElementById('avInitial').style.display = 'none';
        };
        r.readAsDataURL(file);
        showToast('📸 Photo preview updated');
    }

    function showToast(msg, isError = false) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.className   = 'show' + (isError ? ' error' : '');
        clearTimeout(t._t);
        t._t = setTimeout(() => t.className = '', 3000);
    }

    // instant cache render, then live fetch
    const c = {
        name: localStorage.getItem('user_name'),
        email: localStorage.getItem('user_email'),
        github_link: localStorage.getItem('user_github'),
        role: localStorage.getItem('user_role'),
        points: localStorage.getItem('user_points'),
    };
    if (c.name) renderProfile(c);
    loadProfile();
</script>

@endsection

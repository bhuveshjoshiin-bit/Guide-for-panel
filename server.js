require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const GUILD_ID_1 = process.env.GUILD_ID_1;
const GUILD_ID_2 = process.env.GUILD_ID_2;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID || 'dummy',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || 'dummy',
    callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'guilds.join']
}, async (accessToken, refreshToken, profile, done) => {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (botToken) {
        try {
            const guildsToJoin = [GUILD_ID_1, GUILD_ID_2];
            for (const guildId of guildsToJoin) {
                if (guildId) {
                    await axios.put(`https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`, 
                        { access_token: accessToken },
                        { headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' } }
                    ).catch(err => console.log(`Error joining guild ${guildId}:`, err.response?.data || err.message));
                }
            }
        } catch (error) {
            console.error('Failed to join guilds:', error.message);
        }
    }
    process.nextTick(() => done(null, profile));
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/?login=required');
}

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Auth Routes
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
app.get('/auth/logout', (req, res) => req.logout(() => res.redirect('/')));

// App Routes
app.get('/', (req, res) => {
    const methods = [
        { slug: 'aimbot', title: 'Aimbot Logic', desc: 'Core memory manipulation for target acquisition.', icon: '🎯' },
        { slug: 'aimbot-ai', title: 'Aimbot AI Logic', desc: 'Advanced pattern-based target acquisition.', icon: '🤖' },
        { slug: 'keyauth', title: 'KeyAuth Security', desc: 'Secure licensing and user authentication system.', icon: '🔑' },
        { slug: 'particles', title: 'Particle Systems', desc: 'Visual effects and high-performance UI rendering.', icon: '✨' },
        { slug: 'internet', title: 'Network Control', desc: 'Logic for blocking and unblocking game traffic.', icon: '🌐' },
        { slug: 'bypass', title: 'Anti-Cheat Bypass', desc: 'Techniques for staying undetected by security.', icon: '🛡️' },
        { slug: 'chams', title: 'Visual Chams', desc: 'ESP and visual modification logic.', icon: '👁️' },
        { slug: 'ui-logic', title: 'UI & Logic', desc: 'Section management and interface architecture.', icon: '📑' },
        { slug: 'dll-injector', title: 'DLL Injection', desc: 'Injecting dynamic link libraries into processes.', icon: '💉' },
        { slug: 'keybinding', title: 'Keybinding System', desc: 'Global keyboard hooks for feature toggles.', icon: '⌨️' },
        { slug: 'on-off-method', title: 'Camera Control', desc: 'Memory patching for camera modifications.', icon: '📸' },
        { slug: 'sound-adding', title: 'Sound Effects', desc: 'Playing embedded audio resources.', icon: '🔊' },
        { slug: 'streamer-code', title: 'Streamer Mode', desc: 'Hiding panel from recording software.', icon: '🎥' }
    ];
    res.render('index', { 
        categories: ['Aimbot', 'Aimbot AI', 'Key Auth', 'Particles', 'Internet', 'Bypass', 'Chams', 'UI & Logic', 'DLL Injector', 'Keybinding', 'On/Off Method', 'Sound Effects', 'Streamer Mode'],
        methods: methods
    });
});
app.get('/about', (req, res) => res.render('about'));
app.get('/guide', (req, res) => res.render('guide'));
app.get('/download', (req, res) => res.render('download'));

// Specific Method Routes
app.get('/methods', checkAuth, (req, res) => {
    const methods = [
        { slug: 'aimbot', title: 'Aimbot Logic', desc: 'Core memory manipulation for target acquisition.', icon: '🎯' },
        { slug: 'aimbot-ai', title: 'Aimbot AI Logic', desc: 'Advanced pattern-based target acquisition.', icon: '🤖' },
        { slug: 'keyauth', title: 'KeyAuth Security', desc: 'Secure licensing and user authentication system.', icon: '🔑' },
        { slug: 'particles', title: 'Particle Systems', desc: 'Visual effects and high-performance UI rendering.', icon: '✨' },
        { slug: 'internet', title: 'Network Control', desc: 'Logic for blocking and unblocking game traffic.', icon: '🌐' },
        { slug: 'bypass', title: 'Anti-Cheat Bypass', desc: 'Techniques for staying undetected by security.', icon: '🛡️' },
        { slug: 'chams', title: 'Visual Chams', desc: 'ESP and visual modification logic.', icon: '👁️' },
        { slug: 'ui-logic', title: 'UI & Logic', desc: 'Section management and interface architecture.', icon: '📑' },
        { slug: 'dll-injector', title: 'DLL Injection', desc: 'Injecting dynamic link libraries into processes.', icon: '💉' },
        { slug: 'keybinding', title: 'Keybinding System', desc: 'Global keyboard hooks for feature toggles.', icon: '⌨️' },
        { slug: 'on-off-method', title: 'Camera Control', desc: 'Memory patching for camera modifications.', icon: '📸' },
        { slug: 'sound-adding', title: 'Sound Effects', desc: 'Playing embedded audio resources.', icon: '🔊' },
        { slug: 'streamer-code', title: 'Streamer Mode', desc: 'Hiding panel from recording software.', icon: '🎥' }
    ];
    res.render('methods-list', { methods });
});

const methodPages = {
    'aimbot': { 
        title: 'Aimbot Logic', 
        files: [{ name: 'Aimbot Method', path: 'Methods/Aimbot/AIMBOT METHOD.txt' }], 
        refs: ['AIM_MEM.cs'], 
        category: 'Aimbot',
        ui: [
            { element: 'Guna2Button', name: 'btnAimbot', role: 'Toggle Aimbot' },
            { element: 'Label', name: 'Sta', role: 'Status Display' }
        ],
        explanation: 'Memory-based target acquisition using AoB scanning to find dynamic offsets for player coordinates.'
    },
    'aimbot-ai': { 
        title: 'Aimbot AI Logic', 
        files: [{ name: 'Aimbot AI Method', path: 'Methods/Aimbot ai/aimbot ai method by usp gamer.txt' }], 
        refs: ['uspaimbotmem.cs'], 
        category: 'Aimbot ai',
        ui: [
            { element: 'Guna2Button', name: 'button1', role: 'Inject Aimbot' },
            { element: 'Guna2Button', name: 'button2', role: 'Aimbot OFF' },
            { element: 'Label', name: 'lblStatus', role: 'Status Display' }
        ],
        explanation: 'Advanced Aimbot logic using pattern scanning (AoB) and memory manipulation for target acquisition in emulators.'
    },
    'keyauth': { 
        title: 'KeyAuth Security', 
        files: [{ name: 'KeyAuth Login', path: 'Methods/Key auth/KeyAuth.txt' }], 
        refs: ['KeyAuth.cs', 'Ed25519.cs'], 
        category: 'Key auth',
        ui: [
            { element: 'Guna2TextBox', name: 'User', role: 'Username Input' },
            { element: 'Guna2TextBox', name: 'Pass', role: 'Password Input' },
            { element: 'Guna2Button', name: 'btnLogin', role: 'Trigger Authentication' }
        ],
        explanation: 'Secure licensing system integration. Requires initialization before any login attempts.'
    },
    'particles-snow': { 
        title: 'Snow Particles', 
        files: [{ name: 'Snow Logic', path: 'Methods/Particles/snow.txt' }], 
        refs: [], category: 'Particles',
        ui: [{ element: 'Timer', name: 'timer1', role: 'Refresh Logic' }, { element: 'Panel', name: 'Canvas', role: 'Rendering Surface' }],
        explanation: 'Falling snow particle effect using GDI+ rendering.'
    },
    'particles-rainfall': { 
        title: 'RainFall Particles', 
        files: [{ name: 'RainFall Logic', path: 'Methods/Particles/RainFall.txt' }], 
        refs: [], category: 'Particles',
        ui: [{ element: 'Timer', name: 'timer1', role: 'Refresh Logic' }, { element: 'Panel', name: 'Canvas', role: 'Rendering Surface' }],
        explanation: 'Fast-moving rain particle effect with gravity physics.'
    },
    'particles-dot': { 
        title: 'Dot Particles', 
        files: [{ name: 'Dot Logic', path: 'Methods/Particles/Dot.txt' }], 
        refs: [], category: 'Particles',
        ui: [{ element: 'Timer', name: 'timer1', role: 'Refresh Logic' }, { element: 'Panel', name: 'Canvas', role: 'Rendering Surface' }],
        explanation: 'Simple dot particle rendering for minimalist backgrounds.'
    },
    'particles-drift': { 
        title: 'Dot Drift Particles', 
        files: [{ name: 'Dot Drift Logic', path: 'Methods/Particles/Dot Drift.txt' }], 
        refs: [], category: 'Particles',
        ui: [{ element: 'Timer', name: 'timer1', role: 'Refresh Logic' }, { element: 'Panel', name: 'Canvas', role: 'Rendering Surface' }],
        explanation: 'Particles that drift horizontally with smooth noise movement.'
    },
    'particles-fireworks': { 
        title: 'Fire Works Particles', 
        files: [{ name: 'Fire Works Logic', path: 'Methods/Particles/Fire Works.txt' }], 
        refs: [], category: 'Particles',
        ui: [{ element: 'Timer', name: 'timer1', role: 'Refresh Logic' }, { element: 'Panel', name: 'Canvas', role: 'Rendering Surface' }],
        explanation: 'Exploding particle bursts for high-impact visual feedback.'
    },
    'particles-mysterious': { 
        title: 'Mysterious Line Particles', 
        files: [{ name: 'Mysterious Line Logic', path: 'Methods/Particles/Mysterious Line.txt' }], 
        refs: [], category: 'Particles',
        ui: [{ element: 'Timer', name: 'timer1', role: 'Refresh Logic' }, { element: 'Panel', name: 'Canvas', role: 'Rendering Surface' }],
        explanation: 'Flowing line-based particles for an abstract look.'
    },
    'particles-red-triangle': { 
        title: 'Red Triangle Particles', 
        files: [{ name: 'Red Triangle Logic', path: 'Methods/Particles/red triangle particle.txt' }], 
        refs: [], category: 'Particles',
        ui: [{ element: 'Timer', name: 'timer1', role: 'Refresh Logic' }, { element: 'Panel', name: 'Canvas', role: 'Rendering Surface' }],
        explanation: 'Geometric triangle particles with custom color rendering.'
    },
    'internet': { 
        title: 'Network Control', 
        files: [
            { name: 'Execute Command Helper', path: 'Methods/Internet/INTERNET CODE.txt' },
            { name: 'Block Internet', path: 'Methods/Internet/BLOCK INTERNET BUTTON CODE.txt' },
            { name: 'Unblock Internet', path: 'Methods/Internet/UNBLOCK INTERNET BUTTON CODE.txt' }
        ], 
        refs: [], 
        category: 'Internet',
        ui: [
            { element: 'Guna2Button', name: 'btnBlock', role: 'Block Traffic' },
            { element: 'Guna2Button', name: 'btnUnblock', role: 'Restore Traffic' }
        ],
        explanation: 'Firewall-based network manipulation using shell command execution.'
    },
    'bypass': { 
        title: 'Anti-Cheat Bypass', 
        files: [{ name: 'Bypass Method', path: 'Methods/Bypass/BYPASS METHOD.txt' }], 
        refs: [], 
        category: 'Bypass',
        ui: [
            { element: 'Guna2Button', name: 'btnBypass', role: 'Activate Bypass' }
        ],
        explanation: 'Logic for staying undetected by security systems during memory manipulation.'
    },
    'chams': { 
        title: 'Visual Chams', 
        files: [
            { name: 'DLL Extraction', path: 'Methods/Chams/Button code.txt' },
            { name: 'Resource Management', path: 'Methods/Chams/Button Up.txt' }
        ], 
        refs: [], 
        category: 'Chams',
        ui: [
            { element: 'Guna2Button', name: 'btnChams', role: 'Inject Chams DLL' }
        ],
        explanation: 'Internal DLL injection for visual modifications. Uses embedded resources for extraction.'
    },
    'ui-logic': { 
        title: 'UI & Logic', 
        files: [{ name: 'Tab System', path: 'Methods/Tab method/SECTION METHOD.txt' }], 
        refs: [], 
        category: 'Tab method',
        ui: [
            { element: 'Guna2Panel', name: 'guna2Panel1-4', role: 'Feature Containers' },
            { element: 'Guna2Button', name: 'btnTab1-4', role: 'Tab Switching' }
        ],
        explanation: 'Modular UI architecture for switching between different feature sections seamlessly.'
    },
    'dll-injector': { 
        title: 'DLL Injection', 
        files: [{ name: 'DLL Injector Method', path: 'Methods/Dll injector/DLL INJECTOR METHOD.txt' }], 
        refs: [], 
        category: 'Dll injector',
        ui: [
            { element: 'Guna2ComboBox', name: 'guna2ComboBox1', role: 'Process Selection' },
            { element: 'Guna2Button', name: 'guna2ButtonChooseFile', role: 'Select DLL' },
            { element: 'Guna2Button', name: 'guna2ButtonApply', role: 'Inject DLL' }
        ],
        explanation: 'Standard DLL injection method using OpenProcess, VirtualAllocEx, WriteProcessMemory, and CreateRemoteThread.'
    },
    'keybinding': { 
        title: 'Keybinding System', 
        files: [{ name: 'Keybinding Logic', path: 'Methods/keybinding/KEYBINGING.txt' }], 
        refs: [], 
        category: 'keybinding',
        ui: [
            { element: 'Guna2Button', name: 'waitingForKeyButton', role: 'Assign Key' },
            { element: 'Guna2ToggleSwitch', name: 'toggleSwitch', role: 'Feature Toggle' }
        ],
        explanation: 'Global keyboard hook system using Win32 API to bind keys to UI toggles.'
    },
    'on-off-method': { 
        title: 'Camera Control', 
        files: [{ name: 'Camera Left Method', path: 'Methods/On,off method/CAMERA LEFT  METHOD.txt' }], 
        refs: [], 
        category: 'On,off method',
        ui: [
            { element: 'Guna2Button', name: 'button1', role: 'Load Method' },
            { element: 'Guna2ToggleSwitch', name: 'ToggleSwitch1', role: 'Toggle Camera' },
            { element: 'Label', name: 'Sta', role: 'Status Display' }
        ],
        explanation: 'Memory patching technique for camera modifications using AoB scanning and byte replacement.'
    },
    'sound-adding': { 
        title: 'Sound Effects', 
        files: [{ name: 'Sound Logic', path: 'Methods/Sound adding method/Sound.txt' }], 
        refs: [], 
        category: 'Sound adding method',
        ui: [
            { element: 'Function', name: 'PlaySound', role: 'Audio Playback' },
            { element: 'Guna2Button', name: 'btnPlay', role: 'Trigger Sound' }
        ],
        explanation: 'Playing embedded WAV sound resources using System.Media.SoundPlayer.'
    },
    'streamer-code': { 
        title: 'Streamer Mode', 
        files: [
            { name: 'Button Code', path: 'Methods/Streamer code/Button code.txt' },
            { name: 'Button Up', path: 'Methods/Streamer code/Button up.txt' }
        ], 
        refs: [], 
        category: 'Streamer code',
        ui: [
            { element: 'Guna2ToggleSwitch', name: 'streamerbtn', role: 'Toggle Visibility' }
        ],
        explanation: 'Hiding the application from screen capture and taskbar using WindowDisplayAffinity.'
    }
};

app.get('/methods/particles', checkAuth, (req, res) => {
    const particleMethods = [
        { slug: 'particles-snow', title: 'Snow Particles', desc: 'Falling snow effect.', icon: '❄️' },
        { slug: 'particles-rainfall', title: 'RainFall Particles', desc: 'Falling rain effect.', icon: '🌧️' },
        { slug: 'particles-dot', title: 'Dot Particles', desc: 'Minimalist dot rendering.', icon: '⚪' },
        { slug: 'particles-drift', title: 'Dot Drift', desc: 'Horizontally drifting dots.', icon: '💨' },
        { slug: 'particles-fireworks', title: 'Fire Works', desc: 'Exploding burst effects.', icon: '🎆' },
        { slug: 'particles-mysterious', title: 'Mysterious Lines', desc: 'Abstract line particles.', icon: '〽️' },
        { slug: 'particles-red-triangle', title: 'Red Triangles', desc: 'Geometric triangle effects.', icon: '🔺' }
    ];
    res.render('methods/particles-list', { methods: particleMethods });
});

app.get('/methods/:slug', checkAuth, async (req, res) => {
    const page = methodPages[req.params.slug];
    if (!page) return res.status(404).send('Method not found');

    try {
        const fileContents = await Promise.all(page.files.map(async f => {
            const content = await fs.readFile(path.join(__dirname, f.path), 'utf-8');
            return { name: f.name, content };
        }));

        res.render('methods/template', { 
            title: page.title, 
            fileContents, 
            refs: page.refs, 
            category: page.category,
            ui: page.ui,
            explanation: page.explanation,
            slug: req.params.slug
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading method files');
    }
});

app.get('/download/app', (req, res) => {
    const filePath = path.join(__dirname, 'app', 'Panel-Maker-win32-x64.rar');
    res.download(filePath);
});

app.get('/download/:category/:file', checkAuth, async (req, res) => {
    const filePath = path.join(__dirname, 'Methods', req.params.category, req.params.file);
    if (await fs.exists(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const path = require('path');

const app = express();

// --- CONFIGURATION ---
// These pull from the "Environment" tab in your Render Dashboard
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL; 

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
    // This profile contains the user's Discord username and ID
    return done(null, profile);
}));

app.use(session({
    secret: 'character-ai-secret-key', 
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Start Discord Auth
app.get('/auth/discord', passport.authenticate('discord'));

// Discord Callback
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/'); 
});

// API to let the Frontend know who is logged in
app.get('/api/user', (req, res) => {
    res.json(req.user || null);
});

// Logout
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

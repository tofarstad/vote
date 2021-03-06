var express = require('express');
var passport = require('passport');
var errors = require('../errors');

var router = express.Router();

router.get('/login', function(req, res) {
    var csrfToken = process.env.NODE_ENV !== 'test' ? req.csrfToken() : 'test';
    res.render('login', {
        csrfToken: csrfToken,
        feedback: req.flash('error')
    });
});

function stripUsername(req, res, next) {
    req.body.username = req.body.username.trim();
    next();
}

router.post('/login', stripUsername, passport.authenticate('local', {
    failureRedirect: '/auth/login', failureFlash: 'Brukernavn og/eller passord er feil.'
}), function(req, res) {
    // If the user tried to access a specific page before, redirect there:
    var path = req.session.originalPath || '/';
    res.redirect(path);
});

router.post('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) return errors.handleError(res, err);
        res.redirect('/auth/login');
    });
});

module.exports = router;

const router = require('express').Router();
const ensureLogin = require('connect-ensure-login');
const passport = require('passport');
const UserController = require('../controllers/user-controller');
const Auth = require('../controllers/auth-controller.');

const { auth } = require('../middlewares/sessionChecker');

router.get('/login', (req, res, next) => {
    res.render('login-page', { title : "Login "});
})

router.get('/register', (req, res, next) => {
    res.render('register-page', { title : "Register here "})
});

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    req.logOut();
    console.log(req.session);
    res.redirect('/auth/login');
})


router.post('/login', passport.authenticate('login', { failureRedirect : '/auth/login', failureFlash : 'Invalid email / password' }), UserController.login);

router.post('/register', ensureLogin.ensureLoggedOut({ redirectTo : '/auth/logout' }) ,UserController.register );

router.get('/profile', ensureLogin.ensureLoggedIn({ redirectTo : '/auth/login' }), auth ,UserController.profileView);

router.get('/delete/:id', ensureLogin.ensureLoggedIn({ redirectTo : '/auth/login' }), auth ,UserController.deleteProfile);

router.get('/update/:id', ensureLogin.ensureLoggedIn({ redirectTo : '/auth/login' }), auth ,UserController.updateGET);

router.put('/update/:id',  ensureLogin.ensureLoggedIn({ redirectTo : '/auth/login' }), auth ,UserController.updatePUT);



router.get('/forgot-password/', Auth.getForgotPassword);

router.post('/forgot-password/', Auth.postForgotPassword);

router.get('/reset-password/:id/:token', Auth.getResetPassword);

router.post('/reset-password/:id/:token', Auth.postResetPassword);

module.exports = router;
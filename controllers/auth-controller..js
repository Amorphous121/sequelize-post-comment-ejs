const nodemailer = require('nodemailer');
require('dotenv').config()
const JWT = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt')
const { appSecrets } = require('../config');

const db = require('../models');
const User = db.users;

exports.getForgotPassword = async (req, res) => {
    return res.render('forgot-password');   
}

exports.postForgotPassword = async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ where : { email }});

    if (!user) return res.render('error', { error : { status : 404, message : "User doesn't exists !"}});

    // user Exists now create a unique link for 15m

    let secret = process.env.TOKEN_SECRET + user.password;
    const payload = {
        email : user.email,
        id : user.id,
    }
    const token = JWT.sign(payload, secret, { expiresIn : '15m' });
    const link = `http://localhost:8081/auth/reset-password/${user.id}/${token}`;


    /*  To Send link to the mail */

    let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : appSecrets.mail,
            pass : appSecrets.password
        }
    });

    var mailOptions = {
        from : appSecrets.mail,
        to : user.email,
        subject : "Password reset link",
        text : `Click on this link to reset your password => ${link}`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error)
            return res.send(error.message)
        else  return res.send('Password reset link has been sent to your email...');
    });

}


exports.getResetPassword = async (req, res, next) => {
    const { id, token } = req.params;
    // Check if the id exists in database
    const user = await User.findOne({ where : { id : id }});
    if (!user) 
        return res.render('error', { error : { status : 400, message : "User doesn't exists !"}});
    // now we have user with given Id.
    const secret = process.env.TOKEN_SECRET + user.password;
    try {
        const payload = await JWT.verify(token, secret);
        return res.render('reset-password', { email : user.email });
        
    } catch (err) {
        console.log(err.message);
        return res.render('error', { error : { status : 404, message : err.message }});
    }

    // res.render('reset-password', { email : user.email });

}

exports.postResetPassword = async (req, res, next) => {
    const { id, token } = req.params;
    console.log(token);
    const { password1 , password2 } = req.body;

    let user = await User.findOne({ where : { id : id }});
    console.log(user.toJSON());
    const schema = Joi.object({
        password1 : Joi.string().min(4).max(15).trim().required(),
        password2 : Joi.string().min(4).max(15).trim().required(),
    })

    let result = schema.validate(req.body);

    if (result.error) 
        return res.render('error', { error : { status : 400, message : result.error.details[0].message }});

    if (!user) 
        return res.render('error', { error : { status : 400, message : "Invalid Id !"}});
    const secret = appSecrets.jwt + user.password;
    try {
        const payload = await JWT.verify(token, secret);
        console.log("post reset ",payload);
        if(password1 !== password2)
            return res.render('error', { error : { status : 400, message : "Passwords do not match!"}});
        
        user = await User.findOne( { where : { id : payload.id, email : payload.email}});

        if (user) {
            const hash = await bcrypt.hash(password1, 10);
            let updatedUser = await User.update({ password : hash }, { where : { id : payload.id, email : payload.email }});
            if (updatedUser)
                res.redirect('/auth/login');
        }

    } catch (err) {
        console.log(err.message);
        res.send(err.message);
    }
}
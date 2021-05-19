const Promise = require('bluebird');
const bcrypt  = require('bcrypt');
const { Op } = require('sequelize')
const Joi = require('joi');
const APIError = require('../utils/APIError');

const db = require('../models');
const User = db.users;
const Post = db.posts;
const Comment = db.comments;
const Role = db.roles;

exports.register = async (req, res, next) => {

    const { firstName, lastName, email, password } = req.body;

    let user = await User.findOne({ where: { email: email } });
    if (user)
        return res.render('register-page', { error: "Email is already in use.", data: { firstName, lastName, email } });

    try {
        const schema = Joi.object({
            firstName: Joi.string().min(3).max(20).trim().required(),
            lastName: Joi.string().min(3).max(20).trim().required(),
            email: Joi.string().min(7).max(45).trim().required().lowercase().email(),
            password: Joi.string().min(4).max(10).trim().required(),
            cpassword: Joi.string().min(4).max(10).trim().required(),
        });

        if (password !== req.body.cpassword)
            return res.render('register-page', { error: "Passwords do not match.", data: { firstName, lastName, email } });

        const result = schema.validate(req.body);

        if (result.error)
            return res.render('register-page', { error: result.error.details[0].message, data: { firstName, lastName, email } });

        const role = await Role.findOne({ where: { name: 'user' } });
        if (!role) throw new APIError({ status: 500, message: "System roles are not generated yet." });
        let roleId = role.id;
        user = await User.create({ firstName, lastName, email, password, roleId: roleId });

        if (user)
            res.redirect('/auth/login');
        else
            res.redirect('/auth/register');

    } catch (error) {
        res.render('register-page', { data: { firstName, lastName, email }, error: error.message })
    }
}

exports.login = async (req, res, next) => {

    try {

        req.session.user = req.user.id;
        req.session.role = req.user.role.name;
        res.locals.session = req.session;
        res.redirect('/posts/allpost');
    } catch (error) {
        console.log(error)
        return res.redirect('/');
    }
}

exports.profileView = async (req, res, next) => {
    try {
        if (!req.session)
            throw new Error("Session not initialized")
        const user = await User.findOne({
            where: { id: req.session.user },
            include: [{
                model: Post
            }]
        });
        // return res.json(user);
        res.locals.session = req.session;
        return res.render('profile', { user: user });
    } catch (error) {
        console.log(error.message);
        return res.redirect('/')
    }
}

exports.deleteProfile = async (req, res, next) => {


    try {
        const posts = await Post.findAll({
            attributes: ['id'],
            where: { userId: req.params.id }
        })

        let pList = [];
        for (post of posts) {
            pList.push(post.id)
        }

        await Promise.mapSeries(pList, (item) => {
            Post.update({ deletedBy: req.user.id }, { where: { id: item } });
            Comment.update({ deletedBy: req.user.id }, { where: { postId: item } });
        });
        await Promise.mapSeries(pList, (item) => {
            Post.destroy({ where: { id: item } });
            Comment.destroy({ where: { postId: item } });
        });

        await Comment.update({ deletedBy: req.user.id }, { where: { userId: req.params.id } })
        await Comment.destroy({ where: { userId: req.params.id } })
        await User.update({ deletedBy: req.user.id }, { where: { id: req.params.id } });
        const user = await User.destroy({ where: { id: req.params.id } });

        if (user)
            return res.redirect('/auth/login');
    } catch (error) {
        console.log(error)
    }
}

exports.updateGET = async (req, res, next) => {
    const user = await User.findOne({ where: { id: req.params.id } })
    return res.render('edit-profile', { user: user });
}

exports.updatePUT = async (req, res, next) => {

    try {
        const schema = Joi.object({
            firstName: Joi.string().min(3).max(20).trim().required(),
            lastName: Joi.string().min(3).max(20).trim().required(),
            email: Joi.string().min(7).max(45).trim().required().lowercase().email(),
            password: Joi.string().min(4).max(10).trim().required(),
        });

        const getEmail = await User.findOne({ where : { id : req.params.id }})
        const user = await User.findOne({ where: 
            { 
                [Op.and] : [ { email : req.body.email }, { email : { [Op.ne] : getEmail.email }}]
            } 
        });

        if (user)
            return res.render('edit-profile', { user: { ...req.body, id: req.params.id }, error: "Email is already in use." });

        let result = schema.validate(req.body);
        if (result.error)
            return res.render('edit-profile', { user: { ...req.body, id: req.params.id }, error: result.error.details[0].message });

        req.body.password = await bcrypt.hash(req.body.password, 10);
        await User.update({ ...req.body }, { where: { id: req.session.user } });
        return res.redirect('/auth/profile');

    } catch (error) {
        let msg = error.code === 11000 ? "Email already Exists" : error.message;
        return res.render('edit-profile', { user: { ...req.body, id: req.params.id }, error: msg });
    }
}

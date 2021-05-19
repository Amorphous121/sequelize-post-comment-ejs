
const Joi = require('joi');

const db = require('../models');

const Comment = db.comments;
const Post = db.posts;
const User = db.users;

exports.create = async (req, res, next) => {
    try {
        let payload = req.body;
        const schema = Joi.object({
            comment: Joi.string().min(3).max(150).required(),
            post: Joi.number().required(),
        })
 
        let result = schema.validate(payload);

        if (result.error) {
            console.log(result.error)
            return res.redirect('/posts/allpost');
        }
        await Comment.create({
            postId: parseInt(payload.post),
            comment: payload.comment,
            userId: req.user.id,
        });
        return res.redirect('/posts/allpost');
    } catch (error) {
        console.log(error)
        return redirect('/posts/allpost');
    }
}


exports.updateGET = async (req, res, next) => {
    const comment = await Comment.findByPk(req.params.id);
    res.render('edit-comment', { comment: comment });
}

exports.update = async (req, res, next) => {
    try {
        const schema = Joi.object({
            comment: Joi.string().min(3).max(50).required()
        })
        const result = schema.validate(req.body);
        if (result.error)
            return res.render('edit-comment', { error: result.error.details[0].message, comment: { id: req.params.id, comment: req.body.comment } });
        await Comment.update({ ...req.body }, { where: { id: req.params.id } });
        res.redirect('/posts/allpost');
    } catch (error) {
        console.log(error.message);
        res.redirect('/post/allpost');
    }
}

exports.delete = async (req, res, next) => {
    try {
        await Comment.update({ deletedBy: req.session.user }, { where: { id: req.params.id } });
        await Comment.destroy({ where: { id: req.params.id } });
        return res.redirect('/posts/allpost');
    } catch (error) {
        console.log(error);
        return res.redirect('/posts/allpost');
    }
}
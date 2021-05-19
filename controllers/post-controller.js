const Joi = require("joi");

const db = require('../models');
const User = db.users;
const Post = db.posts;
const Comment = db.comments;


exports.allpost = async (req, res, next) => {

    try {
        
        const page = req.query.page * 1 || 1;               
        const limit = req.query.limit * 1 || 5;
        const offset = (page - 1) * limit;
        
        const posts = await Post.findAll({
            order : [['createdAt', 'DESC']],
            include : [
                {
                    model : Comment,
                    include : [{
                        model : User
                    }]
                }
            ],
            limit : limit,
            offset : offset
        })

        const count = await Post.count();

        // return res.send({ posts, count, page, limit,offset });
        // const query =  POST.find({ isDeleted: false })
        // .populate({
        //     path: "comments",
        //     match: { isDeleted: false },
        //     populate: {
        //         path: "user",
        //         model: "user",
        //         select: { firstName: 1, _id: 1 },
        //     }
        // }).sort({ createdAt: -1 });

        return res.render('all-post', { posts: posts, current : page, pages : Math.ceil(count / limit)});

    } catch (error) {
        console.log(error)
        res.locals.message = error.message;
        res.locals.error = error;
        return res.render('error');
    }
}


exports.create = async (req, res, next) => {

    try {
        const { title, content } = req.body;
        const schema = Joi.object({
            title: Joi.string().min(3).max(50).required(),
            content: Joi.string().min(3).max(50).required()
        });

        const result = schema.validate(req.body);

        if (result.error)
            return res.render('create-post', { error: result.error.details[0].message, data: { title, content } });
        
        await Post.create({ title, content, userId: req.user.id });
        return res.redirect('/posts/allpost');
    }
    catch (error) {
        console.log(error);
        return res.redirect('/posts/allpost');
    }
};

exports.update = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const schema = Joi.object({
            title: Joi.string().min(3).max(50).required(),
            content: Joi.string().min(3).max(50).required()
        });

        const result = schema.validate(req.body);

        if (result.error)
            return res.render('edit-post', { error: result.error.details[0].message, post: { title, content, id: req.params.id } });

        await Post.update({title, content}, { where : { id : req.params.id }});
        return res.redirect('/posts/allpost');

    } catch (error) {
        console.log(error.message);
        return res.redirect('/posts/allpost');
    }
}


exports.delete = async (req, res, next) => {

    try {
        
        await Comment.update({ deletedBy : req.user.id }, { where : { postId : req.params.id }});
        await Comment.destroy({ where : { postId : req.params.id }});
        await Post.update({ deletedBy : req.user.id }, { where : { id : req.params.id }});
        await Post.destroy({ where : { id : req.params.id }});
        res.redirect('/posts/allpost')

    } catch (error) {
        console.log(error);
        res.redirect('/posts/allpost')
    }
}

exports.show = async (req, res, next) => {
    const post = await Post.findByPk(req.params.id);
    res.render('show', { post: post });
}

exports.edit = async (req, res, next) => {
    const post = await Post.findByPk(req.params.id);
    res.render('edit-post', { post: post });
}


const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models').users;
const Role = require('../models').roles;

passport.use('login', new localStrategy({
        usernameField : 'email',
        passwordField : 'password'
    },
    async (email, password, done) => {
        try {  
            const user = await User.findOne({ 
                where : { email : email }, 
                include : Role
            });
            if (!user)
                return done(null, false, "User doesn't exists!");
            let match = await user.isValidPassword(password);
            if (!match)
                return done(null, false, "Passwords do not match!");
            
            return done(null,user);
        } catch (err) {
            console.log(err)
            done (err);
        }
    })
)



passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
  
passport.deserializeUser(async function(id, done) {
   try {
        const user = await User.findOne( { 
            where : { id : id },
            include : [ {
                model : Role
            }]
        })
    done(null, user)

   } catch(err) {
       done(err);
   }
});



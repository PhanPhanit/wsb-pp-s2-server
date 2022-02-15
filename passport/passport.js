const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');


// google login

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.DOMAIN_SERVER}/api/v1/auth/google/callback`
  },
  async function(accessToken, refreshToken, profile, done){

    try {
      const {id:googleId, displayName:name, emails:[{value: email}]} = profile;
      const user = await User.findOne({email});
      if(user){
        if(user.isActive){
          user.name = name;
          user.password = "";
          user.googleId = googleId;
          user.email = email;
          await user.save();
          done(null, user);
        }else{
          done(null, "error");
        }
      }else{
        // first registerd user is an admin
        const isFirstAccount = (await User.countDocuments({})) === 0;
        const role = isFirstAccount ? "admin":"user";
        const createUser = await User.create({
          name,
          email,
          googleId,
          role
        });
        done(null, createUser);
      }
    } catch (error) {
      done(null, "error");
    }
  }
));


// facebook login

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.DOMAIN_SERVER}/api/v1/auth/facebook/callback`
},
async function(accessToken, refreshToken, profile, done) {

  try {
    const {id:facebookId, displayName:name} = profile;
    const user = await User.findOne({facebookId});
    if(user){
      if(user.isActive){
        user.name = name;
        user.password = "";
        user.facebookId = facebookId;
        user.email = "";
        await user.save();
        done(null, user);
      }else{
        done(null, "error");
      }
    }else{
      // first registerd user is an admin
      const isFirstAccount = (await User.countDocuments({})) === 0;
      const role = isFirstAccount ? "admin":"user";
      const createUser = await User.create({
        name,
        email: "",
        facebookId,
        role
      });
      done(null, createUser);
    }
  } catch (error) {
    done(null, "error");
  }

  
}
));
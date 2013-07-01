var passport = require('passport');

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, new models.User(obj));
});

servers.Collagen.augment({
    initialize: function(parent, app) {
        parent.call(this, app);
        var that = this;
        _.each(Collagen.config.passport, function(options, key) {
            options.sessionKey = 'auth:' + key;

            // Create `verify` function for populating user model
            var verify = function() {
                arguments = Array.prototype.slice.call(arguments);

                var done = arguments.pop()
                ,   profile = arguments.pop();

                // Store profile details into the user object, to allow us to get them into the session.
                if (options.verify === 'OAuth') _.extend(profile, {oauth: {token: arguments[0], token_secret: arguments[1]}});
                else if (_.size(arguments)) _.extend(profile, arguments);

                return done(null, profile);
            }

            // store the strategy instance in a separate variable, so we can access it easily.
            var strategy = new (require('passport-' + key)[options.strategy])(options, verify);
            // mount the passport strategy.
            passport.use(strategy);

            // give the request access to the strategy instance
            // to allow re-use of the oauth instance to make requests.
            that.use(function(req, res, next) {
                req.passportStrategy = strategy;
                next();
            });
            that.use(passport.initialize());
            that.use(passport.session());
            that.use(that.router);

            that.get('/auth/' + key, passport.authenticate(key, {
                successRedirect: '/',
                failureRedirect: '/error'
            }));

            that.get('/auth/' + key + '/logout', function(req, res) {
                req.logout();
                // Remove user object from session as well
                delete req.session.user;
                res.redirect('/');
            });

            // This should work with most OAuth-based authentication frameworks
            // without interfering with non-OAuth ones.
            that.get('/auth/' + key + '/callback', passport.authenticate(key), function(req, res, next) {
                // Add the query parameters to the user object.
                // This should be done by the oauth library, but for some reason
                // it doesn't behave correctly with some variables.
                // @see https://github.com/jaredhanson/passport-oauth/issues/1
                _.extend(req.user, req.query);

                // we don't want the query argument oauth_token in the user record.
                delete req.user.oauth_token;

                // Move the oauth credentials into the session proper, not the
                // user record. This means we can push the user record to the
                // client without leaking secrets.
                req.session.oauth = req.user.oauth;
                delete req.user.oauth;

                // Store the user object into the session for later retrieval
                req.session.user = _.clone(req.user);

                // @todo Decide wether we want to redirect always.
                // This is currently quite hard to bypass.
                res.redirect('/');
            });
        });
    }
});

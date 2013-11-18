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
        var _this = this;
        _.each(Collagen.config.passport, function(options, key) {
            options.sessionKey = 'auth:' + key;

            // Create `verify` function for populating user model
            var verify = function() {
                arguments = Array.prototype.slice.call(arguments);

                var done = arguments.pop(),
                    profile = arguments.pop();

                // Store profile details into the user object, to allow us to get them into the session.
                if (strategy._oauth) _.extend(profile, {oauth: {token: arguments[0], token_secret: arguments[1]}});
                else if (_.size(arguments)) _.extend(profile, arguments);

                return done(null, profile);
            }

            // store the strategy instance in a separate variable, so we can access it easily.
            var strategy = new (require('passport-' + key))(options, verify);
            // mount the passport strategy.
            passport.use(strategy);

            // give the request access to the strategy instance
            // to allow re-use of the oauth instance to make requests.
            _this.use(function(req, res, next) {
                req.passportStrategy = strategy;
                next();
            });
            _this.use(passport.initialize());
            _this.use(passport.session());

            // Attempt to load user data. Authenticate if not available.
            _this.get('/auth/' + key + '/login', function(req, res, next) {
                var cookieKey = Collagen.config.session.key,
                    tokens = req.session[options.sessionKey] || req.session['oauth'];

                if (req.cookies[cookieKey] && tokens) {
                    // Determine parameters to load user profile
                    var params = _.union(_.values(tokens), {}, function(err, user) {
                        if (err) return res.redirect('/auth/' + key);
                        req.session.user = user;
                        req.session.messages = req.session.messages || [];
                        req.session.messages.push({type: 'info', message: 'User successfully logged in'});
                        res.redirect(options.loginRedirect || 'back');
                    });
                    strategy.userProfile.apply(strategy, params);
                } else {
                    res.redirect('/auth/' + key);
                }
            });

            // Perform authentication
            _this.get('/auth/' + key, passport.authenticate(key, {
                successRedirect: '/',
                failureRedirect: '/error'
            }));

            // Logout user
            _this.get('/auth/' + key + '/logout', function(req, res) {
                req.logout();
                // Remove user object from session
                delete req.session.user;
                // Delete any existing OAuth tokens
                delete req.session.oauth;
                // Destroy session data from configured store
                var sid = req.cookies[Collagen.config.session.key];
                Collagen.config.session.store.destroy(sid);
                // Display user message
                req.session.messages = req.session.messages || [];
                req.session.messages.push({type: 'info', message: 'User successfully logged out'});
                res.redirect(options.logoutRedirect || 'home');
            });

            // This should work with most OAuth-based authentication frameworks
            // without interfering with non-OAuth ones.
            _this.get('/auth/' + key + '/callback', passport.authenticate(key), function(req, res) {
                // Move the oauth credentials into the session proper, not the
                // user record. This means we can push the user record to the
                // client without leaking secrets.
                req.session.oauth = _.clone(req.user.oauth);
                delete req.user.oauth;

                // Store the user object into the session for later retrieval
                req.session.user = _.clone(req.user);

                req.session.messages = req.session.messages || [];
                req.session.messages.push({type: 'info', message: 'User successfully logged in'});

                // @todo Decide wether we want to redirect always.
                // This is currently quite hard to bypass.
                res.redirect(options.loginRedirect && options.loginRedirect.substr(0, 1) === '/' ? options.loginRedirect : 'home');
            });
        });
    }
});

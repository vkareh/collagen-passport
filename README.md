Collagen.js Passport
====================

This module allows the [Collagen.js](http://collagenjs.org) framework to use the
[Passport](http://passportjs.org) authentication framework for node.js.

To use, you will need to also install an authenticatin strategy, which can be
found here: [https://github.com/jaredhanson/passport/wiki/Strategies](https://github.com/jaredhanson/passport/wiki/Strategies).

The configuration for your authentication strategy should live in the
`collagen.json` file and can be created as follows (the example uses the
[passport-oauth1](https://github.com/jaredhanson/passport-oauth1) strategy):

````JSON
"passport": {
    "oauth1" : { // <---Authentication strategy: module name, without the `passport-` part
        "requestTokenURL": "http://provider.example.com/oauth/request_token",
        "accessTokenURL": "http://provider.example.com/oauth/access_token",
        "userAuthorizationURL": "http://provider.example.com/oauth/authorize",
        "consumerKey": "CONSUMER KEY",
        "consumerSecret": "CONSUMER SECRET",
        "callbackURL": "http://consumer.example.com/auth/oauth/callback"
    }
}
````

The module currently supports user profile verification function for OAuth
strategies, but has sensible defaults in case other mechanisms are used (this
can also be extended with your custom logic).

To login using this strategy, browse to `http://localhost:3000/auth/oauth1/login`
(or `/auth/KEY/login`, where KEY is your authentication strategy). Multiple
authentication strategies are supported in the passport object inside
`collagen.json`

This module also supports URL redirection after login/logout. To enable, add the
following to your `collagen.json` file:

````JSON
"passport": {
    "oauth1": {
        ...
        "loginRedirect": "/user",
        "logoutRedirect": "home"
    }
}
````

The parameters are passed directly to [`res.redirect(...)`](http://expressjs.com/api.html#res.redirect).
They take the following arguments:

* "home": Website root (similar to "/"). Default for `logoutRedirect`.
* "back": Referer. Redirects back to where the user was. Default for `loginRedirect`.
* "/my/absolute/path": Any absolute URL path on the website.
* "http://external.example.com": An external website.

_Note: When authorizing an application for the first time, `loginRedirect` will
not work with the `back` option. In this case, it will default to `home`._

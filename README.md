Collagen.js Passport
====================

This module allows the [Collagen.js](http://collagenjs.org) framework to use the
[Passport](http://passportjs.org) authentication framework for node.js.

To use, you will need to also install an authenticatin strategy, which can be
found here: [https://github.com/jaredhanson/passport/wiki/Strategies](https://github.com/jaredhanson/passport/wiki/Strategies).

The configuration for your authentication strategy should live in the
`collagen.json` file and can be created as follows (the example uses the
[passport-oauth](https://github.com/jaredhanson/passport-oauth) strategy):

````JSON
"passport": {
    "oauth" : {
        "strategy": "OAuthStrategy",
        "verify": "OAuth",
        "requestTokenURL": "http://provider.example.com/oauth/request_token",
        "accessTokenURL": "http://provider.example.com/oauth/access_token",
        "userAuthorizationURL": "http://provider.example.com/oauth/authorize",
        "consumerKey": "CONSUMER KEY",
        "consumerSecret": "CONSUMER SECRET",
        "callbackURL": "http://consumer.example.com/auth/oauth/callback"
    }
}
````

The `strategy` property will be the class name used by the selected strategy.
The `verify` property is used by Collagen to create the verify function, which
dictates how the user profile object is created. It currently supports OAuth,
but has sensible defaults in case other mechanisms are used (this can also be
extended with your custom logic).

To login using this strategy, browse to `http://localhost:3000/auth/oauth`
(or /auth/KEY, where KEY is your authentication strategy). Multiple
authentication strategies are supported in the passport object inside
`collagen.json`

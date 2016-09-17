var config = {
    server: {
        hostUrl: 'https://localhost', // Used only in messages to user, like activation code email
        port: 443,
        useHttps: true,
        https: {
            keyPath: 'ssl/localhost-key.pem',
            certPath: 'ssl/localhost-cert.pem',
            chain: [
                   ],
            passphrase: ''
        },
        appDirectory: require('path').dirname(module.filename),
        publicDirectory: 'public',
        routesDirectory: 'routes',
        logDirectory: 'logs',
        index: 'index.html',
        //login: 'login.html',
        //register: 'register.html',
        //registerSuccess: 'registerSuccess.html',
        //activationSuccess: 'activationSuccess.html',
        //activationFailure: 'activationFailure.html',
        //admin: 'admin.html',
        //changePassword: 'changePassword.html',
    },
    db: {
        hostname: 'localhost',
        port: 27017,
        mainDb: 'votenow',
        useSSL: false,
        required: true,
        authenticate: false,
        authentication: {
            username: '',
            password: ''
        },
        collections: {
            oauthAccessTokens: 'oauthAccessTokens',
            polls: 'polls',
            voteIds: 'voteIds',
            votes: 'votes',
        }
    },
    oauth: {
        webClientId: 'webClient',
        accessTokenLifetime: 3600, // seconds until an access token expires and the user must login again
    },
    app: {
        email: {
            transport: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // use SSL
                auth: {
                    user: 'someone@gmail.com',
                    pass: 'somePassword'
                }
            },
        },
        activationCodeLifetime: 600, // seconds until an activation code expires and the user must request another
        admins: [
        ]
    },
    web: {
        // Web config
    }
};

module.exports = config;
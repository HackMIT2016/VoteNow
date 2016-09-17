var config = {
    server: {
        port: 80,
        useHttps: false,
        https: {
            keyPath: '',
            certPath: '',
            chain: [
                   ],
            passphrase: ''
        },
    },
    db: {
        hostname: 'localhost',
        port: 27017,
        mainDb: 'votenow',
        useSSL: false,
        required: false,
        authenticate: false,
        authentication: {
            username: '',
            password: ''
        },
        collections: {
        }
    },
};

module.exports = config;
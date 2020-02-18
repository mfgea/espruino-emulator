class http {
    static createServer(handler) {
        console.info('Created http server: ', handler);
        return {
            listen: function(port) {
                console.info('Listening to port: ', port);
            }
        }
    }
}

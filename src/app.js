const config = require("./config");
const Logger = require("./loaders/logger");
const { appLoader } = require("./loaders/startup");
const app = require("express")();

const startServer = async () => {

    await appLoader(app);

    app.listen(config.port, () => {
        Logger.info(`
            ################################################
            🛡️  Server listening on port: ${config.port} 🛡️
            ################################################
        `);
    }).on('error', err => {
        Logger.error(err);
        process.exit(1);
    });
}

startServer();

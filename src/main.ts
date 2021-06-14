import { Server, Probot } from 'probot';
import app from './index';

async function startServer() {
    const appId = process.env.APP_ID;
    // const privateKey = (process.env.PRIVATE_KEY as string).replace(/\\n/gm, '\n');
    const privateKey = Buffer.from(process.env.PRIVATE_KEY as string, 'base64').toString();
    console.log(privateKey);
    const webHookSecret = process.env.WEBHOOK_SECRET;
    const port = Number(process.env.PORT  || 3000);
    const host = process.env.GHE_HOST;
    console.log(appId, privateKey, webHookSecret, port, host);
    let server;
    if (host) {
        server = new Server({
            Probot: Probot.defaults({
                appId: appId,
                privateKey: privateKey,
                secret: webHookSecret,
            }),
            
            port,
            host,
        });
    } else {
        server = new Server({
            Probot: Probot.defaults({
                appId: appId,
                privateKey: privateKey,
                secret: webHookSecret
            }),
            port,
        });
    }

    try {
        await server.load(app);

        server.start();
    } catch (err) {
        console.log(err.message);
    }

}

startServer();
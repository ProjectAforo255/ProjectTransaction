require('dotenv').config()
const express = require('express')
const app = express()

const { ZIPKIN_LOCAL_ENDPOINT, ZIPKIN_SERVICE_NAME } = require('./app/common/constants')

const NacosConfigClient = require('nacos').NacosConfigClient;

async function startServer() {
    const configClient = new NacosConfigClient({
        serverAddr: process.env.NACOS_SERVERADDR,
        serverPort: process.env.NACOS_PORT,
        namespace: process.env.NACOS_NAMESPACE
      });
      
    // listen data changed
    let config = await configClient.getConfig( process.env.NACOS_DATAID, process.env.NACOS_GROUP)
        .then(content => {
            let config = JSON.parse(content);
            console.log(content);
            for (const key in config) {
                process.env[key.toUpperCase()] = config[key];
            }
            console.log('Transaction -> nacos set');
            return config;
        }).catch((err)=>{
            console.log('Error con nacos');
            console.log(err);
        })

    const PORT = process.env.SERVER_PORT_MOVEMENT || 3005;

    const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require('zipkin')
    const { HttpLogger } = require('zipkin-transport-http')
    const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware
    const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT || ZIPKIN_LOCAL_ENDPOINT
    const tracer = new Tracer({
        ctxImpl: new ExplicitContext(),
        recorder: new BatchRecorder({
            logger: new HttpLogger({
                endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
                jsonEncoder: jsonEncoder.JSON_V2,
            }),
        }),
        localServiceName: ZIPKIN_SERVICE_NAME,
    })
    app.use(zipkinMiddleware({ tracer }))
    
    app.use(express.json())
    app.use('/api', require('./app/routes'))
    
    app.listen(PORT, () => {
        console.log('Application running on port ', PORT)
    })
}

startServer()
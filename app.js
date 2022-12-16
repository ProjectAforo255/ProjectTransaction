require('dotenv').config()
const express = require('express')
const app = express()
const { Kafka } = require('kafkajs')

const NacosConfigClient = require('nacos').NacosConfigClient;

const MongoClient = require('mongodb').MongoClient

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
    
    app.use(express.json())
    app.use('/api', require('./app/routes'))
    
    app.listen(PORT, () => {
        console.log('Application running on port ', PORT)
    })

    init_kafka_consumer()
}


async function init_kafka_consumer(){

    const logProvider = require('./app/middleware/logprovider')

    try {
        logProvider.info('Iniciando kafka-transaction');
        const kafka = new Kafka({
            clientId: 'pay-client',
            brokers: [process.env.KAFKA_SERVER],
        });
    
        const consumer = kafka.consumer({groupId: 'pay-subcription', allowAutoTopicCreation: true});
        await consumer.connect();
        await consumer.subscribe({topic: 'pay-topic', fromBeginning: true });
        await consumer.run({
            autoCommit: false,
            eachMessage: async ({topic, partition, message})=>{
    
                var jsonObj = JSON.parse(message.value.toString())
                var amountNew = 0;
                const invoiceId = jsonObj.invoiceId;
                const amount = jsonObj.amount;
                const date = Date.now();

                if( jsonObj.type === 'pay' ){
                    amountNew = amount * (-1)
                }else{
                    amountNew = amount;
                }

                MongoClient.connect(process.env.DB_MONGO_URI, function (err, db) {
                    if (err) throw err

                    db.db(process.env.DB_MONGO_DATABASE_TRANSACTION).collection("transaction")
                        .insertOne({id_invoice: invoiceId, amount : amount, date: date})
                            .then( async (rst)=>{
                                logProvider.info(`TRANSACTION to invoiceId: ${invoiceId} `,)
                                await consumer.commitOffsets([{topic, partition, offset: ( Number(message.offset)+1).toString() }])
                            }).catch((err)=>{
                                logProvider.error('Error executing query')
                                console.log('Error query => ',  err);
                            })
                })
            }
        })
        
    } catch (error) {
        console.log('Error kafka');
        console.log(error);
        
    }

}

startServer()
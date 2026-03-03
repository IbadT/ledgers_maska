export const rabbitmqConfig = {
  // URI для подключения к RabbitMQ
  uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',

  // Очередь для получения данных от Matematika
  queue: {
    name: 'matematika.to.maska',
    options: {
      durable: true, // сохраняется при рестарте
      deadLetterExchange: 'maska.dlx', // DLX для failed сообщений
      deadLetterRoutingKey: 'maska.failed',
    },
  },

  // Routing key для получения сообщений
  routingKey: 'statement.generate',

  // DLQ (Dead Letter Queue) для ошибок
  dlq: {
    exchange: 'maska.dlx',
    queue: 'maska.failed',
  },
};

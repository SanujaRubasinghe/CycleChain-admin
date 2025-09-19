import mqtt from 'mqtt';

let client;

export function getMqttClient({
  url = 'mqtt://localhost:1883',
  username = '',
  password = '',
  clientId = `nextjs-${Math.random().toString(16).substr(2, 8)}`,
  clean = true,
  topics = [],
  onMessage
} = {}) {
  if (!client) {
    client = mqtt.connect(url, { username, password, clientId, clean });

    client.on('connect', () => {
      console.log(`[MQTT] Connected as ${clientId}`);
      if (topics.length) {
        topics.forEach((topic) => {
          client.subscribe(topic, (err) => {
            if (!err) console.log(`[MQTT] Subscribed to ${topic}`);
            else console.error(`[MQTT] Failed to subscribe ${topic}`, err);
          });
        });
      }
    });

    client.on('message', (topic, message) => {
      if (onMessage && typeof onMessage === 'function') {
        onMessage(topic, message.toString());
      } else {
        console.log(`[MQTT][${topic}] ${message.toString()}`);
      }
    });

    client.on('error', (err) => {
      console.error('[MQTT] Error:', err);
    });

    client.on('reconnect', () => {
      console.log('[MQTT] Reconnecting...');
    });

    client.on('close', () => {
      console.log('[MQTT] Connection closed');
    });
  }

  return client;
}

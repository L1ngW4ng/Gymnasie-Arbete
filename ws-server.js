// Importera WebSocket-biblioteket
const WebSocket = require('ws');

// Skapa en WebSocket-server som lyssnar på port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket-server started on ws://localhost:8080");

// När en klient ansluter:
wss.on('connection', (ws) => {
  console.log("New connection.");

  // När servern får ett meddelande från en klient
  ws.on('message', (message) => {
    console.log(`Client: ${message}`);

    // Skicka vidare till ALLA klienter som är uppkopplade
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // När klienten kopplar från
  ws.on('close', () => {
    console.log("Client disconnected");
  });
});

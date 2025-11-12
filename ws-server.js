// ===== WebSocket-server för Render =====
const WebSocket = require("ws");

// Render tilldelar en port via miljövariabeln PORT
const PORT = process.env.PORT || 8080;

// Skapa WebSocket-servern
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket-server startad på port ${PORT}`);

// När en klient ansluter
wss.on("connection", (ws) => {
  console.log("Ny klient ansluten.");

  // När ett meddelande tas emot från en klient
  ws.on("message", (message) => {
    console.log(`Meddelande från klient: ${message}`);

    // Skicka vidare meddelandet till alla anslutna klienter
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // När klienten kopplar från
  ws.on("close", () => {
    console.log("Klient frånkopplad.");
  });
});

// server.js

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000; // Change as needed

app.set('trust proxy', true); // If behind a proxy

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to generate hash from IP
function generateHash(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex');
}

// Middleware to assign chat hash based on IP
app.use((req, res, next) => {
    // Get user's IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Generate hash
    const hash = generateHash(ip);
    req.chatHash = hash;
    next();
});

// Route to redirect to the user's chat
app.get('/', (req, res) => {
    res.redirect(`/chats/${req.chatHash}`);
});

// Route to serve the chat page
app.get('/chats/:hash', (req, res) => {
    const hash = req.params.hash;
    const chatFilePath = path.join(__dirname, 'chats', `${hash}.md`);

    // Check if chat file exists; if not, create it
    if (!fs.existsSync(chatFilePath)) {
        fs.writeFileSync(chatFilePath, `# Chat History for ${hash}\n\n`);
    }

    // Read the chat history
    fs.readFile(chatFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server Error');
        }

        // Serve the HTML with embedded chat history
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Chat</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; }
                    #chatHistory { flex: 1; padding: 20px; overflow-y: scroll; background-color: #f5f5f5; }
                    #inputArea { display: flex; padding: 10px; background-color: #ddd; }
                    #messageInput { flex: 1; padding: 10px; font-size: 16px; }
                    #sendButton { padding: 10px 20px; font-size: 16px; }
                </style>
            </head>
            <body>
                <div id="chatHistory">${data.replace(/\n/g, '<br>')}</div>
                <div id="inputArea">
                    <input type="text" id="messageInput" placeholder="Type your message here..." />
                    <button id="sendButton">Send</button>
                </div>

                <script>
                    const sendButton = document.getElementById('sendButton');
                    const messageInput = document.getElementById('messageInput');
                    const chatHistory = document.getElementById('chatHistory');

                    sendButton.addEventListener('click', () => {
                        const message = messageInput.value.trim();
                        if (message === '') return;

                        fetch('/chats/${hash}/messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Append the new message to chat history
                                chatHistory.innerHTML += '<br>' + data.message.replace(/\\n/g, '<br>');
                                chatHistory.scrollTop = chatHistory.scrollHeight;
                                messageInput.value = '';
                            } else {
                                alert('Error sending message.');
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            alert('Error sending message.');
                        });
                    });

                    // Allow pressing Enter to send message
                    messageInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            sendButton.click();
                        }
                    });
                </script>
            </body>
            </html>
        `);
    });
});

// Route to handle new messages
app.post('/chats/:hash/messages', (req, res) => {
    const hash = req.params.hash;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, error: 'No message provided.' });
    }

    const chatFilePath = path.join(__dirname, 'chats', `${hash}.md`);
    const timestamp = new Date().toISOString();
    const formattedMessage = `**${timestamp}**: ${message}\n`;

    // Append the message to the chat file
    fs.appendFile(chatFilePath, formattedMessage, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Failed to save message.' });
        }

        res.json({ success: true, message: formattedMessage });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

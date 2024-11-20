const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());

// Queue to track ongoing communications
let communicationQueue = [];

/**
 * API to handle communication between PCs
 * Params:
 * - start: Starting PC number
 * - end: Ending PC number
 * - msg: Message to send (used to calculate communication time)
 */
app.post('/api/communicate', (req, res) => {
    const { start, end, msg } = req.body;

    if (!start || !end || !msg) {
        return res.status(400).json({ message: "Please provide start, end, and msg parameters." });
    }

    // Calculate time based on message length (1 second per word)
    const time = msg.split(' ').length;

    // Get the current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = currentTime + time;

    // Check for collision
    for (const comm of communicationQueue) {
        if (
            (comm.start === start || comm.end === end || comm.start === end || comm.end === start) &&
            comm.endTime > currentTime
        ) {
            return res.status(409).json({
                message: `Collision detected! Communication between PC ${comm.start} and PC ${comm.end} is ongoing.`,
            });
        }
    }

    // Add the new communication to the queue
    communicationQueue.push({ start, end, endTime });

    // Simulate communication completion after the time
    setTimeout(() => {
        // Remove the completed communication from the queue
        communicationQueue = communicationQueue.filter((comm) => comm.endTime > Math.floor(Date.now() / 1000));
        // console.log(`Communication between PC ${start} and PC ${end} completed successfully.`);
    }, time * 1000); // Convert seconds to milliseconds for setTimeout

    return res.status(200).json({
        message: `Communication between PC ${start} and PC ${end} started successfully for ${time} seconds.`,
        details: { start, end, time },
    });
});

// Endpoint to check current communication queue
app.get('/api/status', (req, res) => {
    const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds
    const activeCommunications = communicationQueue.map((comm) => ({
        start: comm.start,
        end: comm.end,
        remainingTime: Math.max(0, comm.endTime - currentTime), // Remaining time in seconds
    }));
    res.status(200).json({ activeCommunications });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

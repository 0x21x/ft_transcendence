const express = require('express'); // eslint-disable-line
const path = require('path'); // eslint-disable-line

const app = express();


app.use('/static', express.static(path.resolve(__dirname, 'static'))); // eslint-disable-line

app.get('/languages/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path)); // eslint-disable-line
});

app.get('/components/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path)); // eslint-disable-line
});


app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html')); // eslint-disable-line
});

app.use('/static', express.static(path.resolve(__dirname, 'static'))); // eslint-disable-line

app.get('/languages/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path)); // eslint-disable-line
});

app.get('/components/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path)); // eslint-disable-line
});


app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html')); // eslint-disable-line
});

app.listen(process.env.PORT || 3000, () => { // eslint-disable-line
    console.log(`Server running on port ${process.env.PORT || 3000}`); // eslint-disable-line
});
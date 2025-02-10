const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serwuj statyczne pliki z folderu public
app.use(express.static(path.join(__dirname, 'public')));

// Dodaj ręczną obsługę dla ścieżki /pictures
app.use('/pictures', express.static(path.join(__dirname, 'public', 'pictures')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});

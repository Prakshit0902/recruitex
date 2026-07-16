import app from './app.js';

const port = process.env.PORT || 5004;
app.listen(port, () => {
    console.log('ai service is running on port ' + port);
});

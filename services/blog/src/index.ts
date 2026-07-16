import app from './app.js';

const port = process.env.PORT || 5006;
app.listen(port, () => {
    console.log('blog service is running on port ' + port);
});

import app from './app.js';
import { startSendMailConsumer } from './consumer.js';

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('utils service is running on port ' + port);
});

startSendMailConsumer();

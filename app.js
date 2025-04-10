//Here is where you'll set up your server as shown in lecture code
import dotenv from 'dotenv';
import express from 'express';
import { engine } from 'express-handlebars';
import configRoutes from './routes/index.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({extended: true}));


configRoutes(app);

app.listen(port, () => {
    console.log(`Your routes will be running on http://localhost:${port}`);
});
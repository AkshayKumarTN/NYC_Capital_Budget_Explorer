import {static as staticDir} from 'express';
import projectsRouter    from './projects.js';


const constructorMethod = (app) => {
    

    app.use('/', projectsRouter);
    app.use('/public', staticDir('public'));
    
    app.use('*', (req, res) => {
        res.status(404).render('error', { title: 'Error', error: 'Page Not Found' });
    });
}


export default constructorMethod;
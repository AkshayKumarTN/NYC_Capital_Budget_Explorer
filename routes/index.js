import {static as staticDir} from 'express';
import homeRouter from './home.js';
import projectsRouter  from './projects.js';
import userAuthenticationRouter from './userAuthentication.js';
import exportRouter from './export.js';
import userRegistrationRouter from './userRegistration.js';
import {forgotPassRouter, verifyResetRouter} from "./userVerification.js";


const constructorMethod = (app) => {
    

    app.use('/', homeRouter);
    app.use('/login', userAuthenticationRouter)
    app.use('/projects', projectsRouter);
    app.use('/export', exportRouter);
    app.use('/public', staticDir('public'));
    app.use("/signup", userRegistrationRouter);
    app.use("/forgot-password", forgotPassRouter);
    app.use("/verify-reset-code", verifyResetRouter);
    
    app.use('*', (req, res) => {
        res.status(404).render('error', { title: 'Error', error: 'Page Not Found' });
    });
}


export default constructorMethod;
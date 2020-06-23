import { RestyApp } from './app';

const app = new RestyApp({logger: console, showRoutes: true, createBodyData: true});

app.use((req, res ,next) => {
    req.body = {...req.body,"dd": "dddsdsdsdd"};
    next();
});

app.post('/:id', (req, res, next) => {
    console.log(req.body, req.query, req.params);
    // res.send.OK({"test":"test"});
    res.send.sendResponse({"ss":"ss"}, "sss", 500);
})

app.start();
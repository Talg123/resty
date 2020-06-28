# RestyTS
Lightweight small library for REST api.
Have all kind of features out of the box!

## Install

```
npm install restyts
```

## Usage
Typescript:

```javascript
import { RestyApp } from 'restyts';

const app = new RestyApp({
    logger: console,
    showRoutes: true,
    port: 8080,
    createBodyData: true,
    detectResponseTime: true
});
app.use((req: IRestyRequest, res: IRestyResponse , next: IRestyNextFunction) => {
    // Do any kind of work;
    next();
});

app.get('/:id', (req: IRestyRequest, res: IRestyResponse , next: IRestyNextFunction) => {
    console.log(req.body, req.query, req.params, req.files);
    console.log(req.currentRoute);
    res.send.OK({"isWorking": true}, "Working!");
})

app.use((req: IRestyRequest, res: IRestyResponse , next: IRestyNextFunction, err: any) => {
    // Failed, received some error;
    res.send.SERVERERROR(err);
})

app.start();

```

## Options

| Option | Explanation | default |
|---|---|---|
|logger| this property can receive any logger that have "error" and "log" functions |none |
|showRoutes| can have a list of all routes with their properties printed to the logger  | false | 
|port|the port the server will run on| 8000 |
|createBodyData | parse body data, json/multipart/urlencoded with files data | false |
|detectResponseTime| show in milliseconds how much time the whole endpoint took in the logger| false |


## detectResponseTime
that how it looks when you set it up to true:
```
[28/5/2020 08:36:47:59]: POST /:id [STARTED]
[28/5/2020 08:36:47:65]: POST /:id [ENDED] -> took: 0.006
```
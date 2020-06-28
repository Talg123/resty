import { Server, createServer } from 'http';
import { RestyRouter, RestyHelper, HttpResponse } from './classes';
import { Method, IUrlQuery, IRestyRequest, IUrlBody, IRestyHandlers, IRestyResponse, IRouteParams } from './interfaces';
import { ContentTypes } from './consts';

export class RestyApp extends RestyRouter {
    private server: Server;
    private port: number;
    private logger: any;
    private showRoutes: boolean;
    private createBodyData: boolean;
    private detectResponseTime: boolean;

     constructor(options?:{
        port?: number, 
        logger?: any, 
        showRoutes?: boolean, 
        createBodyData?: boolean,
        detectResponseTime?: boolean
    }) {
         super();
         this.port = options?.port || 8000;
         this.logger = options?.logger;
         this.showRoutes = options?.showRoutes || false;
         this.createBodyData = !!options?.createBodyData;
         this.detectResponseTime = options?.detectResponseTime || false;
         this.init();
     }

    private init(): void {
        this.server = createServer(async (request, response) => {
            const req: any = request;
            const res: any = response;
            const url = <string>request.url;
            const method: Method = <Method>request.method || 'GET';
            const endpoint = RestyHelper.getCurrentRoute(this._routes[method], url);
            if (!endpoint) {
                return response.end('No such endpoint');
            }
            req.query = this.getQueryData(url);
            req.currentRoute = {url: endpoint.route.url, properties: endpoint.route.properties};
            req.params = endpoint.params;
            if (this.createBodyData)
                req.body = await this.getBodyData(<IRestyRequest>request);
            res.send = new HttpResponse(res);
            if (this.detectResponseTime)
                this.endpointTimeDetection(method, endpoint, res);
            try {
                await this.executeCallbacks(endpoint.route.handlers, <IRestyRequest>req, <IRestyResponse>res);
            } catch (error) {
                this.logger?.error(error);
                RestyHelper.handleError(endpoint.route.handlers, req, res, error);
            }
        });
    }

    public start(): void {
        this.server.listen(this.port, () => { 
            this.logger?.log(`Server running on port: ${this.port}`);
            if (this.showRoutes)
                this.logger?.log(`Routes:`, this._routes);
        });
    }

    private getQueryData(path: string): IUrlQuery {
        const queryParams = path.split('?')
        .pop()?.split('=');
        if (!queryParams?.length) return {};
        const params: IUrlQuery = {};
        for (let i = 0; i < queryParams.length; i+=2) {
            params[queryParams[i]] = queryParams[i+1];
        }
        return params;
    }

    private async getBodyData(request: IRestyRequest): Promise<IUrlBody> {
        const ctype = <string>request.headers["content-type"]?.split(';')[0];
        if (ctype === ContentTypes["multipart/form-data"]) {
            return await RestyHelper.getMultipartData(request);
        }
        return new Promise((res) => {
            let data = '';
            request.on('data', chunk => {
                data+=chunk;
            });
            request.on('end', () => {
                res(RestyHelper.getBodyParamsByContentType(data, ctype));
            });
        })
    }

    private async executeCallbacks(
        handlers: IRestyHandlers[],
        request: IRestyRequest,
        response: IRestyResponse,
        i = 0): Promise<void> {
        if (handlers.length)
            await handlers[i](request, response, async () => { 
                try {
                    await this.executeCallbacks(handlers.slice(i + 1), request, response); 
                } catch (error) {
                    RestyHelper.handleError(handlers, request, response, error);
                }
            });
    }

    private endpointTimeDetection(method: string, route: IRouteParams, res: IRestyResponse): void {
        const startTime: bigint = process.hrtime.bigint();
        this.logger?.log(`[${RestyHelper.getCurrentDate()}]: ${method} ${route.route.url} [STARTED]`)
        res.on('close', () => {
            const endTime: bigint = process.hrtime.bigint();
            const timediff = Number((endTime - startTime)) / 1000 / 1000000;
            this.logger?.log(`[${RestyHelper.getCurrentDate()}]: ${method} ${route.route.url} [ENDED] -> took: ${timediff.toFixed(3)}s`);
        });
    }
}
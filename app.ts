import { Server, createServer } from 'http';
import { RestyRouter, RestyHelper } from './classes';
import { Method, IUrlQuery, IRestyRequest, IUrlBody, IRestyHandlers, IRestyResponse } from './interfaces';

export class RestyApp extends RestyRouter{
    private server: Server;
    private port: number;
    private logger: any;
    private showRoutes: boolean;
    private createBodyData: boolean;

     constructor(options?:{port?: number, logger?: any, showRoutes?: boolean, createBodyData?: boolean}) {
         super();
         this.port = options?.port || 8000;
         this.logger = options?.logger;
         this.showRoutes = options?.showRoutes || false;
         this.createBodyData = !!options?.createBodyData;
         this.init();
     }

    private init(): void {
        this.server = createServer(async (request, response) => {
            const req: any = request;
            const url = <string>request.url;
            const method: Method = <Method>request.method || 'GET';
            const endpoint = RestyHelper.getCurrentRoute(this._routes[method], url);
            if (!endpoint) {
                return response.end('No such endpoint');
            }
            req.query = this.getQueryData(url);
            req.params = endpoint.params;
            if (this.createBodyData)
                req.body = await this.getBodyData(<IRestyRequest>request);
            try {
                await this.executeCallbacks(endpoint.route.handlers, <IRestyRequest>req, response);
            } catch (error) {
                endpoint.route.handlers.find(route => {
                    console.log(route.toString());
                })
                this.logger?.error(error);
                response.end('ERROR');
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
                    const handler = handlers.find(route => {
                        if (route.length === 4 && route.prototype.constructor.toString().includes('err')) 
                            return true;
                    })
                    if (handler)
                        await handler(request, response, () => {}, error);
                }
            });
    }
}
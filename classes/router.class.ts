import { IRestyRouter, IRestyRoutes, IRestyHandlers, IMethodObject, Method } from "../interfaces";
import { INIT_ROUTES } from "../consts";
import { RestyHelper } from ".";
import { RestyApp } from "../app";

export class RestyRouter {

    public _routes: IRestyRoutes = JSON.parse(JSON.stringify(INIT_ROUTES));
    private middlewares: IRestyHandlers[] = []; 

    constructor() {}

    private addRoutes(route: IRestyRouter): void {
        const properties = RestyHelper.getUrlAndProperties(route.path);
        this._routes[route.method].push({
            properties,
            url: route.path,
            handlers: [...this.middlewares,...route.handlers]
        });
    }

    public get(path: string, ...handlers: IRestyHandlers[]): this {
        this.addRoutes({path, handlers, method: 'GET'});
        return this;
    }

    public post(path: string, ...handlers: IRestyHandlers[]): this {
        this.addRoutes({path, handlers, method: 'POST'});
        return this;
    }

    public put(path: string, ...handlers: IRestyHandlers[]): this {
        this.addRoutes({path, handlers, method: 'PUT'});
        return this;
    }
    
    public delete(path: string, ...handlers: IRestyHandlers[]): this {
        this.addRoutes({path, handlers, method: 'DELETE'});
        return this;
    }

    public use(path: string | IRestyHandlers, handlers?: RestyRouter | RestyApp): this {
        if (typeof path === 'function') {
            this.middlewares.push(path);
            this.addMiddlewareToRoutes(path);
        }
        if (typeof handlers === 'object') {
            const routes: IRestyRoutes = handlers._routes;
            this.addRoutesFromRouterOrApp(routes, <string>path);
        }
        return this;
    }

    private addMiddlewareToRoutes(handler: IRestyHandlers): void {
        for (let routes of Object.values(this._routes)) {
            if (!routes.length) continue;
            routes.forEach((element: IMethodObject) => {
                element.handlers.push(handler);
            });
        }
    }

    private addRoutesFromRouterOrApp(routes: IRestyRoutes, path: string): void {
        for(let [method, endpoints] of Object.entries(routes)) {
            for (let route of endpoints) {
                this.addRoutes({method: <Method>method, path: `${path}${route.url}`, handlers: route.handlers })
            }
        }
    }
}
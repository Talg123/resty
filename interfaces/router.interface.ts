import { IncomingMessage, ServerResponse } from 'http'

export interface IRestyRoutes {
    GET: IMethodObject[]
    POST: IMethodObject[]
    PUT: IMethodObject[]
    DELETE: IMethodObject[]
    PATCH: IMethodObject[]
}

export interface IRestyRouter {
    method: Method
    path: string
    handlers: IRestyHandlers[]
}

export interface IMethodObject {
    url: string
    properties: IPropertyIndex
    handlers: IRestyHandlers[]
}

export interface IPropertyIndex {
    [key: string]: number
}

export interface IUrlQuery extends IUrlParse {};

export interface IUrlBody extends IUrlParse {};

export interface IRouteParams {
    route: IMethodObject
    params: IUrlParse
}

export interface IUrlParse {
    [property: string]: string;
}

export interface IRestyHandlers {
    (request: IRestyRequest, response: IRestyResponse, next: IRestyNextFunction, err?: any): Promise<void> | void
}

export interface IRestyRequest extends IncomingMessage {
    [x: string]: any;
    [x: number]: any;
    query: IUrlQuery
    params: IUrlParse
    body: IUrlBody
}

export interface IRestyResponse extends ServerResponse {

}

export interface IRestyNextFunction {
 (): void
}

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
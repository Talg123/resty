import { IMethodObject, IUrlParse, IPropertyIndex, IRouteParams, IUrlBody } from "../interfaces";
import { ContentTypes, MULTIPART_DIVDER } from "../consts";

export class RestyHelper {
    public static getUrlAndProperties(path: string): IPropertyIndex {
        if (!path.includes(":"))
            return {};
        return path.split('/')
            .map((str, i) => {
                if (str.includes(':'))
                    return {[str.slice(1)]: i - 1};
                return {};
            }).reduce((prv, crv) => ({...prv, ...crv}),{});
    }

    public static getCurrentRoute(routes: IMethodObject[], path: string): IRouteParams | undefined {
        const pathArray = path.split('?')[0].split('/');
        const route = routes.find(route => {
            const routePathArray = route.url.split('/');
            if(pathArray.length !== routePathArray.length)
                return;
            return routePathArray
                .every((routePath, index) => routePath.includes(':') || routePath === pathArray[index]);
        });
        if (!route) {
            return;
        }
        return {params: this.getRouteParamsData(route, path), route};
        
    }

    private static getRouteParamsData(route: IMethodObject, path: string): IUrlParse {
        if (!Object.keys(route.properties).length) return {};
        const pathArray = path.split('/'); 
        return Object.keys(route.properties)
                .reduce((prv, crv) => ({...prv, [crv]: pathArray[route.properties[crv]]}),{});
    }

    public static getBodyParamsByContentType(data: string, ctype: string): IUrlBody {
        switch(ctype) {
            case ContentTypes["application/json"]: 
                return JSON.parse(data);
            case ContentTypes["application/x-www-form-urlencoded"]:
                const parsedData = data.split('&');
                return parsedData.reduce((prv, crv) => {
                    const currentValue = crv.split('=');
                    return {...prv, [currentValue[0]]: currentValue[1]};
                },{});
            case ContentTypes["multipart/form-data"]:
                const bodyData: IUrlBody = {};
                const parsedMultipart = data.split('\r\n');
                for (let i = 0; i < parsedMultipart.length; i++) {
                    if(parsedMultipart[i].includes(MULTIPART_DIVDER)) {
                        const nameParsed = <string>parsedMultipart[i].split(MULTIPART_DIVDER).pop();
                        try {
                            bodyData[nameParsed.slice(0, -1)] = JSON.parse(parsedMultipart[i + 2]);
                        } catch (error) {
                            bodyData[nameParsed.slice(0, -1)] = parsedMultipart[i + 2];
                        }
                    }
                }
                return bodyData;
            default: 
                return {};
        }
    }
}
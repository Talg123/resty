import { IRestyRoutes } from "../interfaces";

export const INIT_ROUTES: IRestyRoutes = {
    DELETE: [],
    GET: [],
    PATCH: [],
    POST: [],
    PUT: []
}

export const ContentTypes = {
    'application/json': 'application/json',
    'multipart/form-data': 'multipart/form-data',
    'application/x-www-form-urlencoded': 'application/x-www-form-urlencoded',
}

export const MULTIPART_DIVDER = 'Content-Disposition: form-data; name="';
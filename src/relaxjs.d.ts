/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../typings/q/Q.d.ts" />
/// <reference path="../typings/mime/mime.d.ts" />
/// <reference path="../typings/xml2js/xml2js.d.ts" />


declare module "relaxjs" {
  
	import http = require("http");
	import Q = require('q');

	export function relaxjs(): void;

  export module routing {

  	export class Route {
  	    verb: string;
  	    static: boolean;
  	    pathname: string;
  	    path: string[];
  	    query: any;
  	    outFormat: string;
  	    inFormat: string;
  	    cookies: string[];
  	    request: http.ServerRequest;
  	    response: http.ServerResponse;
  	    headers: ResponseHeaders;
  	    constructor(uri?: string, outFormat?: string, inFormat?: string);
  	    stepThrough(stpes: number): Route;
  	    getNextStep(): string;
  	    addResponseHeaders(h: ResponseHeaders): void;
  	}
  	export function fromRequestResponse(request: http.ServerRequest, response: http.ServerResponse): Route;

  }

	export interface ResourceMap {
	    [name: string]: Container[];
	}
	export interface ResponseHeaders {
	    [headerName: string]: string;
	}

	export interface ResourceResponse {
	    result: string;
	    data?: any;
	    httpCode?: number;
	    location?: string;
	    cookiesData?: string[];
	    headers?: ResponseHeaders;
	}
	export interface FilterResultCB {
	    (err?: RxError, data?: any): void;
	}
	export interface RequestFilter {
	    (route: routing.Route, body: any, complete: FilterResultCB): any;
	}
	export interface FiltersData {
	    [name: string]: any;
	}
	export interface HttpPlayer {
	    name: string;
	    urlName: string;
	    head(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    get(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    post(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    put(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    delete(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    patch(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	}
	export interface Resource {
	    name: string;
	    key?: string;
	    view?: string;
	    layout?: string;
	    data?: any;
	    resources?: Resource[];
	    urlParameters?: string[];
	    outFormat?: string;
	    headers?: ResponseHeaders;
	    onHead?: (query: any, respond: Response) => void;
	    onGet?: (query: any, respond: Response) => void;
	    onPost?: (query: any, body: any, respond: Response) => void;
	    onPut?: (query: any, body: any, respond: Response) => void;
	    onDelete?: (query: any, respond: Response) => void;
	    onPatch?: (query: any, body: any, respond: Response) => void;
	}
	export class Error {
	    name: string;
	    message: string;
	    stack: string;
	    constructor(message?: string);
	}
	export class RxError extends Error {
	    httpCode: number;
	    extra: string;
	    name: string;
	    message: string;
	    stack: string;
	    constructor(message: string, name?: string, code?: number, extra?: string);
	    getHttpCode(): number;
	    getExtra(): string;
	    toString(): string;
	}
	export class Container {
	    protected _name: string;
	    private _parent;
	    protected _cookiesData: string[];
	    protected _cookies: string[];
	    protected _resources: ResourceMap;
	    protected _headers: ResponseHeaders;
	    data: any;
	    constructor(parent?: Container);
	    parent: Container;
	    name: string;
	    urlName: string;
	    setName(newName: string): void;
	    headers: ResponseHeaders;
	    setCookie(cookie: string): void;
	    getCookies(): string[];
	    cookiesData: string[];
	    resetOutgoingCookies(): void;
	    remove(child: ResourcePlayer): boolean;
	    protected _getStepDirection(route: routing.Route): Direction;
	    protected _getDirection(route: routing.Route, verb?: string): Direction;
	    getResource(pathname: string): Container;
	    add(newRes: Resource): void;
	    getFirstMatching(typeName: string): Container;
	    getChild(name: string, idx?: number): Container;
	    childTypeCount(typeName: string): number;
	    childrenCount(): number;
	}
	export class Response {
	    private _onOk;
	    private _onFail;
	    private _resource;
	    constructor(resource: Container);
	    onOk(cb: (resp: ResourceResponse) => void): void;
	    onFail(cb: (err: RxError) => void): void;
	    ok(): void;
	    redirect(where: string): void;
	    fail(err: RxError): void;
	}
	export class Direction {
	    resource: Container;
	    route: routing.Route;
	    verb: string;
	}
	export class Embodiment {
	    httpCode: number;
	    location: string;
	    mimeType: string;
	    body: Buffer;
	    cookiesData: string[];
	    additionalHeaders: ResponseHeaders;
	    constructor(mimeType: string, code?: number, body?: Buffer);
	    addSetCookie(cookie: string): void;
	    setAdditionalHeaders(headers: any): void;
	    serve(response: http.ServerResponse): void;
	    bodyAsString(): string;
	    bodyAsJason(): any;
	}
	export class Site extends Container implements HttpPlayer {
	    private static _instance;
	    private _version;
	    private _siteName;
	    private _home;
	    private _tempDir;
	    private _pathCache;
	    private _filters;
	    enableFilters: boolean;
	    constructor(siteName: string, parent?: Container);
	    static $(name?: string): Site;
	    protected _getDirection(route: routing.Route, verb?: string): Direction;
	    name: string;
	    version: string;
	    siteName: string;
	    setPathCache(path: string, shortcut: {
	        resource: ResourcePlayer;
	        path: string[];
	    }): void;
	    private _outputError(response, error, format);
	    addRequestFilter(name: string, filterFunction: RequestFilter): void;
	    deleteRequestFilter(name: string): boolean;
	    deleteAllRequestFilters(): boolean;
	    private _checkFilters(route, body, response);
	    serve(): http.Server;
	    setHome(path: string): void;
	    setTempDirectory(path: string): void;
	    head(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    get(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    post(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    patch(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    put(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    delete(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	}
	export class ResourcePlayer extends Container implements HttpPlayer {
	    static version: any;
	    private _site;
	    private _template;
	    private _layout;
	    private _paramterNames;
	    private _outFormat;
	    private _onGet;
	    private _onPost;
	    private _onPatch;
	    private _onDelete;
	    private _onPut;
	    private _parameters;
	    filtersData: FiltersData;
	    constructor(res: Resource, parent: Container);
	    setOutputFormat(fmt: string): void;
	    outFormat: string;
	    resources: ResourceMap;
	    private _readParameters(path, generateError?);
	    private _updateData(newData);
	    private _deliverReply(later, resResponse, outFormat, deliverAnyFormat?);
	    head(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    get(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    delete(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    post(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    patch(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    put(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	}
	export function site(name?: string): Site;

}

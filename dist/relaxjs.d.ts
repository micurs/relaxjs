/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/lodash/lodash.d.ts" />
/// <reference path="../typings/mime/mime.d.ts" />
/// <reference path="../typings/xml2js/xml2js.d.ts" />


declare module "relaxjs" {
  
	import http = require("http");
	import fs = require("fs");
	// import Q = require('q');
	import relaxjs = require('relaxjs');

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
          headers: relaxjs.ResponseHeaders;
          constructor(uri?: string, outFormat?: string, inFormat?: string);
          stepThrough(stpes: number): Route;
          getNextStep(): string;
          addResponseHeaders(h: relaxjs.ResponseHeaders): void;
      }
      export function fromRequestResponse(request: http.ServerRequest, response: http.ServerResponse): Route;

  }

	export function relaxjs(): void;
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
      /*
	    head(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    get(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    post(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    put(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    delete(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    patch(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    */
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
	/**
	 * Every resource is converted to their embodiment before is sent back as a HTTP Response
	 */
	export class Embodiment {
	    httpCode: number;
	    location: string;
	    mimeType: string;
	    bodyData: Buffer;
	    bodyStream: fs.ReadStream;
	    cookiesData: string[];
	    additionalHeaders: ResponseHeaders;
	    /**
	     * Builds a new Embodiment object that can be served back as a response to a HTTP request.
	     */
	    constructor(mimeType: string, code?: number, data?: Buffer | fs.ReadStream);
	    /**
	     * Add a serialized cookie (toString()) to be returned as part of this embodiment
	     */
	    addSetCookie(cookie: string): void;
	    /**
	     * Add headers to this embodiment
	     */
	    setAdditionalHeaders(headers: any): void;
	    /**
	     * Serve this emnbodiment through the given ServerResponse
	     */
	    serve(response: http.ServerResponse): void;
	    /**
	     * utility: return the body of this embodiment as utf-8 encoded string
	     */
	    bodyAsString(): string;
	    /**
	     * utility: return the bosy of this embodiment as a JSON object
	     */
	    bodyAsJason(): any;
	}
	/**
	 * Root object for the application is the Site.
	 * The site is in itself a Resource and is accessed via the root / in a url.
	*/
	export class Site extends Container implements HttpPlayer {
	    private static _instance;
	    private _version;
	    private _siteName;
	    private _home;
	    private _tempDir;
	    private _pathCache;
	    private _errorView;
	    private _filters;
	    enableFilters: boolean;
	    constructor(siteName: string, parent?: Container);
	    static $(name?: string): Site;
	    protected _getDirection(route: routing.Route, verb?: string): Direction;
	    /**
	     * name of this resource (it should be 'site')
	     */
	    name: string;
	    /**
	     * relaxjs version
	     */
	    version: string;
	    /**
	     * name of this site
	     */
	    siteName: string;
	    /**
	     * Setup a shortcut to a specific resource. This function is used internally.
	     */
	    setPathCache(path: string, shortcut: {
	        resource: ResourcePlayer;
	        path: string[];
	    }): void;
	    /**
	     * Override the Error output using a custom view.
	     */
	    setErrorView(name: string): void;
	    private _outputError(response, error, format);
	    /**
	     * Add a request filter. The given function will be called on every request
	     * before reaching any resource. All request filters must succeed for the
	     * request to procees towards a resource.
	     */
	    addRequestFilter(name: string, filterFunction: RequestFilter): void;
	    /**
	     * Remove an existing request filter.
	     */
	    deleteRequestFilter(name: string): boolean;
	    /**
	     * Delete ALL request filters associated with this site
	     */
	    deleteAllRequestFilters(): boolean;
	    private _checkFilters(route, body, response);
	    /**
	     * Serve this site. This call creates a Server for the site and manage all the requests
	     * by routing them to the appropriate resources.
	    */
	    serve(): http.Server;
	    /**
	     * Set the Home resource for this site by giving its path
	     */
	    setHome(path: string): void;
	    /**
	     * Set the given path as location for temporary files produced by POST and PUT operations
	     */
	    setTempDirectory(path: string): void;
	    /**
	     * HTTP verb HEAD response functiion. Analyze the give route and redirect the call to the appropriate
	     * child resource if available.
	     */
	    // head(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HTTP verb GET response functiion. Analyze the give route and redirect the call to the appropriate
	     * child resource if available.
	     */
	    // get(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HTTP verb POST response functiion. Analyze the give route and redirect the call to the appropriate
	     * child resource if available.
	     */
	    // post(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HTTP verb PATCH response functiion. Analyze the give route and redirect the call to the appropriate
	     * child resource if available.
	     */
	    // patch(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HTTP verb PUT response functiion. Analyze the give route and redirect the call to the appropriate
	     * child resource if available.
	     */
	    // put(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HTTP verb DELETE response functiion. Analyze the give route and redirect the call to the appropriate
	     * child resource if available.
	     */
	    // delete(route: routing.Route, body: any, filterData?: FiltersData): Q.Promise<Embodiment>;
	}
	/**
	 * ResourcePlayer absorbs a user defined resource and execute the HTTP requests.
	 * The player dispatch requests to the childres resources or invoke user defined
	 * response function for each verb.
	*/
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
	    /**
	     * Build a active resource by providing a Resource data object
	     */
	    constructor(res: Resource, parent: Container);
	    /**
	     *
	     */
	    setOutputFormat(fmt: string): void;
	    outFormat: string;
	    resources: ResourceMap;
	    private _readParameters(path, generateError?);
	    private _updateData(newData);
	    private _deliverReply(later, resResponse, outFormat, deliverAnyFormat?);
	    /**
	     * Resource Player HEAD. Get the response as for a GET request, but without the response body.
	    */
	    // head(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HttpPlayer GET. Analyze the route and redirect the call to a child resource or
	     * will call the onGet() for the this resource.
	    */
	    // get(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HttpPlayer DELETE. Analyze the route and redirect the call to a child resource or
	     * will call the onGet() for the this resource.
	    */
	    // delete(route: routing.Route, filtersData: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HttpPlayer POS. Analyze the route and redirect the call to a child resource or
	     * will call the onPost() for the this resource.
	     * The default action is to create a new subordinate of the web resource identified by the URI.
	     * The body sent to a post must contain the resource name to be created.
	    */
	    //post(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    /**
	     * HttpPlayer POS. Analyze the route and redirect the call to a child resource or
	     * will call the onPost() for the this resource.
	     * The default action is to apply partial modifications to a resource (as identified in the URI).
	    */
	    // patch(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	    // put(route: routing.Route, body: any, filtersData: FiltersData): Q.Promise<Embodiment>;
	}
	export function site(name?: string): Site;

}

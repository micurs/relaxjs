// Generated by dts-bundle v0.4.3
// Dependencies for this module:
//   ../typings/globals/node/index.d.ts

declare module 'relaxjs' {
 import * as http from 'http';
 import * as rxjsFilters from 'relaxjs/filters';
 export const filters: typeof rxjsFilters;
 /**
  * print out the version
  *
  * @export
  */
 export function relaxjs(): void;
 /**
  * Response headers as strings indexed by the header name
  */
 export interface ResponseHeaders {
   [headerName: string]: string;
 }
 /**
  * Data produced from the filters functions are available using the filter name as index
  */
 export interface FiltersData {
   [name: string]: any;
 }
 /**
  * The resource HttpPlayer implement the resource runtime capabilities.
  * Classes implementing HttpPlayers must implement HTTP verb functions defined here.
  * @export
  * @interface HttpPlayer
  */
 export interface HttpPlayer {
   name: string;
   urlName: string;
 }
 /**
  * This is the definition for a Resource as passed to a Site object.
  *
  * @export
  * @interface Resource
  */
 export interface Resource {
   /**
    * (description)
    *
    * @type {string}
    */
   name: string;
   /**
    * (description)
    *
    * @type {string}
    */
   key?: string;
   /**
    * (description)
    *
    * @type {string}
    */
   view?: string;
   /**
    * (description)
    *
    * @type {string}
    */
   layout?: string;
   /**
    * (description)
    *
    * @type {*}
    */
   data?: any;
   /**
    * (description)
    *
    * @type {Resource[]}
    */
   resources?: Resource[];
   /**
    * (description)
    *
    * @type {string[]}
    */
   urlParameters?: string[];
   /**
    * the mime type of the response generated from this resource
    *
    * @type {string}
    */
   outFormat?: string;
   /**
    * Additional headers to generate in the responses from this resource
    *
    * @type {ResponseHeaders}
    */
   headers?: ResponseHeaders;
   /**
    * Function to call upon receiving of a GET request
    *
    * @type {( query : any, respond : Response ) => void}
    */
   onGet?: (query: any, respond: Response) => void;
   /**
    * Function to call upon receiving of a POST request
    *
    * @type {( query : any, body : any, respond : Response) => void}
    */
   onPost?: (query: any, body: any, respond: Response) => void;
   /**
    * Function to call upon receiving of a DELETE request
    *
    * @type {( query : any, respond : Response ) => void}
    */
   onDelete?: (query: any, respond: Response) => void;
   /**
    * Function to call upon receiving of a PATCH request
    *
    * @type {( query : any, body : any, respond : Response) => void}
    */
   onPatch?: (query: any, body: any, respond: Response) => void;
 }
 /**
  * Extended Error class for Relax.js
  */
 export class RxError extends Error {
   /**
    * HTTP error code
    *
    * @type {number}
    */
   httpCode: number;
   /**
    * Extra information about the errror
    *
    * @type {string}
    */
   extra: string;
   /**
    * Error name
    *
    * @type {string}
    */
   name: string;
   /**
    * Error message
    *
    * @type {string}
    */
   message: string;
   /**
    * Call stack at the moment the error was generated
    *
    * @type {string}
    */
   stack: string;
   /**
    * Creates an instance of RxError.
    *
    * @param {string} message (description)
    * @param {string} [name] (description)
    * @param {number} [code] (description)
    * @param {string} [extra] (description)
    */
   constructor(message: string, name?: string, code?: number, extra?: string);
   /**
    * Return the http error code
    *
    * @returns {number} (description)
    */
   getHttpCode(): number;
   getExtra(): string;
   /**
    * Serialize the error to a string.
    *
    * @returns {string} (description)
    */
   toString(): string;
 }
 /**
  * A container of resources. This class offer helper functions to add and retrieve resources
  * child resources
  */
 export class Container {
   /**
    * (description)
    *
    * @readonly
    * @type {Container}
    */
   parent: Container;
   /**
    * (description)
    *
    * @readonly
    * @type {string}
    */
   name: string;
   /**
    * (description)
    *
    * @readonly
    * @type {string}
    */
   urlName: string;
   /**
    * Add the given headers to the one already set
    */
   headers: ResponseHeaders;
   /**
    * Cookies data as a string array
    *
    * @readonly
    * @type {string[]}
    */
   cookiesData: string[];
   /**
    * Creates an instance of Container.
    *
    * @param {Container} [parent] (description)
    */
   constructor(parent?: Container);
   /**
    * (description)
    *
    * @param {string} newName (description)
    */
   setName(newName: string): void;
   /**
    * (description)
    *
    * @param {string} cookie (description)
    */
   setCookie(cookie: string): void;
   /**
    * (description)
    *
    * @returns {string[]} (description)
    */
   getCookies(): string[];
   /**
    * Return the resource matching the given path.
    */
   getResource(pathname: string): Container;
   /**
    * Add a resource of the given type as child
    *
    * @param {Resource} newRes (description)
    */
   add(newRes: Resource): void;
   /**
    * Find the first resource of the given type
    *
    * @param {string} typeName (description)
    * @returns {Container} (description)
    */
   getFirstMatching(typeName: string): Container;
   /**
    * Retruieve the child of a resource with the given name
    *
    * @param {string} name (description)
    * @param {number} [idx=0] (description)
    * @returns {Container} (description)
    */
   getChild(name: string, idx?: number): Container;
   /**
    * Return the number of children resources of the given type.
    *
    * @param {string} typeName (description)
    * @returns {number} (description)
    */
   childTypeCount(typeName: string): number;
   /**
    * Return the total number of children resources for this node.
    *
    * @returns {number} count result as number
    */
   childrenCount(): number;
 }
 /**
  * Helper class used to deliver a response from a HTTP verb function call.
  * An instance of this class is passed as argument to all verb functions
  */
 export class Response {
   /**
    * To return a resource without error invoke this function on the response object receive in the request call
    */
   ok(): void;
   /**
    * Call this function to redirect the caller to a different URL
    * Code 303
    *
    * @param {string} where (description)
    */
   redirect(where: string): void;
   /**
    * Call this function to return an error to the caller
    *
    * @param {RxError} err (description)
    */
   fail(err: RxError): void;
 }
 /**
  * Root object for the application is the Site.
  * The site is in itself a Resource and is accessed via the root / in a url.
  */
 export class Site extends Container implements HttpPlayer {
   /**
    * (description)
    *
    * @type {boolean}
    */
   enableFilters: boolean;
   /**
    * (description)
    *
    * @static
    * @param {string} [name] (description)
    * @returns {Site} (description)
    */
   static $(name?: string): Site;
   /**
    * name of this resource (it should be 'site')
    *
    * @readonly
    * @type {string}
    */
   name: string;
   /**
    * relaxjs version
    *
    * @readonly
    * @type {string}
    */
   version: string;
   /**
    * name of this site
    *
    * @readonly
    * @type {string}
    */
   siteName: string;
   /**
    * Creates an instance of Site.
    *
    * @param {string} siteName (description)
    * @param {Container} [parent] (description)
    */
   constructor(siteName: string, parent?: Container);
   /**
    * Enable positive responses to OPTIONS Preflighted requests in CORS
    */
   allowCORS(flag: boolean): void;
   /**
    * Override the Error output using a custom view.
    *
    * @param {string} name (description)
    */
   setErrorView(name: string): void;
   /**
    * Add a request filter. The given function will be called on every request
    * before reaching any resource. All request filters must succeed for the
    * request to procees towards a resource.
    *
    * @param {string} name (description)
    * @param {RequestFilter} filterFunction (description)
    */
   addRequestFilter(name: string, filterFunction: rxjsFilters.RequestFilterCall): void;
   /**
    * Remove an existing request filter.
    *
    * @param {string} name (description)
    * @returns {boolean} (description)
    */
   deleteRequestFilter(name: string): boolean;
   /**
    * Delete ALL request filters associated with this site
    *
    * @returns {boolean} (description)
    */
   deleteAllRequestFilters(): boolean;
   /**
    * Serve this site. This call creates a Server for the site and manage all the requests
    * by routing them to the appropriate resources.
    *
    * @returns {http.Server} (description)
    */
   serve(): http.Server;
   /**
    * Set the Home resource for this site by giving its path
    *
    * @param {string} path (description)
    */
   setHome(path: string): void;
   /**
    * Set the given path as location for temporary files produced by POST and PUT operations
    *
    * @param {string} path (description)
    */
   setTempDirectory(path: string): void;
 }
 /**
  * (description)
  *
  * @export
  * @param {string} [name] (description)
  * @returns {Site} (description)
  */
 export function site(name?: string): Site;
}

declare module 'relaxjs/filters' {
 import * as http from 'http';
 import * as routing from 'relaxjs/routing';
 /**
  * Generic middleware function call
  *
  * @interface MiddlewareCall
  */
 export interface MiddlewareCall {
   (request: http.ServerRequest, response: http.ServerResponse, next: () => void): void;
 }
 /**
  * Filter complete function definition.
  * This is called to complete a filter with error or data to pass to a resource
  *
  * @export
  * @interface FilterResultCB
  */
 export interface FilterResultCB {
   (err?: Error, data?: any): void;
 }
 /**
  * A filter function is called on every request and can stop the dispatch of the request to the
  * target resource. The call is asyncronous. When complete it must call the complete function
  * passed as third argument.
  * Important Notes:
  * Filters are called by the Site before attempting to route any request to a resource.
  * Filters can return data to the resource using the filterData member.
  * Filters must all succeed in order for the request to reach the resource
  * Filters are not called in any predefined order (there cannot be dependencies from each other filter)
  */
 export interface RequestFilter {
   filter(route: routing.Route, body: any, complete: FilterResultCB): void;
 }
 export interface RequestFilterCall {
   (route: routing.Route, body: any, complete: FilterResultCB): void;
 }
 /**
  * A relaxjs filter class that process express style middleware functions
  *
  * @export
  * @class middleware
  */
 export class MiddlewareFilter implements RequestFilter {
   /**
    * Creates an instance of MiddlewareFilter.
    *
    * @param {...MiddlewareCall[]} ms (description)
    */
   constructor(...ms: MiddlewareCall[]);
   /**
    * Add one or more middleware function to the filter
    *
    * @param {...mwareFunc[]} ms (description)
    */
   use(...ms: MiddlewareCall[]): void;
   /**
    * Filter function to be passes to a site using addRequestFilter.
    * Example site.addRequestFilter( mw.filter.bind(mw) )
    *
    * @param {routing.Route} route (description)
    * @param {*} body (description)
    * @param {FilterResultCB} complete (description)
    */
   filter(route: routing.Route, body: any, complete: FilterResultCB): void;
 }
}

declare module 'relaxjs/routing' {
 import * as http from 'http';
 /**
  * Route: helper class to routing requests to the correct resource
  * @export
  * @class Route
  */
 export class Route {
   /**
    * Request HTTP verb
    *
    * @type {string}
    */
   verb: string;
   /**
    * if true it means this route is mapping to a file
    *
    * @type {boolean}
    */
   static: boolean;
   /**
    * path of the request as received
    *
    * @type {string}
    */
   pathname: string;
   /**
    * Path of the request split in its components
    *
    * @type {string[]}
    */
   path: string[];
   /**
    * Query data associated with this request.
    * It is a collection of name: value
    *
    * @type {*}
    */
   query: any;
   /**
    * Mime type of the expeted response
    *
    * @type {string}
    */
   outFormat: string;
   /**
    * mime type of the incomed request
    *
    * @type {string}
    */
   inFormat: string;
   /**
    * Cookies associated with the request
    *
    * @type {string[]}
    */
   cookies: string[];
   /**
    * Original HTTP Request
    *
    * @type {http.ServerRequest}
    */
   request: http.ServerRequest;
   /**
    * Original HTTP response object
    *
    * @type {http.ServerResponse}
    */
   response: http.ServerResponse;
 }
}


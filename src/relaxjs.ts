/*
 * Relax.js version 0.2.0
 * by Michele Ursino June - 2015
 * -------------------------------------------------------
*/

/// <reference path='../typings/index.d.ts' />

import * as http from 'http';
// import * as fs from 'fs';
import { EventEmitter } from 'events';
import * as stream from 'stream';
import * as Q from 'q';
import * as _ from 'lodash';
import * as xml2js from 'xml2js';

// sub-modules importing
import * as internals from './internals';
import * as routing from './routing';
import * as rxjsFilters from './filters';

// exports.routing = routing;
// exports.internals = internals;
// exports.filters = filters;

export const filters = rxjsFilters;

/* tslint:disable */
const packageinfo : any = require( __dirname + '/../package.json');
const version : string = packageinfo.version;
/* tslint:enable */

/**
 * print out the version
 *
 * @export
 */
export function relaxjs() : void {
  console.log(`relaxjs version ${version}`);
}

/**
 * A Resource map is a collection of Resource arrays.
 * Each arrray contain resource of the same type.
 * @internal
*/
export interface ResourceMap {
  [name: string]: Container [];
}

/**
 * Response headers as strings indexed by the header name
 */
export interface ResponseHeaders {
  [ headerName : string ] : string;
}

/**
 * Response definition: every resource generate an instance of ResourceResponse.
 * This is generated automatically from a resource by calling a response function:
 * ok(), fail() or redirect() from a resource response function.
 * @internal
 */
export interface ResourceResponse {
  result: string;
  data?: any;
  httpCode?: number;
  location?: string;
  cookiesData?: string[];
  headers?: ResponseHeaders;
}

/**
 * Definition for Collection of filters
 * @internal
 */
interface RequestFilterDict {
  [ name: string ]: rxjsFilters.RequestFilterCall ;
}

/**
 * Data produced from the filters functions are available using the filter name as index
 */
export interface FiltersData {
  [ name: string ]: any;
}


/**
 * The resource HttpPlayer implement the resource runtime capabilities.
 * Classes implementing HttpPlayers must implement HTTP verb functions defined here.
 * @export
 * @interface HttpPlayer
 */
export interface HttpPlayer {
  name : string;
  urlName : string;

  /**
   * Asks for the response identical to the one that would correspond to a GET request, but without the response body.
   * @internal
   * @param {routing.Route} route (description)
   * @param {FiltersData} filtersData (description)
   * @returns {Q.Promise<Embodiment>} (description)
   */
  head( route: routing.Route, filtersData : FiltersData) : Q.Promise<Embodiment> ;

  //
  /**
   * A GET requests returns a representation of the specified resource.
   * @internal
   * @param {routing.Route} route (description)
   * @param {FiltersData} filtersData (description)
   * @returns {Q.Promise<Embodiment>} (description)
   */
  get( route: routing.Route, filtersData : FiltersData ) : Q.Promise<Embodiment> ;

  /**
   * A POST requests add new subordinate of the web resource identified by the URI.
   * @internal
   * @param {routing.Route} route (description)
   * @param {*} body (description)
   * @param {FiltersData} filtersData (description)
   * @returns {Q.Promise<Embodiment>} (description)
   */
  post( route: routing.Route, body : any, filtersData : FiltersData ) : Q.Promise<Embodiment> ;

  /**
   * A PUT requests that the enclosed entity be stored under the supplied URI.
   * If the URI refers to an already existing resource, it is modified otherwise the resource can be created.
   * @internal
   * @param {routing.Route} route (description)
   * @param {*} body (description)
   * @param {FiltersData} filtersData (description)
   * @returns {Q.Promise<Embodiment>} (description)
   */
  put( route: routing.Route, body : any, filtersData : FiltersData ) : Q.Promise<Embodiment> ;

  //
  /**
   * A Delete request deletes the specified resource.
   * @internal
   * @param {routing.Route} route (description)
   * @param {FiltersData} filtersData (description)
   * @returns {Q.Promise<Embodiment>} (description)
   */
  delete( route: routing.Route, filtersData : FiltersData ) : Q.Promise<Embodiment> ;

  /**
   * A PATCH request applies partial modifications to a resource.
   * @internal
   * @param {routing.Route} route (description)
   * @param {*} body (description)
   * @param {FiltersData} filtersData (description)
   * @returns {Q.Promise<Embodiment>} (description)
   */
  patch( route: routing.Route, body : any, filtersData : FiltersData ) : Q.Promise<Embodiment> ;
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
  name : string;
  /**
   * (description)
   *
   * @type {string}
   */
  key? : string;
  /**
   * (description)
   *
   * @type {string}
   */
  view? : string;
  /**
   * (description)
   *
   * @type {string}
   */
  layout? : string;
  /**
   * (description)
   *
   * @type {*}
   */
  data? : any;
  /**
   * (description)
   *
   * @type {Resource[]}
   */
  resources? : Resource[];
  /**
   * (description)
   *
   * @type {string[]}
   */
  urlParameters? : string[];
  /**
   * the mime type of the response generated from this resource
   *
   * @type {string}
   */
  outFormat? : string;
  /**
   * Additional headers to generate in the responses from this resource
   *
   * @type {ResponseHeaders}
   */
  headers? : ResponseHeaders;
  /**
   * not yet available
   * @internal
   * @type {( query : any, respond : Response ) => void}
   */
  onHead? : ( query : any, respond : Response ) => void;
  /**
   * Function to call upon receiving of a GET request
   *
   * @type {( query : any, respond : Response ) => void}
   */
  onGet? : ( query : any, respond : Response ) => void;
  /**
   * Function to call upon receiving of a POST request
   *
   * @type {( query : any, body : any, respond : Response) => void}
   */
  onPost? : ( query : any, body : any, respond : Response) => void;
  /**
   * Function to call upon receiving of a PUT request
   * not yet implemented
   * @internal
   * @type {( query : any, body : any, respond : Response) => void}
   */
  onPut? : ( query : any, body : any, respond : Response) => void;
  /**
   * Function to call upon receiving of a DELETE request
   *
   * @type {( query : any, respond : Response ) => void}
   */
  onDelete? : ( query : any, respond : Response ) => void;
  /**
   * Function to call upon receiving of a PATCH request
   *
   * @type {( query : any, body : any, respond : Response) => void}
   */
  onPatch? : ( query : any, body : any, respond : Response) => void;
}

/**
 * Standard node Error: type declaration
 * @internal
*/
export declare class Error {
    public name : string;
    public message : string;
    public stack : string;
    constructor(message? : string);
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
  public httpCode : number;
  /**
   * Extra information about the errror
   *
   * @type {string}
   */
  public extra : string;
  /**
   * Error name
   *
   * @type {string}
   */
  public name : string;
  /**
   * Error message
   *
   * @type {string}
   */
  public message : string;
  /**
   * Call stack at the moment the error was generated
   *
   * @type {string}
   */
  public stack : string;

  /**
   * Creates an instance of RxError.
   *
   * @param {string} message (description)
   * @param {string} [name] (description)
   * @param {number} [code] (description)
   * @param {string} [extra] (description)
   */
  constructor( message : string, name? : string, code? : number, extra? : string ) {
    super();
    const tmp = new Error(); // We use this to generate the stack info to assign to this error
    this.message = message;
    this.name = name;
    this.httpCode = code ? code : 500;
    this.stack = tmp.stack;
    this.extra = extra;
  }
  /**
   * Return the http error code
   *
   * @returns {number} (description)
   */
  getHttpCode() : number {
    return this.httpCode;
  }
  getExtra() : string {
    return this.extra ? this.extra : '' ;
  }

  /**
   * Serialize the error to a string.
   *
   * @returns {string} (description)
   */
  toString() : string {
    return internals.format('RxError {0}: {1}\n{2}\nStack:\n{3}' , this.httpCode, this.name, this.message, this.stack);
  }
}


/**
 * A container of resources. This class offer helper functions to add and retrieve resources
 * child resources
*/
export class Container {

  /** @internal */
  public data : any = {};
  /** @internal */
  private _parent : Container;
  /** @internal */
  protected _name : string = '';
  /** @internal */
  protected _cookiesData : string[] = [];   // Outgoing cookies to be set
  /** @internal */
  protected _cookies : string[] = [];        // Received cookies unparsed
  /** @internal */
  protected _resources : ResourceMap = {};
  /** @internal */
  protected _headers : ResponseHeaders = {};

  /**
   * (description)
   *
   * @readonly
   * @type {Container}
   */
  get parent() : Container {
    return this._parent;
  }
  /**
   * (description)
   *
   * @readonly
   * @type {string}
   */
  get name() : string {
    return this._name;
  }
  /**
   * (description)
   *
   * @readonly
   * @type {string}
   */
  get urlName() : string {
    return internals.slugify(this.name);
  }

  /**
   * Add the given headers to the one already set
   */
  set headers( h: ResponseHeaders ) {
    const self = this;
    _.forOwn( h, ( value : string, key : string ) => self._headers[key] = value );
  }

  /**
   * get the headers
   *
   * @type {ResponseHeaders}
   */
  get headers() : ResponseHeaders {
    return this._headers;
  }

  /**
   * Cookies data as a string array
   *
   * @readonly
   * @type {string[]}
   */
  get cookiesData() : string[] {
    return this._cookiesData;
  }

  /**
   * Creates an instance of Container.
   *
   * @param {Container} [parent] (description)
   */
  constructor( parent? : Container ) {
    this._parent = parent;
  }

  /**
   * (description)
   *
   * @param {string} newName (description)
   */
  setName( newName: string ): void {
    this._name = newName;
  }

  /**
   * Detach this resource from its parent
   * @internal
   */
  detachFromParent(): void {
    this._parent = undefined;
  }

  /**
   * (description)
   *
   * @param {string} cookie (description)
   */
  setCookie( cookie: string ) : void {
    this._cookiesData.push(cookie);
  }

  /**
   * (description)
   *
   * @returns {string[]} (description)
   */
  getCookies() : string[] {
    return this._cookies;
  }

  /**
   * (description)
   * @internal
   */
  resetOutgoingCookies() : void {
    this._cookiesData = [];
  }

  /**
   * Remove a child resource from this container
   * @internal
   *
   * @param {ResourcePlayer} child (description)
   * @returns {boolean} (description)
   */
  remove( child: ResourcePlayer ) : boolean {
    const log = internals.log().child( { func : 'Container.remove'} );
    const resArr = this._resources[child.name];
    if ( !resArr ) {
      return false;
    }
    const idx = _.indexOf(resArr, child );
    if ( idx < 0 ) {
      return false;
    }
    resArr.splice(idx, 1);
    log.info('- %s', child.name);
    return true;
  }

  /**
   * Inspect the cuurent path in the given route and create the direction
   * to pass a http request to a child resource.
   * If the route.path is terminal this function finds the immediate target resource
   * and assign it to the direction.resource.
   * This function manages also the interpretaiton of an index in the path immediately
   * after the resource name.
   * @internal
   * @protected
   * @param {routing.Route} route (description)
   * @returns {Direction} (description)
   */
  protected _getStepDirection( route: routing.Route ) : Direction {
    const log = internals.log().child( { func : 'Container.getStepDirection'} );
    const direction : Direction = new Direction();
    log.info('Follow next step on %s', JSON.stringify(route.path) );
    direction.route = route.stepThrough(1);
    const childResName: string = direction.route.getNextStep();

    if ( childResName in this._resources ) {
      let idx : number = 0;
      if ( this._resources[childResName].length > 1 ) {
        // Since there are more than just ONE resource maching the name
        // we check the next element in the path for the index needed to
        // locate the right resource in the array.
        if ( direction.route.path[1] !== undefined ) {
          idx = parseInt(direction.route.path[1]) ;
          if ( isNaN(idx) ) {
            idx = 0;
          }
          else {
            direction.route = direction.route.stepThrough(1);
          }
        }

      }
      log.info('Access Resource "%s"[%d] ', childResName, idx );
      direction.resource = this.getChild(childResName, idx);
    }

    return direction;
  }


  /**
   * Returns the direction toward the resource in the given route.
   * The Direction object returned may point directly to the resource requested or
   * may point to a resource that will lead to the requested resource
   * @internal
   */
  protected _getDirection( route: routing.Route, verb : string = 'GET' ) : Direction {
    const log = internals.log().child( { func: 'Container._getDirection'} );

    log.info('%s Step into %s ', verb, route.pathname );
    const direction = this._getStepDirection(route);
    if ( direction && direction.resource ) {
      direction.verb = verb;
      return direction;
    }
    log.info('No Direction found', verb, route.pathname );
    return undefined;
  }


  /**
   * Return the resource matching the given path.
   */
  getResource( pathname : string ) : Container {
    const route = new routing.Route(pathname);
    let direction = this._getDirection(route); // This one may return the resource directly if cached
    if ( !direction ) {
      return undefined;
    }
    let resource : Container = direction.resource;
    route.path = direction.route.path;
    while ( route.path.length > 1 ) {
      direction = resource._getStepDirection(route);
      if ( direction ) {
        resource = direction.resource;
        route.path = direction.route.path;
      }
      else {
        return undefined;
      }
    }
    return resource;
  }


  /**
   * Add a resource of the given type as child
   *
   * @param {Resource} newRes (description)
   */
  add( newRes : Resource ) : void {
    const log = internals.log().child( { func : 'Container.add'} );
    /* tslint:disable */
    newRes['_version'] = site().version;
    newRes['siteName'] = site().siteName;
    /* tslint:enable */
    const resourcePlayer : ResourcePlayer = new ResourcePlayer(newRes, this);

    // Add the resource player to the child resource container for this container.
    const indexName = internals.slugify(newRes.name);
    const childArray = this._resources[indexName];
    if ( childArray === undefined ) {
      this._resources[indexName] = [ resourcePlayer ];
    }
    else {
      childArray.push(resourcePlayer);
    }
    log.info('+ %s', indexName);
  }


  /**
   * Find the first resource of the given type
   *
   * @param {string} typeName (description)
   * @returns {Container} (description)
   */
  getFirstMatching( typeName : string ) : Container {
    const childArray = this._resources[typeName];
    if ( childArray === undefined ) {
      return undefined;
    }
    return childArray[0];
  }


  /**
   * Retruieve the child of a resource with the given name
   *
   * @param {string} name (description)
   * @param {number} [idx=0] (description)
   * @returns {Container} (description)
   */
  getChild( name : string, idx : number = 0 ) : Container {
    if ( this._resources[name] && this._resources[name].length > idx ) {
      return this._resources[name][idx];
    }
    else {
      return undefined;
    }
  }


  /**
   * Return the number of children resources of the given type.
   *
   * @param {string} typeName (description)
   * @returns {number} (description)
   */
  childTypeCount( typeName : string ) : number {
    if ( this._resources[typeName] ) {
      return this._resources[typeName].length;
    }
    else {
      return 0;
    }
  }


  /**
   * Return the total number of children resources for this node.
   *
   * @returns {number} count result as number
   */
  childrenCount() : number {
    let counter: number = 0;
    _.each< Container[]>( this._resources, ( arrayItem: Container[] ) => { counter += arrayItem.length; } );
    return counter;
  }

}


/**
 * Helper class used to deliver a response from a HTTP verb function call.
 * An instance of this class is passed as argument to all verb functions
*/
export class Response {

  /** @internal */
  private _onOk: ( resp : ResourceResponse ) => void;
  /** @internal */
  private _onFail: ( err : RxError ) => void;
  /** @internal */
  private _resource: Container;

  /**
   * Creates an instance of Response.
   * @internal
   * @param {Container} resource (description)
   */
  constructor( resource: Container ) {
    this._resource = resource;
  }

  /**
   * (description)
   * @internal
   * @param {( resp : ResourceResponse ) => void} cb (description)
   */
  onOk( cb : ( resp : ResourceResponse ) => void ) : void  {
    this._onOk = cb;
  }
  /**
   * (description)
   * @internal
   * @param {( err : RxError ) => void} cb (description)
   */
  onFail( cb : ( err : RxError ) => void ) : void  {
    this._onFail = cb;
  }

  //
  /**
   * To return a resource without error invoke this function on the response object receive in the request call
   */
  ok() : void {
    const respObj : ResourceResponse = {
      cookiesData : this._resource.cookiesData,
      httpCode : 200,
      result : 'ok'
    };
    respObj.data = this._resource.data;
    respObj.headers = this._resource.headers;
    if (this._onOk) {
      this._onOk( respObj );
    }
  }

  /**
   * Call this function to redirect the caller to a different URL
   * Code 303
   *
   * @param {string} where (description)
   */
  redirect( where : string ) : void {
    const respObj : ResourceResponse = {
      cookiesData : this._resource.cookiesData,
      httpCode : 303,
      location : where,
      result : 'ok'
    };
    respObj.data = this._resource.data;
    if (this._onOk) {
      this._onOk( respObj );
    }
  }

  //
  /**
   * Call this function to return an error to the caller
   *
   * @param {RxError} err (description)
   */
  fail( err : RxError ) : void {
    const log = internals.log().child( { func : this._resource.name + '.fail' } );
    log.info('Call failed: %s', err.message );
    if (this._onFail) {
      this._onFail( err );
    }
  }
}


/**
 * Routing direction for a request to a resource
 * @internal
 * @export
 * @class Direction
 */
export class Direction {
  resource : Container;
  route: routing.Route;
  verb : string;
}


/**
 * Every resource is converted to their embodiment before is sent back as a HTTP Response
 * @internal
 */
export class Embodiment {

  public httpCode : number;
  public location : string;
  public mimeType : string;
  public bodyData : Buffer;
  public bodyStream : NodeJS.ReadableStream;
  public cookiesData : string[] = []; // example a cookie valie would be ["type=ninja", "language=javascript"]
  public additionalHeaders : ResponseHeaders = {};

  /**
   * Builds a new Embodiment object that can be served back as a response to a HTTP request.
   */
  constructor(  mimeType : string, code : number = 200, data?: Buffer | NodeJS.ReadableStream ) {
    this.httpCode = code;
    if ( data instanceof EventEmitter ) {
      this.bodyStream = <stream.Readable>data;
    }
    else {
      this.bodyData = <Buffer>data;
    }

    this.mimeType = mimeType;
  }

  /**
   * Add a serialized cookie (toString()) to be returned as part of this embodiment
   */
  addSetCookie( cookie: string ) : void {
    this.cookiesData.push(cookie);
  }

  /**
   * Add headers to this embodiment
   */
  setAdditionalHeaders( headers: any ) : void {
    if ( !this.additionalHeaders ) {
      this.additionalHeaders = _.clone(headers);
    }
    else {
      _.merge( this.additionalHeaders, headers );
    }
  }

  /**
   * Serve this emnbodiment through the given ServerResponse
   */
  serve(response: http.ServerResponse) : void {
    const log = internals.log().child( { func: 'Embodiment.serve'} );
    const headers = { 'content-type' : this.mimeType };
    if ( this.bodyData ) {
      headers['content-length'] = this.bodyData.length;
    }
    if ( this.location ) {
      /* tslint:disable */
      headers['Location'] = this.location;
      /* tslint:enable */
    }

    // Add the additionalHeaders to the response
    _.forOwn( this.additionalHeaders, (value : string, key : string ) => {
      response.setHeader(key, value);
    });

    // Add the cookies set to the header (pass the full array to allow writing multiple cookies)
    if ( this.cookiesData ) {
      response.setHeader('Set-Cookie', <any>(this.cookiesData) );
    }

    response.writeHead( this.httpCode, headers );
    if ( this.bodyData ) {
      response.write(this.bodyData);
      if ( this.bodyData.length > 1024 ) {
        log.info( 'Sending %s Kb (as %s)', Math.round( this.bodyData.length / 1024 ), this.mimeType ) ;
      }
      else {
        log.info( 'Sending %s bytes (as %s)', this.bodyData.length, this.mimeType );
      }
      response.end();
      log.info( '<< REQUEST: Complete');
    }
    else if ( this.bodyStream ) {
      log.info( 'Streaming Data');
      this.bodyStream.pipe( response, { end: false } );
      this.bodyStream.on('end', () => {
        response.end();
        log.info( 'Stream Complete');
      });
    }
    else { // Anything else complete the response with no data attached.
      response.end();
    }
  }

  /**
   * utility: return the body of this embodiment as utf-8 encoded string
   */
  bodyAsString() : string {
    return this.bodyData.toString('utf-8');
  }

  /**
   * utility: return the bosy of this embodiment as a JSON object
   */
  bodyAsJason() : any {
    return JSON.parse(this.bodyAsString());
  }
}

/**
 * Root object for the application is the Site.
 * The site is in itself a Resource and is accessed via the root / in a url.
 */
export class Site extends Container implements HttpPlayer {

  /** @internal */
  private static _instance: Site = undefined;
  // private _name: string = "site";
  /** @internal */
  private _version: string = version;
  /** @internal */
  private _siteName: string = 'site';
  /** @internal */
  private _home: string = '/';
  /** @internal */
  private _tempDir: string;
  /** @internal */
  private _pathCache = {};
  /** @internal */
  private _errorView: string = undefined;
  /** @internal */
  private _allowCors: boolean = false;
  /** @internal */
  private _filters: RequestFilterDict = {} ;
  /**
   * (description)
   *
   * @type {boolean}
   */
  public enableFilters: boolean = false;

  /**
   * (description)
   *
   * @static
   * @param {string} [name] (description)
   * @returns {Site} (description)
   */
  public static $( name?: string ) : Site {
    if ( Site._instance === undefined || name ) {
      Site._instance = undefined;
      Site._instance = new Site( name ? name : 'site' );
    }
    return Site._instance;
  }


  /**
   * name of this resource (it should be 'site')
   *
   * @readonly
   * @type {string}
   */
  get name() : string {
    return 'site';
  }

  /**
   * relaxjs version
   *
   * @readonly
   * @type {string}
   */
  get version() : string {
    return this._version;
  }

  /**
   * name of this site
   *
   * @readonly
   * @type {string}
   */
  get siteName() : string {
    return this._siteName;
  }

  /**
   * Returns the direction toward the resource in the given route.
   * The Direction object returned may point directly to the resource requested or
   * may point to a resource that will lead to the requested resource
   * @internal
   */
  protected _getDirection( route: routing.Route, verb: string = 'GET' ): Direction {
    const log = internals.log().child( { func : 'Site._getDirection'} );
    const cachedPath = this._pathCache[route.pathname];
    if ( cachedPath ) {
      const direction = new Direction();
      direction.resource = cachedPath.resource;
      direction.route = route;
      direction.route.path = cachedPath.path;
      direction.verb = verb;
      log.info('%s Path Cache found for "%s"', verb, route.pathname );
      return direction;
    }
    else {
      log.info('%s Step into %s ', verb, route.pathname );
      const direction = this._getStepDirection(route);
      if ( direction && direction.resource ) {
        direction.verb = verb;
        return direction;
      }
    }
    log.info('No Direction found', verb, route.pathname );
    return undefined;
  }


  /**
   * Creates an instance of Site.
   *
   * @param {string} siteName (description)
   * @param {Container} [parent] (description)
   */
  constructor( siteName: string, parent?: Container ) {
    super(parent);
    this._siteName = siteName;
    if ( Site._instance ) {
      throw new Error('Error: Only one site is allowed.');
    }
    Site._instance = this;

    internals.initLog(siteName);

    if ( _.find( process.argv, (arg : string ) => arg === '--relaxjs-verbose' ) ) {
      internals.setLogVerbose(true);
    }
  }

  /**
   * Enable positive responses to OPTIONS Preflighted requests in CORS
   */
  public allowCORS( flag: boolean ) : void {
    this._allowCors = flag;
  }

  /**
   * Setup a shortcut to a specific resource. This function is used internally.
   * @internal
   * @param {string} path (description)
   * @param {{ resource : ResourcePlayer; path : string[] }} shortcut (description)
   */
  setPathCache( path: string, shortcut: { resource: ResourcePlayer; path: string[] } ): void {
    this._pathCache[path] = shortcut;
  }

  /**
   * Override the Error output using a custom view.
   *
   * @param {string} name (description)
   */
  setErrorView( name: string ) : void {
    this._errorView = name;
  }

  /**
   * Output to response the given error following the mime type in format.
   * @internal
   * @private
   * @param {http.ServerResponse} response (description)
   * @param {RxError} error (description)
   * @param {string} format (description)
   * @returns {void} (description)
   */
  private _outputError( response: http.ServerResponse, error: RxError, format: string ): void {
    const self = this;
    const log = internals.log().child( { func : 'Site._outputError'} );
    const mimeType = format.split(/[\s,]+/)[0];
    const errCode = error.getHttpCode ? error.getHttpCode() : 500;

    const errObj = {
      error : {
        message : error.message,
        name : error.name,
        stack : error.stack.split('\n')
      },
      result : 'error',
      version : version
    };

    switch ( mimeType ) {
      case 'text/html':
        if ( self._errorView ) {
          log.info(`Custom Error View [${self._errorView}]`);
          internals.viewDynamic( self._errorView, { data : { error : errObj } } )
          .then( ( reply : Embodiment ) => {
             log.info(`Error Reply ${reply}`);
             reply.httpCode = errCode;
             reply.serve(response);
             response.end();
          })
          .fail( (err : Error ) => {
            log.error(`Custom Error Reply Failes ${err}`);
            response.writeHead( errCode, { 'content-type' : mimeType } );
            response.write('<html><body style="font-family:arial;"><h1>relaxjs: the resource request caused an error.</h1>');
            response.write(`<h2>${error.name}</h2><h3 style="color:red;">${_.escape(error.message)}</h3><hr/><pre>${_.escape(error.stack)}</pre>`);
            response.write('<body></html>');
            response.end();
          });
          return;
        }
        else {
          response.writeHead( errCode, { 'content-type' : mimeType } );
          response.write('<html><body style="font-family:arial;"><h1>relaxjs: the resource request caused an error.</h1>');
          response.write(`<h2>${error.name}</h2><h3 style="color:red;">${_.escape(error.message)}</h3><hr/><pre>${_.escape(error.stack)}</pre>`);
          response.write('<body></html>');
        }
      break;
      case 'application/xml':
      case 'text/xml':
        const builder = new xml2js.Builder({ rootName : 'relaxjs' });
        response.writeHead( errCode, { 'content-type' : mimeType } );
        response.write( builder.buildObject(errObj) );
      break;
      default:
        response.writeHead( errCode, { 'content-type' : mimeType } );
        response.write( JSON.stringify(errObj) );
      break;
    }
    response.end();
  }

  /**
   * Add a request filter. The given function will be called on every request
   * before reaching any resource. All request filters must succeed for the
   * request to procees towards a resource.
   *
   * @param {string} name (description)
   * @param {RequestFilter} filterFunction (description)
   */
  addRequestFilter( name: string, filterFunction: rxjsFilters.RequestFilterCall ): void {
    const log = internals.log().child( { func : 'Site.addRequestFilter'} );
    this._filters[name] = filterFunction;
    log.info('filters', _.keys(this._filters) );
  }

  /**
   * Remove an existing request filter.
   *
   * @param {string} name (description)
   * @returns {boolean} (description)
   */
  deleteRequestFilter( name: string ) : boolean {
    if ( name in this._filters ) {
      delete this._filters[name];
      return true;
    }
    return false;
    // return ( _.remove( this._filters, (f) => f === filterFunction ) !== undefined );
  }

  /**
   * Delete ALL request filters associated with this site
   *
   * @returns {boolean} (description)
   */
  deleteAllRequestFilters() : boolean {
    this._filters = {};
    return true;
  }

  /*
   * Execute all the active filters, collect their returned data and post all of them in the returned promise.
   * @internal
   * @private
   * @param {routing.Route} route (description)
   * @param {*} body (description)
   * @param {http.ServerResponse} response (description)
   * @returns {Q.Promise< FiltersData >} (description)
   */
  private _checkFilters( route: routing.Route, body: any, response: http.ServerResponse ) : Q.Promise< FiltersData > {
    const self = this;
    const log = internals.log().child( { func : 'Site._checkFilters'} );
    const later = Q.defer< FiltersData > ();
    if ( !self.enableFilters || Object.keys(self._filters).length === 0 ) {
      log.info(`no filters executed `);
      later.resolve( {} );
      return later.promise;
    }

    log.info(`executing filters `);

    // All filters call are converted to promise returning functions and stored in an array
    const filtersCalls = _.map( _.values(self._filters), ( f: rxjsFilters.RequestFilterCall ) => Q.nfcall( f.bind( self, route, body) ) );

    // Filter the request: execute all the filters (the first failing will trigger a fail and it will
    // not waiting for the rest of the batch)
    Q.all( filtersCalls )
      .then( ( dataArr : any[] ) => {
        let filterData : FiltersData = {};
        _.each( _.keys(self._filters), (name : string, i : number ) => {
          if ( dataArr[i] ) {
            filterData[name] = dataArr[i];
          }
        });
        log.info(`all ${dataArr.length} filters passed `);
        later.resolve(filterData);
      })
      .fail( ( err : RxError ) => {
        log.warn(`filters not passed ${err.message}`);
        later.reject( err );
      });

    return later.promise;
  }

  /**
   * Serve this site. This call creates a Server for the site and manage all the requests
   * by routing them to the appropriate resources.
   *
   * @returns {http.Server} (description)
   */
  serve(): http.Server {
    const self = this;
    const srv = http.createServer( (msg: http.ServerRequest , response: http.ServerResponse) => {
      // here we need to route the call to the appropriate class:
      const route: routing.Route = routing.fromRequestResponse(msg, response);
      const site: Site = this;
      const log = internals.log().child( { func : 'Site.serve'} );

      this._cookies = route.cookies;  // The client code can retrieved the cookies using this.getCookies();

      log.info('>> REQUEST: %s', route.verb );
      log.info('      PATH: %s %s', route.pathname, route.query);
      log.info('Out FORMAT: %s', route.outFormat);
      log.info(' In FORMAT: %s', route.inFormat);
      const httpMethod = msg.method.toLowerCase();
      if ( site[httpMethod] === undefined ) {
        if ( httpMethod === 'options' && this._allowCors ) {
          const emb = new Embodiment(route.outFormat);
          emb.setAdditionalHeaders({
            'Access-Control-Allow-Headers' : 'Authorization, Content-Type' ,
            'Access-Control-Allow-Origin' : '*' ,
            'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PATCH, DELETE'
          });
          emb.serve(response);
        }
        else {
          const err = new RxError(`Requst ${httpMethod} not allowed`, 'request not supported', 403);
          self._outputError(response, err, route.outFormat);
        }
        return;
      }

      let requestData;
      // Parse the data received with this request
      internals.parseRequestData(msg, route.inFormat)
        .then( ( bodyData : any ) => {
          requestData = bodyData;
          log.info('check filters');
          return self._checkFilters( route, bodyData, response );
        })
        .then( ( allFiltersData : FiltersData ) => {
          // Execute the HTTP request
          site[httpMethod]( route, requestData, allFiltersData )
            .then( ( reply : Embodiment ) => {
              if ( self._allowCors) {
                reply.setAdditionalHeaders({ 'Access-Control-Allow-Origin' : '*' });
              }
              reply.serve(response);
            })
            .fail( (error : RxError ) => {
              if ( error.httpCode >= 300 ) {
                log.error(`HTTP ${msg.method} failed : ${error.httpCode} : ${error.name} - ${error.message}`);
              }
              self._outputError(response, error, route.outFormat);
            })
            .done();
        })
        .fail( (error : RxError ) => {
          if ( error.httpCode >= 300 ) {
            log.error(`HTTP ${msg.method} failed : ${error.httpCode} : ${error.name} - ${error.message}`);
          }
          self._outputError(response, error , route.outFormat );
          });
        }); // End http.createServer()
    return srv;
  }

  /**
   * Set the Home resource for this site by giving its path
   *
   * @param {string} path (description)
   */
  setHome( path: string ) : void {
    this._home = path;
  }

  /**
   * Set the given path as location for temporary files produced by POST and PUT operations
   *
   * @param {string} path (description)
   */
  setTempDirectory( path: string ) : void {
    this._tempDir = path;
    internals.setMultipartDataTempDir(path);
  }

  // HTTP Verb functions --------------------

  /**
   * HTTP verb HEAD response functiion. Analyze the give route and redirect the call to the appropriate
   * child resource if available.
   * @internal
   */
  head( route: routing.Route, body: any, filterData: FiltersData = {} ) : Q.Promise< Embodiment > {
    const self = this;
    const log = internals.log().child( { func : 'Site.head'} );
    log.info('route: %s', route.pathname);
    if ( route.path.length > 1 ) {
      const direction = self._getDirection( route, 'HEAD' );
      if ( !direction ) {
        return internals.promiseError( internals.format('Resource not found or invalid in request "{0}"', route.pathname) , route.pathname, 404 );
      }
      route.path = direction.route.path;
      const res = <ResourcePlayer>(direction.resource);
      return res.head(route, filterData);
    }
    if ( self._home === '/') {
       return internals.viewDynamic(self.name, this );
     }
     else {
       log.info('HEAD is redirecting to "%s"', self._home );
       return internals.redirect( self._home );
     }
  }

  /**
   * HTTP verb GET response functiion. Analyze the give route and redirect the call to the appropriate
   * child resource if available.
   * @internal
   */
  get( route: routing.Route, body: any, filterData: FiltersData = {} ): Q.Promise< Embodiment > {
    const self = this;
    const log = internals.log().child( { func : 'Site.get'} );
    log.info('route: %s', route.pathname);

    if ( route.static ) {
      return internals.viewStatic( decodeURI(route.pathname), route.headers );
    }


    if ( route.path.length > 1 ) {
      const direction = self._getDirection( route, 'GET' );
      if ( direction === undefined ) {
        return internals.promiseError(  internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname), route.pathname, 404 );
      }
      route.path = direction.route.path;
      const res = <ResourcePlayer>(direction.resource);
      return res.get(route, filterData);
    }

    if ( route.path[0] === 'site' && self._home === '/') {
      return internals.viewDynamic(self.name, this );
    }
    if ( self._home !== '/' ) {
      log.info('GET is redirecting to home "%s"', self._home );
      return internals.redirect( self._home );
    }

    return internals.promiseError( internals.format('[error] Root Resource not found or invalid in request "{0}"', route.pathname ), route.pathname, 404 );
  }


  /**
   * HTTP verb POST response functiion. Analyze the give route and redirect the call to the appropriate
   * child resource if available.
   * @internal
   */
  post( route: routing.Route, body: any, filterData: FiltersData = {} ): Q.Promise< Embodiment > {
    const self = this;
    const log = internals.log().child( { func : 'Site.post'} );
    if ( route.path.length > 1 ) {
      const direction = self._getDirection( route, 'POST' );
      if ( !direction ) {
        return internals.promiseError( internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname ), route.pathname );
      }
      const res = <ResourcePlayer>(direction.resource);
      log.info('POST on resource "%s"', res.name );
      route.path = direction.route.path;
      return res.post( direction.route, body, filterData );
    }
    return internals.promiseError(  internals.format('[error] Invalid in request "{0}"', route.pathname ), route.pathname, 404 );
  }


  /**
   * HTTP verb PATCH response functiion. Analyze the give route and redirect the call to the appropriate
   * child resource if available.
   * @internal
   */
  patch( route: routing.Route, body: any, filterData: FiltersData = {} ): Q.Promise<Embodiment> {
    const self = this;
    const log = internals.log().child( { func : 'Site.patch'} );
    if ( route.path.length > 1 ) {
      const direction = self._getDirection( route, 'PATCH' );
      if ( !direction ) {
        return internals.promiseError( internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname ), route.pathname, 404 );
      }
      const res = <ResourcePlayer>(direction.resource);
      log.info('PATCH on resource "%s"', res.name );
      route.path = direction.route.path;
      return res.patch( direction.route, body, filterData );
    }
    return internals.promiseError(  internals.format('[error] Invalid in request "{0}"', route.pathname ), route.pathname, 404 );
  }


  /**
   * HTTP verb PUT response functiion. Analyze the give route and redirect the call to the appropriate
   * child resource if available.
   * @internal
   */
  put( route: routing.Route, body: any, filterData: FiltersData = {} ): Q.Promise<Embodiment> {
    const log = internals.log().child( { func : 'Site.put'} );
    const self = this;
    if ( route.path.length > 1 ) {
      const direction = self._getDirection( route, 'PUT' );
      if ( !direction ) {
        return internals.promiseError( internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname ), route.pathname, 404 );
      }
      const res = <ResourcePlayer>(direction.resource);
      log.info('PUT on resource "%s"', res.name );
      route.path = direction.route.path;
      return res.put( direction.route, body, filterData );
    }
    return internals.promiseError( internals.format('[error] Invalid PUT request "{0}"', route.pathname ), route.pathname, 404 );
  }


  /**
   * HTTP verb DELETE response functiion. Analyze the give route and redirect the call to the appropriate
   * child resource if available.
   * @internal
   * @param {routing.Route} route (description)
   * @param {*} body (description)
   * @param {FiltersData} [filterData={}] (description)
   * @returns {Q.Promise<Embodiment>} (description)
   */
  delete( route: routing.Route, body: any, filterData: FiltersData = {} ): Q.Promise<Embodiment> {
    const self = this;
    const ctx = `[${this.name}.delete] `;
    if ( route.static ) {
      return internals.promiseError( 'DELETE not supported on static resources', route.pathname );
    }

    if ( route.path.length > 1 ) {
      const direction = self._getDirection( route, 'DELETE' );
      if ( !direction ) {
        return internals.promiseError( internals.format('{0} [error] Resource not found or invalid in request "{1}"', ctx, route.pathname ), route.pathname, 404 );
      }
      const res = <ResourcePlayer>(direction.resource);
      internals.log().info('%s "%s"', ctx, res.name );
      route.path = direction.route.path;
      return res.delete( direction.route, filterData );
    }
    return internals.promiseError( internals.format('[error] Invalid DELETE request "{0}"', route.pathname ), route.pathname, 404 );
  }

}


/**
 * ResourcePlayer absorbs a user defined resource and execute the HTTP requests.
 * The player dispatch requests to the childres resources or invoke user defined
 * response function for each verb.
 * @internal
 */
export class ResourcePlayer extends Container implements HttpPlayer {

  static version = version;
  // private _site: Site;
  private _template: string = '';
  private _layout: string;
  private _paramterNames: string[];
  private _outFormat: string;

  private _onGet: ( query: any, respond: Response ) => void;
  private _onPost: ( query: any, body: any, respond: Response ) => void;
  private _onPatch: ( query: any, body: any, respond: Response ) => void;
  private _onDelete: ( query: any, respond: Response ) => void;
  private _onPut: ( query: any, body: any, respond: Response ) => void;

  private _parameters = {};

  public filtersData: FiltersData = {};

  // public data = {};

  set outFormat( f: string ) {
    this._outFormat = f;
  }

  get resources() : any {
    return this._resources;
  }

  /**
   * Build a active resource by providing a Resource data object
   */
  constructor( res: Resource, parent: Container = undefined ) {
    super(parent);
    const self = this;
    self.setName(res.name);
    self._template = res.view;
    self._layout = res.layout;
    self._paramterNames = res.urlParameters ? res.urlParameters : [];
    self._parameters = {};
    self._outFormat = res.outFormat;
    self._onGet = res.onGet;
    self._onPost = res.onPost;
    self._onPatch = res.onPatch;
    self._onDelete = res.onDelete;
    self._onPut = res.onPut;

    // Copy other functions in res to self (new in 0.2.8)
    const resfn = _.functions(res);
    const xresfn = _.filter( resfn, ( fn: string ) => fn !== 'onGet' && fn !== 'onPut' && fn !== 'onPost' && fn !== 'onDelete'  && fn !== 'onPatch' );
    _.each( xresfn, fn => (this as any)[fn] = _.bind( (res as any)[fn], this ) );

    // Add children resources if available
    if ( res.resources ) {
      _.each( res.resources, ( child: Resource, index: number) => {
        self.add( child );
      });
    }
    // Merge the data into this object to easy access in the view.
    self._updateData(res.data);
  }

  /**
   *
   */
  setOutputFormat( fmt: string ) : void  {
    this._outFormat = fmt;
  }

  /*
   * Reads the parameters from a route and store them in the this._parmaters member.
   * Return the number of paramters correcly parsed.
  */
  private _readParameters( path: string[], generateError: boolean = true ) : number {
    const log = internals.log().child( { func: this.name + '._readParameters'} );
    let counter = 0;
    _.each(this._paramterNames, ( parameterName: string, idx: number /*, list*/ ) => {
      if ( !path[ idx + 1 ] ) {
        if ( generateError ) {
          log.error('Could not read all the required paramters from URI. Read %d, needed %d', counter, this._paramterNames.length );
        }
        return counter; // breaks out of the each loop.
      }
      this._parameters[ parameterName ] = path[ idx + 1 ];
      counter++;
    });
    log.info('Read %d parameters from request URL: %s', counter, JSON.stringify(this._parameters) );
    return counter;
  }


  /*
   * Reset the data property for this object and copy all the
   * elements from the given parameter into it.
   */
  private _updateData( newData: any ) : void {
    const self = this;
    self.data = {};
    _.each(newData, ( value: any, attrname: string ) => {
      if ( attrname !== 'resources') {
        self.data[attrname] = value;
      }
    } );
  }


  /*
   * Delivers a reply as Embodiment of the given response through the given promise and
   * in the given outFormat
  */
  private _deliverReply( later: Q.Deferred<Embodiment>,
                         resResponse: ResourceResponse,
                         outFormat: string,
                         deliverAnyFormat: boolean = false ) : void {
    const self = this;
    const log = internals.log().child( { func: 'ResourcePlayer(' + self.name + ')._deliverReply' } );

    // Force application/json out format for redirect responses
    if ( resResponse.httpCode === 303 || resResponse.httpCode === 307 ) {
      outFormat = 'application/json';
    }

    const mimeTypes = outFormat ? outFormat.split(/[\s,;]+/) : ['application/json'];
    log.info('Formats: %s', JSON.stringify(mimeTypes));

    // Use the template for GET html requests
    if ( self._template &&
        ( mimeTypes.indexOf('text/html') !== -1 || mimeTypes.indexOf('*/*') !== -1 ) ) {
      // Here we copy the data into the resource itself and process it through the viewing engine.
      // This allow the code in the view to act in the context of the resourcePlayer.
      self.data = resResponse.data;
      internals.viewDynamic(self._template, self, self._layout )
        .then( ( reply: Embodiment ) => {
          reply.httpCode = resResponse.httpCode ? resResponse.httpCode : 200;
          reply.location = resResponse.location;
          reply.cookiesData = resResponse.cookiesData;
          reply.additionalHeaders = self.headers;
          later.resolve(reply);
        })
        .fail( (err : Error ) => {
          later.reject(err);
        });
    }
    else {
      let mimeType = undefined;
      // This is orrible, it should be improved in version 0.1.3
      if ( mimeTypes.indexOf( '*/*' ) !== -1 ) { mimeType = 'application/json'; }
      if ( mimeTypes.indexOf( 'application/json' ) !== -1 ) { mimeType = 'application/json'; }
      if ( mimeTypes.indexOf( 'application/xml' ) !== -1 ) { mimeType = 'application/xml'; }
      if ( mimeTypes.indexOf( 'text/xml' ) !== -1 ) { mimeType = 'text/xml'; }
      if ( mimeTypes.indexOf( 'application/xhtml+xml' ) !== -1 ) { mimeType = 'application/xml'; }
      if ( mimeTypes.indexOf( 'application/x-www-form-urlencoded' ) !== -1 ) { mimeType = 'text/xml'; }
      if ( mimeType ) {
        internals.createEmbodiment(resResponse.data, mimeType )
          .then( ( reply: Embodiment ) => {
            reply.httpCode = resResponse.httpCode ? resResponse.httpCode : 200;
            reply.location = resResponse.location;
            reply.cookiesData = resResponse.cookiesData;
            reply.additionalHeaders = resResponse.headers;
            later.resolve(reply);
          })
          .fail( (err : Error ) => {
            later.reject(err);
          });
      }
      else {
        if ( deliverAnyFormat ) {
          log.info(`Deliver anyformat: ${outFormat}`);
          const reply = new Embodiment( outFormat, 200, resResponse.data );
          reply.cookiesData = resResponse.cookiesData;
          reply.additionalHeaders = resResponse.headers;
          later.resolve(reply);
        }
        else {
          later.reject( new RxError( 'output as (' + outFormat + ') is not available for this resource', 'Unsupported Media Type', 415 ) ); // 415 Unsupported Media Type
        }
      }
    }
  }


  // -------------------- HTTP VERB FUNCIONS -------------------------------------


  /**
   * Resource Player HEAD. Get the response as for a GET request, but without the response body.
   */
  head( route: routing.Route, filtersData: FiltersData ) : Q.Promise<Embodiment> {
    const later = Q.defer< Embodiment >();
    this.resetOutgoingCookies();

    _.defer( () => { later.reject( new RxError('Not Implemented')); });
    return later.promise;
  }


  /**
   * HttpPlayer GET. Analyze the route and redirect the call to a child resource or
   * will call the onGet() for the this resource.
   */
  get( route: routing.Route, filtersData: FiltersData = undefined ) : Q.Promise< Embodiment > {
    const self = this; // use to consistently access this object.
    const log = internals.log().child( { func: 'ResourcePlayer(' + self.name + ').get'} );
    const paramCount = self._paramterNames.length;
    const later = Q.defer< Embodiment >();
    this.resetOutgoingCookies();

    // Dives in and navigates through the path to find the child resource that can answer this GET call
    if ( route && route.path.length > ( 1 + paramCount ) ) {
      const direction = self._getStepDirection( route );
      if ( direction.resource ) {
        const res = <ResourcePlayer>(direction.resource);
        return res.get( direction.route, filtersData );
      }
      else {
        if ( _.keys(self._resources).length === 0 ) {
          return internals.promiseError( internals.format('[error: no child] This resource "{0}" does not have any child resource to navigate to. Path= "{1}"', self.name, JSON.stringify(route.path) ), route.pathname );
        }
        else {
          return internals.promiseError( internals.format('[error: no such child] ResourcePlayer GET could not find a Resource for "{0}"',  JSON.stringify(route.path) ), route.pathname );
        }
      }
    }
    // Check route.path[0] is referring to this resource
    if ( route.path[0] !== this.name) {
      later.reject( new RxError( `[error invalid resource] ${route.path[0]} is not ${this.name} `, 'GET ' + this.name, 404 ));
      return later.promise;
    }

    // Read the parameters from the route
    log.info('GET Target Found: %s (requires %d parameters)', self.name, paramCount );
    if ( paramCount > 0 ) {
      if ( self._readParameters(route.path) < paramCount ) {
        later.reject( new RxError( 'Not enough paramters available in the URI ', 'GET ' + self.name, 404 ));
        return later.promise;
      }
    }

    // Set the cach to invoke this resource for this path directly next time
    if ( route ) {
      site().setPathCache(route.pathname, { path: route.path, resource: this } );
    }

    // This is the resource that need to answer either with a onGet or directly with data
    // var dyndata: any = {};

    // If the onGet() is defined use id to get dynamic data from the user defined resource.
    if ( self._onGet ) {
      let outFormat = self._outFormat || route ? route.outFormat : undefined;
      log.info('Invoking GET on %s (%s)', self.name, outFormat );
      this.filtersData = filtersData;
      this._headers = route.headers;
      this._cookies = route.cookies;  // The client code can retrieved the cookies using this.getCookies();
      const response = new Response( self );
      response.onOk( ( resresp: ResourceResponse ) => {
        self._updateData(resresp.data);
        self._deliverReply( later, resresp, outFormat, outFormat !== undefined );
      });
      response.onFail( ( rxErr: RxError ) => later.reject(rxErr) );
      try {
        self._onGet( route.query, response );
      }
      catch ( error) {
        later.reject(error);
      }
      return later.promise;
    }

    // 4 - Perform the default GET that is: deliver the data associated with this resource
    log.info('Returning static data from %s', self.name);
    const responseObj: ResourceResponse = {
      data: self.data,
      httpCode: 200,
      result: 'ok'
    };
    self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat );
    return later.promise;
  }


  /**
   * HttpPlayer DELETE. Analyze the route and redirect the call to a child resource or
   * will call the onGet() for the this resource.
   */
  delete( route: routing.Route, filtersData: FiltersData ) : Q.Promise<Embodiment> {
    const self = this; // use to consistently access this object.
    const log = internals.log().child( { func: 'ResourcePlayer(' + self.name + ').delete'} );
    const paramCount = self._paramterNames.length;
    const later = Q.defer< Embodiment >();
    this.resetOutgoingCookies();


    // 1 - Dives in and navigates through the path to find the child resource that can answer this DELETE call
    if ( route.path.length > ( 1 + paramCount ) ) {
      const direction = self._getStepDirection( route );
      if ( direction ) {
        const res = <ResourcePlayer>(direction.resource);
        log.info('DELETE on resource "%s"', res.name );
        return res.delete( direction.route, filtersData );
      }
      else {
        return internals.promiseError( internals.format('[error] Resource not found "{0}"', route.pathname ), route.pathname );
      }
    }

    // 2 - Read the parameters from the route
    log.info('DELETE Target Found: %s (requires %d parameters)', self.name, paramCount );
    if ( paramCount > 0 ) {
      if ( self._readParameters(route.path) < paramCount ) {
        later.reject( new RxError('Not enough paramters available in the URI ', 'DELETE ' + self.name, 404));
        return later.promise;
      }
    }

    // If the onDelete() is defined use it to invoke a user define delete.
    if ( self._onDelete ) {
      log.info('call onDelete() for %s', self.name );
      this._headers = route.headers;
      this._cookies = route.cookies;  // The client code can retrieved the cookies using this.getCookies();
      this.filtersData = filtersData;
      const response = new Response( self );
      response.onOk( ( resresp : ResourceResponse ) => {
        self._updateData(resresp.data);
        self._deliverReply( later, resresp, self._outFormat ? self._outFormat : route.outFormat  );
      });
      response.onFail( ( rxErr : RxError ) => later.reject(rxErr) );
      try {
        this._onDelete( route.query, response );
      }
      catch ( err ) {
        later.reject(err);
      }
      return later.promise;
    }

    // 4 - Perform the default DELETE that is: delete this resource
    log.info('Default Delete: Removing resource %s', self.name );
    self.parent.remove(self);
    self.detachFromParent();
    const responseObj : ResourceResponse = {
      data : self.data,
      httpCode : 200,
      result : 'ok',
    };
    self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat  );
    return later.promise;
  }


  /**
   * HttpPlayer POS. Analyze the route and redirect the call to a child resource or
   * will call the onPost() for the this resource.
   * The default action is to create a new subordinate of the web resource identified by the URI.
   * The body sent to a post must contain the resource name to be created.
   */
  post( route: routing.Route, body : any, filtersData : FiltersData ) : Q.Promise< Embodiment > {
    const self = this; // use to consistently access this object.
    const log = internals.log().child( { func : 'ResourcePlayer(' + self.name + ').post'} );
    const paramCount = self._paramterNames.length;
    const later = Q.defer< Embodiment >();
    this.resetOutgoingCookies();

    // Dives in and navigates through the path to find the child resource that can answer this POST call
    if ( route.path.length > ( 1 + paramCount ) ) {
      const direction = self._getStepDirection( route );
      if ( direction ) {
        const res = <ResourcePlayer>(direction.resource);
        log.info('POST on resource "%s"', res.name );
        return res.post( direction.route, body, filtersData );
      }
      else {
        return internals.promiseError( internals.format('[error] Resource not found "{0}"', route.pathname ), route.pathname );
      }
    }

    // 2 - Read the parameters from the route
    log.info('POST Target Found : %s (requires %d parameters)', self.name, paramCount );
    if ( paramCount > 0 ) {
      // In a POST not finding all the paramters expeceted should not fail the call.
      self._readParameters( route.path, false );
    }

    // Call the onPost() for this resource (user code)
    if ( self._onPost ) {
      log.info('calling onPost() for %s', self.name );
      this.filtersData = filtersData;
      this._headers = route.headers;
      this._cookies = route.cookies;  // The client code can retrieved the cookies using this.getCookies();
      const response = new Response( self );
      response.onOk( ( resresp : ResourceResponse ) => {
        self._deliverReply(later, resresp, self._outFormat ? self._outFormat : route.outFormat  );
      });
      response.onFail( ( rxErr : RxError ) => later.reject(rxErr) );
      try {
        self._onPost( route.query, body, response );
      }
      catch ( err ) {
        later.reject( new RxError(err) );
      }
      return later.promise;
    }

    // 4 - Perform the default POST that is: set the data directly
    log.info('Adding data for %s', self.name );
    self._updateData(body);
    const responseObj : ResourceResponse = {
      data : self.data,
      httpCode : 200,
      result : 'ok',
    };
    self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat );
    return later.promise;
  }


  /**
   * HttpPlayer POS. Analyze the route and redirect the call to a child resource or
   * will call the onPost() for the this resource.
   * The default action is to apply partial modifications to a resource (as identified in the URI).
   */
  patch( route: routing.Route, body : any, filtersData : FiltersData ) : Q.Promise<Embodiment> {
    const self = this; // use to consistently access this object.
    const log = internals.log().child( { func : 'ResourcePlayer(' + self.name + ').patch'} );
    const paramCount = self._paramterNames.length;
    const later = Q.defer< Embodiment >();
    this.resetOutgoingCookies();

    // 1 - Dives in and navigates through the path to find the child resource that can answer this POST call
    if ( route.path.length > ( 1 + paramCount ) ) {
      const direction = self._getStepDirection( route );
      if ( direction ) {
        const res = <ResourcePlayer>(direction.resource);
        log.info('PATCH on resource "%s"', res.name );
        return res.patch( direction.route, body, filtersData );
      }
      else {
        return internals.promiseError( internals.format('[error] Resource not found "{0}"', route.pathname ), route.pathname );
      }
    }

    // 2 - Read the parameters from the route
    log.info('PATCH Target Found : %s (requires %d parameters)', self.name, paramCount );
    if ( paramCount > 0 ) {
      if ( self._readParameters(route.path) < paramCount ) {
        later.reject( new RxError('Not enough paramters available in the URI ', 'PATCH ' + self.name, 404));
        return later.promise;
      }
    }

    // 3 - call the resource defined function to respond to a PATCH request
    if ( self._onPatch ) {
      log.info('calling onPatch() for %s', self.name );
      this.filtersData = filtersData;
      this._headers = route.headers;
      this._cookies = route.cookies;  // The client code can retrieved the cookies using this.getCookies();
      const response = new Response( self );
      response.onOk(  ( resresp : ResourceResponse ) => {
        self._updateData(resresp.data);
        self._deliverReply(later, resresp, self._outFormat ? self._outFormat : route.outFormat  );
      });
      response.onFail( ( rxErr: RxError ) => later.reject(rxErr) );
      try {
        self._onPatch( route.query, body, response );
      }
      catch ( err ) {
        later.reject( new RxError(err) );
      }
      return later.promise;
    }

    // 4 - Perform the default PATH that is set the data directly
    log.info('Updating data for %s', self.name );
    self._updateData(body);
    const responseObj: ResourceResponse = {
      data : self.data,
      httpCode : 200,
      result : 'ok',
    };
    self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat  );
    return later.promise;
  }


  /*
   * HttpPlayer PUT
   * Asks that the enclosed entity be stored under the supplied URI.
   * The body sent to a post does not contain the resource name to be stored since that name is the URI.
  */
  put( route: routing.Route, body: any, filtersData: FiltersData ): Q.Promise<Embodiment> {
    // const self = this; // use to consistently access this object.
    // const log = internals.log().child( { func : 'ResourcePlayer(' +self.name+ ').put'} );
    const later = Q.defer< Embodiment >();
    this.resetOutgoingCookies();


    _.defer( () => { later.reject( new RxError('Not Implemented')); });
    return later.promise;
  }

}

/**
 * (description)
 *
 * @export
 * @param {string} [name] (description)
 * @returns {Site} (description)
 */
export function site( name?: string ): Site {
  return Site.$(name);
}

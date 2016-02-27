/*
 * Relax.js Route utility class
 * by Michele Ursino - 2015, 2016
 */

/// <reference path='./relaxjs.ts' />

import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as _ from 'lodash';

import * as relaxjs from './relaxjs';

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
  verb : string;
  /**
   * if true it means this route is mapping to a file
   *
   * @type {boolean}
   */
  static : boolean = true;
  /**
   * path of the request as received
   *
   * @type {string}
   */
  pathname : string;
  /**
   * Path of the request split in its components
   *
   * @type {string[]}
   */
  path : string[];
  /**
   * Query data associated with this request.
   * It is a collection of name: value
   *
   * @type {*}
   */
  query : any;
  /**
   * Mime type of the expeted response
   *
   * @type {string}
   */
  outFormat : string;
  /**
   * mime type of the incomed request
   *
   * @type {string}
   */
  inFormat : string;
  /**
   * Cookies associated with the request
   *
   * @type {string[]}
   */
  cookies : string[]; // Unparsed cookies received withing the request.
  /**
   * Original HTTP Request
   *
   * @type {http.ServerRequest}
   */
  request : http.ServerRequest;
  /**
   * Original HTTP response object
   *
   * @type {http.ServerResponse}
   */
  response : http.ServerResponse;
  /**
   * Headers associated with the request
   * @internal
   * @type {relaxjs.ResponseHeaders}
   */
  headers : relaxjs.ResponseHeaders = {}; // Additional headers filters or resources may set before returning an answer.

  /**
   * Creates an instance of Route.
   * @internal
   * @param {string} [uri] (description)
   * @param {string} [outFormat] (description)
   * @param {string} [inFormat] (description)
   */
  constructor( uri? : string, outFormat? : string, inFormat? : string ) {
    if ( uri ) {
      const parsedUrl : url.Url = url.parse( uri, true );
      const extension = path.extname( parsedUrl.pathname );
      let resources : string[] = parsedUrl.pathname.split('/');
      if ( parsedUrl.pathname.charAt(0) === '/' ) {
        resources.unshift('site');
      }
      resources = _.map(resources, ( item : string ) => decodeURI(item) );

      this.pathname = parsedUrl.pathname;
      this.query = parsedUrl.query;
      this.path = _.filter( resources, ( res : string ) => res.length > 0 );
      this.static = ( extension.length > 0 );
      this.outFormat = outFormat ? outFormat : 'application/json';
      this.inFormat = inFormat ? inFormat : 'application/json';
    }
  }

  //
  /**
   * Create a new Route with a new path without the first item
   * @internal
   * @param {number} stpes (description)
   * @returns {Route} (description)
   */
  stepThrough( stpes : number ) : Route {
    const newRoute : Route = new Route();
    _.assign( newRoute, {
      verb : this.verb,
      static : this.static,
      pathname: this.pathname,
      path: [],
      query: this.query,
      outFormat: this.outFormat,
      inFormat: this.inFormat,
      cookies: this.cookies,
      request: this.request,
      response: this.response
    });
    newRoute.path = _.map( this.path, v => _.clone(v) );
    newRoute.path.splice( 0, stpes );
    return newRoute;
  }

  /**
   * (description)
   * @internal
   * @returns {string} (description)
   */
  getNextStep() : string {
    // console.log('[Route.nextStep] '+this.path[0] );
    return this.path[0];
  }

  /**
   * Add new headers to this route
   * @internal
   * @param {relaxjs.ResponseHeaders} h (description)
   */
  addResponseHeaders( h: relaxjs.ResponseHeaders ) {
    _.merge(this.headers,h);
  }
}



/**
 * Create a Route from a request, response couple. For example:
 *  GET /home/users?id=100  becomes home.users.get(100)
 *  PUT /home/users?id=100  becomes home.users.put(100, data)
 * @internal
 * @export
 * @param {http.ServerRequest} request (description)
 * @param {http.ServerResponse} response (description)
 * @returns {Route} (description)
 */
export function fromRequestResponse( request: http.ServerRequest, response: http.ServerResponse ) : Route {
  if ( !request.url ) {
    request.url = '/';
  }
  const route = new Route( request.url );

  route.request = request;
  route.response = response;

  // Extract the cookies (if any) from the request
  if ( request.headers.cookie ) {
    route.cookies = request.headers.cookie.split(';');
  }

  // This is the format the request would like to have back
  if ( request.headers['accept'] ) {
    route.outFormat = request.headers['accept'];
  }
  // This is the format the requester is sending its data with
  if ( request.headers['content-type'] ) {
    route.inFormat = request.headers['content-type'];
  }

  if ( !request.headers['accept'] && request.headers['content-type'] ) {
    route.outFormat = request.headers['content-type'];
  }
  if ( request.headers['accept'] && !request.headers['content-type'] ) {
    route.inFormat = request.headers['accept'];
  }
  if ( !request.headers['accept'] && !request.headers['content-type'] ) {
    route.inFormat = 'application/json';
    route.outFormat = 'application/json';
  }

  route.verb = request.method;
  return route;
}

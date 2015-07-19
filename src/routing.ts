/*
 * Relax.js version 0.1.4
 * by Michele Ursino - 2015
 */

///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/lodash/lodash.d.ts' />
///<reference path='../typings/q/Q.d.ts' />
///<reference path='../typings/mime/mime.d.ts' />

///<reference path='./relaxjs.ts' />

import http = require("http");
import fs = require('fs');
import url = require('url');
import path = require('path');
import Q = require('q');
import mime = require('mime');
import _ = require("lodash");
// _.str = require('underscore.string');

import relaxjs = require('./relaxjs');

// Route: helper class to routing requests to the correct resource
export class Route {
  verb: string;
  static : boolean = true; // if true it means this rout is mapping to a file
  pathname : string;
  path : string[];
  query: any;
  outFormat: string;
  inFormat : string;
  cookies: string[]; // Unparsed cookies received withing the request.
  request: http.ServerRequest;
  response: http.ServerResponse;
  headers: relaxjs.ResponseHeaders = {}; // Additional headers filters or resources may set before returning an answer.

  constructor( uri?: string, outFormat?: string, inFormat?: string ) {
    if ( uri ) {
      var parsedUrl : url.Url = url.parse(uri, true);
      var extension = path.extname(parsedUrl.pathname)
      var resources : string[] = parsedUrl.pathname.split('/');//.splice(0,1);
      if ( parsedUrl.pathname.charAt(0) == '/' ) {
        resources.unshift('site');
      }
      resources = _.map(resources, (item) => decodeURI(item) );

      this.pathname = parsedUrl.pathname;
      this.query = parsedUrl.query;
      this.path = _.filter( resources, (res) => res.length>0 );
      // console.log(_.str.sprintf('Route Path:"%s" Extension:"%s"', JSON.stringify(this.path), extension ) );
      this.static = ( extension.length>0 );
      this.outFormat = outFormat ? outFormat : 'application/json';
      this.inFormat = inFormat ? inFormat: 'application/json';
    }
  }

  // Create a new Route with a new path without the first item
  stepThrough( stpes: number ) : Route {
    var newRoute : Route = new Route();
    _.assign( newRoute, {
      verb: this.verb,
      static: this.static,
      pathname: this.pathname,
      path: [],
      query: this.query,
      outFormat: this.outFormat,
      inFormat: this.inFormat,
      cookies: this.cookies,
      request: this.request,
      response: this.response
    });
    newRoute.path = _.map(this.path, (v) => _.clone(v) );
    newRoute.path.splice(0,stpes);
    return newRoute;
  }

  getNextStep() : string {
    // console.log('[Route.nextStep] '+this.path[0] );
    return this.path[0];
  }

  addResponseHeaders( h: relaxjs.ResponseHeaders ) {
    _.merge(this.headers,h);
  }
}


// --------------------------------------------------------------
// GET /home/users?id=100
// becomes
// home.users.get(100)
// PUT /home/users?id=100
// becomes
//  home.users.put( 100, data)
// --------------------------------------------------------------
export function fromRequestResponse( request: http.ServerRequest, response: http.ServerResponse ) : Route {
  if ( !request.url )
    request.url = '/';
  var route = new Route( request.url );

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

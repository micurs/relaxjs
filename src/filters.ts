/*
 * relaxjs predefined filters
 * by Michele Ursino - 2016
 */

/// <reference path='./relaxjs.ts' />
/// <reference path='./routing.ts' />

import * as http from 'http';
import * as _ from 'lodash';

import * as routing from './routing';

/**
 * Generic middleware function call
 *
 * @interface MiddlewareCall
 */
export interface MiddlewareCall {
  ( request: http.ServerRequest, response: http.ServerResponse , next: () => void ) : void;
};

/**
 * Filter complete function definition.
 * This is called to complete a filter with error or data to pass to a resource
 *
 * @export
 * @interface FilterResultCB
 */
export interface FilterResultCB {
  ( err?: Error, data?: any ) : void;
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
  filter( route: routing.Route, body: any, complete: FilterResultCB ) : void;
}

export interface RequestFilterCall {
  ( route: routing.Route, body: any, complete: FilterResultCB ) : void;
}

/**
 * A relaxjs filter class that process express style middleware functions
 *
 * @export
 * @class middleware
 */
export class MiddlewareFilter implements RequestFilter {
  /** @internal */
  private _mwares: MiddlewareCall[] = [];

  /**
   * Creates an instance of MiddlewareFilter.
   *
   * @param {...MiddlewareCall[]} ms (description)
   */
  constructor( ...ms: MiddlewareCall[] ) {
    _.each( ms, m => this._mwares.push(m) );
  }

  /**
   * Add one or more middleware function to the filter
   *
   * @param {...mwareFunc[]} ms (description)
   */
  use( ...ms: MiddlewareCall[] ) : void {
    _.each( ms, m => this._mwares.push(m) );
  }

  /**
   * Filter function to be passes to a site using addRequestFilter.
   * Example site.addRequestFilter( mw.filter.bind(mw) )
   *
   * @param {routing.Route} route (description)
   * @param {*} body (description)
   * @param {FilterResultCB} complete (description)
   */
  filter( route: routing.Route, body: any, complete: FilterResultCB ) : void {
    let midx = 0;
    const next = () => {
      if ( this._mwares[midx] ) {
        this._mwares[midx++]( route.request, route.response, next);
      }
      else {
        complete();
      }
    };
    next();
  }

}


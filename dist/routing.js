"use strict";
/*
 * relaxjs route utility class
 * by Michele Ursino - 2015, 2016
 */
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var path = require("path");
var _ = require("lodash");
/**
 * Route: helper class to routing requests to the correct resource
 * @export
 * @class Route
 */
var Route = (function () {
    /**
     * Creates an instance of Route.
     * @internal
     * @param {string} [uri] (description)
     * @param {string} [outFormat] (description)
     * @param {string} [inFormat] (description)
     */
    function Route(uri, outFormat, inFormat) {
        /**
         * if true it means this route is mapping to a file
         *
         * @type {boolean}
         */
        this.static = true;
        /**
         * Headers associated with the request
         * @internal
         * @type {relaxjs.ResponseHeaders}
         */
        this.headers = {}; // Additional headers filters or resources may set before returning an answer.
        if (uri) {
            var parsedUrl = url.parse(uri, true);
            var extension = path.extname(parsedUrl.pathname);
            var resources = parsedUrl.pathname.split('/');
            if (parsedUrl.pathname.charAt(0) === '/') {
                resources.unshift('site');
            }
            resources = _.map(resources, function (item) { return decodeURI(item); });
            this.pathname = parsedUrl.pathname;
            this.query = parsedUrl.query;
            this.path = _.filter(resources, function (res) { return res.length > 0; });
            this.static = (extension.length > 0);
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
    Route.prototype.stepThrough = function (stpes) {
        var newRoute = new Route();
        _.assign(newRoute, {
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
        newRoute.path = _.map(this.path, function (v) { return _.clone(v); });
        newRoute.path.splice(0, stpes);
        return newRoute;
    };
    /**
     * (description)
     * @internal
     * @returns {string} (description)
     */
    Route.prototype.getNextStep = function () {
        // console.log('[Route.nextStep] '+this.path[0] );
        return this.path[0];
    };
    /**
     * Add new headers to this route
     * @internal
     * @param {relaxjs.ResponseHeaders} h (description)
     */
    Route.prototype.addResponseHeaders = function (h) {
        _.merge(this.headers, h);
    };
    return Route;
}());
exports.Route = Route;
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
function fromRequestResponse(request, response) {
    if (!request.url) {
        request.url = '/';
    }
    var route = new Route(request.url);
    route.request = request;
    route.response = response;
    // Extract the cookies (if any) from the request
    if (request.headers.cookie) {
        route.cookies = request.headers.cookie.split(';');
    }
    // This is the format the request would like to have back
    if (request.headers['accept']) {
        route.outFormat = request.headers['accept'];
    }
    // This is the format the requester is sending its data with
    if (request.headers['content-type']) {
        route.inFormat = request.headers['content-type'];
    }
    if (!request.headers['accept'] && request.headers['content-type']) {
        route.outFormat = request.headers['content-type'];
    }
    if (request.headers['accept'] && !request.headers['content-type']) {
        route.inFormat = request.headers['accept'];
    }
    if (!request.headers['accept'] && !request.headers['content-type']) {
        route.inFormat = 'application/json';
        route.outFormat = 'application/json';
    }
    route.verb = request.method;
    return route;
}
exports.fromRequestResponse = fromRequestResponse;
//# sourceMappingURL=routing.js.map
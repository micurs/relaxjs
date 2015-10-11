/*
 * Relax.js version 0.1.4
 * by Michele Ursino - 2015
 */
var url = require('url');
var path = require('path');
var _ = require("lodash");
// Route: helper class to routing requests to the correct resource
var Route = (function () {
    function Route(uri, outFormat, inFormat) {
        this.static = true; // if true it means this rout is mapping to a file
        this.headers = {}; // Additional headers filters or resources may set before returning an answer.
        if (uri) {
            var parsedUrl = url.parse(uri, true);
            var extension = path.extname(parsedUrl.pathname);
            var resources = parsedUrl.pathname.split('/'); //.splice(0,1);
            if (parsedUrl.pathname.charAt(0) == '/') {
                resources.unshift('site');
            }
            resources = _.map(resources, function (item) { return decodeURI(item); });
            this.pathname = parsedUrl.pathname;
            this.query = parsedUrl.query;
            this.path = _.filter(resources, function (res) { return res.length > 0; });
            // console.log(_.str.sprintf('Route Path:"%s" Extension:"%s"', JSON.stringify(this.path), extension ) );
            this.static = (extension.length > 0);
            this.outFormat = outFormat ? outFormat : 'application/json';
            this.inFormat = inFormat ? inFormat : 'application/json';
        }
    }
    // Create a new Route with a new path without the first item
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
    Route.prototype.getNextStep = function () {
        // console.log('[Route.nextStep] '+this.path[0] );
        return this.path[0];
    };
    Route.prototype.addResponseHeaders = function (h) {
        _.merge(this.headers, h);
    };
    return Route;
})();
exports.Route = Route;
// --------------------------------------------------------------
// GET /home/users?id=100
// becomes
// home.users.get(100)
// PUT /home/users?id=100
// becomes
//  home.users.put( 100, data)
// --------------------------------------------------------------
function fromRequestResponse(request, response) {
    if (!request.url)
        request.url = '/';
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
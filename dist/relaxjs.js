/*
 * Relax.js version 0.2.0
 * by Michele Ursino June - 2015
 * -------------------------------------------------------
*/
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path='references.ts' />
var http = require('http');
var stream = require('stream');
var Q = require('q');
var _ = require('lodash');
var xml2js = require('xml2js');
// sub-modules importing
var internals = require('./internals');
var routing = require('./routing');
exports.routing = routing;
exports.internals = internals;
/* tslint:disable */
var packageinfo = require(__dirname + '/../package.json');
var version = packageinfo.version;
/* tslint:enable */
/**
 * print out the version
 *
 * @export
 */
function relaxjs() {
    console.log("relaxjs version " + version);
}
exports.relaxjs = relaxjs;
/**
 * Extended Error class for Relax.js
*/
var RxError = (function (_super) {
    __extends(RxError, _super);
    /**
     * Creates an instance of RxError.
     *
     * @param {string} message (description)
     * @param {string} [name] (description)
     * @param {number} [code] (description)
     * @param {string} [extra] (description)
     */
    function RxError(message, name, code, extra) {
        _super.call(this);
        var tmp = new Error(); // We use this to generate the stack info to assign to this error
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
    RxError.prototype.getHttpCode = function () {
        return this.httpCode;
    };
    RxError.prototype.getExtra = function () {
        return this.extra ? this.extra : '';
    };
    /**
     * Serialize the error to a string.
     *
     * @returns {string} (description)
     */
    RxError.prototype.toString = function () {
        return internals.format('RxError {0}: {1}\n{2}\nStack:\n{3}', this.httpCode, this.name, this.message, this.stack);
    };
    return RxError;
}(Error));
exports.RxError = RxError;
/**
 * A container of resources. This class offer helper functions to add and retrieve resources
 * child resources
*/
var Container = (function () {
    /**
     * Creates an instance of Container.
     *
     * @param {Container} [parent] (description)
     */
    function Container(parent) {
        /** @internal */
        this.data = {};
        /** @internal */
        this._name = '';
        /** @internal */
        this._cookiesData = []; // Outgoing cookies to be set
        /** @internal */
        this._cookies = []; // Received cookies unparsed
        /** @internal */
        this._resources = {};
        /** @internal */
        this._headers = {};
        this._parent = parent;
    }
    Object.defineProperty(Container.prototype, "parent", {
        /**
         * (description)
         *
         * @readonly
         * @type {Container}
         */
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "name", {
        /**
         * (description)
         *
         * @readonly
         * @type {string}
         */
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "urlName", {
        /**
         * (description)
         *
         * @readonly
         * @type {string}
         */
        get: function () {
            return internals.slugify(this.name);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * (description)
     *
     * @param {string} newName (description)
     */
    Container.prototype.setName = function (newName) {
        this._name = newName;
    };
    /**
     * Detach this resource from its parent
     * @internal
     */
    Container.prototype.detachFromParent = function () {
        this._parent = undefined;
    };
    Object.defineProperty(Container.prototype, "headers", {
        /**
         * get the headers
         *
         * @type {ResponseHeaders}
         */
        get: function () {
            return this._headers;
        },
        /**
         * Add the given headers to the one already set
         */
        set: function (h) {
            var self = this;
            _.forOwn(h, function (value, key) { return self._headers[key] = value; });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * (description)
     *
     * @param {string} cookie (description)
     */
    Container.prototype.setCookie = function (cookie) {
        this._cookiesData.push(cookie);
    };
    /**
     * (description)
     *
     * @returns {string[]} (description)
     */
    Container.prototype.getCookies = function () {
        return this._cookies;
    };
    Object.defineProperty(Container.prototype, "cookiesData", {
        /**
         * Cookies data as a string array
         *
         * @readonly
         * @type {string[]}
         */
        get: function () {
            return this._cookiesData;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * (description)
     * @internal
     */
    Container.prototype.resetOutgoingCookies = function () {
        this._cookiesData = [];
    };
    /**
     * Remove a child resource from this container
     * @internal
     *
     * @param {ResourcePlayer} child (description)
     * @returns {boolean} (description)
     */
    Container.prototype.remove = function (child) {
        var log = internals.log().child({ func: 'Container.remove' });
        var resArr = this._resources[child.name];
        if (!resArr) {
            return false;
        }
        var idx = _.indexOf(resArr, child);
        if (idx < 0) {
            return false;
        }
        resArr.splice(idx, 1);
        log.info('- %s', child.name);
        return true;
    };
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
    Container.prototype._getStepDirection = function (route) {
        var log = internals.log().child({ func: 'Container.getStepDirection' });
        var direction = new Direction();
        log.info('Follow next step on %s', JSON.stringify(route.path));
        direction.route = route.stepThrough(1);
        var childResName = direction.route.getNextStep();
        if (childResName in this._resources) {
            var idx = 0;
            if (this._resources[childResName].length > 1) {
                // Since there are more than just ONE resource maching the name
                // we check the next element in the path for the index needed to
                // locate the right resource in the array.
                if (direction.route.path[1] !== undefined) {
                    idx = parseInt(direction.route.path[1]);
                    if (isNaN(idx)) {
                        idx = 0;
                    }
                    else {
                        direction.route = direction.route.stepThrough(1);
                    }
                }
            }
            log.info('Access Resource "%s"[%d] ', childResName, idx);
            direction.resource = this.getChild(childResName, idx);
        }
        return direction;
    };
    /**
     * Returns the direction toward the resource in the given route.
     * The Direction object returned may point directly to the resource requested or
     * may point to a resource that will lead to the requested resource
     * @internal
    */
    Container.prototype._getDirection = function (route, verb) {
        if (verb === void 0) { verb = 'GET'; }
        var log = internals.log().child({ func: 'Container._getDirection' });
        log.info('%s Step into %s ', verb, route.pathname);
        var direction = this._getStepDirection(route);
        if (direction && direction.resource) {
            direction.verb = verb;
            return direction;
        }
        log.info('No Direction found', verb, route.pathname);
        return undefined;
    };
    /**
     * Return the resource matching the given path.
    */
    Container.prototype.getResource = function (pathname) {
        var route = new routing.Route(pathname);
        var direction = this._getDirection(route); // This one may return the resource directly if cached
        if (!direction) {
            return undefined;
        }
        var resource = direction.resource;
        route.path = direction.route.path;
        while (route.path.length > 1) {
            direction = resource._getStepDirection(route);
            if (direction) {
                resource = direction.resource;
                route.path = direction.route.path;
            }
            else {
                return undefined;
            }
        }
        return resource;
    };
    /**
     * Add a resource of the given type as child
     *
     * @param {Resource} newRes (description)
     */
    Container.prototype.add = function (newRes) {
        var log = internals.log().child({ func: 'Container.add' });
        /* tslint:disable */
        newRes['_version'] = site().version;
        newRes['siteName'] = site().siteName;
        /* tslint:enable */
        var resourcePlayer = new ResourcePlayer(newRes, this);
        // Add the resource player to the child resource container for this container.
        var indexName = internals.slugify(newRes.name);
        var childArray = this._resources[indexName];
        if (childArray === undefined) {
            this._resources[indexName] = [resourcePlayer];
        }
        else {
            childArray.push(resourcePlayer);
        }
        log.info('+ %s', indexName);
    };
    /**
     * Find the first resource of the given type
     *
     * @param {string} typeName (description)
     * @returns {Container} (description)
     */
    Container.prototype.getFirstMatching = function (typeName) {
        var childArray = this._resources[typeName];
        if (childArray === undefined) {
            return undefined;
        }
        return childArray[0];
    };
    /**
     * Retruieve the child of a resource with the given name
     *
     * @param {string} name (description)
     * @param {number} [idx=0] (description)
     * @returns {Container} (description)
     */
    Container.prototype.getChild = function (name, idx) {
        if (idx === void 0) { idx = 0; }
        if (this._resources[name] && this._resources[name].length > idx) {
            return this._resources[name][idx];
        }
        else {
            return undefined;
        }
    };
    /**
     * Return the number of children resources of the given type.
     *
     * @param {string} typeName (description)
     * @returns {number} (description)
     */
    Container.prototype.childTypeCount = function (typeName) {
        if (this._resources[typeName]) {
            return this._resources[typeName].length;
        }
        else {
            return 0;
        }
    };
    /**
     * Return the total number of children resources for this node.
     *
     * @returns {number} count result as number
     */
    Container.prototype.childrenCount = function () {
        var counter = 0;
        _.each(this._resources, function (arrayItem) { counter += arrayItem.length; });
        return counter;
    };
    return Container;
}());
exports.Container = Container;
/**
 * Helper class used to deliver a response from a HTTP verb function call.
 * An instance of this class is passed as argument to all verb functions
*/
var Response = (function () {
    /**
     * Creates an instance of Response.
     * @internal
     * @param {Container} resource (description)
     */
    function Response(resource) {
        this._resource = resource;
    }
    /**
     * (description)
     * @internal
     * @param {( resp : ResourceResponse ) => void} cb (description)
     */
    Response.prototype.onOk = function (cb) {
        this._onOk = cb;
    };
    /**
     * (description)
     * @internal
     * @param {( err : RxError ) => void} cb (description)
     */
    Response.prototype.onFail = function (cb) {
        this._onFail = cb;
    };
    //
    /**
     * To return a resource without error invoke this function on the response object receive in the request call
     */
    Response.prototype.ok = function () {
        var respObj = {
            cookiesData: this._resource.cookiesData,
            httpCode: 200,
            result: 'ok'
        };
        respObj.data = this._resource.data;
        respObj.headers = this._resource.headers;
        if (this._onOk) {
            this._onOk(respObj);
        }
    };
    /**
     * Call this function to redirect the caller to a different URL
     * Code 303
     *
     * @param {string} where (description)
     */
    Response.prototype.redirect = function (where) {
        var respObj = {
            cookiesData: this._resource.cookiesData,
            httpCode: 303,
            location: where,
            result: 'ok'
        };
        respObj.data = this._resource.data;
        if (this._onOk) {
            this._onOk(respObj);
        }
    };
    //
    /**
     * Call this function to return an error to the caller
     *
     * @param {RxError} err (description)
     */
    Response.prototype.fail = function (err) {
        var log = internals.log().child({ func: this._resource.name + '.fail' });
        log.info('Call failed: %s', err.message);
        if (this._onFail) {
            this._onFail(err);
        }
    };
    return Response;
}());
exports.Response = Response;
/**
 * Routing direction for a request to a resource
 * @internal
 * @export
 * @class Direction
 */
var Direction = (function () {
    function Direction() {
    }
    return Direction;
}());
exports.Direction = Direction;
/**
 * Every resource is converted to their embodiment before is sent back as a HTTP Response
 * @internal
 */
var Embodiment = (function () {
    /**
     * Builds a new Embodiment object that can be served back as a response to a HTTP request.
     */
    function Embodiment(mimeType, code, data) {
        if (code === void 0) { code = 200; }
        this.cookiesData = []; // example a cookie valie would be ["type=ninja", "language=javascript"]
        this.additionalHeaders = {};
        this.httpCode = code;
        if (data instanceof stream.Readable) {
            this.bodyStream = data;
        }
        else {
            this.bodyData = data;
        }
        this.mimeType = mimeType;
    }
    /**
     * Add a serialized cookie (toString()) to be returned as part of this embodiment
     */
    Embodiment.prototype.addSetCookie = function (cookie) {
        this.cookiesData.push(cookie);
    };
    /**
     * Add headers to this embodiment
     */
    Embodiment.prototype.setAdditionalHeaders = function (headers) {
        if (!this.additionalHeaders) {
            this.additionalHeaders = _.clone(headers);
        }
        else {
            _.merge(this.additionalHeaders, headers);
        }
    };
    /**
     * Serve this emnbodiment through the given ServerResponse
     */
    Embodiment.prototype.serve = function (response) {
        var log = internals.log().child({ func: 'Embodiment.serve' });
        var headers = { 'content-type': this.mimeType };
        if (this.bodyData) {
            headers['content-length'] = this.bodyData.length;
        }
        if (this.location) {
            /* tslint:disable */
            headers['Location'] = this.location;
        }
        // Add the additionalHeaders to the response
        _.forOwn(this.additionalHeaders, function (value, key) {
            response.setHeader(key, value);
        });
        // Add the cookies set to the header (pass the full array to allow writing multiple cookies)
        if (this.cookiesData) {
            response.setHeader('Set-Cookie', (this.cookiesData));
        }
        response.writeHead(this.httpCode, headers);
        if (this.bodyData) {
            response.write(this.bodyData);
            if (this.bodyData.length > 1024) {
                log.info('Sending %s Kb (as %s)', Math.round(this.bodyData.length / 1024), this.mimeType);
            }
            else {
                log.info('Sending %s bytes (as %s)', this.bodyData.length, this.mimeType);
            }
            response.end();
            log.info('<< REQUEST: Complete');
        }
        else if (this.bodyStream) {
            log.info('Streaming Data');
            this.bodyStream.pipe(response, { end: false });
            this.bodyStream.on('end', function () {
                response.end();
                log.info('Stream Complete');
            });
        }
        else {
            response.end();
        }
    };
    /**
     * utility: return the body of this embodiment as utf-8 encoded string
     */
    Embodiment.prototype.bodyAsString = function () {
        return this.bodyData.toString('utf-8');
    };
    /**
     * utility: return the bosy of this embodiment as a JSON object
     */
    Embodiment.prototype.bodyAsJason = function () {
        return JSON.parse(this.bodyAsString());
    };
    return Embodiment;
}());
exports.Embodiment = Embodiment;
/**
 * Root object for the application is the Site.
 * The site is in itself a Resource and is accessed via the root / in a url.
 */
var Site = (function (_super) {
    __extends(Site, _super);
    /**
     * Creates an instance of Site.
     *
     * @param {string} siteName (description)
     * @param {Container} [parent] (description)
     */
    function Site(siteName, parent) {
        _super.call(this, parent);
        // private _name: string = "site";
        /** @internal */
        this._version = version;
        /** @internal */
        this._siteName = 'site';
        /** @internal */
        this._home = '/';
        /** @internal */
        this._pathCache = {};
        /** @internal */
        this._errorView = undefined;
        /** @internal */
        this._allowCors = false;
        /** @internal */
        this._filters = {};
        /**
         * (description)
         *
         * @type {boolean}
         */
        this.enableFilters = false;
        this._siteName = siteName;
        if (Site._instance) {
            throw new Error('Error: Only one site is allowed.');
        }
        Site._instance = this;
        internals.initLog(siteName);
        if (_.find(process.argv, function (arg) { return arg === '--relaxjs-verbose'; })) {
            internals.setLogVerbose(true);
        }
    }
    /**
     * Returns the direction toward the resource in the given route.
     * The Direction object returned may point directly to the resource requested or
     * may point to a resource that will lead to the requested resource
     * @internal
    */
    Site.prototype._getDirection = function (route, verb) {
        if (verb === void 0) { verb = 'GET'; }
        var log = internals.log().child({ func: 'Site._getDirection' });
        var cachedPath = this._pathCache[route.pathname];
        if (cachedPath) {
            var direction = new Direction();
            direction.resource = cachedPath.resource;
            direction.route = route;
            direction.route.path = cachedPath.path;
            direction.verb = verb;
            log.info('%s Path Cache found for "%s"', verb, route.pathname);
            return direction;
        }
        else {
            log.info('%s Step into %s ', verb, route.pathname);
            var direction = this._getStepDirection(route);
            if (direction && direction.resource) {
                direction.verb = verb;
                return direction;
            }
        }
        log.info('No Direction found', verb, route.pathname);
        return undefined;
    };
    /**
     * (description)
     *
     * @static
     * @param {string} [name] (description)
     * @returns {Site} (description)
     */
    Site.$ = function (name) {
        if (Site._instance === undefined || name) {
            Site._instance = undefined;
            Site._instance = new Site(name ? name : 'site');
        }
        return Site._instance;
    };
    /**
     * Enable positive responses to OPTIONS Preflighted requests in CORS
     */
    Site.prototype.allowCORS = function (flag) {
        this._allowCors = flag;
    };
    Object.defineProperty(Site.prototype, "name", {
        /**
         * name of this resource (it should be 'site')
         *
         * @readonly
         * @type {string}
         */
        get: function () {
            return 'site';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Site.prototype, "version", {
        /**
         * relaxjs version
         *
         * @readonly
         * @type {string}
         */
        get: function () {
            return this._version;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Site.prototype, "siteName", {
        /**
         * name of this site
         *
         * @readonly
         * @type {string}
         */
        get: function () {
            return this._siteName;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Setup a shortcut to a specific resource. This function is used internally.
     * @internal
     * @param {string} path (description)
     * @param {{ resource : ResourcePlayer; path : string[] }} shortcut (description)
     */
    Site.prototype.setPathCache = function (path, shortcut) {
        this._pathCache[path] = shortcut;
    };
    /**
     * Override the Error output using a custom view.
     *
     * @param {string} name (description)
     */
    Site.prototype.setErrorView = function (name) {
        this._errorView = name;
    };
    /**
     * Output to response the given error following the mime type in format.
     * @internal
     * @private
     * @param {http.ServerResponse} response (description)
     * @param {RxError} error (description)
     * @param {string} format (description)
     * @returns {void} (description)
     */
    Site.prototype._outputError = function (response, error, format) {
        var self = this;
        var log = internals.log().child({ func: 'Site._outputError' });
        var mimeType = format.split(/[\s,]+/)[0];
        var errCode = error.getHttpCode ? error.getHttpCode() : 500;
        var errObj = {
            error: {
                message: error.message,
                name: error.name,
                stack: error.stack.split('\n')
            },
            result: 'error',
            version: version
        };
        switch (mimeType) {
            case 'text/html':
                if (self._errorView) {
                    log.info("Custom Error View [" + self._errorView + "]");
                    internals.viewDynamic(self._errorView, { data: { error: errObj } })
                        .then(function (reply) {
                        log.info("Error Reply " + reply);
                        reply.httpCode = errCode;
                        reply.serve(response);
                        response.end();
                    })
                        .fail(function (err) {
                        log.error("Custom Error Reply Failes " + err);
                        response.writeHead(errCode, { 'content-type': mimeType });
                        response.write('<html><body style="font-family:arial;"><h1>relaxjs: the resource request caused an error.</h1>');
                        response.write("<h2>" + error.name + "</h2><h3 style=\"color:red;\">" + _.escape(error.message) + "</h3><hr/><pre>" + _.escape(error.stack) + "</pre>");
                        response.write('<body></html>');
                        response.end();
                    });
                    return;
                }
                else {
                    response.writeHead(errCode, { 'content-type': mimeType });
                    response.write('<html><body style="font-family:arial;"><h1>relaxjs: the resource request caused an error.</h1>');
                    response.write("<h2>" + error.name + "</h2><h3 style=\"color:red;\">" + _.escape(error.message) + "</h3><hr/><pre>" + _.escape(error.stack) + "</pre>");
                    response.write('<body></html>');
                }
                break;
            case 'application/xml':
            case 'text/xml':
                var builder = new xml2js.Builder({ rootName: 'relaxjs' });
                response.writeHead(errCode, { 'content-type': mimeType });
                response.write(builder.buildObject(errObj));
                break;
            default:
                response.writeHead(errCode, { 'content-type': mimeType });
                response.write(JSON.stringify(errObj));
                break;
        }
        response.end();
    };
    /**
     * Add a request filter. The given function will be called on every request
     * before reaching any resource. All request filters must succeed for the
     * request to procees towards a resource.
     *
     * @param {string} name (description)
     * @param {RequestFilter} filterFunction (description)
     */
    Site.prototype.addRequestFilter = function (name, filterFunction) {
        var log = internals.log().child({ func: 'Site.addRequestFilter' });
        this._filters[name] = filterFunction;
        log.info('filters', _.keys(this._filters));
    };
    /**
     * Remove an existing request filter.
     *
     * @param {string} name (description)
     * @returns {boolean} (description)
     */
    Site.prototype.deleteRequestFilter = function (name) {
        if (name in this._filters) {
            delete this._filters[name];
            return true;
        }
        return false;
        // return ( _.remove( this._filters, (f) => f === filterFunction ) !== undefined );
    };
    /**
     * Delete ALL request filters associated with this site
     *
     * @returns {boolean} (description)
     */
    Site.prototype.deleteAllRequestFilters = function () {
        this._filters = {};
        return true;
    };
    /*
     * Execute all the active filters, collect their returned data and post all of them in the returned promise.
     * @internal
     * @private
     * @param {routing.Route} route (description)
     * @param {*} body (description)
     * @param {http.ServerResponse} response (description)
     * @returns {Q.Promise< FiltersData >} (description)
     */
    Site.prototype._checkFilters = function (route, body, response) {
        var self = this;
        var log = internals.log().child({ func: 'Site._checkFilters' });
        var later = Q.defer();
        if (!self.enableFilters || Object.keys(self._filters).length === 0) {
            log.info("no filters executed ");
            later.resolve({});
            return later.promise;
        }
        log.info("executing filters ");
        // All filters call are converted to promise returning functions and stored in an array
        var filtersCalls = _.map(_.values(self._filters), function (f) { return Q.nfcall(f.bind(self, route, body)); });
        // Filter the request: execute all the filters (the first failing will trigger a fail and it will
        // not waiting for the rest of the batch)
        Q.all(filtersCalls)
            .then(function (dataArr) {
            var filterData = {};
            _.each(_.keys(self._filters), function (name, i) {
                if (dataArr[i]) {
                    filterData[name] = dataArr[i];
                }
            });
            log.info("all " + dataArr.length + " filters passed ");
            later.resolve(filterData);
        })
            .fail(function (err) {
            log.warn("filters not passed " + err.message);
            later.reject(err);
        });
        return later.promise;
    };
    /**
     * Serve this site. This call creates a Server for the site and manage all the requests
     * by routing them to the appropriate resources.
     *
     * @returns {http.Server} (description)
     */
    Site.prototype.serve = function () {
        var _this = this;
        var self = this;
        var srv = http.createServer(function (msg, response) {
            // here we need to route the call to the appropriate class:
            var route = routing.fromRequestResponse(msg, response);
            var site = _this;
            var log = internals.log().child({ func: 'Site.serve' });
            _this._cookies = route.cookies; // The client code can retrieved the cookies using this.getCookies();
            log.info('>> REQUEST: %s', route.verb);
            log.info('      PATH: %s %s', route.pathname, route.query);
            log.info('Out FORMAT: %s', route.outFormat);
            log.info(' In FORMAT: %s', route.inFormat);
            var httpMethod = msg.method.toLowerCase();
            if (site[httpMethod] === undefined) {
                if (httpMethod === 'options' && _this._allowCors) {
                    var emb = new Embodiment(route.outFormat);
                    emb.setAdditionalHeaders({
                        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, DELETE'
                    });
                    emb.serve(response);
                }
                else {
                    var err = new RxError("Requst " + httpMethod + " not allowed", 'request not supported', 403);
                    self._outputError(response, err, route.outFormat);
                }
                return;
            }
            var requestData;
            // Parse the data received with this request
            internals.parseRequestData(msg, route.inFormat)
                .then(function (bodyData) {
                requestData = bodyData;
                log.info('check filters');
                return self._checkFilters(route, bodyData, response);
            })
                .then(function (allFiltersData) {
                // Execute the HTTP request
                site[httpMethod](route, requestData, allFiltersData)
                    .then(function (reply) {
                    if (self._allowCors) {
                        reply.setAdditionalHeaders({ 'Access-Control-Allow-Origin': '*' });
                    }
                    reply.serve(response);
                })
                    .fail(function (error) {
                    if (error.httpCode >= 300) {
                        log.error("HTTP " + msg.method + " failed : " + error.httpCode + " : " + error.name + " - " + error.message);
                    }
                    self._outputError(response, error, route.outFormat);
                })
                    .done();
            })
                .fail(function (error) {
                if (error.httpCode >= 300) {
                    log.error("HTTP " + msg.method + " failed : " + error.httpCode + " : " + error.name + " - " + error.message);
                }
                self._outputError(response, error, route.outFormat);
            });
        }); // End http.createServer()
        return srv;
    };
    /**
     * Set the Home resource for this site by giving its path
     *
     * @param {string} path (description)
     */
    Site.prototype.setHome = function (path) {
        this._home = path;
    };
    /**
     * Set the given path as location for temporary files produced by POST and PUT operations
     *
     * @param {string} path (description)
     */
    Site.prototype.setTempDirectory = function (path) {
        this._tempDir = path;
        internals.setMultipartDataTempDir(path);
    };
    // HTTP Verb functions --------------------
    /**
     * HTTP verb HEAD response functiion. Analyze the give route and redirect the call to the appropriate
     * child resource if available.
     * @internal
     */
    Site.prototype.head = function (route, body, filterData) {
        if (filterData === void 0) { filterData = {}; }
        var self = this;
        var log = internals.log().child({ func: 'Site.head' });
        log.info('route: %s', route.pathname);
        if (route.path.length > 1) {
            var direction = self._getDirection(route, 'HEAD');
            if (!direction) {
                return internals.promiseError(internals.format('Resource not found or invalid in request "{0}"', route.pathname), route.pathname, 404);
            }
            route.path = direction.route.path;
            var res = (direction.resource);
            return res.head(route, filterData);
        }
        if (self._home === '/') {
            return internals.viewDynamic(self.name, this);
        }
        else {
            log.info('HEAD is redirecting to "%s"', self._home);
            return internals.redirect(self._home);
        }
    };
    /**
     * HTTP verb GET response functiion. Analyze the give route and redirect the call to the appropriate
     * child resource if available.
     * @internal
     */
    Site.prototype.get = function (route, body, filterData) {
        if (filterData === void 0) { filterData = {}; }
        var self = this;
        var log = internals.log().child({ func: 'Site.get' });
        log.info('route: %s', route.pathname);
        if (route.static) {
            return internals.viewStatic(decodeURI(route.pathname), route.headers);
        }
        if (route.path.length > 1) {
            var direction = self._getDirection(route, 'GET');
            if (direction === undefined) {
                return internals.promiseError(internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname), route.pathname, 404);
            }
            route.path = direction.route.path;
            var res = (direction.resource);
            return res.get(route, filterData);
        }
        if (route.path[0] === 'site' && self._home === '/') {
            return internals.viewDynamic(self.name, this);
        }
        if (self._home !== '/') {
            log.info('GET is redirecting to home "%s"', self._home);
            return internals.redirect(self._home);
        }
        return internals.promiseError(internals.format('[error] Root Resource not found or invalid in request "{0}"', route.pathname), route.pathname, 404);
    };
    /**
     * HTTP verb POST response functiion. Analyze the give route and redirect the call to the appropriate
     * child resource if available.
     * @internal
     */
    Site.prototype.post = function (route, body, filterData) {
        if (filterData === void 0) { filterData = {}; }
        var self = this;
        var log = internals.log().child({ func: 'Site.post' });
        if (route.path.length > 1) {
            var direction = self._getDirection(route, 'POST');
            if (!direction) {
                return internals.promiseError(internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname), route.pathname);
            }
            var res = (direction.resource);
            log.info('POST on resource "%s"', res.name);
            route.path = direction.route.path;
            return res.post(direction.route, body, filterData);
        }
        return internals.promiseError(internals.format('[error] Invalid in request "{0}"', route.pathname), route.pathname, 404);
    };
    /**
     * HTTP verb PATCH response functiion. Analyze the give route and redirect the call to the appropriate
     * child resource if available.
     * @internal
     */
    Site.prototype.patch = function (route, body, filterData) {
        if (filterData === void 0) { filterData = {}; }
        var self = this;
        var log = internals.log().child({ func: 'Site.patch' });
        if (route.path.length > 1) {
            var direction = self._getDirection(route, 'PATCH');
            if (!direction) {
                return internals.promiseError(internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname), route.pathname, 404);
            }
            var res = (direction.resource);
            log.info('PATCH on resource "%s"', res.name);
            route.path = direction.route.path;
            return res.patch(direction.route, body, filterData);
        }
        return internals.promiseError(internals.format('[error] Invalid in request "{0}"', route.pathname), route.pathname, 404);
    };
    /**
     * HTTP verb PUT response functiion. Analyze the give route and redirect the call to the appropriate
     * child resource if available.
     * @internal
     */
    Site.prototype.put = function (route, body, filterData) {
        if (filterData === void 0) { filterData = {}; }
        var log = internals.log().child({ func: 'Site.put' });
        var self = this;
        if (route.path.length > 1) {
            var direction = self._getDirection(route, 'PUT');
            if (!direction) {
                return internals.promiseError(internals.format('[error] Resource not found or invalid in request "{0}"', route.pathname), route.pathname, 404);
            }
            var res = (direction.resource);
            log.info('PUT on resource "%s"', res.name);
            route.path = direction.route.path;
            return res.put(direction.route, body, filterData);
        }
        return internals.promiseError(internals.format('[error] Invalid PUT request "{0}"', route.pathname), route.pathname, 404);
    };
    /**
     * HTTP verb DELETE response functiion. Analyze the give route and redirect the call to the appropriate
     * child resource if available.
     * @internal
     */
    Site.prototype.delete = function (route, body, filterData) {
        if (filterData === void 0) { filterData = {}; }
        var self = this;
        var ctx = "[" + this.name + ".delete] ";
        if (route.static) {
            return internals.promiseError('DELETE not supported on static resources', route.pathname);
        }
        if (route.path.length > 1) {
            var direction = self._getDirection(route, 'DELETE');
            if (!direction) {
                return internals.promiseError(internals.format('{0} [error] Resource not found or invalid in request "{1}"', ctx, route.pathname), route.pathname, 404);
            }
            var res = (direction.resource);
            internals.log().info('%s "%s"', ctx, res.name);
            route.path = direction.route.path;
            return res.delete(direction.route, filterData);
        }
        return internals.promiseError(internals.format('[error] Invalid DELETE request "{0}"', route.pathname), route.pathname, 404);
    };
    /** @internal */
    Site._instance = undefined;
    return Site;
}(Container));
exports.Site = Site;
/**
 * ResourcePlayer absorbs a user defined resource and execute the HTTP requests.
 * The player dispatch requests to the childres resources or invoke user defined
 * response function for each verb.
 * @internal
 */
var ResourcePlayer = (function (_super) {
    __extends(ResourcePlayer, _super);
    // public data = {};
    /**
     * Build a active resource by providing a Resource data object
     */
    function ResourcePlayer(res, parent) {
        _super.call(this, parent);
        // private _site: Site;
        this._template = '';
        this._parameters = {};
        this.filtersData = {};
        var self = this;
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
        // Add children resources if available
        if (res.resources) {
            _.each(res.resources, function (child, index) {
                self.add(child);
            });
        }
        // Merge the data into this object to easy access in the view.
        self._updateData(res.data);
    }
    /**
     *
     */
    ResourcePlayer.prototype.setOutputFormat = function (fmt) {
        this._outFormat = fmt;
    };
    Object.defineProperty(ResourcePlayer.prototype, "outFormat", {
        set: function (f) {
            this._outFormat = f;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ResourcePlayer.prototype, "resources", {
        get: function () {
            return this._resources;
        },
        enumerable: true,
        configurable: true
    });
    /*
     * Reads the parameters from a route and store them in the this._parmaters member.
     * Return the number of paramters correcly parsed.
    */
    ResourcePlayer.prototype._readParameters = function (path, generateError) {
        var _this = this;
        if (generateError === void 0) { generateError = true; }
        var log = internals.log().child({ func: this.name + '._readParameters' });
        var counter = 0;
        _.each(this._paramterNames, function (parameterName, idx /*, list*/) {
            if (!path[idx + 1]) {
                if (generateError) {
                    log.error('Could not read all the required paramters from URI. Read %d, needed %d', counter, _this._paramterNames.length);
                }
                return counter; // breaks out of the each loop.
            }
            _this._parameters[parameterName] = path[idx + 1];
            counter++;
        });
        log.info('Read %d parameters from request URL: %s', counter, JSON.stringify(this._parameters));
        return counter;
    };
    /*
     * Reset the data property for this object and copy all the
     * elements from the given parameter into it.
     */
    ResourcePlayer.prototype._updateData = function (newData) {
        var self = this;
        self.data = {};
        _.each(newData, function (value, attrname) {
            if (attrname !== 'resources') {
                self.data[attrname] = value;
            }
        });
    };
    /*
     * Delivers a reply as Embodiment of the given response through the given promise and
     * in the given outFormat
    */
    ResourcePlayer.prototype._deliverReply = function (later, resResponse, outFormat, deliverAnyFormat) {
        if (deliverAnyFormat === void 0) { deliverAnyFormat = false; }
        var self = this;
        var log = internals.log().child({ func: 'ResourcePlayer(' + self.name + ')._deliverReply' });
        // Force application/json out format for redirect responses
        if (resResponse.httpCode === 303 || resResponse.httpCode === 307) {
            outFormat = 'application/json';
        }
        var mimeTypes = outFormat ? outFormat.split(/[\s,;]+/) : ['application/json'];
        log.info('Formats: %s', JSON.stringify(mimeTypes));
        // Use the template for GET html requests
        if (self._template &&
            (mimeTypes.indexOf('text/html') !== -1 || mimeTypes.indexOf('*/*') !== -1)) {
            // Here we copy the data into the resource itself and process it through the viewing engine.
            // This allow the code in the view to act in the context of the resourcePlayer.
            self.data = resResponse.data;
            internals.viewDynamic(self._template, self, self._layout)
                .then(function (reply) {
                reply.httpCode = resResponse.httpCode ? resResponse.httpCode : 200;
                reply.location = resResponse.location;
                reply.cookiesData = resResponse.cookiesData;
                reply.additionalHeaders = self.headers;
                later.resolve(reply);
            })
                .fail(function (err) {
                later.reject(err);
            });
        }
        else {
            var mimeType = undefined;
            // This is orrible, it should be improved in version 0.1.3
            if (mimeTypes.indexOf('*/*') !== -1) {
                mimeType = 'application/json';
            }
            if (mimeTypes.indexOf('application/json') !== -1) {
                mimeType = 'application/json';
            }
            if (mimeTypes.indexOf('application/xml') !== -1) {
                mimeType = 'application/xml';
            }
            if (mimeTypes.indexOf('text/xml') !== -1) {
                mimeType = 'text/xml';
            }
            if (mimeTypes.indexOf('application/xhtml+xml') !== -1) {
                mimeType = 'application/xml';
            }
            if (mimeTypes.indexOf('application/x-www-form-urlencoded') !== -1) {
                mimeType = 'text/xml';
            }
            if (mimeType) {
                internals.createEmbodiment(resResponse.data, mimeType)
                    .then(function (reply) {
                    reply.httpCode = resResponse.httpCode ? resResponse.httpCode : 200;
                    reply.location = resResponse.location;
                    reply.cookiesData = resResponse.cookiesData;
                    reply.additionalHeaders = resResponse.headers;
                    later.resolve(reply);
                })
                    .fail(function (err) {
                    later.reject(err);
                });
            }
            else {
                if (deliverAnyFormat) {
                    log.info("Deliver anyformat: " + outFormat);
                    var reply = new Embodiment(outFormat, 200, resResponse.data);
                    reply.cookiesData = resResponse.cookiesData;
                    reply.additionalHeaders = resResponse.headers;
                    later.resolve(reply);
                }
                else {
                    later.reject(new RxError('output as (' + outFormat + ') is not available for this resource', 'Unsupported Media Type', 415)); // 415 Unsupported Media Type
                }
            }
        }
    };
    // -------------------- HTTP VERB FUNCIONS -------------------------------------
    /**
     * Resource Player HEAD. Get the response as for a GET request, but without the response body.
     */
    ResourcePlayer.prototype.head = function (route, filtersData) {
        var later = Q.defer();
        this.resetOutgoingCookies();
        _.defer(function () { later.reject(new RxError('Not Implemented')); });
        return later.promise;
    };
    /**
     * HttpPlayer GET. Analyze the route and redirect the call to a child resource or
     * will call the onGet() for the this resource.
     */
    ResourcePlayer.prototype.get = function (route, filtersData) {
        var self = this; // use to consistently access this object.
        var log = internals.log().child({ func: 'ResourcePlayer(' + self.name + ').get' });
        var paramCount = self._paramterNames.length;
        var later = Q.defer();
        this.resetOutgoingCookies();
        // Dives in and navigates through the path to find the child resource that can answer this GET call
        if (route.path.length > (1 + paramCount)) {
            var direction = self._getStepDirection(route);
            if (direction.resource) {
                var res = (direction.resource);
                return res.get(direction.route, filtersData);
            }
            else {
                if (_.keys(self._resources).length === 0) {
                    return internals.promiseError(internals.format('[error: no child] This resource "{0}" does not have any child resource to navigate to. Path= "{1}"', self.name, JSON.stringify(route.path)), route.pathname);
                }
                else {
                    return internals.promiseError(internals.format('[error: no such child] ResourcePlayer GET could not find a Resource for "{0}"', JSON.stringify(route.path)), route.pathname);
                }
            }
        }
        // 2 - Read the parameters from the route
        log.info('GET Target Found : %s (requires %d parameters)', self.name, paramCount);
        if (paramCount > 0) {
            if (self._readParameters(route.path) < paramCount) {
                later.reject(new RxError('Not enough paramters available in the URI ', 'GET ' + self.name, 404));
                return later.promise;
            }
        }
        // Set the cach to invoke this resource for this path directly next time
        site().setPathCache(route.pathname, { path: route.path, resource: this });
        // This is the resource that need to answer either with a onGet or directly with data
        // var dyndata: any = {};
        // If the onGet() is defined use id to get dynamic data from the user defined resource.
        if (self._onGet) {
            log.info('Invoking GET on %s (%s)', self.name, route.outFormat);
            this.filtersData = filtersData;
            this._headers = route.headers;
            this._cookies = route.cookies; // The client code can retrieved the cookies using this.getCookies();
            var response = new Response(self);
            response.onOk(function (resresp) {
                self._updateData(resresp.data);
                self._deliverReply(later, resresp, self._outFormat ? self._outFormat : route.outFormat, self._outFormat !== undefined);
            });
            response.onFail(function (rxErr) { return later.reject(rxErr); });
            try {
                self._onGet(route.query, response);
            }
            catch (error) {
                later.reject(error);
            }
            return later.promise;
        }
        // 4 - Perform the default GET that is: deliver the data associated with this resource
        log.info('Returning static data from %s', self.name);
        var responseObj = {
            data: self.data,
            httpCode: 200,
            result: 'ok'
        };
        self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat);
        return later.promise;
    };
    /**
     * HttpPlayer DELETE. Analyze the route and redirect the call to a child resource or
     * will call the onGet() for the this resource.
     */
    ResourcePlayer.prototype.delete = function (route, filtersData) {
        var self = this; // use to consistently access this object.
        var log = internals.log().child({ func: 'ResourcePlayer(' + self.name + ').delete' });
        var paramCount = self._paramterNames.length;
        var later = Q.defer();
        this.resetOutgoingCookies();
        // 1 - Dives in and navigates through the path to find the child resource that can answer this DELETE call
        if (route.path.length > (1 + paramCount)) {
            var direction = self._getStepDirection(route);
            if (direction) {
                var res = (direction.resource);
                log.info('DELETE on resource "%s"', res.name);
                return res.delete(direction.route, filtersData);
            }
            else {
                return internals.promiseError(internals.format('[error] Resource not found "{0}"', route.pathname), route.pathname);
            }
        }
        // 2 - Read the parameters from the route
        log.info('DELETE Target Found : %s (requires %d parameters)', self.name, paramCount);
        if (paramCount > 0) {
            if (self._readParameters(route.path) < paramCount) {
                later.reject(new RxError('Not enough paramters available in the URI ', 'DELETE ' + self.name, 404));
                return later.promise;
            }
        }
        // If the onDelete() is defined use it to invoke a user define delete.
        if (self._onDelete) {
            log.info('call onDelete() for %s', self.name);
            this._headers = route.headers;
            this._cookies = route.cookies; // The client code can retrieved the cookies using this.getCookies();
            this.filtersData = filtersData;
            var response = new Response(self);
            response.onOk(function (resresp) {
                self._updateData(resresp.data);
                self._deliverReply(later, resresp, self._outFormat ? self._outFormat : route.outFormat);
            });
            response.onFail(function (rxErr) { return later.reject(rxErr); });
            try {
                this._onDelete(route.query, response);
            }
            catch (err) {
                later.reject(err);
            }
            return later.promise;
        }
        // 4 - Perform the default DELETE that is: delete this resource
        log.info('Default Delete: Removing resource %s', self.name);
        self.parent.remove(self);
        self.detachFromParent();
        var responseObj = {
            data: self.data,
            httpCode: 200,
            result: 'ok',
        };
        self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat);
        return later.promise;
    };
    /**
     * HttpPlayer POS. Analyze the route and redirect the call to a child resource or
     * will call the onPost() for the this resource.
     * The default action is to create a new subordinate of the web resource identified by the URI.
     * The body sent to a post must contain the resource name to be created.
     */
    ResourcePlayer.prototype.post = function (route, body, filtersData) {
        var self = this; // use to consistently access this object.
        var log = internals.log().child({ func: 'ResourcePlayer(' + self.name + ').post' });
        var paramCount = self._paramterNames.length;
        var later = Q.defer();
        this.resetOutgoingCookies();
        // Dives in and navigates through the path to find the child resource that can answer this POST call
        if (route.path.length > (1 + paramCount)) {
            var direction = self._getStepDirection(route);
            if (direction) {
                var res = (direction.resource);
                log.info('POST on resource "%s"', res.name);
                return res.post(direction.route, body, filtersData);
            }
            else {
                return internals.promiseError(internals.format('[error] Resource not found "{0}"', route.pathname), route.pathname);
            }
        }
        // 2 - Read the parameters from the route
        log.info('POST Target Found : %s (requires %d parameters)', self.name, paramCount);
        if (paramCount > 0) {
            // In a POST not finding all the paramters expeceted should not fail the call.
            self._readParameters(route.path, false);
        }
        // Call the onPost() for this resource (user code)
        if (self._onPost) {
            log.info('calling onPost() for %s', self.name);
            this.filtersData = filtersData;
            this._headers = route.headers;
            this._cookies = route.cookies; // The client code can retrieved the cookies using this.getCookies();
            var response = new Response(self);
            response.onOk(function (resresp) {
                self._deliverReply(later, resresp, self._outFormat ? self._outFormat : route.outFormat);
            });
            response.onFail(function (rxErr) { return later.reject(rxErr); });
            try {
                self._onPost(route.query, body, response);
            }
            catch (err) {
                later.reject(new RxError(err));
            }
            return later.promise;
        }
        // 4 - Perform the default POST that is: set the data directly
        log.info('Adding data for %s', self.name);
        self._updateData(body);
        var responseObj = {
            data: self.data,
            httpCode: 200,
            result: 'ok',
        };
        self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat);
        return later.promise;
    };
    /**
     * HttpPlayer POS. Analyze the route and redirect the call to a child resource or
     * will call the onPost() for the this resource.
     * The default action is to apply partial modifications to a resource (as identified in the URI).
     */
    ResourcePlayer.prototype.patch = function (route, body, filtersData) {
        var self = this; // use to consistently access this object.
        var log = internals.log().child({ func: 'ResourcePlayer(' + self.name + ').patch' });
        var paramCount = self._paramterNames.length;
        var later = Q.defer();
        this.resetOutgoingCookies();
        // 1 - Dives in and navigates through the path to find the child resource that can answer this POST call
        if (route.path.length > (1 + paramCount)) {
            var direction = self._getStepDirection(route);
            if (direction) {
                var res = (direction.resource);
                log.info('PATCH on resource "%s"', res.name);
                return res.patch(direction.route, body, filtersData);
            }
            else {
                return internals.promiseError(internals.format('[error] Resource not found "{0}"', route.pathname), route.pathname);
            }
        }
        // 2 - Read the parameters from the route
        log.info('PATCH Target Found : %s (requires %d parameters)', self.name, paramCount);
        if (paramCount > 0) {
            if (self._readParameters(route.path) < paramCount) {
                later.reject(new RxError('Not enough paramters available in the URI ', 'PATCH ' + self.name, 404));
                return later.promise;
            }
        }
        // 3 - call the resource defined function to respond to a PATCH request
        if (self._onPatch) {
            log.info('calling onPatch() for %s', self.name);
            this.filtersData = filtersData;
            this._headers = route.headers;
            this._cookies = route.cookies; // The client code can retrieved the cookies using this.getCookies();
            var response = new Response(self);
            response.onOk(function (resresp) {
                self._updateData(resresp.data);
                self._deliverReply(later, resresp, self._outFormat ? self._outFormat : route.outFormat);
            });
            response.onFail(function (rxErr) { return later.reject(rxErr); });
            try {
                self._onPatch(route.query, body, response);
            }
            catch (err) {
                later.reject(new RxError(err));
            }
            return later.promise;
        }
        // 4 - Perform the default PATH that is set the data directly
        log.info('Updating data for %s', self.name);
        self._updateData(body);
        var responseObj = {
            data: self.data,
            httpCode: 200,
            result: 'ok',
        };
        self._deliverReply(later, responseObj, self._outFormat ? self._outFormat : route.outFormat);
        return later.promise;
    };
    /*
     * HttpPlayer PUT
     * Asks that the enclosed entity be stored under the supplied URI.
     * The body sent to a post does not contain the resource name to be stored since that name is the URI.
    */
    ResourcePlayer.prototype.put = function (route, body, filtersData) {
        // const self = this; // use to consistently access this object.
        // const log = internals.log().child( { func : 'ResourcePlayer(' +self.name+ ').put'} );
        var later = Q.defer();
        this.resetOutgoingCookies();
        _.defer(function () { later.reject(new RxError('Not Implemented')); });
        return later.promise;
    };
    ResourcePlayer.version = version;
    return ResourcePlayer;
}(Container));
exports.ResourcePlayer = ResourcePlayer;
/**
 * (description)
 *
 * @export
 * @param {string} [name] (description)
 * @returns {Site} (description)
 */
function site(name) {
    return Site.$(name);
}
exports.site = site;

//# sourceMappingURL=relaxjs.js.map

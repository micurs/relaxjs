# relaxjs
Welcome to repo for the relaxjs node framework.

## Introduction

To install the framework use npm:
```
npm install relaxjs
```

You can use relaxjs directly in your Javascript code as well as in your TypeScript projects.

The following are two basic examples on how to use relaxjs. These are just very basic examples.
I am writing more samples that shows how to use every aspect of relaxjs in this [repo](https://github.com/micurs/relaxjs-examples)

### Basci use in Javascript

The main element of a server created with relaxjs is the resource.
We add a resource to a site and we give it some data.

```
// hello_relaxjs.js
var r = require('relaxjs');

var site = r.site('simpleSite');

site.add( {
  name: 'hello',
  outFormat: 'application/json',
  data: { message: "Hello relaxjs !" }
});
site.setHome('/hello');
site.serve().listen(9000);
```

Then start you server:

```
node hello_relaxjs.js
```

### Typescript

The Typescript version of the same example would look like this:

```
// hello_relaxjs.ts
import r = require('relaxjs');

var site = r.site('simpleSite');

site.add( {
  name: 'hello',
  outFormat: 'application/json',
  data: { message: "Hello relaxjs !" }
});
site.setHome('/hello');
site.serve().listen(9000);
```

With Typescript you need to compile the file and generate the Javascript file:

```
tsc -m commonjs -t es5 hello_relaxjs.ts
```

Then start you server:

```
node hello_relaxjs.js
```

# Main Concepts

So relaxjs is a simple node framework for building true RESTful web server apps.
The core elements of a relaxjs application are:

* the site
* its resources

The site listens to HTTP requests and direct them to the resources according to their hirearchical location within the site.
The resource represent a unit accessible through a specific URI through one of the accepted HTTP verbs: GET, POST, PUT, PATCH and DELETE.

In addition you can add filter to a site to analyze any HTTP request before it reaches a resource and either stop these requests or add data to be pass to the resource themselves.

All the code for your web service resides inside the resources.

Some of the major features include:

* Allows to define response functions inside a resource to respond to HTTP request (onGet, onPost, onDelete and onPatch)
* Eecources can be nested inside other resources.
* Resource response functions can set headers and defines the mime types of their responses.
* Allows to define filters functions that are called before requests reach any resources
* Support CORS protocol to build server REST application that can be called by other sites.
* Support html views compiled by [lodash template](https://lodash.com/docs#template) function.

For examples on each one these feature visit [relaxjs-examples repo](https://github.com/micurs/relaxjs-examples).

License: MIT






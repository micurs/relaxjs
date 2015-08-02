# relaxjs
Welcome to repo for the relaxjs node framework.

## Introduction

To install the framework use npm:
```
npm install relaxjs
```

You can use relaxjs directly in your Javascript code as well as in your TypeScript project.

### Javascript

relaxjs is written in Typescript, but the distribution files are in plain Javascript ES5 code.
So you can use the framework in Javascript with ease:

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

relaxjs is a simple node framework for building truly RESTful web applications in Javascript (or Typescript) using node.js.
The core elements of a relaxjs application are:

* the site 
* its resources

The site listens to HTTP requests and direct them to the resources according to their hirearchical location within the site.
The resource represent a unit accessible through a specific URI through one of the accepted HTTP verbs: GET, POST, PUT, PATCH and DELETE.

In addition you can add filter to a site to analyze any HTTP request before it reaches a resource and either stop these requests or add data to be pass to the resource themselves.

All the code for your web service resides inside the resources.
 



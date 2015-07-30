
var relaxjs = require('../dist/relaxjs.js');
var routing = require('../dist/routing.js');
var rxerror = require('../dist/rxerror.js');

var running = true;

console.log('Start test');

var result;
var site = relaxjs.site('test');
site.add( {
  name: 'parent',
  resources: [{
    name: 'child',
    /* outFormat: 'application/json', */
    data: { message: 'this resource will be deleted', someInfo: [ { nome: 'primo'}, { nome:'secondo'}]}
  }]
});
site.get( new routing.Route('/parent/child', 'text/xml') )
.then( function(emb){
  result = emb.bodyAsString();
  console.log(result);
})
.fail( function (error) {
  result = error;
  console.log(result);
});

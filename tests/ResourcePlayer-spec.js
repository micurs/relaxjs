// ResourcePlayer-spec.js

var relaxjs = require('../dist/relaxjs.js');
var routing = require('../dist/routing.js');

/*
 * GET Tests
*/
/**/
describe('Test GET responses: ', function() {

  describe('1.1 GET static data from a Resource: hello', function() {
    it('should get {"message":"Hello World!"}', function( done ) {
      var result;
      var rp = new relaxjs.ResourcePlayer( { name: 'hello', data: { message: "Hello World!" } });
      rp.get( new routing.Route('hello') )
      .then( function(emb) {
        result = emb.bodyAsString();
        expect( result ).toBeDefined();
        expect( result ).toBe('{"message":"Hello World!"}');
        done();
      })
      .fail( function (error) {
        done(error);
      });
      // waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      // runs( function() {
      // });
    }, 1000);
  });


  describe('1.2 GET dynamic data from a Resource: test', function() {
    it('should get {"message":"Hello World!"}', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'test',
        onGet : function( query, response ) {
          this.data = { message: "Hello World!" };
          response.ok();
        },
        data: { message: "This is now Hello World!" } });
      rp.get( new routing.Route('test') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error);  } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('{"message":"Hello World!"}' );
      });
    });
  });


  describe('1.3 GET static data from a child Resource: hello/world', function() {
    it('should get {"message":"Hello World!"}', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'hello',
        resources: [ {
          name: 'world',
          data: { message: "Hello World!" }
        }]
      });
      rp.get( new routing.Route('hello/world') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error);  } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('{"message":"Hello World!"}');
      });
    });
  });


  describe('1.4 GET dynamic data from a child Resource using a URL parameter: parent/child/1', function() {
    it('should return {"items":["second-item"]}', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'parent',
        resources: [{
          name: 'child',
          urlParameters: [ 'idx' ],
          data: { items : [ 'first-item', 'second-item', 'third-item' ] },
          onGet : function( query, response ) {
            var idx = this._parameters.idx;
            this.data = { items: [ this.data.items[idx] ] };
            response.ok();
          }
        }]
      });
      rp.get( new routing.Route('parent/child/1') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error);  } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('{"items":["second-item"]}');
      });
    });
  });

  // ---

  describe('1.5 GET satatic data from a resource through a site: /hello', function() {
    it('should get {"message":"Hello World!"}', function() {
      var result;
      var site = relaxjs.site('test');
      site.add({ name: 'hello', data: { message: "Hello World!" } } );
      site.get( new routing.Route('/hello') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error);  } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('{"message":"Hello World!"}');
      });
    });
  });


  describe('1.6 GET dynamic data from a Resource through a site: /hello', function() {
    it('should get {"message":"Hello World!"}', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'hello',
        onGet : function( query, response ) {
          this.data = { message: "Hello World!" };
          response.ok();
        },
        data: { message: "This is now Hello World!" }
      });
      site.get( new routing.Route('/hello') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error); } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('{"message":"Hello World!"}' );
      });
    });
  });


  describe('1.7 GET static data from a child Resource through a site: /hello/world', function() {
    it('should get {"message":"Hello World!"}', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'hello',
        resources: [ {
          name: 'world',
          data: { message: "Hello World!" },
        }]
      });
      site.get( new routing.Route('/hello/world') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error); } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result).toBe('{"message":"Hello World!"}');
      });
    });
  });


  describe('1.8 GET dynamic data from a child Resource using a URL parameter: /parent/child/1', function() {
    it('should return {"items":["second-item"]}', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'parent',
        resources: [{
          name: 'child',
          urlParameters: [ 'idx' ],
          data: { items : [ 'first-item', 'second-item', 'third-item' ] },
          onGet : function( query, response ) {
            var idx = this._parameters.idx;
            this.data = { items: [ this.data.items[idx] ] };
            response.ok();
          }
        }]
      });
      site.get( new routing.Route('/parent/child/1') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error); } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('{"items":["second-item"]}');
      });
    });
  });

  describe('1.9 GET static data from a Resource: hello as XML', function() {
    it('should get <resource><message>Hello World!</message></resource>', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'hello',
        outFormat: 'text/xml',
        data: { message: "Hello World!" }
      });
      rp.get( new routing.Route('hello') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error);  } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('<resource><message>Hello World!</message></resource>');
      });
    });
  });

  describe('1.10 GET dynamic data from a Resource: test as XML', function() {
    it('should get <resource><message>This is XML</message></resource>', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'test',
        outFormat: 'text/xml',
        onGet : function( query, response ) {
          this.data = { message: "This is XML" };
          response.ok();
        },
        data: { message: "This is now Hello World!" } });
      rp.get( new routing.Route('test') )
        .then( function(emb) { result = emb.bodyAsString(); })
        .fail( function (error) { result = JSON.stringify(error);  } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( result ).toBe('<resource><message>This is XML</message></resource>' );
      });
    });
  });

})
/**/

/**/
describe('Test POST responses: ', function() {

  describe('2.1 POST JSON data to a Resource with no onPost() function', function() {
    it('should add the data as member of the resource', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'test',
        data: { }
      });
      var postData = { message: 'Hello World!' };
      rp.post(new routing.Route('test'),postData )
        .then( function(emb) { result = emb; } )
        .fail( function (error) { result = error; } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( rp.data ).toEqual( { message:"Hello World!"} );
      });
    });
  });


  describe('2.2 POST JSON data to a Resource with onPost() function', function() {
    it('should add the data under the postData new member of the resource', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'test',
        onPost: function(query , data , respond ) {
          this.data = { message: 'data has been posted', postData: data };
          respond.ok();
        }
      });
      var postData = { posted: 'Hello World!' };
      rp.post(new routing.Route('test'),postData )
        .then( function(emb){ result = emb; } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!==undefined } , 'Waited to long for the POST call to be completed.', 1000 );
      runs( function() {
        console.log(result.bodyAsJason());
        expect( result ).toBeDefined();
        expect( result.bodyAsJason() ).toEqual(  { message: 'data has been posted', postData: { posted: 'Hello World!' } } );
        expect( rp.data ).toEqual({ message: 'data has been posted', postData: { posted: 'Hello World!' } } );
      });

    });
  });


  describe('2.3 POST JSON data to a child Resource with no onPost() function', function() {
    it('should add the data as member of the resource', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'hello',
        resources: [{
          name: 'world',
          data: { }
        }]
      });
      var postData = { message: 'Hello World!' };
      rp.post(new routing.Route('hello/world'),postData )
        .then( function(emb){ result = emb; } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( rp.getChild('world').data ).toEqual( { message:"Hello World!"} );
      });
    });
  });

  // ---

  describe('2.4 POST JSON data to a Resource with no onPost() function through a site', function() {
    it('should add the data as member of the resource', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'test',
        data: { }
      });
      site.post(new routing.Route('/test'), { message: 'Hello World!' } )
        .then( function(emb){ result = emb; } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( site._resources['test'][0].data ).toEqual( { message:"Hello World!"} );
      });
    });
  });


  describe('2.5 POST JSON data to a Resource with onPost() function through a site', function() {
    it('should add the data under the postData new member of the resource', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'test',
        onPost: function(query , data , respond ) {
          this.data = { message: "data has been posted", postData: data };
          respond.ok();
        }
      });
      var postData = { message: 'Hello World!' };
      site.post(new routing.Route('/test'),postData )
        .then( function(emb){ result = emb; } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
      runs( function() {
        // console.log('==== Result');
        expect( result ).toBeDefined();
        expect( site._resources['test'][0].data ).toEqual( { message:"data has been posted", postData: { message: 'Hello World!' } } );
        expect( result.bodyAsJason().data,  { message:"data has been posted", postData: { message: 'Hello World!' } } );
      });

    });
  });


});
/**/

/**/
describe('Test DELETE responses', function() {

  describe('3.1 DELETE a static child Resource', function() {
    it('should remove the resource from its parent', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'parent',
        resources: [{
          name: 'child',
          data: { message: 'this resource will be deleted'}
        }]
      });
      rp.delete(new routing.Route('parent/child') )
        .then( function(emb){ result = emb.bodyAsJason(); } )
        .fail( function (error) { result = error } );


      waitsFor( function() { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( rp.getChild('child') ).toBeUndefined();
        expect( result ).toEqual( { message: 'this resource will be deleted'} );
      });
    });
  });


  describe('3.2 DELETE a dynamic Resource data item', function() {
    it('should remove the item "second-item" from the resource data', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'parent',
        resources: [{
          name: 'child',
          data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
          onDelete: function(query, respond ) {
            var idx = query['idx'];
            this.data.testArray.splice(idx,1);
            respond.ok();
          }
        }]
      });
      rp.delete(new routing.Route('parent/child?idx=1') )
        .then( function(emb){ result = emb.bodyAsJason(); } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
      runs( function() {
        //var res = JSON.parse(result);
        expect( result ).toBeDefined();
        expect( result.testArray ).toBeDefined();
        expect( result.testArray ).not.toContain( 'second-item' );
      });
    });
  });


  describe('3.3 DELETE part of data using url parameters', function() {
    it('should remove the item "second-item" from its data using URL paramter 1', function() {
      var result;
      var rp = new relaxjs.ResourcePlayer( {
        name: 'container',
        resources: [{
          name: 'data-res',
          urlParameters: [ 'idx' ],
          data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
          onDelete: function( query, respond ) {
            var idx = parseInt( this._parameters.idx );
            this.data.testArray.splice(idx,1);
            respond.ok();
          }
        }]
      });
      rp.delete(new routing.Route('container/data-res/1') )
        .then( function(emb){ result = emb.bodyAsJason(); } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
      runs( function() {
        console.log(result);
        expect( result ).toBeDefined();
        expect( result.testArray ).toBeDefined();
        expect( result.testArray ).not.toContain( 'second-item' );
      });

    });
  });

  // ---

  describe('3.4 DELETE a static child Resource through a site', function() {
    it('should remove the resource from its parent', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'parent',
        resources: [{
          name: 'child',
          data: { message: 'this resource will be deleted'}
        }]
      });
      site.delete( new routing.Route('/parent/child') )
        .then( function(emb){ result = emb.bodyAsJason(); } )
        .fail( function (error) { result = error } );


      waitsFor( function() { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
      runs( function() {
        expect( result ).toBeDefined();
        expect( site.getResource('/parent/child') ).toBeUndefined();
        expect( result ).toEqual( { message : 'this resource will be deleted' } );
      });
    });
  });


  describe('3.5 DELETE a dynamic Resource data item through a site', function() {
    it('should remove the item "second-item" from the resource data', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'parent',
        resources: [{
          name: 'child',
          data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
          onDelete: function(query, respond ) {
            var idx = query['idx'];
            this.data.testArray.splice(idx,1);
            respond.ok();
          }
        }]
      });
      site.delete(new routing.Route('/parent/child?idx=1') )
        .then( function(emb){ result = emb.bodyAsJason(); } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
      runs( function() {
        //var res = JSON.parse(result);
        expect( result ).toBeDefined();
        expect( result.testArray ).toBeDefined();
        expect( result.testArray ).not.toContain( 'second-item' );
      });
    });
  });


  describe('3.6 DELETE part of data using url parameters through a site', function() {
    it('should remove the item "second-item" from its data using URL paramter 1', function() {
      var result;
      var site = relaxjs.site('test');
      site.add( {
        name: 'container',
        resources: [{
          name: 'data-res',
          urlParameters: [ 'idx' ],
          data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
          onDelete: function( query, respond ) {
            var idx = parseInt( this._parameters.idx );
            this.data.testArray.splice(idx,1);
            respond.ok();
          }
        }]
      });
      site.delete(new routing.Route('/container/data-res/1') )
        .then( function(emb){ result = emb.bodyAsJason(); } )
        .fail( function (error) { result = error } );

      waitsFor( function() { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
      runs( function() {
        console.log(result);
        expect( result ).toBeDefined();
        expect( result.testArray ).toBeDefined();
        expect( result.testArray ).not.toContain( 'second-item' );
      });

    });
  });

});
/**/

/*
describe('PATCH responses', function() {
});
*/

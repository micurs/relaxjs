/// <reference path='../../typings/index.d.ts' />
/// <reference path="../../dist/relaxjs.d.ts" />

import * as relaxjs from '../relaxjs';
import * as routing from '../routing';
import * as internals from '../internals';

/*
 * GET 2 Tests
*/
describe('Testing GET from Site using basic URLs:', () => {
  let tCount = 0;
  let rtCount = 0;
  const site = relaxjs.site('test');

  it(`${++tCount} - GET static data: "/hello${tCount}" - should get {"message":"Hello World!"}`, ( done ) => {
    rtCount++;
    site.add({
      name: `hello${rtCount}`,
      data: { message: 'Hello World!'}
    });
    site.get( new routing.Route(`/hello${rtCount}`), undefined )
    .then( (emb) => {
      expect( emb ).toBeDefined();
      const result = emb.bodyAsString();
      expect( result ).toBe('{"message":"Hello World!"}');
      done();
    })
    .fail( (error) => done(error) );
  }, 50 );

  it(`${++tCount} - GET static data: "/hellos${tCount}" - should NOT get {"message":"Hello World!"}`, ( done ) => {
    rtCount++;
    site.add({
      name: `hello${rtCount}`,
      data: { message: 'Hello World!'}
    });
    site.get( new routing.Route(`/hellos${rtCount}`), undefined )
    .then( (emb) => {
      expect(true).toBe(false);
      done();
    })
    .fail( (error) => {
      expect( error ).toBeDefined();
      done();
    });
  }, 50 );


  it(`${++tCount} - GET dynamic data: "/hello${tCount}" - should get {"message":"Hello World!"}`, (done) => {
    rtCount++;
    site.add( {
      name: `hello${rtCount}`,
      onGet : function( query: any , response: relaxjs.Response ) {
        this.data = { message: 'Hello World!' };
        response.ok();
      },
      data: { message: 'This is now Hello World!' }
    });
    site.get( new routing.Route(`/hello${rtCount}`), undefined )
    .then( (emb) => {
      expect( emb ).toBeDefined();
      const result = emb.bodyAsString();
      expect( result ).toBe('{"message":"Hello World!"}' );
      done();
    })
    .fail( (error) => done(error) );
  }, 50);


  it(`${++tCount} - GET dynamic data: "/shello${tCount}" - should NOT get {"message":"Hello World!"}`, (done) => {
    rtCount++;
    site.add( {
      name: `hello${rtCount}`,
      onGet : function( query: any , response: relaxjs.Response ) {
        this.data = { message: 'Hello World!' };
        response.ok();
      },
      data: { message: 'This is now Hello World!' }
    });
    site.get( new routing.Route(`/shello${rtCount}`), undefined )
    .then( (emb) => {
      expect(true).toBe(false);
      done();
    })
    .fail( (error) => {
      expect( error ).toBeDefined();
      done();
    });
  }, 50);


  it(`${++tCount} - GET static data: "/hello${tCount}/world${tCount}" - should get {"message":"Hello World!"}`, ( done ) => {
    rtCount++;
    site.add( {
      name: `hello${rtCount}`,
      resources: [ {
        name: `world${rtCount}`,
        data: { message: 'Hello World!' },
      }]
    });
    site.get( new routing.Route(`/hello${rtCount}/world${rtCount}`), undefined )
    .then( (emb) => {
      expect( emb ).toBeDefined();
      const result = emb.bodyAsString();
      expect( result).toBe('{"message":"Hello World!"}');
      done();
    })
    .fail( (error) => done(error) );
  }, 50 );

  it(`${++tCount} - GET static data: "/hello${tCount}/worlds${tCount}" - should NOT get {"message":"Hello World!"}`, ( done ) => {
    rtCount++;
    site.add( {
      name: `hello${rtCount}`,
      resources: [ {
        name: `world${rtCount}`,
        data: { message: 'Hello World!' },
      }]
    });
    site.get( new routing.Route(`/hello${rtCount}/worlds${rtCount}`), undefined )
    .then( (emb) => {
      expect(true).toBe(false);
      done();
    })
    .fail( (error) => {
      expect( error ).toBeDefined();
      done();
    });
  }, 50 );



  it(`${++tCount} - GET dynamic data: "/parent/child/1" - should return {"items":["second-item"]}`, ( done ) => {
    rtCount++;
    site.add( {
      name: `parent${rtCount}`,
      resources: [{
        name: `child${rtCount}`,
        urlParameters: [ 'idx' ],
        data: { items : [ 'first-item', 'second-item', 'third-item' ] },
        onGet : function( query: any , response: relaxjs.Response ) {
          const idx = this._parameters.idx;
          this.data = { items: [ this.data.items[idx] ] };
          response.ok();
        }
      }]
    });
    site.get( new routing.Route(`/parent${rtCount}/child${rtCount}/1`), undefined )
    .then( (emb) => {
      expect( emb ).toBeDefined();
      const result = emb.bodyAsString();
      expect( result ).toBe('{"items":["second-item"]}');
      done();
    })
    .fail( (error) => done(error) );
  }, 50 );

  it(`${++tCount} - GET dynamic data: "/parents/child/1" - should NOT return {"items":["second-item"]}`, ( done ) => {
    rtCount++;
    site.add( {
      name: `parent${rtCount}`,
      resources: [{
        name: `child${rtCount}`,
        urlParameters: [ 'idx' ],
        data: { items : [ 'first-item', 'second-item', 'third-item' ] },
        onGet : function( query: any , response: relaxjs.Response ) {
          const idx = this._parameters.idx;
          this.data = { items: [ this.data.items[idx] ] };
          response.ok();
        }
      }]
    });
    site.get( new routing.Route(`/parents${rtCount}/child${rtCount}/1`), undefined )
    .then( (emb) => {
      expect(true).toBe(false);
      done();
    })
    .fail( (error) => {
      expect( error ).toBeDefined();
      done();
    });
  }, 50 );

});

//   describe('1.9 GET static data from a Resource: hello as XML', () => {
//     it('should get <resource><message>Hello World!</message></resource>', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'hello',
//         outFormat: 'text/xml',
//         data: { message: "Hello World!" }
//       });
//       rp.get( new routing.Route('hello') )
//         .then( function(emb) { result = emb.bodyAsString(); })
//         .fail( function (error) { result = JSON.stringify(error);  } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
//       runs( () => {
//         expect( result ).toBeDefined();
//         expect( result ).toBe('<resource><message>Hello World!</message></resource>');
//       });
//     });
//   });

//   describe('1.10 GET dynamic data from a Resource: test as XML', () => {
//     it('should get <resource><message>This is XML</message></resource>', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'test',
//         outFormat: 'text/xml',
//         onGet : function( query, response ) {
//           this.data = { message: "This is XML" };
//           response.ok();
//         },
//         data: { message: "This is now Hello World!" } });
//       rp.get( new routing.Route('test') )
//         .then( function(emb) { result = emb.bodyAsString(); })
//         .fail( function (error) { result = JSON.stringify(error);  } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the GET call to be completed.', 1000 );
//       runs( () => {
//         expect( result ).toBeDefined();
//         expect( result ).toBe('<resource><message>This is XML</message></resource>' );
//       });
//     });
//   });

// })
// /**/

// /**/
// describe('Test POST responses: ', () => {

//   describe('2.1 POST JSON data to a Resource with no onPost() function', () => {
//     it('should add the data as member of the resource', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'test',
//         data: { }
//       });
//       const postData = { message: 'Hello World!' };
//       rp.post(new routing.Route('test'),postData )
//         .then( function(emb) { result = emb; } )
//         .fail( function (error) { result = error; } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
//       runs( () => {
//         expect( result ).toBeDefined();
//         expect( rp.data ).toEqual( { message:"Hello World!"} );
//       });
//     });
//   });


//   describe('2.2 POST JSON data to a Resource with onPost() function', () => {
//     it('should add the data under the postData new member of the resource', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'test',
//         onPost: function(query , data , respond ) {
//           this.data = { message: 'data has been posted', postData: data };
//           respond.ok();
//         }
//       });
//       const postData = { posted: 'Hello World!' };
//       rp.post(new routing.Route('test'),postData )
//         .then( function(emb){ result = emb; } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!==undefined } , 'Waited to long for the POST call to be completed.', 1000 );
//       runs( () => {
//         console.log(result.bodyAsJason());
//         expect( result ).toBeDefined();
//         expect( result.bodyAsJason() ).toEqual(  { message: 'data has been posted', postData: { posted: 'Hello World!' } } );
//         expect( rp.data ).toEqual({ message: 'data has been posted', postData: { posted: 'Hello World!' } } );
//       });

//     });
//   });


//   describe('2.3 POST JSON data to a child Resource with no onPost() function', () => {
//     it('should add the data as member of the resource', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'hello',
//         resources: [{
//           name: 'world',
//           data: { }
//         }]
//       });
//       const postData = { message: 'Hello World!' };
//       rp.post(new routing.Route('hello/world'),postData )
//         .then( function(emb){ result = emb; } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
//       runs( () => {
//         expect( result ).toBeDefined();
//         expect( rp.getChild('world').data ).toEqual( { message:"Hello World!"} );
//       });
//     });
//   });

//   // ---

//   describe('2.4 POST JSON data to a Resource with no onPost() function through a site', () => {
//     it('should add the data as member of the resource', () => {
//       const result;
//       const site = relaxjs.site('test');
//       site.add( {
//         name: 'test',
//         data: { }
//       });
//       site.post(new routing.Route('/test'), { message: 'Hello World!' } )
//         .then( function(emb){ result = emb; } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
//       runs( () => {
//         expect( result ).toBeDefined();
//         expect( site._resources['test'][0].data ).toEqual( { message:"Hello World!"} );
//       });
//     });
//   });


//   describe('2.5 POST JSON data to a Resource with onPost() function through a site', () => {
//     it('should add the data under the postData new member of the resource', () => {
//       const result;
//       const site = relaxjs.site('test');
//       site.add( {
//         name: 'test',
//         onPost: function(query , data , respond ) {
//           this.data = { message: "data has been posted", postData: data };
//           respond.ok();
//         }
//       });
//       const postData = { message: 'Hello World!' };
//       site.post(new routing.Route('/test'),postData )
//         .then( function(emb){ result = emb; } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the POST call to be completed.', 1000 );
//       runs( () => {
//         // console.log('==== Result');
//         expect( result ).toBeDefined();
//         expect( site._resources['test'][0].data ).toEqual( { message:"data has been posted", postData: { message: 'Hello World!' } } );
//         expect( result.bodyAsJason().data,  { message:"data has been posted", postData: { message: 'Hello World!' } } );
//       });

//     });
//   });


// });
// /**/

// /**/
// describe('Test DELETE responses', () => {

//   describe('3.1 DELETE a static child Resource', () => {
//     it('should remove the resource from its parent', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'parent',
//         resources: [{
//           name: 'child',
//           data: { message: 'this resource will be deleted'}
//         }]
//       });
//       rp.delete(new routing.Route('parent/child') )
//         .then( function(emb){ result = emb.bodyAsJason(); } )
//         .fail( function (error) { result = error } );


//       waitsFor( () => { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
//       runs( () => {
//         expect( result ).toBeDefined();
//         expect( rp.getChild('child') ).toBeUndefined();
//         expect( result ).toEqual( { message: 'this resource will be deleted'} );
//       });
//     });
//   });


//   describe('3.2 DELETE a dynamic Resource data item', () => {
//     it('should remove the item "second-item" from the resource data', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'parent',
//         resources: [{
//           name: 'child',
//           data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
//           onDelete: function(query, respond ) {
//             const idx = query['idx'];
//             this.data.testArray.splice(idx,1);
//             respond.ok();
//           }
//         }]
//       });
//       rp.delete(new routing.Route('parent/child?idx=1') )
//         .then( function(emb){ result = emb.bodyAsJason(); } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
//       runs( () => {
//         //const res = JSON.parse(result);
//         expect( result ).toBeDefined();
//         expect( result.testArray ).toBeDefined();
//         expect( result.testArray ).not.toContain( 'second-item' );
//       });
//     });
//   });


//   describe('3.3 DELETE part of data using url parameters', () => {
//     it('should remove the item "second-item" from its data using URL paramter 1', () => {
//       const result;
//       const rp = new relaxjs.ResourcePlayer( {
//         name: 'container',
//         resources: [{
//           name: 'data-res',
//           urlParameters: [ 'idx' ],
//           data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
//           onDelete: function( query, respond ) {
//             const idx = parseInt( this._parameters.idx );
//             this.data.testArray.splice(idx,1);
//             respond.ok();
//           }
//         }]
//       });
//       rp.delete(new routing.Route('container/data-res/1') )
//         .then( function(emb){ result = emb.bodyAsJason(); } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
//       runs( () => {
//         console.log(result);
//         expect( result ).toBeDefined();
//         expect( result.testArray ).toBeDefined();
//         expect( result.testArray ).not.toContain( 'second-item' );
//       });

//     });
//   });

//   // ---

//   describe('3.4 DELETE a static child Resource through a site', () => {
//     it('should remove the resource from its parent', () => {
//       const result;
//       const site = relaxjs.site('test');
//       site.add( {
//         name: 'parent',
//         resources: [{
//           name: 'child',
//           data: { message: 'this resource will be deleted'}
//         }]
//       });
//       site.delete( new routing.Route('/parent/child') )
//         .then( function(emb){ result = emb.bodyAsJason(); } )
//         .fail( function (error) { result = error } );


//       waitsFor( () => { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
//       runs( () => {
//         expect( result ).toBeDefined();
//         expect( site.getResource('/parent/child') ).toBeUndefined();
//         expect( result ).toEqual( { message : 'this resource will be deleted' } );
//       });
//     });
//   });


//   describe('3.5 DELETE a dynamic Resource data item through a site', () => {
//     it('should remove the item "second-item" from the resource data', () => {
//       const result;
//       const site = relaxjs.site('test');
//       site.add( {
//         name: 'parent',
//         resources: [{
//           name: 'child',
//           data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
//           onDelete: function(query, respond ) {
//             const idx = query['idx'];
//             this.data.testArray.splice(idx,1);
//             respond.ok();
//           }
//         }]
//       });
//       site.delete(new routing.Route('/parent/child?idx=1') )
//         .then( function(emb){ result = emb.bodyAsJason(); } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
//       runs( () => {
//         //const res = JSON.parse(result);
//         expect( result ).toBeDefined();
//         expect( result.testArray ).toBeDefined();
//         expect( result.testArray ).not.toContain( 'second-item' );
//       });
//     });
//   });


//   describe('3.6 DELETE part of data using url parameters through a site', () => {
//     it('should remove the item "second-item" from its data using URL paramter 1', () => {
//       const result;
//       const site = relaxjs.site('test');
//       site.add( {
//         name: 'container',
//         resources: [{
//           name: 'data-res',
//           urlParameters: [ 'idx' ],
//           data: { testArray : [ 'first-item', 'second-item', 'third-item' ] },
//           onDelete: function( query, respond ) {
//             const idx = parseInt( this._parameters.idx );
//             this.data.testArray.splice(idx,1);
//             respond.ok();
//           }
//         }]
//       });
//       site.delete(new routing.Route('/container/data-res/1') )
//         .then( function(emb){ result = emb.bodyAsJason(); } )
//         .fail( function (error) { result = error } );

//       waitsFor( () => { return result!=undefined } , 'Waited to long for the DELETE call to be completed.', 1000 );
//       runs( () => {
//         console.log(result);
//         expect( result ).toBeDefined();
//         expect( result.testArray ).toBeDefined();
//         expect( result.testArray ).not.toContain( 'second-item' );
//       });

//     });
//   });

// });
/**/

/*
describe('PATCH responses', () => {
});
*/

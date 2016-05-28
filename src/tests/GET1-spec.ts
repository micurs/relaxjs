/// <reference path='../../typings/index.d.ts' />
/// <reference path="../../dist/relaxjs.d.ts" />

import * as relaxjs from '../relaxjs';
import * as routing from '../routing';

/*
 * GET 1 Tests
*/
describe('Testing GET from resource using basic URLs:', () => {
  let tCount = 0;

  it(`${++tCount} - GET static data: "hello" - should get {"message":"Hello World!"}`, ( done ) => {
    const testRoute = new routing.Route('hello');
    const rp = new relaxjs.ResourcePlayer( {
      name: 'hello',
      data: { message: 'Hello World!' } }
    );
    rp.get( testRoute )
    .then( (emb) => {
      const result = emb.bodyAsString();
      expect( result ).toBeDefined();
      expect( result ).toBe('{"message":"Hello World!"}');
      done();
    })
    .fail( (error) => {
      done(error);
    });
  }, 50 );

  it(`${++tCount} - GET static data: "test" - should NOT get anything since the route is incorrect`, ( done ) => {
    const testRoute = new routing.Route('hello');
    const rp = new relaxjs.ResourcePlayer( {
      name: 'test',
      data: { message: 'Hello World!' } }
    );
    rp.get( testRoute )
    .then( (emb) => {
      expect(true).toBe(false);
      done();
    })
    .fail( (error) => {
      expect( error ).toBeDefined();
      done();
    });
  }, 50 );

  it(`${++tCount} - GET dynamic data: "test" - should get {"message":"This is dynamic Hello World!"}`, (done) => {
    const testRoute = new routing.Route('hello');
    const rp = new relaxjs.ResourcePlayer( {
        name: 'hello',
        onGet : function( query: any, response: relaxjs.Response ) {
          this.data = { message: 'This is dynamic Hello World!' };
          response.ok();
        },
        data: { message: 'This is static Hello World!' }
      } );
    rp.get( testRoute )
    .then( (emb) => {
      const result = emb.bodyAsString();
      expect( result ).toBeDefined();
      expect( result ).toBe('{"message":"This is dynamic Hello World!"}' );
      done();
    })
    .fail( (error) => done(error) );
  }, 50 );

  it(`${++tCount} - GET dynamic data: "test" - should NOT get anything because the route is incorrect `, (done) => {
    const testRoute = new routing.Route('hello');
    const rp = new relaxjs.ResourcePlayer( {
        name: 'test',
        onGet : function( query: any, response: relaxjs.Response ) {
          this.data = { message: 'This is dynamic Hello World!' };
          response.ok();
        },
        data: { message: 'This is static Hello World!' }
      } );
    rp.get( testRoute )
    .then( (emb) => {
      expect( emb ).toBeUndefined();
      done(new Error('Get should not succeed.'));
    })
    .fail( (error) => {
      expect( error ).toBeDefined();
      done();
    });
  }, 50 );

  it(`${++tCount} - GET static data: "hello/world" - should get {"message":"Hello World!"}`, ( done ) => {
    const testRoute = new routing.Route('hello/world');
    const rp = new relaxjs.ResourcePlayer( {
      name: 'hello',
      resources: [ {
        name: 'world',
        data: { message: 'Hello World!' }
      }]
    });
    rp.get( testRoute )
    .then( ( emb ) => {
      const result = emb.bodyAsString();
      expect( result ).toBeDefined();
      expect( result ).toBe('{"message":"Hello World!"}');
      done();
    })
    .fail( (error) => done(error) );
  }, 50 );

  it(`${++tCount} - GET dynamic data: "parent/child/1" - should return {"items":["second-item"]}`, ( done ) => {
    const rp = new relaxjs.ResourcePlayer( {
      name: 'parent',
      resources: [{
        name: 'child',
        urlParameters: [ 'idx' ],
        data: { items : [ 'first-item', 'second-item', 'third-item' ] },
        onGet : function( query: any, response: relaxjs.Response ) {
          const idx = this._parameters.idx;
          this.data = { items: [ this.data.items[idx] ] };
          response.ok();
        }
      }]
    });
    rp.get( new routing.Route('parent/child/1') )
    .then( (emb) => {
      expect( emb ).toBeDefined();
      const result = emb.bodyAsString();
      expect( result ).toBe('{"items":["second-item"]}');
      done();
    })
    .fail( (error) => done(error) );
  }, 50 );

});



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

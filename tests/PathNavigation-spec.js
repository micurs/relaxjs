// PathNavigation-spec.js

var relaxjs = require('../dist/relaxjs.js');
var routing = require('../dist/routing.js');

/**/
describe('Test GetResource() function', function() {

  it('should get the resources given their paths: /child1 and /child2', function() {
    var site = relaxjs.site('test');
    site.add( { name: 'child1', data: 'this is child 1' });
    site.add( { name: 'child2', data: 'this is child 2' });
    var child1 = site.getResource('/child1');
    var child2 = site.getResource('/child2');
    expect( child1.name ).toBe('child1');
    expect( child2.name ).toBe('child2');
  });

  it('should get an undefined when trying to get an incorrect resource: /child01 instead of /child1', function() {
    var site = relaxjs.site('test');
    site.add( { name: 'child1', data: 'this is child 1' });
    var child1 = site.getResource('/child01');
    expect( child1 ).toBeUndefined();
  });


  it('should get the resources given their paths: /parent/child1 and /parent/child2', function() {
    var site = relaxjs.site('test');
    site.add( {
      name: 'parent',
      resources: [{ name: 'child1', data: 'this is child 1' },
                  { name: 'child2', data: 'this is child 2' }
                 ]
    });
    var child1 = site.getResource('/parent/child1');
    var child2 = site.getResource('/parent/child2');
    expect( child1.name ).toBe('child1');
    expect( child2.name ).toBe('child2');
  });

  it('should get undefined when trying to get an incorrect chile resource: /parent/child01 instead of /parent/child1', function() {
    var site = relaxjs.site('test');
    site.add( {
      name: 'parent',
      resources: [{ name: 'child1', data: 'this is child 1' },
                  { name: 'child2', data: 'this is child 2' }
                 ]
    });
    var child1 = site.getResource('/parent/child01');
    expect( child1 ).toBeUndefined();
  });


  it('should get the resources given their paths and id: /child/0 and /child/1', function() {
    var site = relaxjs.site('test');
    site.add( { name: 'child', data: { id: 'this is child #1'} });
    site.add( { name: 'child', data: { id: 'this is child #2'} });
    var child1 = site.getResource('/child/0');
    var child2 = site.getResource('/child/1');
    expect( child1.data.id ).toBe('this is child #1');
    expect( child2.data.id ).toBe('this is child #2');
  });

  it('should get undefined when trying to get an incorrect chile resource: /child/2 instead of /child/1', function() {
    var site = relaxjs.site('test');
    site.add( { name: 'child', data: { id: 'this is child #1'} });
    site.add( { name: 'child', data: { id: 'this is child #2'} });
    var child1 = site.getResource('/child/2');
    expect( child1 ).toBeUndefined();
  });


  it('should get the resources given their paths and id: /parent/1/child/0 and /parent/0/child/1', function() {
    var site = relaxjs.site('test');
    site.add( { name: 'parent',
                resources: [
                 { name: 'child', data: { id: '/parent/0/child/0'} },
                 { name: 'child', data: { id: '/parent/0/child/1'} }
                ] } );
    site.add( { name: 'parent',
                resources: [
                 { name: 'child', data: { id: '/parent/1/child/0'} },
                 { name: 'child', data: { id: '/parent/1/child/1'} }
                ] } );
    var child1 = site.getResource('/parent/0/child/1');
    var child2 = site.getResource('/parent/1/child/0');
    expect( child1.data.id ).toBe('/parent/0/child/1');
    expect( child2.data.id ).toBe('/parent/1/child/0');
  });

  it('should get undefined when trying to get an incorrect chile resource: /parent/1/child/2 instead of /parent/1/child/1', function() {
    var site = relaxjs.site('test');
    site.add( { name: 'parent',
                resources: [
                 { name: 'child', data: { id: '/parent/0/child/0'} },
                 { name: 'child', data: { id: '/parent/0/child/1'} }
                ] } );
    site.add( { name: 'parent',
                resources: [
                 { name: 'child', data: { id: '/parent/1/child/0'} },
                 { name: 'child', data: { id: '/parent/1/child/1'} }
                ] } );
    var child1 = site.getResource('/parent/0/child/2');
    expect( child1 ).toBeUndefined();
  });

});
/**/

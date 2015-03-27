var _ = require('underscore')
var request = require('supertest')
var assert  = require('assert')
var jsonServer  = require('../src/')

describe('Server', function() {

  var server
  var router
  var db

  beforeEach(function() {
    db = {}

    db.posts = [
      { 
        uuid: '0000217a-8adb-11e1-94d2-12313928d5b8',
        body: 'foo'
      },
      {
        uuid: '0000e862-dbb2-11e3-9eb3-22000b04072f',
        body: 'bar'
      }
    ]

    db.tags = [
      {
        uuid: '0000217a-8adb-11e1-94d2-12313928d5b8',
        body: 'Technology'
      },
      {
        uuid: '0000e862-dbb2-11e3-9eb3-22000b04072f',
        body: 'Photography'
      },
      {
        uuid: '00011541-824e-11e1-9eb5-12313928d5b8',
        body: 'photo'
      }
    ]

    db.comments = [
      { 
        uuid: '0000217a-8adb-11e1-94d2-12313928d5b8',
        published: true,
        weight: 0,
        post: {
          uuid: '0000217a-8adb-11e1-94d2-12313928d5b8'
        }
      },
      {
        uuid: '0000e862-dbb2-11e3-9eb3-22000b04072f',
        published: false,
        weight: 1,
        post: {
          uuid: '0000217a-8adb-11e1-94d2-12313928d5b8'
        }
      },
      {
        uuid: '00011541-824e-11e1-9eb5-12313928d5b8',
        published: false,
        weight: 2,
        post: {
          uuid: '0000e862-dbb2-11e3-9eb3-22000b04072f'
        }
      },
      {
        uuid: '0002a6ed-a8e9-11e3-9170-12313920a02c',
        published: false,
        weight: 3,
        post: {
          uuid: '0000e862-dbb2-11e3-9eb3-22000b04072f'
        }
      },
      {
        uuid: '0002b36c-8f95-11e4-b588-22000b04072f',
        published: false,
        weight: 4,
        post: {
          uuid: '0000e862-dbb2-11e3-9eb3-22000b04072f'
        }
      }
    ]

    db.refs = [
      {
        id: 'abcd-1234',
        url: 'http://example.com',
        postId: 1
      }
    ]

    router = jsonServer.router(db)
    server = jsonServer.create().use(router)
  })

  describe('GET /db', function() {
    it('should respond with json and full database', function(done) {
      request(server)
        .get('/db')
        .expect('Content-Type', /json/)
        .expect(db)
        .expect(200, done)
    })
  })

  describe('GET /:resource', function() {
    it('should respond with json and corresponding resources', function(done) {
      request(server)
        .get('/posts')
        .set('Origin', 'http://example.com')
        .expect('Content-Type', /json/)
        .expect('Access-Control-Allow-Credentials', 'true')
        .expect('Access-Control-Allow-Origin', 'http://example.com')
        .expect(db.posts)
        .expect(200, done)
    })
  })

  describe('GET /:resource?attr=&attr=', function() {
    it('should respond with json and filter resources', function(done) {
      request(server)
        .get('/comments?published=true')
        .expect('Content-Type', /json/)
        .expect([db.comments[0]])
        .expect(200, done)
    })
  })

  describe('GET /:resource?q=', function() {
    it('should respond with json and make a full-text search', function(done) {
      request(server)
        .get('/tags?q=pho')
        .expect('Content-Type', /json/)
        .expect([db.tags[1], db.tags[2]])
        .expect(200, done)
    })

    it('should return an empty array when nothing is matched', function(done) {
        request(server)
          .get('/tags?q=nope')
          .expect('Content-Type', /json/)
          .expect([])
          .expect(200, done)
    })
  })

  describe('GET /:resource?_end=', function() {
    it('should respond with a sliced array', function(done) {
      request(server)
        .get('/comments?_end=2')
        .expect('Content-Type', /json/)
        .expect('x-total-count', db.comments.length.toString())
        .expect('Access-Control-Expose-Headers', 'X-Total-Count')
        .expect(db.comments.slice(0, 2))
        .expect(200, done)
    })
  })

  describe('GET /:resource?sort=', function() {
      it('should respond with json and sort on a field', function(done) {
          request(server)
              .get('/tags?_sort=body')
              .expect('Content-Type', /json/)
              .expect([db.tags[1], db.tags[0], db.tags[2]])
              .expect(200, done)
      })

      it('should reverse sorting with _order=DESC', function(done) {
          request(server)
              .get('/tags?_sort=body&_order=DESC')
              .expect('Content-Type', /json/)
              .expect([db.tags[2], db.tags[0], db.tags[1]])
              .expect(200, done)
      })

      it('should sort on numerical field', function(done) {
          request(server)
              .get('/comments?_sort=weight&_order=DESC')
              .expect('Content-Type', /json/)
              .expect(db.comments.reverse())
              .expect(200, done)
      })
  })

  describe('GET /:resource?_start=&_end=', function() {
    it('should respond with a sliced array', function(done) {
      request(server)
        .get('/comments?_start=1&_end=2')
        .expect('Content-Type', /json/)
        .expect('x-total-count', db.comments.length.toString())
        .expect('Access-Control-Expose-Headers', 'X-Total-Count')
        .expect(db.comments.slice(1, 2))
        .expect(200, done)
    })
  })

  describe('GET /:parent/:parentId/:resource', function() {
    it('should respond with json and corresponding nested resources', function(done) {
      request(server)
        .get('/posts/0000217a-8adb-11e1-94d2-12313928d5b8/comments')
        .expect('Content-Type', /json/)
        .expect([
          db.comments[0],
          db.comments[1]
        ])
        .expect(200, done)
    })
  })

  describe('GET /:resource/:uuid', function() {
    it('should respond with json and corresponding resource', function(done) {
      request(server)
        .get('/posts/0000217a-8adb-11e1-94d2-12313928d5b8')
        .expect('Content-Type', /json/)
        .expect(db.posts[0])
        .expect(200, done)
    })

    it('should respond with 404 if resource is not found', function(done) {
      request(server)
        .get('/posts/9001')
        .expect('Content-Type', /json/)
        .expect({})
        .expect(404, done)
    })
  })


  describe('POST /:resource', function() {
    it('should respond with json, create a resource',
      function(done) {
        request(server)
          .post('/posts')
          .send({body: 'foo', booleanValue: 'true', integerValue: '1'})
          .expect('Content-Type', /json/)
          //.expect({body: 'foo', booleanValue: true, integerValue: 1})
          .expect(200)
          .end(function(err, res){
            if (err) return done(err)
            var last = _.last(db.posts);
            assert.equal(last.body, 'foo')
            assert.equal(last.booleanValue, true)
            assert.equal(last.integerValue, 1)
            assert.equal(db.posts.length, 3)
            done()
          })
      })

    it('should respond with json, create a resource and generate string id',
      function(done) {
        request(server)
          .post('/refs')
          .send({url: 'http://foo.com', postId: '1'})
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res){
            if (err) return done(err)
            assert.equal(db.refs.length, 2)
            done()
          })
      })
  })

  describe('PUT /:resource/:uuid', function() {
    it('should respond with json and update resource', function(done) {
      request(server)
        .put('/posts/0000217a-8adb-11e1-94d2-12313928d5b8')
        .send({body: 'bar', booleanValue: 'true', integerValue: '1'})
        .expect('Content-Type', /json/)
        .expect({uuid: '0000217a-8adb-11e1-94d2-12313928d5b8', body: 'bar', booleanValue: true, integerValue: 1})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err)
          // assert it was created in database too
          assert.deepEqual(db.posts[0], {uuid: '0000217a-8adb-11e1-94d2-12313928d5b8', body: 'bar', booleanValue: true, integerValue: 1})
          done()
        })
    })

    it('should respond with 404 if resource is not found', function(done) {
      request(server)
        .put('/posts/9001')
        .send({id: 1, body: 'bar', booleanValue: 'true', integerValue: '1'})
        .expect('Content-Type', /json/)
        .expect({})
        .expect(404, done)
    })
  })

  describe('PATCH /:resource/:uuid', function() {
    it('should respond with json and update resource', function(done) {
      request(server)
        .patch('/posts/0000217a-8adb-11e1-94d2-12313928d5b8')
        .send({body: 'bar'})
        .expect('Content-Type', /json/)
        .expect({uuid: '0000217a-8adb-11e1-94d2-12313928d5b8', body: 'bar'})
        .expect(200)
        .end(function(err, res){
          if (err) return done(err)
          // assert it was created in database too
          assert.deepEqual(db.posts[0], {uuid: '0000217a-8adb-11e1-94d2-12313928d5b8', body: 'bar'})
          done()
        })
    })

    it('should respond with 404 if resource is not found', function(done) {
      request(server)
        .patch('/posts/9001')
        .send({body: 'bar'})
        .expect('Content-Type', /json/)
        .expect({})
        .expect(404, done)
    })
  })

  describe('DELETE /:resource/:uuid', function() {
    it('should respond with empty data, destroy resource and dependent resources', function(done) {
      request(server)
        .del('/posts/0000217a-8adb-11e1-94d2-12313928d5b8')
        .expect(204)
        .end(function(err, res){
          if (err) return done(err)
          assert.equal(db.posts.length, 1)
          done()
        })
    })
  })

  describe('Static routes', function() {

    describe('GET /', function() {
      it('should respond with html', function(done) {
        request(server)
          .get('/')
          .expect(/You're successfully running JSON Server/)
          .expect(200, done)
      })
    })

    describe('GET /stylesheets/style.css', function() {
      it('should respond with css', function(done) {
        request(server)
          .get('/stylesheets/style.css')
          .expect('Content-Type', /css/)
          .expect(200, done)
      })
    })

  })

  describe('Database #object', function() {
    it('should be accessible', function() {
      assert(router.db.object)
    })
  })
})

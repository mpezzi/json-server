var express = require('express')
var methodOverride = require('method-override')
var bodyParser = require('body-parser')
var _ = require('underscore')
var low = require('lowdb')
var utils = require('./utils')
var _db = require('underscore-db')
var _inflections = require('underscore.inflections')

// Override __id function so 'uuid' can be used as primary key.
_db.__id = function () {
  return 'uuid'
}

low.mixin(_db)
low.mixin(_inflections)

module.exports = function(source) {
  // Create router
  var router = express.Router()
  
  // Add middlewares
  router.use(bodyParser.json({limit: '10mb'}))
  router.use(bodyParser.urlencoded({ extended: false }))
  router.use(methodOverride())

  // Create database
  if (_.isObject(source)) {
    var db = low()
    db.object = source
  } else {
    var db = low(source)
  }

  // Expose database
  router.db = db

  // GET /db
  function showDatabase(req, res, next) {
    res.jsonp(db.object)
  }

  // GET /:resource
  // GET /:resource?q=
  // GET /:resource?attr=&attr=
  // GET /:parent/:parentUuid/:resource?attr=&attr=
  // GET /*?*&_end=
  // GET /*?*&_start=&_end=
  function list(req, res, next) {
    // Filters list
    var filters = {}

    // Result array
    var array
    var parentPlural
    var parentSingular

    // Remove _start and _end from req.query to avoid filtering using those
    // parameters
    var _start = req.query._start
    var _end = req.query._end
    var _sort = req.query._sort
    var _order = req.query._order

    delete req.query._start
    delete req.query._end
    delete req.query._sort
    delete req.query._order

    if (req.query.q) {

      // Full-text search
      var q = req.query.q.toLowerCase()

      array = db(req.params.resource).filter(function(obj) {
        for (var key in obj) {
          var value = obj[key]
          if (_.isString(value) && value.toLowerCase().indexOf(q) !== -1) {
            return true
          }
        }
      })

    } else {

      // Add :parentUuid filter in case URL is like /:parent/:parentUuid/:resource
      if (req.params.parent) {

        // Inspect the first item to determine the format, this format should not
        // change between stored data.
        item = db(req.params.resource).first()
        parentPlural = req.params.parent;
        parentSingular = _.singularize(req.params.parent)

        // Filter instances where reference is an array, this would be a multiple reference.
        if (_.isArray(item[parentPlural])) {
          filters[parentPlural] = [ { uuid: req.params.parentUuid } ];
        }
        // Filter instances where reference is an object, this would be a singular reference.
        else if (_.isObject(item[parentSingular])) {
          filters[parentSingular] = { uuid: req.params.parentUuid };
        }

      }

      // Add query parameters filters
      // Convert query parameters to their native counterparts
      for (var key in req.query) {
        // don't take into account JSONP query parameters
        // jQuery adds a '_' query parameter too
        if (key !== 'callback' && key !== '_') {
          filters[key] = utils.toNative(req.query[key])
        }
      }

      // Filter
      if (_(filters).isEmpty()) {
        array = db(req.params.resource).value()
      } else {
        array = db(req.params.resource).filter(filters)
      }
    }

    // Sort
    if(_sort) {
      _order = _order || 'ASC'

      array = _.sortBy(array, function(element) {
        return element[_sort];
      })

      if (_order === 'DESC') {
        array.reverse();
      }
    }

    // Slice result
    if (_end) {
      res.setHeader('X-Total-Count', array.length)
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')

      _start = _start || 0

      array = array.slice(_start, _end)
    }

    res.jsonp(array)
  }

  // GET /:resource/:uuid
  function show(req, res, next) {
    var resource = db(req.params.resource)
      .get(req.params[_db.__id()])

    if (resource) {
      res.jsonp(resource)
    } else {
      res.status(404).jsonp({})
    }
  }

  // POST /:resource
  function create(req, res, next) {
    for (var key in req.body) {
      req.body[key] = utils.toNative(req.body[key])
    }

    var resource = db(req.params.resource)
      .insert(req.body)

    res.jsonp(resource)
  }

  // PUT /:resource/:uuid
  // PATCH /:resource/:uuid
  function update(req, res, next) {
    for (var key in req.body) {
      req.body[key] = utils.toNative(req.body[key])
    }

    var resource = db(req.params.resource)
      .update(req.params[_db.__id()], req.body)

    if (resource) {
      res.jsonp(resource)
    } else {
      res.status(404).jsonp({})
    }
  }

  // DELETE /:resource/:uuid
  function destroy(req, res, next) {
    db(req.params.resource).remove(req.params[_db.__id()])
    res.status(204).end()
  }

  router.get('/db', showDatabase)

  router.route('/:resource')
    .get(list)
    .post(create)

  router.route('/:resource/:uuid')
    .get(show)
    .put(update)
    .patch(update)
    .delete(destroy)

  router.get('/:parent/:parentUuid/:resource', list)

  return router
}

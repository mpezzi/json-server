# JSON Server UUID [![Build Status](https://travis-ci.org/mpezzi/json-server-uuid.svg)](https://travis-ci.org/mpezzi/json-server-uuid)

> Get a full fake REST API with __zero coding__ in __less than 30 seconds__ (seriously)

Forked from https://github.com/typicode/json-server

## <a name='toc'>Table of Contents</a>
  * [Example](#example)
  * [Routes](#routes)
  * [Install](#install)
  * [Extras](#extras)
  * [Links](#links)

## [[⬆]](#example) <a name="example">Example</a>

Create a `db.json` file

```javascript
{
  "posts": [
    {
      "uuid": "0003aae5-7543-6de4-f115-1b067a704106",
      "name": "Post name 1"
    },
    {
      "uuid": "0003asdf-7543-6de4-f115-1b067a70asdf",
      "name": "Post name 2"
    }
  ],
  "comments": [
    {
      "uuid": "0003rewq-7543-6de4-f115-1b067a70rewq",
      "name": "Comment name 1",
      "post": {
        "uuid": "0003aae5-7543-6de4-f115-1b067a704106",
        "name": "Post name 1"
      }
    },
    {
      "uuid": "0003zxcv-7543-6de4-f115-1b067a70zxcv",
      "name": "Comment name 2",
      "post": {
        "uuid": "0003asdf-7543-6de4-f115-1b067a70asdf",
        "name": "Post name 2"
      }
    },
  ],
  "tags": [
    {
      "uuid": "0003uiop-7543-6de4-f115-1b067a70uiop",
      "name": "JavaScript",
      "posts": [
        {
          "uuid": "0003aae5-7543-6de4-f115-1b067a704106",
          "name": "Post name 1"
        },
        {
          "uuid": "0003asdf-7543-6de4-f115-1b067a70asdf",
          "name": "Post name 2"
        }
      ]
    }
  ]
}
```

Start JSON Server

```bash
$ json-server db.json
```

Now if you go to [http://localhost:3000/posts/0003aae5-7543-6de4-f115-1b067a704106](), you'll get

```javascript
{
  "uuid": "0003aae5-7543-6de4-f115-1b067a704106",
  "name": "Post name 1"
}
```

Also, if you make POST, PUT, PATCH or DELETE requests, changes will be saved to `db.json`

## [[⬆]](#routes) <a name="routes">Routes</a>

Here are all the available routes.

```
GET   /posts
GET   /posts/0003aae5-7543-6de4-f115-1b067a704106
GET   /posts/0003aae5-7543-6de4-f115-1b067a704106/comments
GET   /posts?title=json-server&author=typicode
POST  /posts
PUT   /posts/0003aae5-7543-6de4-f115-1b067a704106
PATCH /posts/0003aae5-7543-6de4-f115-1b067a704106
DEL   /posts/0003aae5-7543-6de4-f115-1b067a704106
```

To slice resources, add `_start` and `_end`.

```
GET /posts?_start=0&_end=10
GET /posts/0003aae5-7543-6de4-f115-1b067a704106/comments?_start=0&_end=10
```

To sort resources, add `_sort` and `_order` (ascending order by default).

```
GET /posts?_sort=views&_order=DESC
GET /posts/0003aae5-7543-6de4-f115-1b067a704106/comments?_sort=votes&_order=ASC
```

To make a full-text search on resources, add `q`.

```
GET /posts?q=internet
```

Returns database.

```
GET /db
```

Returns default index file or serves `./public` directory.

```
GET /
```

## [[⬆]](#install) <a name="install">Install</a>

```bash
$ npm install -g json-server
```

## [[⬆]](#extras) <a name="extras">Extras</a>

### Static file server

You can use JSON Server to serve your HTML, JS and CSS, simply create a `./public` directory.

### Access from anywhere

You can access your fake API from anywhere using CORS and JSONP.

### Remote schema

You can load remote schemas:

```bash
$ json-server http://example.com/file.json
```

### JS file support

You can use JS to programmatically create data:

```javascript
module.exports = function() {
  data = { users: [] }
  // Create 1000 users
  for (var i = 0; i < 1000; i++) {
    data.users.push({ name: 'user' + i })
  }
  return data
}
```

```bash
$ json-server index.js
```

### Module

You can use JSON Server as a module:

```javascript
var jsonServer = require('json-server-uuid')

var object = {
  posts: [
    { id: 1, body: 'foo' }
  ]
}

var router = jsonServer.router(object) // Express router
var server = jsonServer.create()       // Express server

server.use(router)
server.listen(3000)
```

## [[⬆]](#links) <a name="links">Links</a>

### Projects

* [Grunt JSON Server](https://github.com/tfiwm/grunt-json-server)
* [Docker JSON Server](https://github.com/clue/docker-json-server)
* [JSON Server GUI](https://github.com/naholyr/json-server-gui)

## License

MIT - [Typicode](https://github.com/typicode)

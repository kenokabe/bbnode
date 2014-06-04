/* jshint node: true */
/* jshint sub: true */
'use strict';

var log = function(msg)
{
  var util = require('util');
  process.stdout.write('CORE: ');
  process.stdout.write(util.inspect(msg,
  {
    depth: 99,
    colors: true
  }));
  process.stdout.write('\n');
};


//initial one-time log on the app launch
var os = require('os');
log('!!!!!! App = Node>app.js Launced !!!!!!!!!');
log(['OS Hostname:', os.hostname()].join(' '));
log(['OS Type:', os.type()].join(' '));
log(['OS Platform:', os.platform()].join(' '));
log(['OS Architecture:', os.arch()].join(' '));
log(['OS Total memory:', os.totalmem() / 1000 / 1000].join(' '));
log(['OS Free  memory:', os.freemem() / 1000 / 1000].join(' '));


var fs = require('fs');
log('==== load www Files on memory====');
var wwwDir = __dirname + '/www';
var wwwObj = {};

var seekDir = function(dir)
{
  fs.readdir(dir, function(err, dirA)
  {
    if (err)
    {
      var path0 = err.path;

      fs.readFile(path0, function(err, data)
      {
        if (err) throw err;
        var path1 = path0.split(wwwDir)[1];
        wwwObj[path1] = data;
        //  log(path1);
      });

    }
    else
    {
      for (var index in dirA)
      {
        //  log(dirA[ index ]);
        seekDir(dir + '/' + dirA[index]);
      }
    }
  });
};
seekDir(wwwDir);

log('---load modules---');

fs.readdir('./www/modules', function(err, modulesDir)
{
  log(modulesDir);
  //modules
  log('--modules init(require)');

  var modules = [];
  modulesDir.map(function(modulename)
  {
    log(modulename + ' is loading');
    modules[modulename] = require('./www/modules/' + modulename + '/module');
  });

  //=======================
  log('===read ./config/server.json');
  fs
    .readFile('./config/server.json',
      'utf8',
      function(err, data)
      {
        if (err)
        {
          log('Error: ' + err);
          return;
        }
        var obj1 = JSON.parse(data);
        log(obj1);
        log('===read ./config/forum.json');
        fs
          .readFile('./config/forum.json',
            'utf8',
            function(err, data)
            {
              if (err)
              {
                log('Error: ' + err);
                return;
              }
              var obj2 = JSON.parse(data);
              log(obj2);



              var port = obj1.port;
              log('port: ' + port);

              log('===run server==========');
              //
              var http = require('http');
              var path = require('path');
              var url = require('url');

              var mimeTypes = {
                'html': 'text/html',
                'jpeg': 'image/jpeg',
                'jpg': 'image/jpeg',
                'png': 'image/png',
                'js': 'text/javascript',
                'css': 'text/css'
              };

              var server = http
                .createServer(function(req, res)
                {
                  log('->http requestet---');
                  var uri = url.parse(req.url)
                    .pathname;
                  log(uri);
                  try
                  {
                    if (uri === '/')
                    {
                      uri = '/index.html';
                      log('/ -> /index.html');
                    }

                    var mimeType = mimeTypes[path.extname(uri).split('.')[1]];
                    log(mimeType);
                    res.writeHead(200,
                    {
                      'Content-Type': mimeType
                    });
                    if (!wwwObj[uri])
                    {
                      log('no file');
                      /*
                              res.writeHead(200,
                              {
                                  'Content-Type': 'text/html'
                              });
                              uri = '/index.html';
                              res.end(wwwObj[uri]);
                              */
                      res.writeHead(404,
                      {
                        'Content-Type': 'text/plain'
                      });
                      res.write('404 Not Found\n');
                      res.end();
                      return;
                    }
                    else
                    {
                      res.end(wwwObj[uri]);
                    }
                  }
                  catch (e)
                  {
                    return;
                  }

                })
                .listen(port, function()
                {
                  log('HTTP listening ' + port);

                  //--------------------

                  //-------------------
                });

              var socketio = require('socket.io')(server);
              /*
              socketio.configure('production', function()
              {
                  log(" set config for production");
                  io.enable('browser client minification'); // send minified client
                  io.enable('browser client etag'); // apply etag caching logic based on version number
                  io.enable('browser client gzip'); // gzip the file
                  io.set('log level', 1); // reduce logging
                  io.set('transports', [ // enable all transports (optional if you want flashsocket)
                      'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
                  ]);
              });
              */
              socketio
                .on('connection',
                  function(socket)
                  {
                    log('socket connected: ' + socket.id);


                    //---------
                    socket
                      .on('msg',
                        function(msg, f)
                        {
                          log(msg);

                          if (msg.cmd === 'socketid')
                          {
                            f(socket.id);
                          }

                        })
                      .on('disconnect',
                        function()
                        {
                          log('disconnected: ' + socket.id);
                        })
                      .on('reconnect',
                        function()
                        {
                          log('reconnected: ' + socket.id);
                        });


                    log('loading modules=======');
                    modulesDir
                      .map(function(modulename)
                      {
                        // module socket @server
                        log('loading module @' + modulename);
                        modules[modulename].socket(socket);

                        // invoke module socket @client (emit via socket.io, so time-gap)
                        socket.emit('msg',
                        {
                          cmd: 'module',
                          sub: null,
                          data: modulename
                        });

                        //====These sockets corresponds in each side modules
                      });



                  });

              //===========






              //===================
              var _ = require('lazy.js');

              var db = [];
              db['x'] = []; //index for db
              db['s'] = []; //list for db

              db['id'] = []; // user id

              db['id'][0] = [];
              db['id'][0]['email'] = 'adm.bbnode@gmail.com';
              db['id'][0]['name'] = 'ken';

              log(db['id'][0]['email']);


              db['x']['email-id'] = [];
              db['x']['email-id']['adm.bbnode@gmail.com'] = 0;

              var id = db['x']['email-id']['adm.bbnode@gmail.com'];
              log(db['id'][id]['name']);
              db['postid'] = [];
              db['postid'][0] = [];
              db['postid'][0]['userid'] = 0;
              db['postid'][0]['time'] = 20010101125900;
              db['postid'][0]['html'] = '';
              db['postid'][0]['tag'] = [];
              db['postid'][0]['tag'][db['postid'][0]['tag'].length] = '全国';
              db['postid'][0]['tag'][db['postid'][0]['tag'].length] = '兵庫';
              db['postid'][0]['tag'][db['postid'][0]['tag'].length] = '神戸（兵庫）';
              db['postid'][0]['tag'][db['postid'][0]['tag'].length] = '求人';

              db['s']['tag'] = [];

              db['s']['tag']['全国'] = _([]);
              db['s']['tag']['兵庫'] = _([]);
              db['s']['tag']['神戸（兵庫）'] = _([]);
              db['s']['tag']['求人'] = _([]);

              db['s']['tag']['全国'] = db['s']['tag']['全国'].concat([0]);
              db['s']['tag']['兵庫'] = db['s']['tag']['兵庫'].concat([0]);
              db['s']['tag']['神戸（兵庫）'] = db['s']['tag']['神戸（兵庫）'].concat([0]); //add postid=0 to tag='兵庫県神戸市
              db['s']['tag']['求人'] = db['s']['tag']['求人'].concat([0]); //add postid=0 to tag='tag'


              var x = db['s']['tag']['求人']
                .intersection(db['s']['tag']['神戸（兵庫）'])
                .toArray();

              log(x);



              //=======================
            });
      });
});
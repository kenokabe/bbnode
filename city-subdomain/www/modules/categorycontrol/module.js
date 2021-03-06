/* jshint node: true */
/* jshint sub: true */
'use strict';

var moduleID = '@categorycontrol';

var log = function(msg)
{
  var util = require('util');
  process.stdout.write(moduleID + ': ');
  process.stdout.write(util.inspect(msg,
  {
    depth: 99,
    colors: true
  }));
  process.stdout.write('\n');
};

var g = global;
log(g.d);

var init = function()
{
  log('init');

};

init();

module.exports = {
  //on connect or reconnect
  socket: function(socket)
  {
    log(socket.id);


    socket
      .on('msg',
        function(msg, f)
        {
          if (msg.cmd === moduleID)
          {
            log(msg);
            if (msg.sub === 'query')
            {
              var tags = msg.data;

              var area = tags[0];
              var category = tags[1];

              var x = g.d['tag']['thread']['_' + category]
                .intersection(g.d['tag']['thread']['_' + area])
                .toArray();


              var result = {};
              x.map(function(postid)
              {
                log(g.d['postid'][postid]);

                var userid = g.d['postid'][postid]['userid'];
                log(userid);

                var username = g.d['id'][userid]['name'];

                var postdata = g.d['postid'][postid];
                var tags = postdata['_tag'].toArray();

                var threadid = postdata['threadid']; //100

                var threaddata = g.d['threadid'][threadid];
                var threadposts = threaddata['_postid'].toArray();
                log(threadposts);

                result[Object.keys(result).length] = {
                  postid: postid,
                  postdata: postdata,
                  tags: tags,
                  username: username,
                  threaddata: threaddata,
                  threadposts: threadposts
                };
              });

              log('##########');
              var resultS = JSON.stringify(result);

              log(resultS);
              f(resultS);
            }
          }
        });
  }

};

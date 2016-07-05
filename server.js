var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    //users = [];
	rooms = [];
    IDs = [];
//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
server.listen(8090);//for local test
server.listen(process.env.PORT || 3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket
io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname,roomName) {
        //每个ID代表一个用户
        var socketID = socket.id;
        if (rooms.indexOf(roomName)> -1){
            //如果房间已存在
            //查询房间内是否有该用户
            var users = rooms[roomName];
            if(users.indexOf(nickname)>-1){
                socket.emit('nickExisted');
            }else {
                socket.userIndex = users.length;
                socket.nickname = nickname;
                users.push(nickname);
                rooms[roomName] = users;
                socket.emit('loginSuccess');
                var datas = [];
                datas['roomName'] = roomName;
                datas['nickname'] = nickname;
                IDs[socketID] = datas;
                io.sockets.emit('system', nickname,rooms[roomName].length, 'login',roomName);
            }
        }else {
            rooms.push(roomName);
            var users = [];
            users.push(nickname);
            rooms[roomName] = users;
            var datas = [];
            socket.nickname = nickname;
            datas['roomName'] = roomName;
            datas['nickname'] = nickname;
            IDs[socketID] = datas;
            socket.emit('loginSuccess');

            io.sockets.emit('system', nickname,rooms[roomName].length, 'login',roomName);
        }
    });
    //user leaves
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //new message get
    socket.on('postMsg', function(msg, color,roomName) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color,roomName);
    });
    //new image get
    socket.on('img', function(imgData, color,roomName) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color,roomName);
    });
});
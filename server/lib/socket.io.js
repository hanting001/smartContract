const server = require('http').createServer();
const socketIO = require('socket.io');

let groupNsp = null;
let accountNsp = null;
exports.init = () => {
    this.io = socketIO.listen(server);
    // this.io.on('connection', (socket) => {
    //     console.log(socket);
    // });
    groupNsp = this.io.of('/group');
    groupNsp.on('connection', (socket) => {
        console.log('client connect to group socket');
    });
    accountNsp = this.io.of('/account');
};
server.listen(8081, () => console.log('socket.io listen on 8081'));

exports.groupUpdated = function(data) {
    groupNsp.emit('updated', data);
};
exports.accountUpdated = function(id, data) {
    if (id) {
        accountNsp.to(id).emit('updated', data);
    } else {
        accountNsp.emit('updated', data);
    }
    
}
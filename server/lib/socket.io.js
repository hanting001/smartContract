const server = require('http').createServer();
const socketIO = require('socket.io');


exports.init = () => {
    this.io = socketIO.listen(server);
    // this.io.on('connection', (socket) => {
    //     console.log(socket);
    // });
    this.groupNsp = this.io.of('/group');
    this.groupNsp.on('connection', (socket) => {
        console.log('client connect to group socket');
    })
}
server.listen(8081, () => console.log('socket.io listen on 8081'));

exports.group = () => {
    return this.groupNsp
};
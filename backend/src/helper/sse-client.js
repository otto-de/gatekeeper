/*
    source: https://github.com/fmvilas/sse
 */

const http = require('http');
const util = require('util');
const EventEmitter = require('events');

module.exports = function sse(req, res, options) {
    return new SSE(req, res, options)
};

function SSE(req, res, options) {
    if (!(req instanceof http.IncomingMessage)) throw Error('Invalid HTTP request object.');
    if (!(res instanceof http.OutgoingMessage)) throw Error('Invalid HTTP response object.');
    options = options && typeof options === 'object' ? options : {};

    res.sse = this;
    this.req = req;
    this.res = res;
    this.options = options;
    this.events = {};
    this.id = 0;

    req.socket.setNoDelay();

    options.padding = options.padding || true;
    options.heartbeat = options.heartbeat || false;

    this.writeHeaders();
    if (options.padding) this.writePadding();
    if (options.heartbeat) this.handleHeartbeat()
}
util.inherits(SSE, EventEmitter);

SSE.prototype.writeHeaders = function () {
    this.res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    })
};

SSE.prototype.writePadding = function () {
    this.res.write(`:${Array(2049).join(' ')}\n`) // 2kB
};

SSE.prototype.writeRetry = function () {
    this.res.write(`retry: ${this.options.retry || 3000}\n`)
};

SSE.prototype.handleHeartbeat = function () {
    setInterval(() => {
        this.res.write('data: \n\n')
    }, 10000)
};

SSE.prototype.send = function (data) {
    const data_string = this.convertToString(data);
    const data_lines = data_string.split('\n');

    this.writeRetry();

    for (const line of data_lines) {
        this.res.write(`data: ${line}\n`)
    }

    this.res.write('\n')
};

SSE.prototype.sendEvent = function (topic, data) {
    if (typeof topic !== 'string') throw Error('Invalid event topic. It must be a string.');

    this.res.write(`event: ${topic}\n`);
    this.res.write(`id: ${++this.id}\n`);
    this.send(data)
};

SSE.prototype.disconnect = function (last_will) {
    this.req.socket.on('close', (had_error) => {
        this.emit('close', had_error)
    });

    this.req.socket.end(this.convertToString(last_will), 'utf-8')
};

SSE.prototype.convertToString = function (data) {
    switch (typeof data) {
        case 'object':
            return JSON.stringify(data);
        case 'function':
            return this.convertToString(data());
        case 'undefined':
            return '';
        default:
            return String(data)
    }
};
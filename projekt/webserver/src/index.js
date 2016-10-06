import WebServer from './lib/WebServer';

export default {
	start: function start() {
		let server = new WebServer();
		server.start();
		return server;
	}
};

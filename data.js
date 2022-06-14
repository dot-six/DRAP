const fs = require('fs');

const agent = require('superagent');

let servers = require('./servers.json');

function get_server(tld) {
	for (const server of servers.services) {
		// TODO: Use all servers available
		if (server[0].includes(tld)) return server[1][0];
	}

	return undefined;
}

async function fetch_new_data() {
	const date = new Date(servers.publication);
	const nonce = new Date();
	const delta = nonce - date;

	console.info('[i]', 'Last update:', delta / 1000, 'seconds');

	if ((delta / 1000) >= 86400 * 2) {
		await agent
		.get('https://data.iana.org/rdap/dns.json')
		.then(write_data);

		servers = JSON.parse(fs.readFileSync('./servers.json'));

		return 1;
	}


	return 0;
}

function write_data(res) {
	if (res.status !== 200) {
		console.error('[!]', res.body);
		process.exit(1);
	}

	let data = res.body;
	data.publication = new Date();

	fs.writeFileSync('./servers.json', JSON.stringify(data));
}

module.exports = {
	get_server,
	fetch_new_data
};

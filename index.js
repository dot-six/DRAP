const fs = require('fs');

const agent = require('superagent');

const { get_server, fetch_new_data } = require('./data');

async function main() {
	const argv = process.argv.slice(2);

	console.log('[*]', 'Fetching new data if necessary');
	let rs = await fetch_new_data();
	if (rs) {
		console.info('[i]', 'Fetched new data');
	}

	const domain = argv[0];
	const tld = domain?.split('.').pop();

	if (tld === undefined) {
		console.error('[!]', 'Domain', domain, 'is invalid');
		return 1;
	}

	let serverEndpoint = get_server(tld);
	if (!serverEndpoint.endsWith('/')) serverEndpoint += '/';
	console.info('[i]', `Get server for .${tld}:`, serverEndpoint);

	console.log('[*]', 'Starting query for availability...');

	await agent
	.get(`${serverEndpoint}domain/${domain}`)
	.ok(res => res.status < 500)
	.then((res) => {
		const data = res.body;
		const status = res.status;

		if (status === 200) {
			console.info('[!]', 'Domain', domain, 'has been registered');
		} else if (status === 404) {
			console.info('[$]', 'Domain', domain, 'has NOT been registered');
		} else {
			console.log('[!]', 'Something happened');
			console.dir(res, {depth:null});
		}
	}).catch(err => {
		if (err) {
			console.error('[!]', err);
			process.exit(1);
		}
	});

	return 0;
}

main().then(process.exit);

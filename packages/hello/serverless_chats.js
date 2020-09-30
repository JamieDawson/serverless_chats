// jshint esversion: 9

/**
 * @description null
 * @param {ParamsType} params list of command parameters
 * @param {?string} commandText text message
 * @param {!object} [secrets = {}] list of secrets
 * @return {Promise<SlackBodyType>} Response body
 */

async function install(pkgs) {
	pkgs = pkgs.join(' ');
	return new Promise((resolve, reject) => {
		const {exec} = require('child_process');
		exec(`npm install ${pkgs}`, (err, stdout, stderr) => {
			if (err) reject(err);
			else resolve();
		});
	});
}

async function _command(params, commandText, secrets = {}) {
	//rss-parser is a npm package that does not automatically come with commander, so it must be added in install()
	let packages = ['rss-parser'];
	await install(packages);

	let Parser = require('rss-parser');
	let parser = new Parser();

	let feed = await parser.parseURL(
		'https://feeds.transistor.fm/serverless-chats'
	);

	var title = feed.items[0].title;
	var desc = feed.items[0].itunes.subtitle;
	var chatLink = feed.items[0].link;

	return {
		response_type: 'in_channel', // or `ephemeral` for private response
		text: title + '\n' + desc + '\n' + chatLink,
	};
}

/**
 * @typedef {object} SlackBodyType
 * @property {string} text
 * @property {'in_channel'|'ephemeral'} [response_type]
 */

const main = async (args) => ({
	body: await _command(
		args.params,
		args.commandText,
		args.__secrets || {}
	).catch((error) => ({
		// To get more info, run `/nc activation_log` after your command executes
		response_type: 'ephemeral',
		text: `Error: ${error.message}`,
	})),
});
module.exports = main;

/*
	console.log(feed.items[0].title); // Gets title of episode!
	console.log(feed.items[0].itunes.subtitle); //Gets description of episode!
	console.log(feed.items[0].link); // gets link to episode!
 */

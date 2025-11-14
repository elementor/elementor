'use strict';

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const {
	TICKETS_LIST,
	JIRA_VERSION,
	TARGET_BRANCH,
	BASE_BRANCH,
	JIRA_CLIENT_ID,
	JIRA_CLIENT_SECRET,
	JIRA_CLOUD_INSTANCE_BASE_URL,
} = process.env;

console.log('🔧 Configuration:');
console.log(`   Tickets List: ${TICKETS_LIST ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   Jira Version: ${JIRA_VERSION ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   Target Branch: ${TARGET_BRANCH || '❌ NOT SET'}`);
console.log(`   Base Branch: ${BASE_BRANCH || '❌ NOT SET'}`);
console.log('');

if (!TARGET_BRANCH) {
	console.error('❌ Error: TARGET_BRANCH is required');
	process.exit(1);
}

if (!TICKETS_LIST && !JIRA_VERSION) {
	console.error('❌ Error: Either TICKETS_LIST or JIRA_VERSION must be provided');
	process.exit(1);
}

const parseTickets = (ticketsStr) => {
	return ticketsStr
		.split(',')
		.map(t => t.trim().toUpperCase())
		.map(t => t.replace(/ED(\d+)/, 'ED-$1'))
		.filter(t => t.match(/^ED-\d+$/));
};

const getTicketsFromJira = async () => {
	return new Promise((resolve, reject) => {
		if (!JIRA_CLIENT_ID || !JIRA_CLIENT_SECRET || !JIRA_CLOUD_INSTANCE_BASE_URL) {
			reject(new Error('Missing Jira credentials'));
			return;
		}

		const versionsToTry = [];
		const sanitizedVersion = JIRA_VERSION.replace(/^v/, '');
		
		versionsToTry.push(sanitizedVersion);
		versionsToTry.push(JIRA_VERSION);
		
		const majorMinor = sanitizedVersion.split('.').slice(0, 2).join('.');
		if (majorMinor !== sanitizedVersion) {
			versionsToTry.push(majorMinor);
			if (!JIRA_VERSION.startsWith('v')) {
				versionsToTry.push(`v${majorMinor}`);
			}
		}

		console.log(`🔍 Fetching tickets from Jira version: ${JIRA_VERSION}`);
		console.log(`   Trying formats: ${versionsToTry.join(', ')}\n`);

		const tryNextVersion = (index = 0) => {
			if (index >= versionsToTry.length) {
				console.log(`❌ No tickets found with any version format\n`);
				resolve([]);
				return;
			}

			const versionToTry = versionsToTry[index];
			const auth = Buffer.from(`${JIRA_CLIENT_ID}:${JIRA_CLIENT_SECRET}`).toString('base64');
			
			let jqlQuery = `project = ED AND fixVersion = "${versionToTry}" ORDER BY created DESC`;
			const jql = encodeURIComponent(jqlQuery);
			
			console.log(`   Trying query: ${jqlQuery}`);
			
			let baseUrl = JIRA_CLOUD_INSTANCE_BASE_URL.trim();
			if (!baseUrl.startsWith('https://')) {
				baseUrl = `https://${baseUrl}`;
			}

			const url = new URL(`${baseUrl}/rest/api/3/search/jql?jql=${jql}&maxResults=500&fields=key`);

			const req = https.request(url, {
				method: 'GET',
				headers: {
					'Authorization': `Basic ${auth}`,
					'Accept': 'application/json',
				}
			}, (res) => {
				let data = '';
				res.on('data', chunk => data += chunk);
				res.on('end', () => {
					if (res.statusCode >= 400) {
						console.log(`   ❌ "${versionToTry}" - API error (${res.statusCode})`);
						tryNextVersion(index + 1);
						return;
					}

					try {
						const response = JSON.parse(data);
						const tickets = (response.issues || []).map(i => i.key).sort();
						
						if (tickets.length > 0) {
							console.log(`   ✅ Found ${tickets.length} tickets with "${versionToTry}"\n`);
							resolve(tickets);
						} else {
							console.log(`   ⚠️  "${versionToTry}" - 0 tickets found`);
							tryNextVersion(index + 1);
						}
					} catch (e) {
						console.log(`   ❌ "${versionToTry}" - Parse error`);
						tryNextVersion(index + 1);
					}
				});
			});

			req.on('error', () => {
				console.log(`   ❌ "${versionToTry}" - Network error`);
				tryNextVersion(index + 1);
			});
			req.end();
		};

		tryNextVersion();
	});
};

const getBranchCommits = () => {
	try {
		console.log(`\n🔍 Fetching commits from branch: ${TARGET_BRANCH}\n`);
		
		const baseRef = `remotes/origin/${BASE_BRANCH}`;
		const targetRef = `remotes/origin/${TARGET_BRANCH}`;
		
		const cmd = `git log ${baseRef}..${targetRef} --pretty=format:"%B"`;
		console.log(`   Running: ${cmd}`);
		
		const commits = execSync(cmd, { encoding: 'utf-8' });
		console.log(`   ✅ Got commits\n`);
		return commits;
	} catch (error) {
		console.error(`   ❌ Error: ${error.message}`);
		return '';
	}
};

const extractTickets = (commitMessages) => {
	const tickets = new Set();
	const matches = commitMessages.match(/ED-?\d+/g) || [];
	matches.forEach(t => {
		const normalized = t.replace(/ED(\d+)/, 'ED-$1');
		tickets.add(normalized);
	});
	return Array.from(tickets).sort();
};

const main = async () => {
	try {
		let requiredTickets = [];

		if (TICKETS_LIST) {
			console.log(`📋 Using provided tickets list\n`);
			requiredTickets = parseTickets(TICKETS_LIST);
		} else if (JIRA_VERSION) {
			requiredTickets = await getTicketsFromJira();
		}

		console.log(`📋 Checking for ${requiredTickets.length} tickets:`);
		console.log(`   ${requiredTickets.join(', ')}\n`);

		const commits = getBranchCommits();
		const mergedTickets = extractTickets(commits);

		console.log(`📊 Branch commits contain ${mergedTickets.length} tickets:`);
		console.log(`   ${mergedTickets.length > 0 ? mergedTickets.join(', ') : 'None'}\n`);

		const missing = requiredTickets.filter(t => !mergedTickets.includes(t));

		console.log(`📈 Results:`);
		console.log(`   Total required: ${requiredTickets.length}`);
		console.log(`   Found: ${requiredTickets.length - missing.length}`);
		console.log(`   Missing: ${missing.length}\n`);

		if (missing.length === 0) {
			console.log(`✅ SUCCESS! All tickets are merged to ${TARGET_BRANCH}`);
			process.exit(0);
		} else {
			console.log(`⚠️  Missing tickets:`);
			missing.forEach(t => console.log(`   - ${t}`));
			process.exit(1);
		}
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exit(1);
	}
};

main();

'use strict';

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const {
	JIRA_VERSION,
	TARGET_BRANCH,
	BASE_BRANCH,
	JIRA_CLIENT_ID,
	JIRA_CLIENT_SECRET,
	JIRA_CLOUD_INSTANCE_BASE_URL,
} = process.env;

console.log('🔧 Environment Variables Check:');
console.log(`   JIRA_VERSION: ${JIRA_VERSION || '❌ NOT SET'}`);
console.log(`   TARGET_BRANCH: ${TARGET_BRANCH || '❌ NOT SET'}`);
console.log(`   BASE_BRANCH: ${BASE_BRANCH || '❌ NOT SET'}`);
console.log(`   JIRA_CLIENT_ID: ${JIRA_CLIENT_ID ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   JIRA_CLIENT_SECRET: ${JIRA_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   JIRA_CLOUD_INSTANCE_BASE_URL: ${JIRA_CLOUD_INSTANCE_BASE_URL || '❌ NOT SET'}`);
console.log('');

const setGitHubOutput = (key, value) => {
	const output = `${key}=${value}\n`;
	fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
};

const REQUIRED_VARS = ['JIRA_VERSION', 'TARGET_BRANCH', 'BASE_BRANCH', 'JIRA_CLIENT_ID', 'JIRA_CLIENT_SECRET', 'JIRA_CLOUD_INSTANCE_BASE_URL'];
const missingVars = REQUIRED_VARS.filter(v => !process.env[v]);

if (missingVars.length > 0) {
	console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
	
	setGitHubOutput('total_tickets', '0');
	setGitHubOutput('merged_tickets', '0');
	setGitHubOutput('result', 'error');
	setGitHubOutput('missing_tickets', `ERROR: Missing variables: ${missingVars.join(', ')}`);
	
	process.exit(1);
}

const getBasicAuthHeader = () => {
	const authString = Buffer.from(`${JIRA_CLIENT_ID}:${JIRA_CLIENT_SECRET}`).toString('base64');
	return `Basic ${authString}`;
};

const makeJiraRequest = (path) => {
	return new Promise((resolve, reject) => {
		let baseUrl = JIRA_CLOUD_INSTANCE_BASE_URL.trim();
		
		if (!baseUrl.startsWith('https://')) {
			baseUrl = `https://${baseUrl}`;
		}
		
		const fullUrl = `${baseUrl}${path}`;
		console.log(`   Full URL: ${fullUrl.substring(0, 100)}...`);
		
		const url = new URL(fullUrl);

		const options = {
			hostname: url.hostname,
			path: url.pathname + url.search,
			method: 'GET',
			headers: {
				'Authorization': getBasicAuthHeader(),
				'Accept': 'application/json',
			},
		};

		https.request(options, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				if (res.statusCode >= 400) {
					reject(new Error(`Jira API error (${res.statusCode}): ${data}`));
					return;
				}

				try {
					resolve(JSON.parse(data));
				} catch (err) {
					reject(new Error(`Failed to parse Jira response: ${err.message}`));
				}
			});
		}).on('error', reject).end();
	});
};

const getVersionTickets = async () => {
	try {
		console.log(`🔍 Fetching tickets for version: ${JIRA_VERSION}`);
		
		const sanitizedVersion = JIRA_VERSION.replace(/^v/, '');
		const jql = encodeURIComponent(`project = ED AND fixVersion = "${sanitizedVersion}"`);
		const path = `/rest/api/3/search/jql?jql=${jql}&maxResults=500&fields=key`;

		console.log(`   JQL Query: project = ED AND fixVersion = "${sanitizedVersion}"`);
		console.log(`   Request path: ${path}`);

		const response = await makeJiraRequest(path);
		
		if (!response.issues) {
			console.error('❌ Unexpected Jira response format:', JSON.stringify(response, null, 2));
			throw new Error('Jira response missing "issues" field');
		}

		const tickets = response.issues.map(issue => issue.key);

		console.log(`✅ Found ${tickets.length} tickets in version ${JIRA_VERSION}`);
		if (tickets.length > 0) {
			console.log(`   Tickets: ${tickets.join(', ')}`);
		}

		return tickets;
	} catch (error) {
		console.error('❌ Failed to fetch Jira version tickets:', error.message);
		console.error('   This could be due to:');
		console.error('   - Invalid OAuth credentials (JIRA_CLIENT_ID or JIRA_CLIENT_SECRET)');
		console.error('   - Invalid JIRA_CLOUD_INSTANCE_BASE_URL');
		console.error('   - Version name not found in Jira');
		console.error('   - Missing permissions in OAuth app');
		console.error('   - Network connectivity issues');
		console.error('');
		console.error('   📋 Debugging steps:');
		console.error('   1. Check your Jira OAuth app config at: https://developer.atlassian.com/console/myapps/');
		console.error('   2. Verify the app has "Search Jira issues" permission');
		console.error('   3. Try a manual Jira API call with your credentials');
		
		setGitHubOutput('total_tickets', '0');
		setGitHubOutput('merged_tickets', '0');
		setGitHubOutput('result', 'error');
		setGitHubOutput('missing_tickets', `ERROR: Failed to fetch Jira tickets: ${error.message}`);
		
		process.exit(1);
	}
};

const getBranchCommits = () => {
	try {
		console.log(`\n🔍 Fetching commits from ${TARGET_BRANCH}...`);

		const commits = execSync(
			`git log ${BASE_BRANCH}..origin/${TARGET_BRANCH} --pretty=format:%B`,
			{ encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
		);

		return commits;
	} catch (error) {
		console.warn(`⚠️  Could not fetch commits (this might be expected): ${error.message}`);
		return '';
	}
};

const extractTicketsFromCommits = (commitMessages) => {
	const ticketRegex = /ED-\d+/g;
	const tickets = new Set();

	const matches = commitMessages.match(ticketRegex) || [];
	matches.forEach(ticket => tickets.add(ticket));

	return Array.from(tickets);
};

const findMissingTickets = (jiraTickets, branchTickets) => {
	const branchTicketSet = new Set(branchTickets);
	const missing = jiraTickets.filter(ticket => !branchTicketSet.has(ticket));

	return missing;
};

(async () => {
	try {
		console.log('🔐 Authenticating with Jira...\n');

		const jiraTickets = await getVersionTickets();
		const commitMessages = getBranchCommits();
		const branchTickets = extractTicketsFromCommits(commitMessages);

		console.log(`\n📊 Branch "${TARGET_BRANCH}" has ${branchTickets.length} unique tickets`);
		console.log(`   Tickets: ${branchTickets.length > 0 ? branchTickets.join(', ') : 'None found'}`);

		const missingTickets = findMissingTickets(jiraTickets, branchTickets);

		console.log(`\n📋 Verification Results:`);
		console.log(`   Total Jira tickets: ${jiraTickets.length}`);
		console.log(`   Merged tickets: ${jiraTickets.length - missingTickets.length}`);
		console.log(`   Missing tickets: ${missingTickets.length}`);

		setGitHubOutput('total_tickets', String(jiraTickets.length));
		setGitHubOutput('merged_tickets', String(jiraTickets.length - missingTickets.length));

		if (missingTickets.length === 0) {
			console.log(`\n✅ Success! All ${jiraTickets.length} tickets from ${JIRA_VERSION} are merged to ${TARGET_BRANCH}`);
			setGitHubOutput('result', 'success');
			setGitHubOutput('missing_tickets', 'None');
		} else {
			console.log(`\n⚠️  ${missingTickets.length} tickets are missing from ${TARGET_BRANCH}:`);
			missingTickets.forEach(ticket => console.log(`   - ${ticket}`));
			setGitHubOutput('result', 'failure');
			setGitHubOutput('missing_tickets', missingTickets.join('\n'));
		}
	} catch (error) {
		console.error('❌ Verification failed:', error.message);
		console.error('   Stack trace:', error.stack);
		
		setGitHubOutput('total_tickets', '0');
		setGitHubOutput('merged_tickets', '0');
		setGitHubOutput('result', 'error');
		setGitHubOutput('missing_tickets', `ERROR: ${error.message}`);
		
		process.exit(1);
	}
})();

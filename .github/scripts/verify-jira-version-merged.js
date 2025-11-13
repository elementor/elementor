'use strict';

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const {
	JIRA_VERSION,
	TARGET_BRANCH,
	BASE_BRANCH,
	JIRA_HOST,
	JIRA_USER,
	JIRA_API_TOKEN,
} = process.env;

const REQUIRED_VARS = ['JIRA_VERSION', 'TARGET_BRANCH', 'BASE_BRANCH', 'JIRA_HOST', 'JIRA_USER', 'JIRA_API_TOKEN'];
const missingVars = REQUIRED_VARS.filter(v => !process.env[v]);

if (missingVars.length > 0) {
	console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
	console.error('Please set JIRA_HOST, JIRA_USER, and JIRA_API_TOKEN as repository secrets');
	process.exit(1);
}

const makeJiraRequest = (path) => {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: JIRA_HOST,
			path,
			method: 'GET',
			auth: `${JIRA_USER}:${JIRA_API_TOKEN}`,
			headers: {
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
		const path = `/rest/api/3/search?jql=${jql}&maxResults=500&fields=key`;

		const response = await makeJiraRequest(path);
		const tickets = response.issues.map(issue => issue.key);

		console.log(`✅ Found ${tickets.length} tickets in version ${JIRA_VERSION}`);
		console.log(`   Tickets: ${tickets.join(', ')}`);

		return tickets;
	} catch (error) {
		console.error('❌ Failed to fetch Jira version tickets:', error.message);
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

const setGitHubOutput = (key, value) => {
	const output = `${key}=${value}\n`;
	fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
};

(async () => {
	try {
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

		setGitHubOutput('total_tickets', jiraTickets.length);
		setGitHubOutput('merged_tickets', jiraTickets.length - missingTickets.length);

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
		process.exit(1);
	}
})();


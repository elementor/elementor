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
		
		const versionsToTry = [];
		
		const sanitizedVersion = JIRA_VERSION.replace(/^v/, '');
		versionsToTry.push(sanitizedVersion);
		
		if (!JIRA_VERSION.startsWith('v')) {
			versionsToTry.push(`v${JIRA_VERSION}`);
		}
		
		const majorMinor = sanitizedVersion.split('.').slice(0, 2).join('.');
		if (majorMinor !== sanitizedVersion) {
			versionsToTry.push(majorMinor);
			versionsToTry.push(`v${majorMinor}`);
		}
		
		let tickets = [];
		
		for (const versionToTry of versionsToTry) {
			if (tickets.length > 0) break;
			
			const jql = encodeURIComponent(`project = ED AND fixVersion = "${versionToTry}"`);
			const path = `/rest/api/3/search/jql?jql=${jql}&maxResults=500&fields=key`;

			console.log(`   Trying: project = ED AND fixVersion = "${versionToTry}"`);

			const response = await makeJiraRequest(path);
			
			if (!response.issues) {
				console.error('❌ Unexpected Jira response format:', JSON.stringify(response, null, 2));
				throw new Error('Jira response missing "issues" field');
			}

			tickets = response.issues.map(issue => issue.key);
			
			if (tickets.length > 0) {
				console.log(`   ✅ Found ${tickets.length} tickets with version "${versionToTry}"`);
				break;
			}
		}

		console.log(`✅ Found ${tickets.length} tickets in version ${JIRA_VERSION}`);
		if (tickets.length > 0) {
			console.log(`   Tickets: ${tickets.join(', ')}`);
		} else {
			console.warn('\n⚠️  No tickets found. Possible reasons:');
			console.warn('   - Version name might be different in Jira');
			console.warn('   - Tickets might not be assigned to this version');
			console.warn('   - Try checking: https://elementor.atlassian.net/projects/ED/versions');
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

		try {
			execSync('git fetch --all --tags', { encoding: 'utf-8', stdio: 'pipe' });
			console.log('   ✅ Fetched all branches and tags');
		} catch (e) {
			console.warn('   ⚠️  Could not fetch all branches, continuing...');
		}

		let commits = '';
		const branchRefs = [
			`origin/${TARGET_BRANCH}`,
			TARGET_BRANCH,
		];

		for (const ref of branchRefs) {
			try {
				console.log(`   Trying to fetch from: ${ref}`);
				commits = execSync(
					`git log ${BASE_BRANCH}..${ref} --pretty=format:%B`,
					{ encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
				);
				console.log(`   ✅ Successfully fetched commits from ${ref}`);
				return commits;
			} catch (e) {
				console.log(`   ❌ Failed with ${ref}, trying next...`);
			}
		}

		throw new Error('Could not find branch in any expected location');
	} catch (error) {
		console.warn(`⚠️  Could not fetch commits: ${error.message}`);
		console.warn('   Try checking if the branch exists locally with: git branch -a');
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

'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

const {
	TICKETS_LIST,
	TARGET_BRANCH,
} = process.env;

const setOutput = (name, value) => {
	if (!process.env.GITHUB_OUTPUT) return;
	const output = `${name}=${value}\n`;
	fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
};

const setErrorOutputs = (error) => {
	setOutput('result', 'error');
	setOutput('error_message', error);
	setOutput('searched_tickets', 'N/A');
	setOutput('found_tickets', 'N/A');
	setOutput('missing_tickets', 'N/A');
	setOutput('total_required', '0');
	setOutput('total_found', '0');
};

console.log('Configuration:');
console.log(`   Tickets: ${TICKETS_LIST || 'NOT SET'}`);
console.log(`   Target Branch: ${TARGET_BRANCH || 'NOT SET'}`);
console.log('');

if (!TICKETS_LIST || !TARGET_BRANCH) {
	const error = 'TICKETS_LIST and TARGET_BRANCH are required';
	console.error(`Error: ${error}`);
	setErrorOutputs(error);
	process.exit(1);
}

const parseTickets = (ticketsStr) => {
	return ticketsStr
		.split(',')
		.map(t => t.trim().toUpperCase())
		.map(t => t.replace(/ED-?(\d+)/, 'ED-$1'))
		.filter(t => t.match(/^ED-\d+$/));
};

const branchExists = () => {
	try {
		execSync(`git rev-parse --verify remotes/origin/${TARGET_BRANCH}`, { encoding: 'utf-8', stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
};

const getBranchCommits = () => {
	const cmd = `git log remotes/origin/${TARGET_BRANCH} --pretty=format:"%B"`;
	return execSync(cmd, { encoding: 'utf-8' });
};

const extractTickets = (commitMessages) => {
	const tickets = new Set();
	const matches = commitMessages.match(/ED-?\d+/g) || [];
	matches.forEach(t => {
		const normalized = t.replace(/ED-?(\d+)/, 'ED-$1');
		tickets.add(normalized);
	});
	return Array.from(tickets).sort();
};

const main = () => {
	const requiredTickets = parseTickets(TICKETS_LIST);

	if (requiredTickets.length === 0) {
		const error = 'No valid tickets found. Expected format: ED-12345 or ED12345 (comma-separated)';
		console.error(`Error: ${error}`);
		setErrorOutputs(error);
		process.exit(1);
	}

	if (!branchExists()) {
		const error = `Branch "${TARGET_BRANCH}" not found. Make sure branch exists and is fetched.`;
		console.error(`Error: ${error}`);
		setErrorOutputs(error);
		process.exit(1);
	}

	const commits = getBranchCommits();
	const mergedTickets = extractTickets(commits);
	const foundTickets = requiredTickets.filter(t => mergedTickets.includes(t));
	const missing = requiredTickets.filter(t => !mergedTickets.includes(t));

	console.log(`Results:`);
	console.log(`   Total required: ${requiredTickets.length}`);
	console.log(`   Found: ${foundTickets.length}`);
	console.log(`   Missing: ${missing.length}\n`);

	setOutput('searched_tickets', requiredTickets.join(', '));
	setOutput('found_tickets', foundTickets.join(', ') || 'None');
	setOutput('missing_tickets', missing.length > 0 ? missing.join(', ') : 'None');
	setOutput('total_required', String(requiredTickets.length));
	setOutput('total_found', String(foundTickets.length));
	setOutput('result', missing.length === 0 ? 'success' : 'failure');

	if (missing.length === 0) {
		console.log(`SUCCESS! All tickets are merged to ${TARGET_BRANCH}`);
		process.exit(0);
	} else {
		console.log(`Missing tickets:`);
		missing.forEach(t => console.log(`   - ${t}`));
		process.exit(1);
	}
};

main();

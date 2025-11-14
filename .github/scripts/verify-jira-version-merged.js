'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

const {
	TICKETS_LIST,
	TARGET_BRANCH,
	BASE_BRANCH,
} = process.env;

console.log('Configuration:');
console.log(`   Tickets: ${TICKETS_LIST || 'NOT SET'}`);
console.log(`   Target Branch: ${TARGET_BRANCH || 'NOT SET'}`);
console.log(`   Base Branch: ${BASE_BRANCH || 'NOT SET'}`);
console.log('');

if (!TICKETS_LIST || !TARGET_BRANCH) {
	console.error('Error: TICKETS_LIST and TARGET_BRANCH are required');
	process.exit(1);
}

const parseTickets = (ticketsStr) => {
	return ticketsStr
		.split(',')
		.map(t => t.trim().toUpperCase())
		.map(t => t.replace(/ED(\d+)/, 'ED-$1'))
		.filter(t => t.match(/^ED-\d+$/));
};

const getBranchCommits = () => {
	try {
		const baseRef = BASE_BRANCH ? `remotes/origin/${BASE_BRANCH}` : null;
		const targetRef = `remotes/origin/${TARGET_BRANCH}`;
		
		const cmd = baseRef 
			? `git log ${baseRef}..${targetRef} --pretty=format:"%B"`
			: `git log ${targetRef} --pretty=format:"%B"`;
		
		const commits = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
		return commits;
	} catch (error) {
		console.error(`Error: Could not fetch commits from ${TARGET_BRANCH}`);
		console.error(`Command: git log remotes/origin/${TARGET_BRANCH}`);
		console.error(error.message);
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

const setOutput = (name, value) => {
	if (!process.env.GITHUB_OUTPUT) return;
	const output = `${name}=${value}\n`;
	fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
};

const main = () => {
	try {
		const requiredTickets = parseTickets(TICKETS_LIST);
		const commits = getBranchCommits();
		const mergedTickets = extractTickets(commits);
		const missing = requiredTickets.filter(t => !mergedTickets.includes(t));

		console.log(`Results:`);
		console.log(`  Required: ${requiredTickets.length}`);
		console.log(`  Found: ${requiredTickets.length - missing.length}`);
		console.log(`  Missing: ${missing.length}\n`);

		// Write outputs for GitHub summary
		setOutput('searched_tickets', requiredTickets.join(', '));
		setOutput('found_tickets', (requiredTickets.filter(t => mergedTickets.includes(t))).join(', ') || 'None');
		setOutput('missing_tickets', missing.length > 0 ? missing.join(', ') : 'None');
		setOutput('total_required', String(requiredTickets.length));
		setOutput('total_found', String(requiredTickets.length - missing.length));
		setOutput('result', missing.length === 0 ? 'success' : 'failure');

		if (missing.length === 0) {
			console.log(`SUCCESS! All tickets are merged to ${TARGET_BRANCH}`);
			process.exit(0);
		} else {
			console.log(`Missing tickets:`);
			missing.forEach(t => console.log(`   - ${t}`));
			process.exit(1);
		}
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
};

main();

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

const sanitizeBranchName = (branch) => {
	if (!/^[\w.\-/]+$/.test(branch)) {
		throw new Error(`Invalid branch name: "${branch}"`);
	}
	return branch;
};

const parseTickets = (ticketsStr) => {
	return ticketsStr
		.split(',')
		.map(t => t.trim().toUpperCase())
		.map(t => t.replace(/ED-?(\d+)/, 'ED-$1'))
		.filter(t => t.match(/^ED-\d+$/));
};

const branchExists = (branch) => {
	try {
		execSync(`git rev-parse --verify remotes/origin/${branch}`, { encoding: 'utf-8', stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
};

const findTicketsInBranch = (branch, tickets) => {
	if (tickets.length === 0) return new Set();

	const grepPatterns = tickets
		.map(t => {
			const num = t.replace('ED-', '');
			return `ED-${num}\\|ED${num}`;
		})
		.join('\\|');

	try {
		const cmd = `git log remotes/origin/${branch} --oneline --grep="${grepPatterns}"`;
		const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 });

		const foundTickets = new Set();
		const matches = result.match(/ED-?\d+/gi) || [];
		matches.forEach(match => {
			const normalized = match.toUpperCase().replace(/ED(\d+)/, 'ED-$1');
			if (tickets.includes(normalized)) {
				foundTickets.add(normalized);
			}
		});
		return foundTickets;
	} catch {
		return new Set();
	}
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

const main = () => {
	try {
		const branch = sanitizeBranchName(TARGET_BRANCH);
		const requiredTickets = parseTickets(TICKETS_LIST);

		if (requiredTickets.length === 0) {
			const error = 'No valid tickets found. Expected format: ED-12345 or ED12345 (comma-separated)';
			console.error(`Error: ${error}`);
			setErrorOutputs(error);
			process.exit(1);
		}

		if (!branchExists(branch)) {
			const error = `Branch "${branch}" not found. Make sure branch exists and is fetched.`;
			console.error(`Error: ${error}`);
			setErrorOutputs(error);
			process.exit(1);
		}

		console.log(`Checking ${requiredTickets.length} tickets in branch ${branch}...\n`);

		const foundSet = findTicketsInBranch(branch, requiredTickets);
		const foundTickets = requiredTickets.filter(t => foundSet.has(t));
		const missing = requiredTickets.filter(t => !foundSet.has(t));

		requiredTickets.forEach(ticket => {
			const icon = foundSet.has(ticket) ? '✓' : '✗';
			console.log(`   ${icon} ${ticket}`);
		});

		console.log(`\nResults:`);
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
			console.log(`SUCCESS! All tickets are merged to ${branch}`);
			process.exit(0);
		} else {
			console.log(`Missing tickets:`);
			missing.forEach(t => console.log(`   - ${t}`));
			process.exit(1);
		}
	} catch (error) {
		console.error(`Unexpected error: ${error.message}`);
		setErrorOutputs(`Unexpected error: ${error.message}`);
		process.exit(1);
	}
};

main();

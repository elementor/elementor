'use strict';

const { execSync } = require('child_process');

const {
	TICKETS_LIST,
	TARGET_BRANCH,
	BASE_BRANCH,
} = process.env;

console.log('🔧 Configuration:');
console.log(`   Tickets: ${TICKETS_LIST || '❌ NOT SET'}`);
console.log(`   Target Branch: ${TARGET_BRANCH || '❌ NOT SET'}`);
console.log(`   Base Branch: ${BASE_BRANCH || '❌ NOT SET'}`);
console.log('');

if (!TICKETS_LIST || !TARGET_BRANCH) {
	console.error('❌ Error: TICKETS_LIST and TARGET_BRANCH are required');
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

const main = () => {
	try {
		const requiredTickets = parseTickets(TICKETS_LIST);
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

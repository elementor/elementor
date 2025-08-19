const { GITHUB_REPOSITORY, GITHUB_TOKEN, DAYS_TO_UPDATE } = process.env;

const updatePullRequests = async () => {
	const lastDays = new Date();
	lastDays.setDate( lastDays.getDate() - DAYS_TO_UPDATE );
	const lastDaysString = lastDays.toISOString().split( 'T' )[0];

	const url = `https://api.github.com/search/issues?q=repo:${GITHUB_REPOSITORY}+type:pr+is:open+draft:false+base:main+created:>=${lastDaysString}`;
	const headers = {
		Authorization: `token ${GITHUB_TOKEN}`,
		Accept: 'application/vnd.github.v3+json',
	};

	try {
		const response = await fetch( url, { headers } );
		const data = await response.json();

		console.log( 'Preparing to update the following PRs:', data.items.map( item => item.number ).join( ', ' ) );

		for (const item of data.items) {
			const prNumber = item.number;
			const updateUrl = `https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls/${prNumber}/update-branch`;
			try {
				const response = await fetch( updateUrl, {
					method: 'PUT',
					headers,
				} );

				const results = await response.json();
				console.log( { results } );
			} catch (error) {
				console.log( { error } );
			}
		}
	} catch (error) {
		console.log( { error } );
		process.exit( 1 );
	}
};

updatePullRequests();

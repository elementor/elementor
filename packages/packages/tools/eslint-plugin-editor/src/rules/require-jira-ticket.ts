import { type Rule } from '@commitlint/types';

export const requireJiraTicket = ( ( { subject }, _, value: undefined | { prefix?: string } ) => {
	if ( ! subject ) {
		return [ false, 'Your commit should contain a subject' ];
	}

	const prefix = value?.prefix?.trim();

	if ( ! prefix ) {
		return [ false, 'Your configuration must contain a ticket prefix' ];
	}

	const ticketRegex = new RegExp( `\\S\\s\\[${ prefix }-\\d+]$` );

	return [
		ticketRegex.test( subject ),
		`Your subject should contain a JIRA issue prefixed with '${ prefix }-', ` +
			'have a single space before the issue number, and no spaces afterwards.' +
			`Example: 'feat(package): add feature [${ prefix }-1234]'`,
	];
} ) satisfies Rule;

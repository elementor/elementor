import { type Plugin } from '@commitlint/types';

import { requireJiraTicket } from './rules/require-jira-ticket';
import { requireScope } from './rules/require-scope';

export const commitlintPluginEditor = {
	rules: {
		'editor/require-jira-ticket': requireJiraTicket,
		'editor/require-scope': requireScope,
	},
} satisfies Plugin;

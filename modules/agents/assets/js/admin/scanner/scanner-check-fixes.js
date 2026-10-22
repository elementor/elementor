import { FIX_WITH_ANGIE, FIX_WITH_LINK, FIX_WITH_TOGGLE } from './scanner-constants';

const ACTIVATION_TOGGLE_FIX = {
	fixWith: FIX_WITH_TOGGLE,
	isLocal: true,
	resolvedByActivation: true,
};

const AGENT_ACCESS_LINK_FIX = {
	fixWith: FIX_WITH_LINK,
	fixUrl: null,
	isLocal: true,
	resolvedByActivation: false,
};

const DEFAULT_FIX = {
	fixWith: FIX_WITH_ANGIE,
	isLocal: false,
	resolvedByActivation: false,
};

const CHECK_FIXES = {
	'llms-txt-exists': ACTIVATION_TOGGLE_FIX,
	'llms-txt-formatting': AGENT_ACCESS_LINK_FIX,
	'llms-txt-links-resolve': AGENT_ACCESS_LINK_FIX,
	'markdown-url-fallback': ACTIVATION_TOGGLE_FIX,
	'markdown-link-alternate': ACTIVATION_TOGGLE_FIX,
	'markdown-negotiation': ACTIVATION_TOGGLE_FIX,
	'markdown-negotiation-vary': ACTIVATION_TOGGLE_FIX,
	'markdown-frontmatter': ACTIVATION_TOGGLE_FIX,
	'robots-ai-policy-quality': ACTIVATION_TOGGLE_FIX,
	'robots-agent-user-policy': ACTIVATION_TOGGLE_FIX,
	'agent-discovery-file': ACTIVATION_TOGGLE_FIX,
	'ard-catalog': ACTIVATION_TOGGLE_FIX,
	'link-headers-discovery': ACTIVATION_TOGGLE_FIX,
};

export const getCheckFix = ( checkId ) => CHECK_FIXES[ checkId ] ?? DEFAULT_FIX;

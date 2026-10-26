import { getToggleModuleKey } from './scanner-check-settings';
import {
	FIX_BY_ALLY,
	FIX_BY_ANGIE,
	FIX_BY_ANGIE_MCP,
	FIX_BY_BUILT_IN,
	FIX_BY_MANUAL,
	FIX_BY_SEO_PLUGIN,
	FIX_DETAILS_NOT_APPLICABLE,
	FIX_WITH_ANGIE,
	FIX_WITH_MANUAL,
	FIX_WITH_SEO,
	FIX_WITH_TOGGLE,
} from './scanner-constants';

const PROMPT_MARKER = 'prompt:';
const QUOTED_TEXT = /"([^"]*)"/;

const ANGIE_FIX_BY = [ FIX_BY_ANGIE, FIX_BY_ANGIE_MCP, FIX_BY_ALLY ];

const normalizeFix = ( fixText ) => ( 'string' === typeof fixText ? fixText : '' );

const normalizeFixBy = ( fixBy ) => ( 'string' === typeof fixBy ? fixBy.trim().toLowerCase() : '' );

const stripPromptPrefix = ( text ) => {
	const trimmed = text.trim();

	if ( trimmed.toLowerCase().startsWith( PROMPT_MARKER ) ) {
		return trimmed.slice( PROMPT_MARKER.length ).trim();
	}

	return trimmed;
};

const getQuotedOrPromptText = ( instructionText ) => {
	const quoted = instructionText.match( QUOTED_TEXT );

	if ( quoted ) {
		return stripPromptPrefix( quoted[ 1 ] );
	}

	const markerAt = instructionText.toLowerCase().indexOf( PROMPT_MARKER );

	if ( markerAt >= 0 ) {
		return instructionText.slice( markerAt + PROMPT_MARKER.length ).trim();
	}

	return '';
};

const hasPromptMarker = ( instructionText ) => instructionText.toLowerCase().includes( PROMPT_MARKER );

const getInstructionText = ( check ) => {
	const fixDetails = normalizeFix( check?.fixDetails ).trim();

	if ( fixDetails && FIX_DETAILS_NOT_APPLICABLE !== fixDetails.toLowerCase() ) {
		return fixDetails;
	}

	return normalizeFix( check?.fix ).trim();
};

const manualFix = ( howToFix ) => ( {
	fixWith: FIX_WITH_MANUAL,
	fixPrompt: '',
	howToFix,
	resolvedByActivation: false,
} );

const angieFix = ( instructionText ) => {
	const extractedPrompt = getQuotedOrPromptText( instructionText );
	const prompt = extractedPrompt || instructionText.trim();

	if ( ! prompt ) {
		return manualFix( '' );
	}

	return {
		fixWith: FIX_WITH_ANGIE,
		fixPrompt: prompt,
		howToFix: prompt,
		resolvedByActivation: false,
	};
};

const toggleFix = ( howToFix ) => ( {
	fixWith: FIX_WITH_TOGGLE,
	fixPrompt: '',
	howToFix,
	resolvedByActivation: false,
} );

const seoFix = ( howToFix ) => ( {
	fixWith: FIX_WITH_SEO,
	fixPrompt: '',
	howToFix,
	resolvedByActivation: false,
} );

export const classifyCheckFix = ( check ) => {
	const instructionText = getInstructionText( check );

	if ( getToggleModuleKey( check?.id ) ) {
		return toggleFix( instructionText );
	}

	const fixBy = normalizeFixBy( check?.fixBy );

	if ( FIX_BY_SEO_PLUGIN === fixBy ) {
		return seoFix( instructionText );
	}

	if ( ANGIE_FIX_BY.includes( fixBy ) ) {
		return angieFix( instructionText );
	}

	if ( FIX_BY_MANUAL === fixBy || FIX_BY_BUILT_IN === fixBy ) {
		if ( hasPromptMarker( instructionText ) ) {
			return angieFix( instructionText );
		}

		return manualFix( instructionText );
	}

	if ( hasPromptMarker( instructionText ) ) {
		return angieFix( instructionText );
	}

	return manualFix( instructionText );
};

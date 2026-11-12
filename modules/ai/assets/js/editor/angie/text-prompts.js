export const buildAngieTextPrompt = ( {
	elementId,
	controlName,
	controlType,
	currentValue,
} ) => {
	const hasExistingText = 'string' === typeof currentValue && Boolean( currentValue.trim() );
	const actionHint = hasExistingText
		? 'Write improved text, edit the current text, change its tone, or translate it.'
		: 'Write new text for this control. The user may also ask to change tone or translate.';

	return [
		`Update the V3 ${ controlType } control "${ controlName }" on element "${ elementId }".`,
		actionHint,
		hasExistingText ? 'The control has existing text.' : 'The control is currently empty.',
		'When ready, use the v3-text-control tool to read or set this control value. Do not invent other write paths.',
	].join( '\n\n' );
};

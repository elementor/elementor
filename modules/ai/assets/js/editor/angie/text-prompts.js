export const buildAngieTextPrompt = ( {
	elementId,
	controlName,
	controlType,
	currentValue,
} ) => {
	const trimmedValue = 'string' === typeof currentValue ? currentValue.trim() : '';
	const hasExistingText = Boolean( trimmedValue );
	const actionHint = hasExistingText
		? 'Write improved text, edit the current text, change its tone, or translate it.'
		: 'Write new text for this control. The user may also ask to change tone or translate.';

	return [
		`Update the V3 ${ controlType } control "${ controlName }" on element "${ elementId }".`,
		actionHint,
		hasExistingText ? `Current value:\n${ trimmedValue }` : 'The control is currently empty.',
		'When ready, use the v3-text-control tool to read or set this control value. Do not invent other write paths.',
	].join( '\n\n' );
};

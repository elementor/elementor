import { toolPrompts } from '@elementor/editor-mcp';

export const readConsoleErrorsToolPrompt = toolPrompts( 'read-console-errors' );

readConsoleErrorsToolPrompt.description(
	'Reads recent browser console errors from the Elementor editor window, including uncaught errors, ' +
		'unhandled promise rejections and failed script, style or image loads. Returns each error with its stack trace when available.'
);

readConsoleErrorsToolPrompt.instruction(
	'Call it when the user reports that something is not working or shows errors ' +
		'(e.g. "the button does nothing", "the popup does not open", "the calculation is wrong").'
);

readConsoleErrorsToolPrompt.instruction(
	'Use the file path in each stack trace to decide which code caused the error. ' +
		'Only act on errors that reference the code you just created or edited, and ignore the rest.'
);

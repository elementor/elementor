import { buildAngieTextPrompt } from './text-prompts';

const ANGIE_TEXT_CONTROL_TYPES = [ 'text', 'textarea' ];
const AGENT_MODE = 'agent';

export const isAngieTextEnabled = () => Boolean( window.elementorV2?.editorAngie?.openAngie );

export const isAngieTextControlType = ( type ) => ANGIE_TEXT_CONTROL_TYPES.includes( type );

export const tryOpenAngieForTextControl = ( {
	type,
	controlType,
	getControlValue,
	context = {},
} ) => {
	if ( ! isAngieTextControlType( type ) ) {
		return false;
	}

	const editorAngie = window.elementorV2?.editorAngie;
	const openAngie = editorAngie?.openAngie;

	if ( ! openAngie ) {
		return false;
	}

	const prompt = buildAngieTextPrompt( {
		elementId: context.elementId,
		controlName: context.controlName,
		controlType: controlType || context.controlType || type,
		currentValue: 'function' === typeof getControlValue ? getControlValue() : context.controlValue,
	} );

	const mode = editorAngie.AngieInteractionMode?.AGENT ?? AGENT_MODE;

	Promise.resolve( openAngie( { prompt, mode } ) ).catch( ( error ) => {
		// eslint-disable-next-line no-console
		console.error( 'Failed to open Angie for text control:', error );
	} );

	return true;
};

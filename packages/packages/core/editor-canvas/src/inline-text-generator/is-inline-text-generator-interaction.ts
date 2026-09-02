import {
	ANGIE_WIDGET_TOGGLE_CLASS,
	INLINE_TEXT_GENERATOR_CONTAINER_ID,
} from './constants';

export const isInlineTextGeneratorInteraction = ( target: EventTarget | null ): boolean => {
	if ( ! target || ! ( target instanceof Node ) ) {
		return false;
	}

	const element = target instanceof Element ? target : target.parentElement;

	if ( ! element ) {
		return false;
	}

	const angieContainer = document.getElementById( INLINE_TEXT_GENERATOR_CONTAINER_ID );

	if ( angieContainer?.contains( element ) ) {
		return true;
	}

	return Boolean( element.closest( `.${ ANGIE_WIDGET_TOGGLE_CLASS }` ) );
};

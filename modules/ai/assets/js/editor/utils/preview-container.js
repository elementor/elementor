import { toggleHistory } from './history';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */

const PREFIX = 'e-ai-preview-container';
const CLASS_HIDDEN = PREFIX + '--hidden';
const CLASS_IDLE = PREFIX + '--idle';

/**
 * @param {Container} parentContainer
 * @param {{}}        containerOptions
 * @return {{init, setContent, reset, destroy}}
 */

export function createPreviewContainer( parentContainer, containerOptions = {} ) {
	const createdContainers = new Map();
	const idleContainer = createIdleContainer( parentContainer, containerOptions );

	function init() {
		showContainer( idleContainer );
	}

	function getAllContainers() {
		return [ ...createdContainers.values(), idleContainer ];
	}

	function reset() {
		deleteContainers( [ ...createdContainers.values() ] );
		createdContainers.clear();

		showContainer( idleContainer );
	}

	function setContent( template ) {
		if ( ! template ) {
			return;
		}

		hideContainers( getAllContainers() );

		if ( ! createdContainers.has( template ) ) {
			const newContainer = createContainer( parentContainer, template, containerOptions );

			createdContainers.set( template, newContainer );
		}

		showContainer( createdContainers.get( template ) );
	}

	function destroy() {
		deleteContainers( getAllContainers() );

		createdContainers.clear();
	}

	return {
		init,
		reset,
		setContent,
		destroy,
	};
}

/**
 * @param {Container} parentContainer
 * @param {{}}        model
 * @param {{}}        options
 * @return {*}
 */
function createContainer( parentContainer, model, options = {} ) {
	toggleHistory( false );

	const container = $e.run( 'document/elements/create', {
		container: parentContainer,
		model: {
			...model,
			id: `${ PREFIX }-${ elementorCommon.helpers.getUniqueId().toString() }`,
		},
		options: {
			...options,
			edit: false,
		},
	} );

	toggleHistory( true );

	container.view.$el.addClass( CLASS_HIDDEN );

	return container;
}

/**
 * @param {Container} parentContainer
 * @param {{}}        containerOptions
 * @return {*}
 */
function createIdleContainer( parentContainer, containerOptions = {} ) {
	// Create an empty container that'll be used of UI purposes.
	const container = createContainer( parentContainer, { elType: 'container' }, containerOptions );

	container.view.$el.addClass( CLASS_IDLE );

	return container;
}

function hideContainers( containers ) {
	containers.forEach( ( container ) => {
		container.view.$el.addClass( CLASS_HIDDEN );
	} );
}

function showContainer( container ) {
	container.view.$el.removeClass( CLASS_HIDDEN );

	// Delay the scroll to avoid UI jumps when toggling between containers.
	setTimeout( () => {
		container.view.$el[ 0 ].scrollIntoView( {
			behavior: 'smooth',
			block: 'start',
		} );
	} );
}

function deleteContainers( containers ) {
	toggleHistory( false );

	$e.run( 'document/elements/delete', { containers } );

	toggleHistory( true );
}


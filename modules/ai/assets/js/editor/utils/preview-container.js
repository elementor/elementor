import { toggleHistory } from './history';

const PREFIX = 'e-ai-preview-container';
const CLASS_HIDDEN = PREFIX + '--hidden';
const CLASS_IDLE = PREFIX + '--idle';

export function createPreviewContainer( options = {} ) {
	const createdContainers = new Map();
	const idleContainer = createIdleContainer( options );

	createdContainers.set( 'idle', idleContainer );

	function setIdle() {
		hideContainers( createdContainers );
		showContainer( idleContainer );
	}

	function setContent( template ) {
		if ( ! template ) {
			return;
		}

		hideContainers( createdContainers );

		if ( ! createdContainers.has( template ) ) {
			const newContainer = createContainer( template, options );

			createdContainers.set( template, newContainer );
		}

		showContainer( createdContainers.get( template ) );
	}

	function destroy() {
		deleteContainers( createdContainers );
		createdContainers.clear();
	}

	return {
		setIdle,
		setContent,
		destroy,
	};
}

function createContainer( model, options = {} ) {
	toggleHistory( false );

	const container = $e.run( 'document/elements/create', {
		container: elementor.getPreviewContainer(),
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

function createIdleContainer( options = {} ) {
	// Create an empty container that'll be used of UI purposes.
	const container = createContainer( { elType: 'container' }, options );

	container.view.$el.addClass( CLASS_IDLE );

	return container;
}

function hideContainers( containersMap ) {
	[ ...containersMap.values() ].forEach( ( container ) => {
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

function deleteContainers( containersMap ) {
	toggleHistory( false );

	$e.run( 'document/elements/delete', {
		containers: [ ...containersMap.values() ],
	} );

	toggleHistory( true );
}

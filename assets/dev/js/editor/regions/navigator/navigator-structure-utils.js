export function getElementContainer( model ) {
	const id = model?.get?.( 'id' );

	if ( ! id ) {
		return null;
	}

	return elementor.getContainer( id );
}

export function isStructureLocked( model ) {
	return !! model?.get( 'isLocked' );
}

export function isNestableContainer( model ) {
	const elType = model.get( 'elType' );

	if ( 'widget' === elType ) {
		return false;
	}

	if ( elementor.helpers.isAtomicWidget?.( model ) ) {
		const elementData = elementor.getElementData( model );

		return !! elementData?.is_nestable;
	}

	return [ 'section', 'column', 'container' ].includes( elType );
}

export function getChildTextPreview( model, maxLength = 28 ) {
	const children = model.get( 'elements' );

	if ( ! children?.length ) {
		return '';
	}

	for ( let i = 0; i < children.length; i++ ) {
		const child = children.at( i );
		const widgetType = child.get( 'widgetType' );
		const elType = child.get( 'elType' );

		if ( 'widget' !== elType && ! elementor.helpers.isAtomicWidget?.( child ) ) {
			const nested = getChildTextPreview( child, maxLength );

			if ( nested ) {
				return nested;
			}

			continue;
		}

		if ( [ 'heading', 'button', 'e-heading', 'e-button' ].includes( widgetType ) || 'heading' === elType ) {
			const settings = child.get( 'settings' )?.attributes || {};
			const text = settings.title || settings.text || settings.__dynamic__?.title || settings.__dynamic__?.text;

			if ( 'string' === typeof text && text.trim() ) {
				return truncateHint( text.trim(), maxLength );
			}
		}
	}

	return '';
}

function truncateHint( text, maxLength ) {
	if ( text.length <= maxLength ) {
		return text;
	}

	return text.slice( 0, maxLength - 1 ).trim() + '…';
}

export function getFirstGlobalClassLabel( model ) {
	const settings = model.get( 'settings' )?.attributes || {};
	const classes = settings.classes;

	let classIds = [];

	if ( Array.isArray( classes ) ) {
		classIds = classes;
	} else if ( classes?.value && Array.isArray( classes.value ) ) {
		classIds = classes.value;
	}

	if ( ! classIds.length ) {
		return '';
	}

	const classId = classIds[ 0 ];
	const labels = elementor.config?.document?.settings?.settings?.global_classes?.labels
		|| elementor.config?.initial_editor?.global_classes?.labels;

	if ( labels && labels[ classId ] ) {
		return labels[ classId ];
	}

	if ( 'string' === typeof classId ) {
		return classId;
	}

	return '';
}

export function getStructureHint( model ) {
	if ( model.get( 'elType' ) === undefined ) {
		return '';
	}

	const defaultTitle = model.getDefaultTitle?.() || '';
	const currentTitle = model.getTitle?.() || '';
	const editorTitle = model.get( 'editor_settings' )?.title;
	const settingsTitle = model.getSetting?.( '_title' );

	if ( editorTitle && editorTitle.trim() && currentTitle === defaultTitle ) {
		return truncateHint( editorTitle.trim(), 28 );
	}

	if ( settingsTitle && settingsTitle.trim() && currentTitle === defaultTitle ) {
		return truncateHint( settingsTitle.trim(), 28 );
	}

	const classLabel = getFirstGlobalClassLabel( model );

	if ( classLabel ) {
		return truncateHint( classLabel, 28 );
	}

	const textPreview = getChildTextPreview( model );

	if ( textPreview ) {
		return textPreview;
	}

	return '';
}

export function getNavigatorIconTypeClass( model ) {
	if ( isStructureLocked( model ) ) {
		return 'elementor-navigator__element--icon-locked';
	}

	if ( model.get( 'meta' )?.component ) {
		return 'elementor-navigator__element--icon-component';
	}

	const elType = model.get( 'elType' );

	if ( 'widget' === elType ) {
		return 'elementor-navigator__element--icon-widget';
	}

	return 'elementor-navigator__element--icon-container';
}

export function getSiblingIndex( container ) {
	return container.parent.children.indexOf( container );
}

export function getPreviousSiblingContainer( container ) {
	const index = getSiblingIndex( container );

	if ( index <= 0 ) {
		return null;
	}

	return container.parent.children[ index - 1 ];
}

export function getNextSiblingContainer( container ) {
	const index = getSiblingIndex( container );

	if ( index < 0 || index >= container.parent.children.length - 1 ) {
		return null;
	}

	return container.parent.children[ index + 1 ];
}

export function canMoveStructureUp( container ) {
	if ( container.isLocked() ) {
		return false;
	}

	return getSiblingIndex( container ) > 0;
}

export function canMoveStructureDown( container ) {
	if ( container.isLocked() ) {
		return false;
	}

	const index = getSiblingIndex( container );

	return index >= 0 && index < container.parent.children.length - 1;
}

export function canMoveStructureOut( container ) {
	if ( container.isLocked() ) {
		return false;
	}

	const parent = container.parent;

	return parent && 'document' !== parent.model.get( 'elType' );
}

export function canMoveStructureIntoAbove( container ) {
	if ( container.isLocked() ) {
		return false;
	}

	const previous = getPreviousSiblingContainer( container );

	if ( ! previous ) {
		return false;
	}

	return previous.model.isValidChild( container.model );
}

export function runMoveStructureUp( container ) {
	const parent = container.parent;
	const at = Math.max( 0, getSiblingIndex( container ) - 1 );

	return $e.run( 'document/elements/move', {
		container,
		target: parent,
		options: { at },
	} );
}

export function runMoveStructureDown( container ) {
	const parent = container.parent;
	const at = getSiblingIndex( container ) + 1;

	return $e.run( 'document/elements/move', {
		container,
		target: parent,
		options: { at },
	} );
}

export function runMoveStructureOut( container ) {
	const parent = container.parent;
	const grandParent = parent.parent;

	if ( ! grandParent ) {
		return false;
	}

	const at = getSiblingIndex( parent ) + 1;

	return $e.run( 'document/elements/move', {
		container,
		target: grandParent,
		options: { at },
	} );
}

export function runMoveStructureIntoAbove( container ) {
	const previous = getPreviousSiblingContainer( container );

	if ( ! previous ) {
		return false;
	}

	const at = previous.children.length;

	return $e.run( 'document/elements/move', {
		container,
		target: previous,
		options: { at },
	} );
}

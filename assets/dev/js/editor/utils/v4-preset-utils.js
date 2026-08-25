const ELEMENT_STYLE_CHANGE_EVENT = 'elementor/editor-v2/editor-elements/style';

export function buildModel( elType, cssProps, mobileProps ) {
	const model = {
		id: elementorCommon.helpers.getUniqueId(),
		elType,
		elements: [],
	};

	const hasBase = cssProps && Object.keys( cssProps ).length > 0;
	const hasMobile = mobileProps && Object.keys( mobileProps ).length > 0;

	if ( ! hasBase && ! hasMobile ) {
		return model;
	}

	const styleId = `e-${ elementorCommon.helpers.getUniqueId() }`;
	const variants = [
		{
			meta: { breakpoint: 'desktop', state: null },
			props: cssProps ?? {},
			custom_css: null,
		},
	];

	if ( hasMobile ) {
		variants.push( {
			meta: { breakpoint: 'mobile', state: null },
			props: mobileProps,
			custom_css: null,
		} );
	}

	model.styles = {
		[ styleId ]: {
			id: styleId,
			label: 'local',
			type: 'class',
			variants,
		},
	};

	model.settings = {
		classes: { $$type: 'classes', value: [ styleId ] },
	};

	return model;
}

function stripPendingStylesFromModel( model ) {
	const pendingStyles = model.styles;
	const pendingClasses = model.settings?.classes;

	if ( ! pendingStyles || ! Object.keys( pendingStyles ).length ) {
		return { createModel: model, pendingStyles: null, pendingClasses: null };
	}

	const createModel = { ...model };

	delete createModel.styles;

	if ( pendingClasses ) {
		const settings = { ...( createModel.settings || {} ) };

		delete settings.classes;

		if ( Object.keys( settings ).length ) {
			createModel.settings = settings;
		} else {
			delete createModel.settings;
		}
	}

	return { createModel, pendingStyles, pendingClasses };
}

export function applyLocalElementStyles( container, styles, classesSetting ) {
	container.model.set( 'styles', styles );

	if ( classesSetting ) {
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				classes: classesSetting,
			},
		} );
	}

	window.dispatchEvent( new CustomEvent( ELEMENT_STYLE_CHANGE_EVENT ) );
}

export function createV4Element( target, model, options ) {
	const containerClass = elementorModules?.editor?.Container;
	const getDocumentUtils = () => $e?.components?.get?.( 'document' )?.utils;
	const getContainerById = ( id ) => getDocumentUtils()?.findContainerById?.( id ) ?? null;
	const isContainerInstance = ( candidate ) => {
		if ( ! containerClass || ! candidate ) {
			return false;
		}

		return candidate instanceof containerClass ||
			candidate.constructor?.name === containerClass.prototype?.[ Symbol.toStringTag ];
	};
	const resolveContainer = ( candidate ) => {
		if ( ! containerClass ) {
			return candidate;
		}

		if ( isContainerInstance( candidate ) ) {
			return candidate;
		}

		const lookedUp = candidate?.lookup?.();
		if ( isContainerInstance( lookedUp ) ) {
			return lookedUp;
		}

		const byId = candidate?.id ? getContainerById( candidate.id ) : null;
		if ( isContainerInstance( byId ) ) {
			return byId;
		}

		return null;
	};

	const { createModel, pendingStyles, pendingClasses } = stripPendingStylesFromModel( model );
	const resolvedTarget = resolveContainer( target );

	const applyPendingStyles = ( container ) => {
		const resolvedContainer = resolveContainer( container );

		if ( pendingStyles && resolvedContainer ) {
			applyLocalElementStyles( resolvedContainer, pendingStyles, pendingClasses );
		}

		return resolvedContainer ?? container;
	};

	if ( ! resolvedTarget && containerClass && target?.id ) {
		getDocumentUtils()?.addModelToParent?.( target.id, createModel, options );

		const inserted = getContainerById( createModel.id );

		if ( inserted ) {
			return applyPendingStyles( inserted );
		}

		return {
			id: createModel.id,
			lookup: () => applyPendingStyles( getContainerById( createModel.id ) ),
		};
	}

	const created = $e.run( 'document/elements/create', {
		container: resolvedTarget ?? target,
		model: createModel,
		options,
	} );

	const resolvedCreated = resolveContainer( created );

	if ( resolvedCreated || ! containerClass ) {
		return applyPendingStyles( resolvedCreated ?? created );
	}

	return {
		id: createModel.id,
		lookup: () => applyPendingStyles( getContainerById( createModel.id ) ),
	};
}

export function runWithHistory( title, callback ) {
	const historyId = $e.internal( 'document/history/start-log', {
		type: 'add',
		title,
	} );

	let result;

	try {
		result = callback();

		$e.internal( 'document/history/end-log', { id: historyId } );
	} catch ( e ) {
		$e.internal( 'document/history/delete-log', { id: historyId } );
	}

	return result;
}

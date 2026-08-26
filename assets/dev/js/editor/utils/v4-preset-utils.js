/**
 * @typedef {import('../container/container')} Container
 */

/**
 * @typedef {Object} AtomicProp
 * @property {string} $$type - Atomic prop type identifier.
 * @property {*}      value   - Prop value payload.
 */

/**
 * @typedef {Object.<string, AtomicProp>} AtomicPropsMap
 */

/**
 * @typedef {Object} ElementModel
 * @property {string}                    id       - Element id.
 * @property {string}                    elType   - Element type (e.g. `e-grid`).
 * @property {Array}                     elements - Child element models.
 * @property {Object.<string, Object>}   [styles] - Local style classes keyed by style id.
 * @property {{ classes: AtomicProp }}   [settings] - Element settings.
 */

/**
 * Build a V4 element model with optional desktop and mobile style variants.
 *
 * @param {string}         elType      - V4 element type.
 * @param {AtomicPropsMap} cssProps    - Desktop breakpoint style props.
 * @param {AtomicPropsMap} mobileProps - Mobile breakpoint style props.
 *
 * @return {ElementModel} Element model ready for document insertion.
 */
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

/**
 * Insert an element model into the document under the given target container.
 *
 * Expects to run inside a `runWithHistory()` transaction when the operation should be undoable.
 *
 * @param {Container|Object} target  - Parent container (or stub with `id` / `lookup`).
 * @param {ElementModel}     model   - Element model to insert.
 * @param {Object}           options - `document/elements/create` command options.
 *
 * @return {Container|Object} Created container, or a lookup stub when Container is unavailable.
 */
export function insertElementFromModel( target, model, options ) {
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

	const resolvedTarget = resolveContainer( target );

	if ( ! resolvedTarget && containerClass && target?.id ) {
		getDocumentUtils()?.addModelToParent?.( target.id, model, options );

		const inserted = getContainerById( model.id );
		if ( inserted ) {
			return inserted;
		}

		return {
			id: model.id,
			lookup: () => getContainerById( model.id ),
		};
	}

	const created = $e.run( 'document/elements/create', {
		container: resolvedTarget ?? target,
		model,
		options,
	} );

	const resolvedCreated = resolveContainer( created );

	if ( resolvedCreated || ! containerClass ) {
		return resolvedCreated ?? created;
	}

	return {
		id: model.id,
		lookup: () => getContainerById( model.id ),
	};
}

/**
 * Run a callback inside a single document history transaction.
 *
 * @param {string}   title    - History log title shown in the undo stack.
 * @param {Function} callback - Operation to run while history is open.
 *
 * @return {*} Callback return value.
 */
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

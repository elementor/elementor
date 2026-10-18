const SCOPE_ATTRIBUTE = 'data-e-scope';
const ALLOWED_ATTRIBUTE = /^(data|aria)-[\w-]+$/;

function getTargets( { element, args } ) {
	if ( ! args.selector ) {
		return [ element ];
	}

	const scope = element.closest( `[${ SCOPE_ATTRIBUTE }]` ) ?? element.ownerDocument;

	return Array.from( scope.querySelectorAll( args.selector ) );
}

function matches( { args, value } ) {
	return undefined === args.equals ? Boolean( value ) : value === args.equals;
}

function readInputValue( event, currentValue ) {
	const target = event?.target;

	if ( ! target ) {
		return currentValue;
	}

	if ( 'checkbox' === target.type ) {
		return target.checked;
	}

	if ( 'number' === typeof currentValue ) {
		const number = Number( target.value );

		return Number.isNaN( number ) ? currentValue : number;
	}

	return target.value;
}

function pickDifferent( values, current ) {
	const candidates = values.length > 1 ? values.filter( ( value ) => value !== current ) : values;

	return candidates[ Math.floor( Math.random() * candidates.length ) ];
}

function clamp( value, min, max ) {
	return Math.min( max ?? Infinity, Math.max( min ?? -Infinity, value ) );
}

export const BUILT_IN_ACTIONS = {
	'state/set': ( { args, store } ) => store.setState( args.key, args.value ),

	'state/toggle': ( { args, store } ) => store.setState( args.key, ( value ) => ! value ),

	'state/increment': ( { args, store } ) => store.setState( args.key, ( value ) => {
		const next = ( Number( value ) || 0 ) + ( args.by ?? 1 );

		if ( args.wrap && undefined !== args.min && undefined !== args.max ) {
			const span = args.max - args.min + 1;

			return ( ( ( ( next - args.min ) % span ) + span ) % span ) + args.min;
		}

		return clamp( next, args.min, args.max );
	} ),

	'state/cycle': ( { args, store } ) => store.setState( args.key, ( value ) => {
		const values = args.values ?? [];
		const index = values.indexOf( value );

		return values[ ( index + 1 ) % values.length ];
	} ),

	'state/random': ( { args, store } ) => store.setState( args.key, ( value ) => pickDifferent( args.values ?? [], value ) ),

	'state/from-input': ( { args, store, event } ) => store.setState( args.key, ( value ) => readInputValue( event, value ) ),

	'class/toggle': ( context ) => {
		const force = undefined === context.value ? undefined : matches( context );

		getTargets( context ).forEach( ( target ) => target.classList.toggle( context.args.class_name, force ) );
	},

	'element/visible': ( context ) => {
		const visible = matches( context );

		getTargets( context ).forEach( ( target ) => {
			target.hidden = ! visible;
		} );
	},

	'attribute/set': ( context ) => {
		const { args, value } = context;

		if ( ! ALLOWED_ATTRIBUTE.test( args.name ?? '' ) ) {
			return;
		}

		getTargets( context ).forEach( ( target ) => target.setAttribute( args.name, String( args.value ?? value ) ) );
	},

	'animation/playback-rate': ( context ) => {
		const rate = Number( context.args.rate ?? context.value );

		if ( ! Number.isFinite( rate ) ) {
			return;
		}

		getTargets( context ).forEach( ( target ) => {
			target.getAnimations?.( { subtree: true } ).forEach( ( animation ) => {
				animation.playbackRate = rate;
			} );
		} );
	},
};

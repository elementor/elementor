import { ANY_KEY, toStoreResolver } from './data-flow-store';

export const BIND_ATTRIBUTE = 'data-e-bind';

const MAX_DECIMALS = 2;
const PERCENT_FACTOR = 100;
const TEXT_NODE = 3;

function getByPath( source, path ) {
	return path.split( '.' ).reduce( ( value, key ) => value?.[ key ], source );
}

function formatNumber( value ) {
	if ( '' === value || null === value || isNaN( Number( value ) ) ) {
		return String( value );
	}

	return Number( value ).toLocaleString( 'en-US', { maximumFractionDigits: MAX_DECIMALS } );
}

function stringify( value ) {
	return 'object' === typeof value ? JSON.stringify( value ) : String( value );
}

function formatValue( value, format ) {
	if ( 'number' === format ) {
		return formatNumber( value );
	}

	if ( 'percent' === format ) {
		return isNaN( Number( value ) ) ? stringify( value ) : formatNumber( Number( value ) * PERCENT_FACTOR ) + '%';
	}

	return stringify( value );
}

export function formatBinding( value, { format = 'raw', prefix = '', suffix = '' } ) {
	if ( undefined === value || null === value ) {
		return '';
	}

	return prefix + formatValue( value, format ) + suffix;
}

const UNSAFE_URL_PATTERN = /^[\s\u0000-\u001f]*(javascript|vbscript|data\s*:\s*text\/html)/i;
const URL_ATTRIBUTES = [ 'href', 'src', 'action', 'formaction', 'poster', 'xlink:href' ];
const TOGGLE_ATTRIBUTES = [ 'autofocus', 'checked', 'disabled', 'hidden', 'inert', 'multiple', 'open', 'readonly', 'required', 'selected' ];
const FALSY_VALUES = [ '', '0', 'false', 'null' ];

function getTextNodes( element ) {
	return [ ...element.childNodes ].filter( ( node ) => TEXT_NODE === node.nodeType );
}

function readManifest( element ) {
	try {
		return JSON.parse( element.getAttribute( BIND_ATTRIBUTE ) ) ?? [];
	} catch ( error ) {
		return [];
	}
}

function compose( parts, resolveState ) {
	return parts
		.map( ( part ) =>
			'string' === typeof part ? part : formatBinding( getByPath( resolveState( part ), part.key ), part ),
		)
		.join( '' );
}

function isTruthy( value ) {
	return ! ( false === value || undefined === value || null === value || FALSY_VALUES.includes( String( value ).trim().toLowerCase() ) );
}

function writeText( element, target, text ) {
	const nodes = getTextNodes( element );
	const node = nodes[ target.index ] ?? element.appendChild( element.ownerDocument.createTextNode( '' ) );

	if ( node.nodeValue !== text ) {
		node.nodeValue = text;
	}
}

export function writeBoundAttribute( element, name, text ) {
	if ( TOGGLE_ATTRIBUTES.includes( name ) ) {
		element.toggleAttribute( name, isTruthy( text ) );

		return;
	}

	const isBlockedUrl = URL_ATTRIBUTES.includes( name ) && UNSAFE_URL_PATTERN.test( text );

	if ( ! isBlockedUrl && element.getAttribute( name ) !== text ) {
		element.setAttribute( name, text );
	}
}

function applyTarget( element, target, resolveState ) {
	if ( 'toggle' === target.kind ) {
		const binding = target.parts[ 0 ];

		element.toggleAttribute( target.name, isTruthy( getByPath( resolveState( binding ), binding.key ) ) );

		return;
	}

	const text = compose( target.parts, resolveState );

	if ( 'attr' === target.kind ) {
		writeBoundAttribute( element, target.name, text );

		return;
	}

	writeText( element, target, text );
}

export function bindManifests( root, storeOrResolver ) {
	const resolveStore = toStoreResolver( storeOrResolver );

	const unsubscribers = [ ...root.querySelectorAll( `[${ BIND_ATTRIBUTE }]` ) ].map( ( element ) => {
		const targets = readManifest( element );
		const stores = new Map();
		const getStore = ( binding ) => {
			const scope = binding.scope ?? '';

			if ( ! stores.has( scope ) ) {
				stores.set( scope, resolveStore( element, binding.scope ) );
			}

			return stores.get( scope );
		};
		const resolveState = ( binding ) => getStore( binding ).getState();
		const render = () => targets.forEach( ( target ) => applyTarget( element, target, resolveState ) );

		targets.forEach( ( target ) =>
			target.parts.filter( ( part ) => 'string' !== typeof part ).forEach( getStore ),
		);

		render();

		const storeUnsubscribers = [ ...new Set( stores.values() ) ].map( ( store ) =>
			store.subscribe( ANY_KEY, render ),
		);

		return () => storeUnsubscribers.forEach( ( unsubscribe ) => unsubscribe() );
	} );

	return () => unsubscribers.forEach( ( unsubscribe ) => unsubscribe() );
}

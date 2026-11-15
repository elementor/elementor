( function() {
	const DATA_SCRIPT_ID = 'e-state-poc-data';
	const CHANGE_EVENT = 'e-state:change';
	const SELECTED_CLASS = 'is-selected';
	const MAX_CLASS = 'is-max';

	const Alpine = window.elementorV2?.alpinejs?.Alpine;
	const pocLog = ( window.__eStatePoc = window.__eStatePoc || { log: [], effectRuns: 0 } );

	function log( type, detail ) {
		pocLog.log.push( { type, detail, at: performance.now() } );
	}

	if ( ! Alpine ) {
		log( 'error', 'window.elementorV2.alpinejs.Alpine is missing' );
		return;
	}

	const selectors = {
		total: ( state ) => state.qty * state.price,
		isMax: ( state, config ) => state.qty >= config.max,
	};

	const reducers = {
		increment: ( state, ctx, config ) => ( { qty: Math.min( state.qty + 1, config.max ) } ),
		decrement: ( state ) => ( { qty: Math.max( state.qty - 1, 0 ) } ),
		select: ( state, ctx ) => ( { selected: ctx.item } ),
		invalid: () => ( { qty: 'not a number' } ),
		incrementCount: ( state ) => ( { count: state.count + 1 } ),
	};

	function readPayload() {
		const script = document.getElementById( DATA_SCRIPT_ID );

		if ( ! script ) {
			return { entries: [] };
		}

		return JSON.parse( script.textContent );
	}

	function findByDataId( dataId ) {
		return document.querySelector( `[data-id="${ CSS.escape( dataId ) }"]` );
	}

	function markRoot( element, root ) {
		element.setAttribute( 'x-data', 'eState' );
		element.setAttribute( 'x-effect', 'syncRoot' );
		element.setAttribute( 'data-e-state-scope', '' );
		element.setAttribute( 'data-e-state', JSON.stringify( root ) );
	}

	function markOwnTextBindings( rootElement ) {
		rootElement.querySelectorAll( '[data-e-state-key]' ).forEach( ( span ) => {
			if ( span.closest( '[data-e-state-scope]' ) === rootElement ) {
				span.setAttribute( 'x-bind', 'eStateText' );
			}
		} );
	}

	function markText( element, key ) {
		const serverMarker = element.querySelector( '[data-e-state-key]' );

		if ( serverMarker ) {
			log( 'text-marker', { dataId: element.dataset.id, source: 'server' } );
			return;
		}

		const target = element.querySelector( 'span' ) || element;
		target.setAttribute( 'data-e-state-key', key );
		log( 'text-marker', { dataId: element.dataset.id, source: 'data-id' } );
	}

	function markPart( element, entry ) {
		if ( entry.text ) {
			markText( element, entry.text );
			return;
		}

		if ( entry.item ) {
			element.setAttribute( 'data-e-item', entry.item );
			element.setAttribute( 'x-bind', 'eStateItem' );
			return;
		}

		element.setAttribute( 'data-e-on', entry.on.click );

		if ( 'x-on' === entry.listen ) {
			element.setAttribute( 'x-on:click', 'dispatchFromEl' );
			return;
		}

		element.setAttribute( 'x-bind', 'eStateOn' );
	}

	function markElements( payload ) {
		const roots = [];
		let marked = 0;

		payload.entries.forEach( ( entry ) => {
			const element = findByDataId( entry.dataId );

			if ( ! element ) {
				log( 'missing-element', entry.dataId );
				return;
			}

			if ( entry.root ) {
				markRoot( element, entry.root );
				roots.push( element );
			} else {
				markPart( element, entry );
			}

			marked++;
		} );

		roots.forEach( markOwnTextBindings );

		log( 'marked', { entries: payload.entries.length, marked } );
	}

	function snapshot( state ) {
		return structuredClone( Alpine.raw( state ) );
	}

	function isValidPatch( patch, schema ) {
		return Object.entries( patch ).every( ( [ key, value ] ) => {
			const type = schema[ key ];

			return type && typeof value === type;
		} );
	}

	Alpine.data( 'eState', () => ( {
		state: {},
		config: {},

		init() {
			this.config = JSON.parse( this.$el.dataset.eState );
			this.state = this.config.values;
			log( 'init', this.$el.dataset.id );
		},

		read( key ) {
			const derived = this.config.derived?.[ key ];

			if ( ! derived ) {
				return this.state[ key ];
			}

			derived.deps.forEach( ( dep ) => this.state[ dep ] );

			return selectors[ derived.selector ]( snapshot( this.state ), this.config );
		},

		dispatch( name, ctx = {} ) {
			const reducer = reducers[ name ];

			if ( ! reducer || ! this.config.actions.includes( name ) ) {
				log( 'unknown-action', name );
				return;
			}

			const patch = reducer( snapshot( this.state ), ctx, this.config );

			if ( ! isValidPatch( patch, this.config.schema ) ) {
				log( 'rejected-patch', { name, patch } );
				return;
			}

			Object.assign( this.state, patch );

			this.$root.dispatchEvent( new CustomEvent( CHANGE_EVENT, {
				bubbles: false,
				detail: { changed: Object.keys( patch ), state: snapshot( this.state ) },
			} ) );
		},

		dispatchFromEl() {
			this.dispatch( this.$el.dataset.eOn );
		},

		syncRoot() {
			pocLog.effectRuns++;
			log( 'effect', this.$el.dataset.id );

			if ( undefined !== this.state.qty ) {
				this.$el.style.setProperty( '--e-state-qty', String( this.state.qty ) );
				this.$el.classList.toggle( MAX_CLASS, Boolean( this.read( 'isMax' ) ) );
			}
		},
	} ) );

	Alpine.bind( 'eStateText', () => ( {
		'x-text'() {
			return this.read( this.$el.dataset.eStateKey );
		},
	} ) );

	Alpine.bind( 'eStateItem', () => ( {
		':class'() {
			return { [ SELECTED_CLASS ]: this.state.selected === this.$el.dataset.eItem };
		},
		'@click'() {
			this.dispatch( 'select', { item: this.$el.dataset.eItem } );
		},
	} ) );

	Alpine.bind( 'eStateOn', () => ( {
		'@click'() {
			this.dispatch( this.$el.dataset.eOn );
		},
	} ) );

	document.addEventListener( 'alpine:initialized', () => log( 'alpine:initialized' ), { once: true } );

	markElements( readPayload() );
}() );

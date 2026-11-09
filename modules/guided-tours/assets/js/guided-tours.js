const ELEMENT_WAIT_TIMEOUT = 5000;

/**
 * @typedef {Object} TourStep
 * @property {string}                        id          Stable step identifier.
 * @property {string}                        selector    Target CSS selector.
 * @property {string}                        title       Popover title.
 * @property {string}                        description Popover description.
 * @property {'top'|'right'|'bottom'|'left'} side        Popover placement.
 */

/**
 * @typedef {Object} Tour
 * @property {string}     id      Stable tour identifier.
 * @property {number}     version Tour content version.
 * @property {TourStep[]} steps   Ordered tour steps.
 */

export class GuidedTours {
	constructor( config, driverFactory = window.driver?.js?.driver, request = window.fetch ) {
		this.config = config;
		this.driverFactory = driverFactory;
		this.request = request;
		this.listeners = new Map();
		this.progressRequest = Promise.resolve();
		this.tours = new Map();
	}

	init() {
		if ( ! this.driverFactory || ! this.config?.tour ) {
			return;
		}

		this.registerTour( this.config.tour, this.config.progress );

		if ( ! this.isTourDone( this.config.tour.id ) ) {
			this.resumeTour( this.config.tour.id );
		}
	}

	/**
	 * @param {Tour}   tour
	 * @param {Object} progress
	 */
	registerTour( tour, progress = {} ) {
		this.tours.set( tour.id, { progress, tour } );
	}

	/**
	 * @param {string} tourId
	 * @param {number} stepIndex
	 */
	startTour( tourId, stepIndex = 0 ) {
		const registeredTour = this.tours.get( tourId );

		if ( ! registeredTour ) {
			return;
		}

		const steps = registeredTour.tour.steps
			.filter( ( step ) => this.isValidSelector( step.selector ) )
			.map( ( step ) => this.toDriverStep( step ) );

		if ( ! steps.length ) {
			return;
		}

		this.activeTour = registeredTour.tour;
		this.driver = this.driverFactory( {
			allowClose: true,
			showProgress: true,
			skipMissingElement: true,
			smoothScroll: true,
			steps,
			waitForElement: ELEMENT_WAIT_TIMEOUT,
			onDestroyed: ( element, step, options ) => this.handleDestroyed( step, options.reason ),
			onHighlighted: ( element, step ) => this.handleHighlighted( step ),
		} );

		this.emit( 'start', { tourId, stepIndex } );
		this.driver.drive( stepIndex );
	}

	/**
	 * @param {string} tourId
	 */
	resumeTour( tourId ) {
		const registeredTour = this.tours.get( tourId );

		if ( ! registeredTour ) {
			return;
		}

		const currentStepId = registeredTour.progress?.step_id;
		const stepIndex = registeredTour.tour.steps
			.filter( ( step ) => this.isValidSelector( step.selector ) )
			.findIndex( ( step ) => step.id === currentStepId );

		this.startTour( tourId, Math.max( stepIndex, 0 ) );
	}

	/**
	 * @param {string} tourId
	 * @return {boolean}
	 */
	isTourDone( tourId ) {
		return 'completed' === this.tours.get( tourId )?.progress?.status;
	}

	/**
	 * @param {string}   eventName
	 * @param {Function} callback
	 * @return {Function}
	 */
	onTourEvent( eventName, callback ) {
		const listeners = this.listeners.get( eventName ) ?? new Set();
		listeners.add( callback );
		this.listeners.set( eventName, listeners );

		return () => listeners.delete( callback );
	}

	toDriverStep( step ) {
		return {
			data: { id: step.id },
			element: step.selector,
			popover: {
				description: step.description,
				side: this.getPopoverSide( step.side ),
				title: step.title,
			},
		};
	}

	getPopoverSide( side ) {
		if ( 'rtl' !== document.documentElement.dir ) {
			return side;
		}

		return {
			left: 'right',
			right: 'left',
		}[ side ] ?? side;
	}

	isValidSelector( selector ) {
		try {
			document.querySelector( selector );
			return true;
		} catch ( error ) {
			return false;
		}
	}

	handleHighlighted( step ) {
		this.saveProgress( 'in_progress', step.data.id );
		this.emit( 'step', { stepId: step.data.id, tourId: this.activeTour.id } );
	}

	handleDestroyed( step, reason ) {
		if ( ! step ) {
			return;
		}

		const status = 'done' === reason ? 'completed' : 'in_progress';
		this.saveProgress( status, step.data.id );
		this.emit( status, { stepId: step.data.id, tourId: this.activeTour.id } );
	}

	saveProgress( status, stepId ) {
		const body = new URLSearchParams( {
			action: this.config.ajax.action,
			nonce: this.config.ajax.nonce,
			status,
			stepId,
			tourId: this.activeTour.id,
			version: this.activeTour.version,
		} );

		this.progressRequest = this.progressRequest.then( () => this.request( this.config.ajax.url, {
			body,
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			keepalive: true,
			method: 'POST',
		} ) ).catch( () => {} );
	}

	emit( eventName, payload ) {
		this.listeners.get( eventName )?.forEach( ( listener ) => listener( payload ) );
	}
}

const guidedTours = new GuidedTours( window.elementorGuidedToursConfig );
guidedTours.init();

window.elementorGuidedTours = guidedTours;

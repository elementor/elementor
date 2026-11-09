const ELEMENT_WAIT_TIMEOUT = 5000;

/**
 * @typedef {Object} TourStep
 * @property {string}                        id          Stable step identifier.
 * @property {string}                        screen      Admin screen id for this step.
 * @property {string}                        selector    Target CSS selector.
 * @property {string}                        title       Popover title.
 * @property {string}                        description Popover description.
 * @property {'top'|'right'|'bottom'|'left'} side        Popover placement.
 * @property {string}                        [next_url]  Optional admin-relative URL after Next.
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

		if ( this.isTourDone( this.config.tour.id ) ) {
			return;
		}

		const resumeStep = this.getResumeStep( this.config.tour, this.config.progress, this.config.screenId );

		if ( ! resumeStep ) {
			return;
		}

		const stepsOnScreen = this.getStepsForScreen( this.config.tour.steps, this.config.screenId );
		const startIndex = stepsOnScreen.findIndex( ( step ) => step.id === resumeStep.id );

		if ( -1 === startIndex || ! stepsOnScreen.length ) {
			return;
		}

		this.startTour( this.config.tour.id, startIndex, stepsOnScreen );
	}

	/**
	 * @param {Tour}   tour
	 * @param {Object} progress
	 */
	registerTour( tour, progress = {} ) {
		this.tours.set( tour.id, { progress, tour } );
	}

	/**
	 * @param {string}      tourId
	 * @param {number}      stepIndex
	 * @param {TourStep[]}  stepsOnScreen
	 */
	startTour( tourId, stepIndex = 0, stepsOnScreen = null ) {
		const registeredTour = this.tours.get( tourId );

		if ( ! registeredTour ) {
			return;
		}

		const tourSteps = stepsOnScreen ?? registeredTour.tour.steps;
		const steps = tourSteps
			.filter( ( step ) => this.isValidSelector( step.selector ) )
			.map( ( step ) => this.toDriverStep( step, registeredTour.tour ) );

		if ( ! steps.length ) {
			return;
		}

		this.activeTour = registeredTour.tour;
		this.activeScreenSteps = tourSteps;
		this.driver = this.driverFactory( {
			allowClose: true,
			showProgress: true,
			skipMissingElement: true,
			smoothScroll: true,
			steps,
			waitForElement: ELEMENT_WAIT_TIMEOUT,
			onDestroyed: ( element, step, options ) => this.handleDestroyed( step, options.reason ),
			onHighlighted: ( element, step ) => this.handleHighlighted( step ),
			onPopoverRender: ( popover, options ) => this.syncPopoverChrome( popover, this.resolveDriverStep( options ) ),
			onDoneClick: () => this.handleDoneClick( this.resolveDriverStep(), { driver: this.driver } ),
			onNextClick: ( element, step, options ) => this.handleNextClick( step ?? this.resolveDriverStep( options ), options ),
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

		const resumeStep = this.getResumeStep(
			registeredTour.tour,
			registeredTour.progress,
			this.config.screenId
		);

		if ( ! resumeStep ) {
			return;
		}

		const stepsOnScreen = this.getStepsForScreen( registeredTour.tour.steps, this.config.screenId );
		const stepIndex = stepsOnScreen.findIndex( ( step ) => step.id === resumeStep.id );

		this.startTour( tourId, Math.max( stepIndex, 0 ), stepsOnScreen );
	}

	/**
	 * @param {Tour}        tour
	 * @param {Object}      progress
	 * @param {string|null} screenId
	 * @return {TourStep|null}
	 */
	getResumeStep( tour, progress, screenId ) {
		if ( ! screenId || ! tour.steps?.length ) {
			return null;
		}

		if ( ! progress?.step_id ) {
			const firstStep = tour.steps[ 0 ];

			return firstStep.screen === screenId ? firstStep : null;
		}

		const progressIndex = tour.steps.findIndex( ( step ) => step.id === progress.step_id );

		if ( -1 === progressIndex ) {
			return null;
		}

		const progressStep = tour.steps[ progressIndex ];

		if ( progressStep.screen === screenId ) {
			return progressStep;
		}

		const nextOnScreen = tour.steps.find(
			( step, index ) => index > progressIndex && step.screen === screenId
		);

		return nextOnScreen ?? null;
	}

	/**
	 * @param {TourStep[]} steps
	 * @param {string}     screenId
	 * @return {TourStep[]}
	 */
	getStepsForScreen( steps, screenId ) {
		return steps.filter( ( step ) => step.screen === screenId );
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

	toDriverStep( step, tour ) {
		const driverStep = {
			data: { id: step.id },
			element: step.selector,
			popover: {
				description: step.description,
				side: this.getPopoverSide( step.side ),
				title: step.title,
			},
		};

		if ( step.next_url && ! this.isLastTourStepForTour( step.id, tour ) ) {
			const navigate = () => this.handleNextWithNavigation( step, tour );
			driverStep.popover.onNextClick = navigate;
			driverStep.popover.onDoneClick = navigate;
		}

		return driverStep;
	}

	handleNextWithNavigation( step, tour ) {
		const nextStep = this.getNextTourStep( tour, step.id );

		if ( ! nextStep ) {
			return;
		}

		this.saveProgressBeforeNavigation( nextStep.id );
		window.location.assign( this.resolveAdminUrl( step.next_url ) );
	}

	saveProgressBeforeNavigation( stepId ) {
		const body = new URLSearchParams( {
			action: this.config.ajax.action,
			nonce: this.config.ajax.nonce,
			status: 'in_progress',
			stepId,
			tourId: this.activeTour.id,
			version: this.activeTour.version,
		} );

		if ( navigator.sendBeacon ) {
			const payload = new Blob( [ body.toString() ], {
				type: 'application/x-www-form-urlencoded',
			} );
			navigator.sendBeacon( this.config.ajax.url, payload );
			return;
		}

		this.saveProgress( 'in_progress', stepId );
	}

	resolveDriverStep( options = null ) {
		return options?.state?.activeStep
			?? this.driver?.getActiveStep?.()
			?? this.getActiveDriverStep();
	}

	getTourStepById( stepId ) {
		return this.activeTour?.steps?.find( ( step ) => step.id === stepId ) ?? null;
	}

	handleNextClick( step, options ) {
		const driverStep = step ?? this.resolveDriverStep( options );
		const stepId = driverStep?.data?.id;

		if ( ! stepId ) {
			options?.driver?.moveNext();
			return;
		}

		const tourStep = this.getTourStepById( stepId );

		if ( tourStep?.next_url && ! this.isLastTourStep( stepId ) ) {
			this.handleNextWithNavigation( tourStep, this.activeTour );
			return;
		}

		options?.driver?.moveNext();
	}

	handleDoneClick( step, options ) {
		const driverStep = step ?? this.resolveDriverStep( options );
		const stepId = driverStep?.data?.id;

		if ( ! stepId ) {
			return;
		}

		if ( this.isLastTourStep( stepId ) ) {
			this.handleTourComplete( driverStep );
			return;
		}

		const tourStep = this.getTourStepById( stepId );

		if ( tourStep?.next_url ) {
			this.handleNextWithNavigation( tourStep, this.activeTour );
			return;
		}

		options?.driver?.moveNext();
	}

	handleTourComplete( step ) {
		if ( ! step?.data?.id ) {
			return;
		}

		this.saveProgress( 'completed', step.data.id, () => {
			this.driver?.destroy();
		} );
	}

	syncPopoverChrome( popover, step ) {
		const stepId = step?.data?.id;

		if ( ! stepId || ! popover ) {
			return;
		}

		const { current, total } = this.getTourProgressNumbers( stepId );

		if ( popover.progress ) {
			popover.progress.textContent = `${ current } of ${ total }`;
		}

		if ( ! this.isLastTourStep( stepId ) && popover.nextButton ) {
			popover.nextButton.textContent = 'Next';
		}
	}

	getTourProgressNumbers( stepId ) {
		const steps = this.activeTour?.steps ?? [];
		const index = steps.findIndex( ( step ) => step.id === stepId );

		return {
			current: Math.max( index + 1, 1 ),
			total: steps.length,
		};
	}

	/**
	 * @param {Tour}   tour
	 * @param {string} stepId
	 * @return {TourStep|null}
	 */
	getNextTourStep( tour, stepId ) {
		const stepIndex = tour.steps.findIndex( ( step ) => step.id === stepId );

		if ( -1 === stepIndex ) {
			return null;
		}

		return tour.steps[ stepIndex + 1 ] ?? null;
	}

	resolveAdminUrl( path ) {
		return new URL( path, this.config.adminUrl ).href;
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

		const popover = this.driver?.getState?.( 'popover' );

		if ( popover ) {
			this.syncPopoverChrome( popover, step );
		}
	}

	handleDestroyed( step, reason ) {
		if ( ! step?.data?.id ) {
			return;
		}

		if ( 'done' === reason && this.isLastTourStep( step.data.id ) ) {
			return;
		}

		const status = 'done' === reason ? 'completed' : 'in_progress';

		if ( 'completed' === status && ! this.isLastTourStep( step.data.id ) ) {
			this.saveProgress( 'in_progress', step.data.id );
			return;
		}

		this.saveProgress( status, step.data.id );
		this.emit( status, { stepId: step.data.id, tourId: this.activeTour.id } );
	}

	isLastTourStep( stepId ) {
		const steps = this.activeTour?.steps ?? [];

		return steps.length && steps[ steps.length - 1 ].id === stepId;
	}

	isLastTourStepForTour( stepId, tour ) {
		const steps = tour?.steps ?? [];

		return steps.length && steps[ steps.length - 1 ].id === stepId;
	}

	getActiveDriverStep() {
		const index = this.driver?.getState?.( 'activeIndex' );

		if ( index === undefined ) {
			return null;
		}

		const steps = this.driver?.getConfig?.( 'steps' ) ?? [];

		return steps[ index ] ?? null;
	}

	saveProgress( status, stepId, callback = null ) {
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
		} ) ).then( () => callback?.() ).catch( () => {} );
	}

	emit( eventName, payload ) {
		this.listeners.get( eventName )?.forEach( ( listener ) => listener( payload ) );
	}
}

const EDITOR_TOUR_READY_TIMEOUT_MS = 30000;

const isEditorTargetVisible = ( element ) => {
	if ( ! element ) {
		return false;
	}

	const style = window.getComputedStyle( element );

	if ( 'none' === style.display || 'hidden' === style.visibility ) {
		return false;
	}

	const rect = element.getBoundingClientRect();

	return rect.width > 0 && rect.height > 0 && parseFloat( style.opacity ) > 0;
};

const isEditorLoadingOverlayVisible = () => {
	return [ '#elementor-loading', '#elementor-preview-loading' ].some( ( selector ) => {
		return isEditorTargetVisible( document.querySelector( selector ) );
	} );
};

const isEditorPanelReadyForTour = () => {
	const panel = document.querySelector( '#elementor-panel' );

	if ( ! isEditorTargetVisible( panel ) ) {
		return false;
	}

	if ( document.body.classList.contains( 'elementor-panel-loading' ) ) {
		return false;
	}

	if ( isEditorLoadingOverlayVisible() ) {
		return false;
	}

	const elementsWrapper = document.querySelector( '#elementor-panel-elements-wrapper' );

	return !! elementsWrapper?.childElementCount;
};

const waitForEditorTourReady = ( callback ) => {
	const deadline = Date.now() + EDITOR_TOUR_READY_TIMEOUT_MS;

	const pollUntilReady = () => {
		if ( isEditorPanelReadyForTour() ) {
			callback();
			return;
		}

		if ( Date.now() > deadline ) {
			callback();
			return;
		}

		window.requestAnimationFrame( pollUntilReady );
	};

	const startAfterPreview = () => {
		window.requestAnimationFrame( pollUntilReady );
	};

	if ( window.elementor?.loaded ) {
		startAfterPreview();
		return;
	}

	if ( window.elementor?.once ) {
		window.elementor.once( 'preview:loaded', startAfterPreview );
		return;
	}

	const $window = window.jQuery?.( window );

	if ( $window ) {
		$window.one( 'elementor:loaded', () => {
			if ( window.elementor?.once ) {
				window.elementor.once( 'preview:loaded', startAfterPreview );
			} else {
				startAfterPreview();
			}
		} );
		return;
	}

	startAfterPreview();
};

const bootstrapGuidedTours = () => {
	const config = window.elementorGuidedToursConfig;

	if ( ! config ) {
		return;
	}

	const guidedTours = new GuidedTours( config );
	guidedTours.init();
	window.elementorGuidedTours = guidedTours;
};

if ( 'editor' === window.elementorGuidedToursConfig?.context ) {
	waitForEditorTourReady( bootstrapGuidedTours );
} else {
	bootstrapGuidedTours();
}

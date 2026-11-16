import { ELEMENT_WAIT_TIMEOUT } from './constants';
import { formatProgressText, getPopoverSide, isValidSelector } from './popover-utils';
import {
	getNextTourStep,
	getPreviousScreenTarget,
	getStepsForScreen,
	getTourProgressNumbers,
	isLastTourStep,
} from './tour-steps';

export class GuidedTours {
	constructor( config, driverFactory = window.driver?.js?.driver, request = null ) {
		this.config = config;
		this.driverFactory = driverFactory;
		this.request = request ?? window.fetch.bind( window );
		this.listeners = new Map();
		this.progressRequest = Promise.resolve();
		this.tours = new Map();
		this.isNavigating = false;
	}

	init() {
		if ( ! this.driverFactory || ! this.config?.tour ) {
			return;
		}

		this.registerTour( this.config.tour, this.config.progress );

		if ( this.shouldSuppressTour( this.config.tour.id ) ) {
			return;
		}

		const stepsOnScreen = getStepsForScreen( this.config.tour.steps, this.config.screenId );
		const startIndex = stepsOnScreen.findIndex( ( step ) => step.id === this.config.resumeStepId );

		if ( -1 === startIndex ) {
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
	 * @param {string}     tourId
	 * @param {number}     stepIndex
	 * @param {TourStep[]} stepsOnScreen
	 */
	startTour( tourId, stepIndex = 0, stepsOnScreen = null ) {
		const registeredTour = this.tours.get( tourId );

		if ( ! registeredTour ) {
			return;
		}

		const tourSteps = stepsOnScreen ?? registeredTour.tour.steps;
		this.activeTour = registeredTour.tour;
		const steps = tourSteps
			.filter( ( step ) => isValidSelector( step.selector ) )
			.map( ( step ) => this.toDriverStep( step ) );

		if ( ! steps.length ) {
			return;
		}

		this.activeScreenSteps = tourSteps;
		this.driver = this.driverFactory( {
			allowClose: true,
			doneBtnText: this.config.i18n?.done,
			nextBtnText: this.config.i18n?.next,
			prevBtnText: this.config.i18n?.previous,
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
			onPrevClick: ( element, step, options ) => this.handlePrevClick( step, options ),
		} );

		this.emit( 'start', { tourId, stepIndex } );
		this.driver.drive( stepIndex );
	}

	/**
	 * @param {string} tourId
	 * @return {boolean}
	 */
	shouldSuppressTour( tourId ) {
		const status = this.tours.get( tourId )?.progress?.status;

		return 'completed' === status || 'dismissed' === status;
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

	handlePrevClick( step, options ) {
		const stepId = ( step ?? this.resolveDriverStep( options ) )?.data?.id;

		if ( options?.driver?.hasPreviousStep?.() ) {
			options.driver.movePrevious();
			return;
		}

		const target = stepId ? getPreviousScreenTarget( this.activeTour, stepId ) : null;

		if ( ! target ) {
			return;
		}

		this.isNavigating = true;
		this.saveProgressBeforeNavigation( target.stepId ).then( () => {
			window.location.assign( this.resolveAdminUrl( target.url ) );
		} );
	}

	toDriverStep( step ) {
		const canNavigateBack = Boolean( getPreviousScreenTarget( this.activeTour, step.id ) );

		return {
			data: { id: step.id },
			element: step.selector,
			popover: {
				...( canNavigateBack && { disableButtons: [] } ),
				description: step.description,
				side: getPopoverSide( step.side ),
				title: step.title,
			},
		};
	}

	shouldNavigateOnAdvance( tourStep, stepId, tour = this.activeTour ) {
		return Boolean( tourStep?.next_url && ! isLastTourStep( tour, stepId ) );
	}

	handleNextWithNavigation( step, tour ) {
		const nextStep = getNextTourStep( tour, step.id );

		if ( ! nextStep ) {
			return;
		}

		this.isNavigating = true;
		this.saveProgressBeforeNavigation( nextStep.id ).then( () => {
			window.location.assign( this.resolveAdminUrl( step.next_url ) );
		} );
	}

	saveProgressBeforeNavigation( stepId ) {
		const body = this.createProgressBody( 'in_progress', stepId );

		this.progressRequest = this.progressRequest.then( () => this.request( this.config.ajax.url, {
			body,
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			keepalive: true,
			method: 'POST',
		} ) ).catch( () => {} );

		return this.progressRequest;
	}

	resolveDriverStep( options = null ) {
		return options?.state?.activeStep ??
			this.driver?.getActiveStep?.() ??
			this.getActiveDriverStep();
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

		if ( this.shouldNavigateOnAdvance( tourStep, stepId ) ) {
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

		if ( isLastTourStep( this.activeTour, stepId ) ) {
			this.handleTourComplete( driverStep );
			return;
		}

		const tourStep = this.getTourStepById( stepId );

		if ( this.shouldNavigateOnAdvance( tourStep, stepId ) ) {
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

		const { current, total } = getTourProgressNumbers( this.activeTour, stepId );

		if ( popover.progress ) {
			popover.progress.textContent = formatProgressText( this.config.i18n?.progress ?? '%1$s of %2$s', current, total );
		}

		if ( ! isLastTourStep( this.activeTour, stepId ) && popover.nextButton ) {
			popover.nextButton.textContent = this.config.i18n?.next ?? 'Next';
		}
	}

	resolveAdminUrl( path ) {
		return new URL( path, this.config.adminUrl ).href;
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
		if ( ! step?.data?.id || this.isNavigating ) {
			return;
		}

		if ( 'done' === reason ) {
			if ( isLastTourStep( this.activeTour, step.data.id ) ) {
				return;
			}

			this.saveProgress( 'in_progress', step.data.id );
			this.emit( 'in_progress', { stepId: step.data.id, tourId: this.activeTour.id } );
			return;
		}

		this.saveProgress( 'dismissed', step.data.id );
		this.emit( 'dismissed', { stepId: step.data.id, tourId: this.activeTour.id } );
	}

	getActiveDriverStep() {
		const index = this.driver?.getState?.( 'activeIndex' );

		if ( index === undefined ) {
			return null;
		}

		const steps = this.driver?.getConfig?.( 'steps' ) ?? [];

		return steps[ index ] ?? null;
	}

	createProgressBody( status, stepId ) {
		return new URLSearchParams( {
			action: this.config.ajax.action,
			nonce: this.config.ajax.nonce,
			status,
			stepId,
			tourId: this.activeTour.id,
			version: this.activeTour.version,
		} );
	}

	saveProgress( status, stepId, callback = null ) {
		const body = this.createProgressBody( status, stepId );

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

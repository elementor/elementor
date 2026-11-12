/**
 * @typedef {Object} TourStep
 * @property {string}                        id          Stable step identifier.
 * @property {string}                        screen      Admin screen id for this step.
 * @property {string}                        selector    Target CSS selector.
 * @property {string}                        title       Popover title.
 * @property {string}                        description Popover description.
 * @property {'top'|'right'|'bottom'|'left'} side        Popover placement.
 * @property {string}                        [next_url]  Optional admin-relative URL after Next.
 * @property {string}                        [url]       Optional admin-relative URL of this step's screen, used by Previous.
 */

/**
 * @typedef {Object} Tour
 * @property {string}     id      Stable tour identifier.
 * @property {number}     version Tour content version.
 * @property {TourStep[]} steps   Ordered tour steps.
 */

/**
 * @param {TourStep[]} steps
 * @param {string}     screenId
 * @return {TourStep[]}
 */
export const getStepsForScreen = ( steps, screenId ) => {
	return steps.filter( ( step ) => step.screen === screenId );
};

const getPreviousStepUrl = ( steps, index ) => {
	const previousStep = steps[ index - 1 ];
	const linkingStep = steps[ index - 2 ];

	if ( previousStep.url ) {
		return previousStep.url;
	}

	if ( ! linkingStep?.next_url || linkingStep.screen === previousStep.screen ) {
		return null;
	}

	return linkingStep.next_url;
};

export const getPreviousScreenTarget = ( tour, stepId ) => {
	const steps = tour?.steps ?? [];
	const index = steps.findIndex( ( step ) => step.id === stepId );
	const previousStep = steps[ index - 1 ];

	if ( ! previousStep || previousStep.screen === steps[ index ].screen ) {
		return null;
	}

	const url = getPreviousStepUrl( steps, index );

	return url ? { stepId: previousStep.id, url } : null;
};

/**
 * @param {Tour}   tour
 * @param {string} stepId
 * @return {TourStep|null}
 */
export const getNextTourStep = ( tour, stepId ) => {
	const stepIndex = tour.steps.findIndex( ( step ) => step.id === stepId );

	if ( -1 === stepIndex ) {
		return null;
	}

	return tour.steps[ stepIndex + 1 ] ?? null;
};

export const isLastTourStep = ( tour, stepId ) => {
	const steps = tour?.steps ?? [];

	return steps.length > 0 && steps[ steps.length - 1 ].id === stepId;
};

export const getTourProgressNumbers = ( tour, stepId ) => {
	const steps = tour?.steps ?? [];
	const index = steps.findIndex( ( step ) => step.id === stepId );

	return {
		current: Math.max( index + 1, 1 ),
		total: steps.length,
	};
};

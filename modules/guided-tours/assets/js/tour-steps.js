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

/**
 * @param {Tour}        tour
 * @param {Object}      progress
 * @param {string|null} screenId
 * @return {TourStep|null}
 */
export const getResumeStep = ( tour, progress, screenId ) => {
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
		( step, index ) => index > progressIndex && step.screen === screenId,
	);

	return nextOnScreen ?? null;
};

/**
 * @param {TourStep[]} steps
 * @param {string}     screenId
 * @return {TourStep[]}
 */
export const getStepsForScreen = ( steps, screenId ) => {
	return steps.filter( ( step ) => step.screen === screenId );
};

export const getPreviousScreenTarget = ( tour, stepId ) => {
	const steps = tour?.steps ?? [];
	const index = steps.findIndex( ( step ) => step.id === stepId );
	const previousStep = steps[ index - 1 ];
	const linkingStep = steps[ index - 2 ];

	if ( ! previousStep || previousStep.screen === steps[ index ].screen || ! linkingStep?.next_url ) {
		return null;
	}

	if ( linkingStep.screen === previousStep.screen ) {
		return null;
	}

	return { stepId: previousStep.id, url: linkingStep.next_url };
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

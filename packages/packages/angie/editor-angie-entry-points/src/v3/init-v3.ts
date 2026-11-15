import { __privateListenTo as listenTo, isExperimentActive, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { applyAngieControlBehavior } from './apply-angie-control-behavior';

const CONTROLS_BEHAVIORS_FILTER = 'controls/base/behaviors';
const FILTER_PRIORITY = 20;
const ANGIE_IN_PANELS_EXPERIMENT = 'e_angie_in_panels';

type ElementorHooks = {
	addFilter: (
		name: string,
		callback: ( behaviors: Record< string, unknown >, view: unknown ) => Record< string, unknown >,
		priority?: number
	) => void;
};

export function initV3(): void {
	if ( ! isExperimentActive( ANGIE_IN_PANELS_EXPERIMENT ) ) {
		return;
	}

	listenTo( v1ReadyEvent(), () => {
		const hooks = ( window as { elementor?: { hooks?: ElementorHooks } } ).elementor?.hooks;

		hooks?.addFilter(
			CONTROLS_BEHAVIORS_FILTER,
			applyAngieControlBehavior as (
				behaviors: Record< string, unknown >,
				view: unknown
			) => Record< string, unknown >,
			FILTER_PRIORITY
		);
	} );
}

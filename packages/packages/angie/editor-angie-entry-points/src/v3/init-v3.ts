import { __privateListenTo as listenTo, isExperimentActive, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { initV3AnimationControls } from './animation/init-animation';
import { applyAngieControlBehavior } from './apply-angie-control-behavior';
import { initV3CodeControls } from './code/init-code';
import { initV3Layout } from './layout/init-layout';
import { initV3TextControls } from './text/init-text';
import { getExtendedWindow } from './types';

const CONTROLS_BEHAVIORS_FILTER = 'controls/base/behaviors';
const FILTER_PRIORITY = 20;
const ANGIE_IN_PANELS_EXPERIMENT = 'e_angie_in_panels';

export function initV3(): void {
	if ( ! isExperimentActive( ANGIE_IN_PANELS_EXPERIMENT ) ) {
		return;
	}

	initV3TextControls();
	initV3CodeControls();
	initV3AnimationControls();
	initV3Layout();

	listenTo( v1ReadyEvent(), () => {
		getExtendedWindow().elementor?.hooks?.addFilter(
			CONTROLS_BEHAVIORS_FILTER,
			applyAngieControlBehavior as (
				behaviors: Record< string, unknown >,
				view: unknown
			) => Record< string, unknown >,
			FILTER_PRIORITY
		);
	} );
}

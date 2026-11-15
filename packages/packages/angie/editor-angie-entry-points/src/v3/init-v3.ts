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

/**
 * V3 Angie entry points — ticket coverage (Epic ED-25282):
 *
 * | Button / location                         | Ticket    |
 * | ----------------------------------------- | --------- |
 * | Write/Edit with AI (text/textarea/wysiwyg)| ED-26124  |
 * | Code with AI                              | ED-26126  |
 * | Animate with AI / hover animation         | ED-26128  |
 * | Build with AI (add-section)               | ED-26130  |
 * | Generate variations (container menu)      | ED-26130  |
 * | Generate Variations (template library)    | ED-26130  |
 * | Show AI gate                              | ED-26336  |
 * | Entry-points package infra                | ED-26335  |
 *
 * PHP hosts kept in modules/ai/module.php for ED-26128:
 * `ai_animation` (Motion Effects) and `ai_hover_animation` (Transform hover).
 *
 * Intentionally NOT restored (deleted by ED-26337, no Angie replace ticket):
 * media / Create with AI, excerpt, navigator AI titles.
 */
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

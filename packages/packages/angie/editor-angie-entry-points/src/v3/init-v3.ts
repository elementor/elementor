import { __privateListenTo as listenTo, isExperimentActive, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { initV3AnimationControls } from './animation/init-animation';
import { applyAngieControlBehavior } from './apply-angie-control-behavior';
import { initV3CodeControls } from './code/init-code';
import { initV3Layout } from './layout/init-layout';
import { initV3PlaceholderControls } from './placeholders/init-placeholders';
import { initV3TextControls } from './text/init-text';
import { getExtendedWindow } from './types';

const CONTROLS_BEHAVIORS_FILTER = 'controls/base/behaviors';
const FILTER_PRIORITY = 20;
const ANGIE_IN_PANELS_EXPERIMENT = 'e_angie_in_panels';

/**
 * V3 Angie entry points — ticket coverage (Epic ED-25282):
 *
 * | Button / location                         | Ticket / note        |
 * | ----------------------------------------- | -------------------- |
 * | Write/Edit with AI (text/textarea/wysiwyg)| ED-26124             |
 * | Code with AI                              | ED-26126             |
 * | Animate with AI / hover animation         | ED-26128 (+ PHP host)|
 * | Build with AI (structure / add-section)   | ED-26130 (+ template)|
 * | Generate variations (container menu)      | ED-26130             |
 * | Generate Variations (template library)    | ED-26130             |
 * | Create with AI (media) / excerpt          | Placeholder (no replace ticket yet) |
 * | Show AI gate                              | ED-26336             |
 * | Entry-points package infra                | ED-26335             |
 *
 * Durable hosts so buttons cannot vanish after legacy deletion:
 * - Motion/hover: modules/ai/module.php `ai_animation` / `ai_hover_animation`
 * - Build with AI: tmpl-elementor-add-section `.e-ai-layout-button`
 */
export function initV3(): void {
	if ( ! isExperimentActive( ANGIE_IN_PANELS_EXPERIMENT ) ) {
		return;
	}

	initV3TextControls();
	initV3CodeControls();
	initV3AnimationControls();
	initV3PlaceholderControls();
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

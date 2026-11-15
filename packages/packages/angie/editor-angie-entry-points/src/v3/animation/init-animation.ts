import { __ } from '@wordpress/i18n';

import { buildAngieV3AnimationPrompt } from '../../prompts';
import { registerV3AngieControl } from '../registry';
import type { V3ControlViewWithGetValue } from '../types';
import { gatherMotionEffectSettings, resolveWidgetTypeFromView, summarizeMotionSettings } from './motion-settings';

const HOVER_ANIMATION_AI_TYPE = 'hover_animation';

const animationScopeFromAiType = ( aiType: string ): 'hover' | 'entrance' =>
	aiType === HOVER_ANIMATION_AI_TYPE ? 'hover' : 'entrance';

export function initV3AnimationControls(): void {
	registerV3AngieControl( {
		types: [ 'animation', HOVER_ANIMATION_AI_TYPE ],
		forceLabelBlock: true,
		getGetControlValue: ( view: V3ControlViewWithGetValue, aiType: string ) => () =>
			gatherMotionEffectSettings( view, aiType ),
		getAdditionalOptions: ( view, aiType ) => ( {
			animationType: animationScopeFromAiType( aiType ),
			widgetType: resolveWidgetTypeFromView( view ),
			buttonBorder: true,
		} ),
		buildPrompt: ( { type, getControlValue, context, additionalOptions } ) => {
			const rawValue = getControlValue();
			const motionSettings =
				'object' === typeof rawValue && null !== rawValue ? ( rawValue as Record< string, unknown > ) : {};

			return buildAngieV3AnimationPrompt( {
				elementId: context.elementId,
				controlName: context.controlName,
				animationType:
					'string' === typeof additionalOptions?.animationType
						? additionalOptions.animationType
						: animationScopeFromAiType( type ),
				motionSettingsSummary: summarizeMotionSettings( motionSettings ),
			} );
		},
		getButtonLabel: () => __( 'Animate with AI', 'elementor' ),
	} );
}

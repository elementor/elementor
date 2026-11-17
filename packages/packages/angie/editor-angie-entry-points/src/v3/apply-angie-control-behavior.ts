import { getAngieControlBehaviorClass } from './behavior/create-behavior-class';
import { getV3ControlContext } from './context';
import { isAngieEntryPointsEnabled } from './is-angie-entry-points-enabled';
import { getV3AngieControl } from './registry';
import type { BehaviorsMap, V3ControlViewWithGetValue } from './types';

export function applyAngieControlBehavior( behaviors: BehaviorsMap, view: V3ControlViewWithGetValue ): BehaviorsMap {
	if ( ! isAngieEntryPointsEnabled() ) {
		return behaviors;
	}

	const model = view.options.model;
	const aiOptions = model.get( 'ai' ) as { active?: boolean; type?: string; language?: string } | undefined;

	if ( ! aiOptions?.active ) {
		return behaviors;
	}

	const entry = getV3AngieControl( aiOptions.type as string );

	if ( ! entry ) {
		return behaviors;
	}

	const controlType = model.get( 'type' ) as string;
	const context = getV3ControlContext( view, controlType );

	if ( context.isRepeaterItem ) {
		return behaviors;
	}

	const aiType = aiOptions.type as string;
	const getControlValue = entry.getGetControlValue?.( view, aiType ) ?? view.getControlValue.bind( view );

	behaviors.ai = {
		behaviorClass: getAngieControlBehaviorClass(),
		type: aiOptions.type,
		controlType,
		getControlValue,
		isLabelBlock: entry.forceLabelBlock ?? Boolean( model.get( 'label_block' ) ),
		additionalOptions: {
			defaultValue: model.get( 'default' ),
			codeLanguage: aiOptions.language || model.get( 'language' ),
			elementId: view.options.container?.id,
			...( entry.getAdditionalOptions?.( view, aiType ) ?? {} ),
		},
		context,
		buildPrompt: entry.buildPrompt,
		getButtonLabel: entry.getButtonLabel,
	};

	return behaviors;
}

import { getAngieControlBehaviorClass } from './behavior/create-behavior-class';
import { getV3ControlContext } from './context';
import { shouldShowAngieEntryPoints } from './is-angie-entry-points-enabled';
import { getV3AngieControl } from './registry';
import type { BehaviorsMap, V3ControlViewWithGetValue } from './types';

export function applyAngieControlBehavior( behaviors: BehaviorsMap, view: V3ControlViewWithGetValue ): BehaviorsMap {
	if ( ! shouldShowAngieEntryPoints() ) {
		return behaviors;
	}

	const model = view.options.model;
	const aiOptions = model.get( 'ai' ) as { active?: boolean; type?: string; language?: string } | undefined;

	// `active: false` opts out. Missing `active` still shows when a type is registered
	// (many widgets only set `ai.type` and rely on control defaults).
	if ( ! aiOptions?.type || false === aiOptions.active ) {
		return behaviors;
	}

	const aiType = aiOptions.type;
	const entry = getV3AngieControl( aiType );

	if ( ! entry ) {
		return behaviors;
	}

	if ( entry.shouldApply && ! entry.shouldApply( view, aiType ) ) {
		return behaviors;
	}

	const controlType = model.get( 'type' ) as string;
	const context = getV3ControlContext( view, controlType );

	if ( context.isRepeaterItem ) {
		return behaviors;
	}

	const getControlValue = entry.getGetControlValue?.( view, aiType ) ?? view.getControlValue.bind( view );

	behaviors.ai = {
		behaviorClass: getAngieControlBehaviorClass(),
		type: aiType,
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

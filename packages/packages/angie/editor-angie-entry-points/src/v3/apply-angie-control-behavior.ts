import { getAngieControlBehaviorClass } from './behavior/create-behavior-class';
import { getV3ControlContext } from './context';
import { isAngieEntryPointsEnabled } from './is-angie-entry-points-enabled';
import { getV3AngieControl } from './registry';
import type { BehaviorsMap, V3ControlView } from './types';

type V3ControlViewWithValue = V3ControlView & { getControlValue: () => unknown };

export function applyAngieControlBehavior( behaviors: BehaviorsMap, view: V3ControlViewWithValue ): BehaviorsMap {
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

	behaviors.ai = {
		behaviorClass: getAngieControlBehaviorClass(),
		type: aiOptions.type,
		controlType,
		getControlValue: view.getControlValue.bind( view ),
		isLabelBlock: model.get( 'label_block' ),
		additionalOptions: {
			defaultValue: model.get( 'default' ),
			codeLanguage: aiOptions.language || model.get( 'language' ),
			elementId: view.options.container?.id,
		},
		context,
		buildPrompt: entry.buildPrompt,
		getButtonLabel: entry.getButtonLabel,
	};

	return behaviors;
}

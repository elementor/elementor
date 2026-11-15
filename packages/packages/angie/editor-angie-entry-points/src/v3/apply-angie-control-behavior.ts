import { getGenerateWithAngieLabel } from '../labels';
import { getAngieControlBehaviorClass } from './behavior/create-behavior-class';
import { getV3ControlContext } from './context';
import { shouldShowAngieEntryPoints } from './is-angie-entry-points-enabled';
import { getV3AngieControl } from './registry';
import type { BehaviorsMap, BuildV3AngiePromptArgs, V3AngieControlRegistration, V3ControlViewWithGetValue } from './types';

const placeholderRegistration: V3AngieControlRegistration = {
	types: [],
	buildPrompt: ( { type, controlType, context }: BuildV3AngiePromptArgs ) =>
		[
			`Help with the V3 "${ type }" AI control "${ context.controlName }" (control type "${ controlType }") on element "${ context.elementId }".`,
			'Ask the user what they want to change, then guide them.',
		].join( '\n\n' ),
	getButtonLabel: () => getGenerateWithAngieLabel(),
};

export function applyAngieControlBehavior( behaviors: BehaviorsMap, view: V3ControlViewWithGetValue ): BehaviorsMap {
	if ( ! shouldShowAngieEntryPoints() ) {
		return behaviors;
	}

	const model = view.options.model;
	const aiOptions = model.get( 'ai' ) as { active?: boolean; type?: string; language?: string } | undefined;

	if ( ! aiOptions?.active || ! aiOptions.type ) {
		return behaviors;
	}

	const aiType = aiOptions.type;
	const entry = getV3AngieControl( aiType ) ?? placeholderRegistration;

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

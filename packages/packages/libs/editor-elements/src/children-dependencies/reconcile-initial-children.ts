import { type V1ElementConfig, type V1ElementData, type V1ElementSettingsProps } from '../sync/types';
import { evaluateWhen } from './evaluate-when';
import { resolveInsertIndex } from './resolve-insert-index';
import { createChildrenStash } from './stash';
import { type ChildDependencyRule } from './types';

type ReconcileInitialChildrenArgs = {
	elementId: string;
	elementConfig: V1ElementConfig | undefined;
	attributes: {
		elements?: V1ElementData[];
		settings?: V1ElementSettingsProps;
	};
};

export function reconcileInitialChildren( {
	elementId,
	elementConfig,
	attributes,
}: ReconcileInitialChildrenArgs ): void {
	const stash = createChildrenStash();
	const rules = elementConfig?.children_dependencies;

	if ( ! rules?.length ) {
		return;
	}

	const elements = [ ...( attributes.elements ?? [] ) ];
	const settings = attributes.settings ?? {};

	rules.forEach( ( rule: ChildDependencyRule ) => {
		const isMet = evaluateWhen( rule.when, settings );
		const existingIndex = elements.findIndex( ( element ) => element.elType === rule.child_type );
		const isPresent = existingIndex >= 0;

		if ( isMet && ! isPresent ) {
			const stashed = rule.stash ? stash.get( elementId, rule.child_type ) : undefined;
			const modelData = stashed ?? rule.default_model ?? ( { elType: rule.child_type } as V1ElementData );
			const insertAt = resolveInsertIndex( rule.position, elements );

			elements.splice( insertAt, 0, modelData );

			if ( stashed ) {
				stash.clear( elementId, rule.child_type );
			}

			return;
		}

		if ( ! isMet && isPresent ) {
			const [ removed ] = elements.splice( existingIndex, 1 );

			if ( rule.stash && removed ) {
				stash.save( elementId, rule.child_type, removed );
			}
		}
	} );

	attributes.elements = elements;
}

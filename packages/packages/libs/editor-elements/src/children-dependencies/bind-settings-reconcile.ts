import { type PropValue } from '@elementor/editor-props';

import { getContainer } from '../sync/get-container';
import { addModelToParent, removeModelFromParent } from '../sync/resolve-element';
import { resolveInsertIndex } from '../sync/resolve-insert-index';
import { type V1Element, type V1ElementConfig, type V1ElementData, type V1ElementModelProps } from '../sync/types';
import { createChildrenStash } from './stash';
import { type ChildDependencyRule, type ChildrenStash } from './types';
import { evaluateWhen, resolveChildModelData } from './utils';

type SettingsChangeSource = {
	get: ( key: string ) => unknown;
	toJSON: () => Record< string, PropValue >;
	on?: ( event: string, callback: ( ...args: unknown[] ) => void ) => void;
	off?: ( event: string, callback: ( ...args: unknown[] ) => void ) => void;
};

type ReactiveModel = {
	get: ( key: string ) => unknown;
};

type BindSettingsReconcileArgs = {
	model: ReactiveModel;
	elementConfig: V1ElementConfig | undefined;
};

type Detach = () => void;

export function bindSettingsReconcile( { model, elementConfig }: BindSettingsReconcileArgs ): Detach {
	const stash = createChildrenStash();
	const rules = elementConfig?.children_dependencies;

	if ( ! rules?.length ) {
		return () => {};
	}

	const settingsModel = model.get( 'settings' ) as SettingsChangeSource | undefined;
	const elementId = model.get( 'id' ) as string | undefined;

	if ( ! settingsModel?.on || ! settingsModel?.off || ! elementId ) {
		return () => {};
	}

	const lastMet = new Map< string, boolean >();

	rules.forEach( ( rule ) => {
		lastMet.set( rule.child_type, evaluateWhen( rule.when, settingsModel.toJSON() ) );
	} );

	const onChange = () => {
		const currentSettings = settingsModel.toJSON();

		rules.forEach( ( rule ) => {
			const previous = lastMet.get( rule.child_type ) ?? false;
			const current = evaluateWhen( rule.when, currentSettings );

			if ( previous === current ) {
				return;
			}

			lastMet.set( rule.child_type, current );

			if ( current ) {
				attachChildFromRule( elementId, rule, stash );
			} else {
				detachChildFromRule( elementId, rule, stash );
			}
		} );
	};

	settingsModel.on( 'change', onChange );

	return () => {
		settingsModel.off?.( 'change', onChange );
		stash.clearAllForElement( elementId );
	};
}

function attachChildFromRule( parentId: string, rule: ChildDependencyRule, stash: ChildrenStash ): void {
	const parent = getContainer( parentId ) ?? undefined;
	const currentChildren = getDirectChildData( parent );
	const alreadyPresent = currentChildren.some( ( child ) => child.elType === rule.child_type );

	if ( alreadyPresent ) {
		return;
	}

	const { modelData, wasStashed } = resolveChildModelData( parentId, rule, stash );
	const insertAt = resolveInsertIndex( rule.position, currentChildren );

	const attached = addModelToParent( parentId, modelData as unknown as V1ElementModelProps, { at: insertAt } );

	if ( ! attached ) {
		return;
	}

	if ( wasStashed ) {
		stash.clear( parentId, rule.child_type );
	}

	requestNavigatorRefresh( parentId );
}

function detachChildFromRule( parentId: string, rule: ChildDependencyRule, stash: ChildrenStash ): void {
	const parent = getContainer( parentId ) ?? undefined;
	const child = parent?.children?.find( ( candidate ) => candidate.model.get( 'elType' ) === rule.child_type );

	if ( ! child ) {
		return;
	}

	const childSnapshot = child.model.toJSON() as unknown as V1ElementData;
	const removed = removeModelFromParent( parentId, child.id );

	if ( ! removed ) {
		return;
	}

	if ( rule.stash ) {
		stash.save( parentId, rule.child_type, childSnapshot );
	}

	requestNavigatorRefresh( parentId );
}

// Backbone `add`/`remove` on the parent elements collection is silent (see
// assets/dev/js/editor/document/component.js addModelToParent / removeModelFromParent),
// so the Marionette Navigator CompositeView never observes our mutation. The
// legacy navigator exposes an `elementor/navigator/refresh-children` custom
// window event (assets/dev/js/editor/regions/navigator/element.js) that
// re-renders the subtree for a given element id — dispatch it here so the
// Structure panel stays in sync with the model.
function requestNavigatorRefresh( parentId: string ): void {
	if ( typeof window === 'undefined' || typeof window.dispatchEvent !== 'function' ) {
		return;
	}

	window.dispatchEvent(
		new CustomEvent( 'elementor/navigator/refresh-children', {
			detail: { elementId: parentId },
		} )
	);
}

function getDirectChildData( parent: V1Element | undefined ): V1ElementData[] {
	return ( parent?.children ?? [] ).map( ( child ) => child.model.toJSON() as unknown as V1ElementData );
}

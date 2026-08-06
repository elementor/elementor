import { useEffect, useRef } from 'react';
import { getContainer, getElementSettings, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { booleanPropTypeUtil } from '@elementor/editor-props';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { HISTORY_DEBOUNCE_WAIT } from '../../../hooks/use-styles-fields';
import { ACCORDION_ITEM_ELEMENT_TYPE } from './use-actions';

const ACCORDION_ITEM_HEAD_ELEMENT_TYPE = 'e-accordion-item-head';

type CascadeShowIconPayload = {
	accordionId: string;
	showIcon: boolean;
};

type CascadeShowIconResult = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	previous: Record< string, any >;
};

// `show_icon` is global on the root (`Atomic_Accordion::define_props_schema()`); every
// `e-accordion-item-head` carries a *mirrored* `show_icon` prop of its own purely because the
// children-dependencies reconciler evaluates a rule against the declaring element's own settings
// and can only attach/detach that element's own direct children (see the comment on both props in
// PHP). This function is the write-through: it pushes the root's current value onto every head's
// mirrored prop, in one undo-able history transaction, so a single undo restores every head at
// once. It does not touch the icon child itself - each head's own `Child_Dependency` (bound to that
// head's settings `change` event) reacts to the prop flip and attaches/detaches/restashes the icon
// on its own, exactly as it would if the head's `show_icon` had been changed directly.
export const cascadeShowIconToHeads = undoable< CascadeShowIconPayload, CascadeShowIconResult, void >(
	{
		do: ( { accordionId, showIcon } ) => {
			const headIds = getAccordionHeadIds( accordionId );

			const previous = Object.fromEntries(
				headIds.map( ( headId ) => [ headId, getElementSettings( headId, [ 'show_icon' ] ).show_icon ] )
			);

			headIds.forEach( ( headId ) => {
				updateElementSettings( {
					id: headId,
					props: { show_icon: booleanPropTypeUtil.create( showIcon ) },
					withHistory: false,
				} );
			} );

			return { previous };
		},
		undo: ( _payload, { previous } ) => {
			Object.entries( previous ).forEach( ( [ headId, previousValue ] ) => {
				if ( ! previousValue ) {
					return;
				}

				updateElementSettings( { id: headId, props: { show_icon: previousValue }, withHistory: false } );
			} );
		},
	},
	{
		title: __( 'Accordion', 'elementor' ),
		subtitle: __( 'Show Icon', 'elementor' ),
		// `undoable()`'s debounce only delays when the *history entry* is pushed onto the undo stack -
		// the settings write itself (`do()`) still runs synchronously on every call. The root's own
		// `show_icon` change goes through `SettingsField` -> `useUndoableUpdateElementProp`
		// (`settings-field.tsx`), which debounces its history push by `HISTORY_DEBOUNCE_WAIT` (800ms).
		// Without matching that here, this cascade's history entry (pushed immediately) would land on
		// the undo stack *before* the root's (pushed 800ms later), so the first Undo after a toggle
		// would revert the root switch alone while every head stayed on its new value - the switch and
		// the icons would visibly disagree until a second Undo. Matching the debounce window fixes the
		// stack order to be deterministic (root's own entry, then this one) regardless of how quickly a
		// user hits Undo. It does not make the two changes one atomic transaction - see the comment on
		// `useShowIconWriteThrough` for why that would require forking the shared `Switch_Control`.
		debounce: { wait: HISTORY_DEBOUNCE_WAIT },
	}
);

function getAccordionHeadIds( accordionId: string ): string[] {
	const accordion = getContainer( accordionId );

	const itemContainers = ( accordion?.children ?? [] ).filter(
		( child ) => child.model.get( 'elType' ) === ACCORDION_ITEM_ELEMENT_TYPE
	);

	const headContainers = itemContainers
		.map( ( item ) => item.children?.find( ( child ) => child.model.get( 'elType' ) === ACCORDION_ITEM_HEAD_ELEMENT_TYPE ) )
		.filter( ( head ): head is V1Element => Boolean( head ) );

	return headContainers.map( ( head ) => head.id );
}

// Watches the root's *current* `show_icon` value (read reactively from the panel's element
// settings) and cascades it to every head on change. Skips the very first render for a given
// element so mounting the panel on an already-toggled-off accordion doesn't re-fire a no-op
// cascade. Deliberately lives alongside the repeater control rather than inside the generic
// `Switch_Control` -> `SettingsField` pipeline: that pipeline is shared by every atomic element's
// switch controls, so it is not a safe place to special-case one element's cross-element write-
// through.
export function useShowIconWriteThrough( accordionId: string, showIcon: boolean ): void {
	const previousRef = useRef< { accordionId: string; showIcon: boolean } | null >( null );

	useEffect( () => {
		const previous = previousRef.current;
		previousRef.current = { accordionId, showIcon };

		// No baseline yet, or the accordion identity changed (e.g. a different element got selected
		// into the same mounted control) - just record the new baseline, never cascade.
		if ( ! previous || previous.accordionId !== accordionId || previous.showIcon === showIcon ) {
			return;
		}

		cascadeShowIconToHeads( { accordionId, showIcon } );
	}, [ accordionId, showIcon ] );
}

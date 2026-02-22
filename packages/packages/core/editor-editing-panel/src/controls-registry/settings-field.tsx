import * as React from 'react';
import { useMemo } from 'react';
import { PropKeyProvider, PropProvider, type SetValueMeta } from '@elementor/editor-controls';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	type ElementID,
	getElementLabel,
	getElementSettings,
	updateElementSettings,
	useElementSettings,
} from '@elementor/editor-elements';
import {
	type CreateOptions,
	isDependency,
	isDependencyMet,
	type PropKey,
	type Props,
	type PropsSchema,
	type PropType,
	type PropValue,
} from '@elementor/editor-props';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { extractOrderedDependencies, getUpdatedValues, type Values } from '../utils/prop-dependency-utils';
import { createTopLevelObjectType } from './create-top-level-object-type';

type SettingsFieldProps = {
	bind: PropKey;
	propDisplayName: string;
	children: React.ReactNode;
};

const HISTORY_DEBOUNCE_WAIT = 800;

const useDependencyEffect = ( bind: string, elementId: ElementID, propsSchema: PropsSchema ) => {
	const elementSettingsForDepCheck = useElementSettings< PropValue >( elementId, Object.keys( propsSchema ) );

	Object.keys( propsSchema ).forEach( ( key ) => {
		if ( ! Object.hasOwn( elementSettingsForDepCheck || {}, key ) ) {
			if ( propsSchema[ key ].default !== null ) {
				elementSettingsForDepCheck[ key ] = propsSchema[ key ].default as Values[ keyof Values ];
			}
		}
	} );
	const propType = propsSchema[ bind ];
	const depCheck = isDependencyMet( propType?.dependencies, elementSettingsForDepCheck );
	return {
		isDisabled: ( prop: PropType ) => ! isDependencyMet( prop?.dependencies, elementSettingsForDepCheck ).isMet,
		isHidden:
			! depCheck.isMet &&
			! isDependency( depCheck.failingDependencies[ 0 ] ) &&
			depCheck.failingDependencies[ 0 ]?.effect === 'hide',
	};
};

export const SettingsField = ( { bind, children, propDisplayName }: SettingsFieldProps ) => {
	const {
		element: { id: elementId },
		elementType: { propsSchema, dependenciesPerTargetMapping = {} },
	} = useElement();

	const elementSettingValues = useElementSettings< PropValue >( elementId, Object.keys( propsSchema ) ) as Values;

	const value = { [ bind ]: elementSettingValues?.[ bind ] ?? null };

	const propType = createTopLevelObjectType( { schema: propsSchema } );

	const undoableUpdateElementProp = useUndoableUpdateElementProp( {
		elementId,
		propDisplayName,
	} );

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const setValue = ( newValue: Values, _: CreateOptions = {}, meta?: SetValueMeta ) => {
		const { withHistory = true } = meta ?? {};
		const dependents = extractOrderedDependencies( dependenciesPerTargetMapping );

		const settings = getUpdatedValues( newValue, dependents, propsSchema, elementSettingValues, elementId );
		if ( withHistory ) {
			undoableUpdateElementProp( settings );
		} else {
			updateElementSettings( { id: elementId, props: settings, withHistory: false } );
		}
	};

	const { isDisabled: propCheckDisabled, isHidden } = useDependencyEffect( bind, elementId, propsSchema );
	if ( isHidden ) {
		return null;
	}
	return (
		<PropProvider propType={ propType } value={ value } setValue={ setValue } isDisabled={ propCheckDisabled }>
			<PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
		</PropProvider>
	);
};

function useUndoableUpdateElementProp( {
	elementId,
	propDisplayName,
}: {
	elementId: ElementID;
	propDisplayName: string;
} ) {
	return useMemo( () => {
		return undoable(
			{
				do: ( newSettings: Props ) => {
					const prevPropValue = getElementSettings( elementId, Object.keys( newSettings ) ) as Props;

					updateElementSettings( { id: elementId, props: newSettings as Props, withHistory: false } );
					setDocumentModifiedStatus( true );

					return prevPropValue;
				},

				undo: ( {}, prevProps ) => {
					updateElementSettings( { id: elementId, props: prevProps, withHistory: false } );
				},
			},
			{
				title: getElementLabel( elementId ),
				// translators: %s is the name of the property that was edited.
				subtitle: __( '%s edited', 'elementor' ).replace( '%s', propDisplayName ),
				debounce: { wait: HISTORY_DEBOUNCE_WAIT },
			}
		);
	}, [ elementId, propDisplayName ] );
}

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

const getElementSettigsWithDefaults = ( propsSchema: PropsSchema, elementSettings?: Props ) => {
	const elementSettingsWithDefaults = { ...elementSettings };
	Object.keys( propsSchema ).forEach( ( key ) => {
		if ( ! ( key in elementSettingsWithDefaults ) ) {
			if ( propsSchema[ key ].default !== null ) {
				elementSettingsWithDefaults[ key ] = propsSchema[ key ].default as Values[ keyof Values ];
			}
		}
	} );
	return elementSettingsWithDefaults;
};

const extractDependencyEffect = ( bind: string, propsSchema: PropsSchema, currentElementSettings: Props ) => {
	const elementSettingsForDepCheck = getElementSettigsWithDefaults( propsSchema, currentElementSettings );
	const propType = propsSchema[ bind ];
	const depCheck = isDependencyMet( propType?.dependencies, elementSettingsForDepCheck );
	const isHidden =
		! depCheck.isMet &&
		! isDependency( depCheck.failingDependencies[ 0 ] ) &&
		depCheck.failingDependencies[ 0 ]?.effect === 'hide';
	return {
		isDisabled: ( prop: PropType ) => {
			const result = ! isDependencyMet( prop?.dependencies, elementSettingsForDepCheck ).isMet;
			return result;
		},
		isHidden,
		settingsWithDefaults: elementSettingsForDepCheck as Values,
	};
};

export const SettingsField = ( { bind, children, propDisplayName }: SettingsFieldProps ) => {
	const {
		element: { id: elementId },
		elementType: { propsSchema, dependenciesPerTargetMapping = {} },
	} = useElement();
	const currentElementSettings = useElementSettings< PropValue >( elementId, Object.keys( propsSchema ) ) as Values;
	const value = { [ bind ]: currentElementSettings?.[ bind ] ?? null };
	const propType = createTopLevelObjectType( { schema: propsSchema } );

	const undoableUpdateElementProp = useUndoableUpdateElementProp( {
		elementId,
		propDisplayName,
	} );
	const { isDisabled, isHidden, settingsWithDefaults } = extractDependencyEffect(
		bind,
		propsSchema,
		currentElementSettings
	);
	if ( isHidden ) {
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const setValue = ( newValue: Values, _: CreateOptions = {}, meta?: SetValueMeta ) => {
		const { withHistory = true } = meta ?? {};
		const dependents = extractOrderedDependencies( dependenciesPerTargetMapping );

		const settings = getUpdatedValues( newValue, dependents, propsSchema, settingsWithDefaults, elementId );
		if ( withHistory ) {
			undoableUpdateElementProp( settings );
		} else {
			updateElementSettings( { id: elementId, props: settings, withHistory: false } );
		}
	};

	return (
		<PropProvider propType={ propType } value={ value } setValue={ setValue } isDisabled={ isDisabled }>
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

import * as React from 'react';
import { useMemo } from 'react';
import { PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	type ElementID,
	getElementLabel,
	getElementSettings,
	updateElementSettings,
	useElementSettings,
} from '@elementor/editor-elements';
import { isDependencyMet, type PropKey, type Props, type PropType, type PropValue } from '@elementor/editor-props';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { extractOrderedDependencies, updateValues, type Values } from '../utils/prop-dependency-utils';
import { createTopLevelOjectType } from './create-top-level-object-type';

type SettingsFieldProps = {
	bind: PropKey;
	propDisplayName: string;
	children: React.ReactNode;
};

const HISTORY_DEBOUNCE_WAIT = 800;

export const SettingsField = ( { bind, children, propDisplayName }: SettingsFieldProps ) => {
	const {
		element: { id: elementId },
		elementType: { propsSchema, dependenciesPerTargetMapping = {} },
	} = useElement();

	const elementSettingValues = useElementSettings< PropValue >( elementId, Object.keys( propsSchema ) ) as Values;

	const value = { [ bind ]: elementSettingValues?.[ bind ] ?? null };

	const propType = createTopLevelOjectType( { schema: propsSchema } );

	const undoableUpdateElementProp = useUndoableUpdateElementProp( {
		elementId,
		propDisplayName,
	} );

	const setValue = ( newValue: Values ) => {
		const dependents = extractOrderedDependencies(
			bind,
			propsSchema,
			elementSettingValues,
			dependenciesPerTargetMapping
		);

		const settings = updateValues( newValue, dependents, propsSchema, elementSettingValues );

		undoableUpdateElementProp( settings );
	};

	const isDisabled = ( prop: PropType ) => ! isDependencyMet( prop?.dependencies, elementSettingValues );

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

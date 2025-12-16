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
	isDependencyMet,
	migratePropValue,
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

export const SettingsField = ( { bind, children, propDisplayName }: SettingsFieldProps ) => {
	const {
		element: { id: elementId },
		elementType: { propsSchema, dependenciesPerTargetMapping = {} },
	} = useElement();

	const elementSettingValues = useElementSettings< PropValue >( elementId, Object.keys( propsSchema ) ) as Values;

	const migratedValues = useMemo( () => {
		return migratePropValues( elementSettingValues, propsSchema );
	}, [ elementSettingValues, propsSchema ] );

	const value = { [ bind ]: migratedValues?.[ bind ] ?? null };

	const propType = createTopLevelObjectType( { schema: propsSchema } );

	const undoableUpdateElementProp = useUndoableUpdateElementProp( {
		elementId,
		propDisplayName,
	} );

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const setValue = ( newValue: Values, _: CreateOptions = {}, meta?: SetValueMeta ) => {
		const { withHistory = true } = meta ?? {};
		const dependents = extractOrderedDependencies(
			bind,
			propsSchema,
			migratedValues,
			dependenciesPerTargetMapping
		);

		const settings = getUpdatedValues( newValue, dependents, propsSchema, migratedValues, elementId );
		if ( withHistory ) {
			undoableUpdateElementProp( settings );
		} else {
			updateElementSettings( { id: elementId, props: settings, withHistory: false } );
		}
	};

	const isDisabled = ( prop: PropType ) => ! isDependencyMet( prop?.dependencies, migratedValues ).isMet;

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

function migratePropValues( values: Values, schema: PropsSchema ): Values {
	if ( ! values ) {
		return values;
	}

	const migrated: Values = {};

	for ( const [ key, value ] of Object.entries( values ) ) {
		if ( value === null || value === undefined ) {
			migrated[ key ] = value;
			continue;
		}

		const propType = schema[ key ];

		if ( ! propType ) {
			migrated[ key ] = value;
			continue;
		}

		migrated[ key ] = migratePropValue( value, propType ) as Values[ string ];
	}

	return migrated;
}

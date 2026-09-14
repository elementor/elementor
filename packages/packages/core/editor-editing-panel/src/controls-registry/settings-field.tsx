import * as React from 'react';
import { useMemo } from 'react';
import { PropKeyProvider, PropProvider, type SetValueMeta, useBoundProp } from '@elementor/editor-controls';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { type ElementID, getElementLabel, getElementSettings, updateElementSettings } from '@elementor/editor-elements';
import {
	type CreateOptions,
	type PropKey,
	type Props,
	responsiveFallbackChain,
	responsivePropTypeUtil,
} from '@elementor/editor-props';
import { type BreakpointId, useActiveBreakpoint, useBreakpoints } from '@elementor/editor-responsive';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { isResponsivePropType } from '../utils/is-responsive-prop-type';
import {
	extractDependencyEffect,
	extractOrderedDependencies,
	getElementSettingsWithDefaults,
	getUpdatedValues,
	type Values,
} from '../utils/prop-dependency-utils';
import { createTopLevelObjectType } from './create-top-level-object-type';

type SettingsFieldProps = {
	bind: PropKey;
	propDisplayName: string;
	children: React.ReactNode;
};

const HISTORY_DEBOUNCE_WAIT = 800;
const DESKTOP_BREAKPOINT: BreakpointId = 'desktop';

export const SettingsField = ( { bind, children, propDisplayName }: SettingsFieldProps ) => {
	const {
		element: { id: elementId },
		elementType: { propsSchema, dependenciesPerTargetMapping = {} },
		settings: currentElementSettings,
	} = useElement();

	const value = { [ bind ]: currentElementSettings?.[ bind ] ?? null };
	const propType = createTopLevelObjectType( { schema: propsSchema } );

	const undoableUpdateElementProp = useUndoableUpdateElementProp( {
		elementId,
		propDisplayName,
	} );

	const { isDisabled, isHidden } = extractDependencyEffect( bind, propsSchema, currentElementSettings );

	if ( isHidden ) {
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const setValue = ( newValue: Values, _: CreateOptions = {}, meta?: SetValueMeta ) => {
		const { withHistory = true } = meta ?? {};
		const dependents = extractOrderedDependencies( dependenciesPerTargetMapping );

		const settingsWithDefaults = getElementSettingsWithDefaults( propsSchema, currentElementSettings );
		const settings = getUpdatedValues( newValue, dependents, propsSchema, settingsWithDefaults, elementId );
		if ( withHistory ) {
			undoableUpdateElementProp( settings );
		} else {
			updateElementSettings( { id: elementId, props: settings, withHistory: false } );
		}
	};

	return (
		<PropProvider propType={ propType } value={ value } setValue={ setValue } isDisabled={ isDisabled }>
			<PropKeyProvider bind={ bind }>
				{ isResponsivePropType( propsSchema[ bind ] ) ? (
					<ResponsiveBinding>{ children }</ResponsiveBinding>
				) : (
					children
				) }
			</PropKeyProvider>
		</PropProvider>
	);
};

const ResponsiveBinding = ( { children }: { children: React.ReactNode } ) => {
	const { value, setValue, propType, disabled } = useBoundProp( responsivePropTypeUtil );
	const breakpoint = useActiveBreakpoint() ?? DESKTOP_BREAKPOINT;
	const activeBreakpoints = ( useBreakpoints() ?? [] ).map( ( { id } ) => id );

	const inherited = responsiveFallbackChain( breakpoint )
		.filter( ( key ) => key !== breakpoint && activeBreakpoints.includes( key as BreakpointId ) )
		.map( ( key ) => value?.[ key ] )
		.find( ( entry ) => entry !== null && entry !== undefined );

	return (
		<PropProvider
			propType={ propType }
			value={ value }
			setValue={ setValue }
			placeholder={ { [ breakpoint ]: inherited } }
			isDisabled={ () => disabled }
		>
			<PropKeyProvider bind={ breakpoint }>{ children }</PropKeyProvider>
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

import * as React from 'react';
import { useMemo } from 'react';
import { PropKeyProvider, PropProvider, type SetValueMeta } from '@elementor/editor-controls';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	ELEMENT_SETTINGS_VARIANTS_CHANGE_EVENT,
	type ElementID,
	getElementLabel,
	getElementSettings,
	getElementSettingsVariants,
	getSettingsVariantByMeta,
	updateElementSettings,
	updateElementSettingsVariant,
} from '@elementor/editor-elements';
import { type CreateOptions, type PropKey, type Props } from '@elementor/editor-props';
import { useBreakpoints } from '@elementor/editor-responsive';
import { __privateUseListenTo as useListenTo, undoable, windowEvent } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { useSettingsBreakpoint } from '../contexts/settings-breakpoint-context';
import { getInheritedSettingsValue } from '../hooks/use-settings-field';
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
const DESKTOP_BREAKPOINT = 'desktop';

export const SettingsField = ( { bind, children, propDisplayName }: SettingsFieldProps ) => {
	const {
		element: { id: elementId },
		elementType: { propsSchema, dependenciesPerTargetMapping = {} },
		settings: currentElementSettings,
	} = useElement();

	const breakpoint = useSettingsBreakpoint();
	const activeBreakpoints = ( useBreakpoints() ?? [] ).map( ( item ) => item.id );
	const variants = useListenTo( windowEvent( ELEMENT_SETTINGS_VARIANTS_CHANGE_EVENT ), () =>
		getElementSettingsVariants( elementId )
	);
	const isResponsive = isResponsivePropType( propsSchema[ bind ] );
	const isBreakpointOverride = isResponsive && breakpoint !== DESKTOP_BREAKPOINT;

	const boundValue = isBreakpointOverride
		? getSettingsVariantByMeta( variants, breakpoint )?.props?.[ bind ] ?? null
		: currentElementSettings?.[ bind ] ?? null;

	const inherited = isBreakpointOverride
		? getInheritedSettingsValue( {
				bind,
				breakpoint,
				elementId,
				desktopValue: currentElementSettings?.[ bind ] ?? null,
				activeBreakpoints,
		  } )
		: undefined;

	const value = { [ bind ]: boundValue } as Values;
	const propType = createTopLevelObjectType( { schema: propsSchema } );
	const placeholder = ( isBreakpointOverride ? { [ bind ]: inherited ?? null } : undefined ) as Values | undefined;

	const undoableUpdateElementProp = useUndoableUpdateElementProp( {
		elementId,
		propDisplayName,
	} );
	const undoableUpdateVariant = useUndoableUpdateElementVariant( {
		elementId,
		breakpoint,
		propDisplayName,
	} );

	const { isDisabled, isHidden } = extractDependencyEffect( bind, propsSchema, currentElementSettings );

	if ( isHidden ) {
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const setValue = ( newValue: Values, _: CreateOptions = {}, meta?: SetValueMeta ) => {
		const { withHistory = true } = meta ?? {};

		if ( isBreakpointOverride ) {
			const variantProps = { [ bind ]: newValue[ bind ] ?? null } as Props;

			if ( withHistory ) {
				undoableUpdateVariant( variantProps );
			} else {
				updateElementSettingsVariant( { elementId, breakpoint, props: variantProps } );
			}

			return;
		}

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
		<PropProvider
			propType={ propType }
			value={ value }
			setValue={ setValue }
			placeholder={ placeholder }
			isDisabled={ isDisabled }
		>
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

function useUndoableUpdateElementVariant( {
	elementId,
	breakpoint,
	propDisplayName,
}: {
	elementId: ElementID;
	breakpoint: string;
	propDisplayName: string;
} ) {
	return useMemo( () => {
		return undoable(
			{
				do: ( newProps: Props ) => {
					const prevVariant = getSettingsVariantByMeta( getElementSettingsVariants( elementId ), breakpoint );
					const prevProps = Object.fromEntries(
						Object.keys( newProps ).map( ( key ) => [ key, prevVariant?.props?.[ key ] ?? null ] )
					) as Props;

					updateElementSettingsVariant( { elementId, breakpoint, props: newProps } );
					setDocumentModifiedStatus( true );

					return prevProps;
				},

				undo: ( {}, prevProps ) => {
					updateElementSettingsVariant( { elementId, breakpoint, props: prevProps } );
				},
			},
			{
				title: getElementLabel( elementId ),
				// translators: %s is the name of the property that was edited.
				subtitle: __( '%s edited', 'elementor' ).replace( '%s', propDisplayName ),
				debounce: { wait: HISTORY_DEBOUNCE_WAIT },
			}
		);
	}, [ elementId, breakpoint, propDisplayName ] );
}

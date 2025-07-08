import * as React from 'react';
import { useMemo } from 'react';
import { PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	type ElementID,
	getElementLabel,
	getElementSetting,
	updateElementSettings,
	useElementSettings,
} from '@elementor/editor-elements';
import { type PropKey, type PropType, type PropValue } from '@elementor/editor-props';
import { isExperimentActive, undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { EXPERIMENTAL_FEATURES } from '../sync/experiments-flags';
import { createTopLevelOjectType } from './create-top-level-object-type';
import { getDisableState } from './get-dependency-state';

type Props = {
	bind: PropKey;
	propDisplayName: string;
	children: React.ReactNode;
};

export const SettingsField = ( { bind, children, propDisplayName }: Props ) => {
	const { element, elementType } = useElement();

	const elementSettingValues = useElementSettings< PropValue >( element.id, Object.keys( elementType.propsSchema ) );

	const value = { [ bind ]: elementSettingValues?.[ bind ] };

	const propType = createTopLevelOjectType( { schema: elementType.propsSchema } );

	const undoableUpdateElementProp = useUndoableUpdateElementProp( {
		propKey: bind,
		elementId: element.id,
		propDisplayName,
	} );

	const setValue = ( newValue: Record< string, PropValue > ) => {
		const isVersion331Active = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_31 );

		if ( isVersion331Active ) {
			undoableUpdateElementProp( { newValue } );
		} else {
			updateElementSettings( { id: element.id, props: newValue } );
		}
	};

	const isDisabled = ( prop: PropType ) => getDisableState( prop, elementSettingValues );

	return (
		<PropProvider propType={ propType } value={ value } setValue={ setValue } isDisabled={ isDisabled }>
			<PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
		</PropProvider>
	);
};

type UndoableUpdateElementSettingsArgs = {
	newValue: Record< string, PropValue >;
};

function useUndoableUpdateElementProp( {
	propKey,
	elementId,
	propDisplayName,
}: {
	propKey: PropKey;
	elementId: ElementID;
	propDisplayName: string;
} ) {
	return useMemo( () => {
		return undoable(
			{
				do: ( { newValue }: UndoableUpdateElementSettingsArgs ) => {
					const prevPropValue = getElementSetting( elementId, propKey ) as PropValue;

					updateElementSettings( { id: elementId, props: { ...newValue }, withHistory: false } );
					setDocumentModifiedStatus( true );

					return { [ propKey ]: prevPropValue };
				},

				undo: ( {}, prevProps ) => {
					updateElementSettings( { id: elementId, props: prevProps, withHistory: false } );
				},
			},
			{
				title: getElementLabel( elementId ),
				// translators: %s is the name of the property that was edited.
				subtitle: __( '%s edited', 'elementor' ).replace( '%s', propDisplayName ),
			}
		);
	}, [ propKey, elementId, propDisplayName ] );
}

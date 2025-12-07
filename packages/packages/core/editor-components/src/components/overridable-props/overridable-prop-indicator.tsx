import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { useElement } from '@elementor/editor-editing-panel';
import { getWidgetsCache } from '@elementor/editor-elements';
import { type TransformablePropValue } from '@elementor/editor-props';
import { __getState as getState } from '@elementor/store';
import { bindPopover, bindTrigger, Popover, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { setOverridableProp } from '../../store/actions/set-overridable-prop';
import { selectOverridableProps } from '../../store/store';
import { type OverridableProps } from '../../types';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { Indicator } from './indicator';
import { OverridablePropForm } from './overridable-prop-form';
import { getOverridableProp } from './utils/get-overridable-prop';

const FORBIDDEN_KEYS = [ '_cssid', 'attributes' ];

export function OverridablePropIndicator() {
	const { bind } = useBoundProp();
	const currentDocument = getV1CurrentDocument();

	if ( currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE || ! currentDocument.id ) {
		return null;
	}

	if ( ! isPropAllowed( bind ) ) {
		return null;
	}

	const overridableProps = selectOverridableProps( getState(), currentDocument.id );

	return <Content componentId={ currentDocument.id } overridableProps={ overridableProps } />;
}

type Props = {
	componentId: number;
	overridableProps?: OverridableProps;
};
export function Content( { componentId, overridableProps }: Props ) {
	const {
		element: { id: elementId },
		elementType,
	} = useElement();
	const { value, bind, propType } = useBoundProp();
	const { value: overridableValue, setValue: setOverridableValue } = useBoundProp( componentOverridablePropTypeUtil );

	const popupState = usePopupState( {
		variant: 'popover',
	} );

	const triggerProps = bindTrigger( popupState );
	const popoverProps = bindPopover( popupState );

	const { elType } = getWidgetsCache()?.[ elementType.key ] ?? { elType: 'widget' };

	const handleSubmit = ( { label, group }: { label: string; group: string | null } ) => {
		const originValue = ! overridableValue ? value ?? propType.default : overridableValue?.origin_value ?? {};

		const overridablePropConfig = setOverridableProp( {
			componentId,
			overrideKey: overridableValue?.override_key ?? null,
			elementId,
			label,
			groupId: group,
			propKey: bind,
			elType: elType ?? 'widget',
			widgetType: elementType.key,
			originValue,
		} );

		if ( ! overridableValue && overridablePropConfig ) {
			setOverridableValue( {
				override_key: overridablePropConfig.overrideKey,
				origin_value: originValue as TransformablePropValue< string, unknown >,
			} );
		}

		popupState.close();
	};

	const overridableConfig = overridableValue
		? getOverridableProp( { componentId, overrideKey: overridableValue.override_key } )
		: undefined;

	return (
		<>
			<Tooltip placement="top" title={ __( 'Override Property', 'elementor' ) }>
				<Indicator
					{ ...triggerProps }
					isOpen={ !! popoverProps.open }
					isOverridable={ !! overridableValue }
				/>
			</Tooltip>
			<Popover
				disableScrollLock
				anchorOrigin={ {
					vertical: 'bottom',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				PaperProps={ {
					sx: { my: 2.5 },
				} }
				{ ...popoverProps }
			>
				<OverridablePropForm
					onSubmit={ handleSubmit }
					groups={ overridableProps?.groups.order.map( ( groupId ) => ( {
						value: groupId,
						label: overridableProps.groups.items[ groupId ].label,
					} ) ) }
					currentValue={ overridableConfig }
				/>
			</Popover>
		</>
	);
}

function isPropAllowed( bind: string ) {
	return ! FORBIDDEN_KEYS.includes( bind );
}

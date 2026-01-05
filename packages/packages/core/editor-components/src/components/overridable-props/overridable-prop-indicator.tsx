import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { useElement } from '@elementor/editor-editing-panel';
import { getWidgetsCache } from '@elementor/editor-elements';
import { type TransformablePropValue } from '@elementor/editor-props';
import { bindPopover, bindTrigger, Popover, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { useComponentInstanceElement, useOverridablePropValue } from '../../provider/overridable-prop-context';
import { setOverridableProp } from '../../store/actions/set-overridable-prop';
import { useCurrentComponentId, useOverridableProps } from '../../store/store';
import { type OverridableProps } from '../../types';
import { getFinalWidgetPropValue } from '../../utils/get-final-widget-prop-value';
import { Indicator } from './indicator';
import { OverridablePropForm } from './overridable-prop-form';
import { getOverridableProp } from './utils/get-overridable-prop';

const FORBIDDEN_KEYS = [ '_cssid', 'attributes' ];

export function OverridablePropIndicator() {
	const { bind } = useBoundProp();
	const componentId = useCurrentComponentId();
	const overridableProps = useOverridableProps( componentId );

	if ( ! isPropAllowed( bind ) || ! componentId || ! overridableProps ) {
		return null;
	}

	return <Content componentId={ componentId } overridableProps={ overridableProps } />;
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

	const contextOverridableValue = useOverridablePropValue();
	const componentInstanceElement = useComponentInstanceElement();

	const { value: boundPropOverridableValue, setValue: setOverridableValue } = useBoundProp(
		componentOverridablePropTypeUtil
	);

	/**
	 * This is intended to handle custom layout controls, such as <LinkControl />, which has <ControlLabel /> nested within it
	 * i.e. its bound prop value would be the one manipulated by the new <PropProvider /> thus won't be considered overridable
	 */
	const overridableValue = boundPropOverridableValue ?? contextOverridableValue;

	const popupState = usePopupState( {
		variant: 'popover',
	} );

	const triggerProps = bindTrigger( popupState );
	const popoverProps = bindPopover( popupState );

	const { elType } = getWidgetsCache()?.[ elementType.key ] ?? { elType: 'widget' };

	const handleSubmit = ( { label, group }: { label: string; group: string | null } ) => {
		const propTypeDefault = propType.default ?? {};

		const originValue = getFinalWidgetPropValue( overridableValue?.origin_value ) ?? value ?? propTypeDefault;

		const matchingOverridableProp = overridableValue
			? overridableProps?.props?.[ overridableValue.override_key ]
			: undefined;

		const overridablePropConfig = setOverridableProp( {
			componentId,
			overrideKey: overridableValue?.override_key ?? null,
			elementId: componentInstanceElement?.element.id ?? elementId,
			label,
			groupId: group,
			propKey: bind,
			elType: elType ?? 'widget',
			widgetType: componentInstanceElement?.elementType.key ?? elementType.key,
			originValue,
			originPropFields: matchingOverridableProp?.originPropFields,
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
				<Indicator { ...triggerProps } isOpen={ !! popoverProps.open } isOverridable={ !! overridableValue } />
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

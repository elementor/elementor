import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { useElement } from '@elementor/editor-editing-panel';
import { getWidgetsCache } from '@elementor/editor-elements';
import { type TransformablePropValue } from '@elementor/editor-props';
import { __getState as getState } from '@elementor/store';
import { bindPopover, bindTrigger, Popover, Tooltip, usePopupState } from '@elementor/ui';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { setOverridableProp } from '../../store/set-overridable-prop';
import { selectOverridableProps } from '../../store/store';
import { type OverridableProps } from '../../types';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { Form } from './form';
import { Indicator } from './indicator';

const FORBIDDEN_KEYS = [ '_cssid', 'attributes' ];

export function OverridablePropIndicator() {
	const { bind, value } = useBoundProp();
	const currentDocument = getV1CurrentDocument();

	if ( currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE || ! currentDocument.id ) {
		return null;
	}

	if ( ! isPropAllowed( bind ) ) {
		return null;
	}

	const overridableProps = selectOverridableProps( getState(), currentDocument.id );
	const isOverridable = componentOverridablePropTypeUtil.isValid( value );

	return (
		<Content
			componentId={ currentDocument.id }
			isOverridable={ isOverridable }
			overridableProps={ overridableProps }
		/>
	);
}

type Props = {
	componentId: number;
	isOverridable: boolean;
	overridableProps?: OverridableProps;
};
export function Content( { componentId, isOverridable, overridableProps }: Props ) {
	const {
		element: { id: elementId },
		elementType,
	} = useElement();
	const { value, setValue, bind } = useBoundProp();

	const { elType } = getWidgetsCache()?.[ elementType.key ] ?? { elType: 'widget' };

	const popupState = usePopupState( {
		variant: 'popover',
	} );

	const triggerProps = bindTrigger( popupState );
	const popoverProps = bindPopover( popupState );

	const handleSubmit = ( { label, group }: { label: string; group: string | null } ) => {
		const { extract, create } = componentOverridablePropTypeUtil;
		const originValue = ( ! isOverridable ? value : extract( value )?.origin_value );

		if( ! isOverridable ) {
			setValue(
				create( {
					override_key: generateUniqueId(),
					origin_value: originValue as TransformablePropValue< string, unknown >,
				} )
			);
		}

		setOverridableProp( {
			componentId,
			elementId,
			label,
			groupId: group,
			propKey: bind,
			elType,
			widgetType: elementType.key,
			originValue,
		} );

		popupState.close();
	};

	const overridableConfig = Object.values( overridableProps?.props ?? {} ).find(
		( prop ) => prop.elementId === elementId && prop.propKey === bind
	);

	return (
		<>
			<Tooltip placement="top" title={ __( 'Override Property', 'elementor' ) }>
				<Indicator
					triggerProps={ triggerProps }
					isOpen={ !! popoverProps.open }
					isOverridable={ isOverridable }
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
				<Form
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

import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { useElement } from '@elementor/editor-editing-panel';
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
	const componentOverrides = selectOverridableProps( getState(), currentDocument.id );

	if ( currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE || ! currentDocument.id ) {
		return null;
	}

	if ( ! isPropAllowed( bind ) ) {
		return null;
	}

	const isOverridable = componentOverridablePropTypeUtil.isValid( value );

	return (
		<Content
			componentId={ currentDocument.id }
			isOverridable={ isOverridable }
			overridables={ componentOverrides }
		/>
	);
}

type Props = {
	componentId: number;
	isOverridable: boolean;
	overridables?: OverridableProps;
};
export function Content( { componentId, isOverridable, overridables }: Props ) {
	const {
		element: { id: elementId },
		elementType,
	} = useElement();
	const { value, setValue, bind } = useBoundProp();

	const popupState = usePopupState( {
		variant: 'popover',
	} );

	const triggerProps = bindTrigger( popupState );
	const popoverProps = bindPopover( popupState );

	const handleSubmit = ( { label, group }: { label: string; group: string | null } ) => {
		setValue(
			componentOverridablePropTypeUtil.create( {
				override_key: generateUniqueId(),
				default_value: value,
			} )
		);

		setOverridableProp( componentId, elementId, label, group, bind, elementType.key, value );

		popupState.close();
	};

	const currentValue = Object.values( overridables?.props ?? {} ).find(
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
					groups={ overridables?.groups.order.map( ( groupId ) => ( {
						value: groupId,
						label: overridables.groups.items[ groupId ].label,
					} ) ) }
					currentValue={ currentValue }
				/>
			</Popover>
		</>
	);
}

function isPropAllowed( bind: string ) {
	return ! FORBIDDEN_KEYS.includes( bind );
}

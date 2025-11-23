import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { useElement } from '@elementor/editor-editing-panel';
import { CheckIcon, PlusIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, Popover, styled, Tooltip, usePopupState } from '@elementor/ui';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { setOverridableProp } from '../../store/set-overridable-prop';
import { type OverridableProps } from '../../types';
import { OverridablePropForm } from './overridable-prop-form';

const SIZE = 'tiny';

const IconWrapper = styled( Box )`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	width: 16px;
	height: 16px;
	margin-inline: ${ ( { theme } ) => theme.spacing( 0.5 ) };

	&:before {
		content: '';
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% ) rotate( 45deg );
		width: 5px;
		height: 5px;
		border-radius: 1px;
		background-color: ${ ( { theme } ) => theme.palette.primary.main };
		transition: all 0.1s ease-in-out;
	}

	&:hover,
	&.enlarged {
		&:before {
			width: 12px;
			height: 12px;
			border-radius: 2px;
		}

		.icon {
			opacity: 1;
		}
	}
`;

const IconContainer = styled( Box )`
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.2s ease-in-out;

	& > svg {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate( -50%, -50% );
		width: 8px;
		height: 8px;
		fill: ${ ( { theme } ) => theme.palette.primary.contrastText };
	}
`;

type Props = {
	componentId: number;
	isOverridable: boolean;
	overridables?: OverridableProps;
};
export function Indicator( { componentId, isOverridable, overridables }: Props ) {
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
				<IconWrapper { ...triggerProps } className={ popoverProps.open || isOverridable ? 'enlarged' : '' }>
					<IconContainer className="icon">
						{ isOverridable ? <CheckIcon fontSize={ SIZE } /> : <PlusIcon fontSize={ SIZE } /> }
					</IconContainer>
				</IconWrapper>
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

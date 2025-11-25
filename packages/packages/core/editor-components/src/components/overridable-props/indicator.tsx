import * as React from 'react';
import { CheckIcon, PlusIcon } from '@elementor/icons';
import { type bindTrigger, Box, styled } from '@elementor/ui';

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
		width: 10px;
		height: 10px;
		fill: ${ ( { theme } ) => theme.palette.primary.contrastText };
	}
`;

type Props = {
	isOverridable: boolean;
	triggerProps: ReturnType< typeof bindTrigger >;
	isOpen: boolean;
};
export const Indicator = ( { triggerProps, isOpen, isOverridable }: Props ) => (
	<IconWrapper { ...triggerProps } className={ isOpen || isOverridable ? 'enlarged' : '' }>
		<IconContainer className="icon">
			{ isOverridable ? <CheckIcon fontSize={ SIZE } /> : <PlusIcon fontSize={ SIZE } /> }
		</IconContainer>
	</IconWrapper>
);

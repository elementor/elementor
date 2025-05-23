import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { ToggleButton, ToggleButtonProps, SvgIconProps, SvgIcon, styled } from '@elementor/ui';

interface StyledElementorLogoProps extends SvgIconProps {
	showMenuIcon?: boolean;
}

type ToolbarLogoProps = Omit<ToggleButtonProps, 'value'>;

const ElementorLogo = ( props: SvgIconProps ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props }>
			<g>
				<circle cx="16" cy="16" r="16" />
				<path d="M11.7 9H9V22.3H11.7V9Z" />
				<path d="M22.4 9H9V11.7H22.4V9Z" />
				<path d="M22.4 14.4004H9V17.1004H22.4V14.4004Z" />
				<path d="M22.4 19.6992H9V22.3992H22.4V19.6992Z" />
			</g>
		</SvgIcon>
	);
};

const StyledToggleButton = styled( ToggleButton )( () => ( {
	padding: 0,
	'&.MuiToggleButton-root:hover': {
		backgroundColor: 'initial',
	},
	'&.MuiToggleButton-root.Mui-selected': {
		backgroundColor: 'initial',
	},
} ) );

const StyledElementorLogo = styled( ElementorLogo, {
	shouldForwardProp: ( prop ) => prop !== 'showMenuIcon',
} )<StyledElementorLogoProps>( ( { theme, showMenuIcon } ) => ( {
	width: 'auto',
	height: '100%',
	'& path': {
		fill: 'initial',
		transition: 'all 0.2s linear',
		transformOrigin: 'bottom left',
		'&:first-of-type': {
			transitionDelay: ! showMenuIcon && '0.2s',
			transform: showMenuIcon && 'translateY(-9px) scaleY(0)',
		},
		'&:not(:first-of-type)': {
			// Emotion automatically change 4 to -4 in RTL moode.
			transform: ! showMenuIcon && `translateX(${ theme.direction === 'rtl' ? '4' : '9' }px) scaleX(0.6)`,
		},
		'&:nth-of-type(2)': {
			transitionDelay: showMenuIcon ? '0' : '0.2s',
		},
		'&:nth-of-type(3)': {
			transitionDelay: '0.1s',
		},
		'&:nth-of-type(4)': {
			transitionDelay: showMenuIcon ? '0.2s' : '0',
		},
	},
} ) );

export default function ToolbarLogo( props: ToolbarLogoProps ) {
	const [ isHoverState, setIsHoverState ] = useState( false );
	const showMenuIcon = props.selected || isHoverState;

	return (
		<StyledToggleButton
			{ ...props }
			value="selected"
			size="small"
			onMouseEnter={ () => setIsHoverState( true ) }
			onMouseLeave={ () => setIsHoverState( false ) }
		>
			<StyledElementorLogo titleAccess={ __( 'Elementor Logo', 'elementor' ) } showMenuIcon={ showMenuIcon } />
		</StyledToggleButton>
	);
}

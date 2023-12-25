import React from 'react';
import styled from 'styled-components';
import { useActiveContext } from '../contexts/active-context';
import DivBase from './global/div-base';
import InnerWrapper from './global/inner-wrapper';

const Button = styled.button.attrs( ( props ) => ( {
	'data-e-active': props.isActive ? true : null,
} ) )`
	font-size: 16px;
	height: 100%;
	font-weight: 500;
	font-style: normal;
	text-decoration: none;
	line-height: 1.5em;
	letter-spacing: 0;
	color: var(--e-a-color-txt);
	border: none;
	background: none;
	text-transform: capitalize;
	font-family: Roboto, sans-serif;
	padding: 0;

	&:hover, &[data-e-active='true'], &:focus {
		outline: none;
		background: none;
		color: var(--e-a-color-txt-accent);
	}
`;

const AreaButton = ( props ) => {
	const { activeArea, activateArea } = useActiveContext();

	const { area, children } = props;

	const onClick = () => {
		activateArea( area );
	};

	// TODO: Add hover/active states

	return (
		<Button variant="transparent"
			size="s"
			onClick={ onClick }
			isActive={ area === activeArea }
		>
			{ children }
		</Button>
	);
};

const Wrapper = styled( DivBase )`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 48px;
	display: flex;
	background: var(--e-a-bg-default);
	border-bottom: 1px solid var(--e-a-border-color-bold);
	z-index: 1;
`;

const ButtonsWrapper = styled( DivBase )`
	display: flex;
	justify-content: flex-end;
	flex-grow: 1;
	gap: 20px;
`;

const Title = styled.h2`
	color: var(--e-a-color-txt-accent);
	font-family: Roboto, sans-serif;
	font-size: 16px;
	font-weight: 600;
	text-transform: capitalize;
	font-style: normal;
	text-decoration: none;
	line-height: 1.2em;
	letter-spacing: 0;
	word-spacing: 0;
	margin: 0;
`;

export default function Header() {
	return (
		<Wrapper>
			<InnerWrapper>
				<Title>{ __( 'Style Guide Preview', 'elementor' ) }</Title>
				<ButtonsWrapper>
					<AreaButton area={ 'colors' }>{ __( 'Colors', 'elementor' ) }</AreaButton>
					<AreaButton area={ 'fonts' }>{ __( 'Fonts', 'elementor' ) }</AreaButton>
				</ButtonsWrapper>
			</InnerWrapper>
		</Wrapper>
	);
}

AreaButton.propTypes = {
	area: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

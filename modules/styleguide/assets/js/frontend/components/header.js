import React, { useContext } from 'react';
import styled from 'styled-components';
import InnerWrapper from './global/inner-wrapper';
import { ActiveContext } from '../contexts/active-context';

const Button = styled.button`
	font-size: 16px;
	height: 100%;
	font-weight: 500;
	font-style: normal;
	text-decoration: none;
	line-height: 1.5em;
	letter-spacing: 0;
	color: #515962;
	border: none;
	background: none;
	text-transform: capitalize;
	font-family: Roboto, sans-serif;
	padding: 0;

	&:hover {
		background: none;
		color: #51585e;
	}

	&:focus {
		outline: none;
		background: none;
		color: #51585e;
	}
`;

const AreaButton = ( props ) => {
	const { activateArea } = useContext( ActiveContext );

	const { area, children } = props;
	const onClick = () => {
		activateArea( area );
	};

	// TODO: Add active state

	return (
		<Button variant="transparent"
			size="s"
			onClick={ onClick }
		>
			{ children }
		</Button>
	);
};

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	border-style: solid;
	border-width: 0 0 1px 0;
	border-color: #C2CBD2;
	transition: background 0.3s, border 0.3s, border-radius 0.3s, box-shadow 0.3s;
	padding: 0 5% 15px 5%;
	width: 100%;
	height: 50px;
	background: #fff;
	z-index: 1;
	position: fixed;
	top: 0;
`;

const ButtonsWrapper = styled.div`
	display: flex;
	justify-content: flex-end;
	flex-grow: 1;
	gap: 8px;
`;

const Title = styled.h2`
	color: #0C0D0E;
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
				<Title>Style Guide Preview</Title>
				<ButtonsWrapper>
					<AreaButton area={ 'colors' }>Colors</AreaButton>
					<AreaButton area={ 'fonts' }>Fonts</AreaButton>
				</ButtonsWrapper>
			</InnerWrapper>
		</Wrapper>
	);
}

AreaButton.propTypes = {
	area: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

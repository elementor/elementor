import React, { useState } from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import App from '../editor/app';

const AIMedia = ( { onClose } ) => {
	return (
		<>
			<App
				type={ 'media' }
				getControlValue={ () => {} }
				setControlValue={ () => {} }
				onClose={ onClose }
			/>
		</>
	);
};

AIMedia.propTypes = {
	onClose: PropTypes.func.isRequired,
};

const Icon = styled.i`
	padding-right: 0.5em;
	cursor: pointer;
`;

const StyledButton = styled.a`
	color: #C00BB9;
	cursor: pointer;
	font: inherit;
	display: inline-block;
	position: relative;
	box-sizing: border-box;
	top: -3px;
	margin-left: 4px;
	border: 1px solid #C00BB9;
	border-radius: 3px;
	line-height: 2.15384615;
	padding: 0 10px;
	background: #f6f7f7;

	&:hover {
		color: #C00BB9;
		background: #eeefef;
	}
`;

const GenerateImageWithAI = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleClick = () => {
		setIsOpen( true );
	};

	const handleClose = () => {
		wp.media.frame.content.get().collection._requery( true ); // Refresh the media library.
		setIsOpen( false );
	};

	return (
		<div style={ { padding: '0.5em' } }>
			<RequestIdsProvider>
				<StyledButton onClick={ handleClick }>
					<Icon className={ 'eicon-ai' } />
					{ __( 'Generate with Elementor AI', 'elementor' ) }
				</StyledButton>
				{ isOpen && <AIMedia onClose={ handleClose } /> }
			</RequestIdsProvider>
		</div>
	);
};

export default GenerateImageWithAI;

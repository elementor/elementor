import React from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useState } from '@wordpress/element';
import App from '../editor/app';

const AIMedia = ( { onClose } ) => {
	return (
		<>
			<App
				type={ 'media' }
				getControlValue={ () => {} }
				setControlValue={ () => {} }
				onClose={ onClose }
				isRTL={ elementorCommon.config.isRTL }
				isInternalCall={ false }
			/>
		</>
	);
};

AIMedia.propTypes = {
	onClose: PropTypes.func.isRequired,
};

const Icon = styled.i`
  color: #C00BB9;
  padding-right: 0.5em;
  cursor: pointer;
`;

const ImageLink = styled.a`
  color: #C00BB9;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  //display: inline-block;
  &:hover {
    color: #C00BB9;
  }
`;

const GenerateImageWithAI = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleClick = () => {
		setIsOpen( true );
	};

	const handleClose = () => {
		location.reload();
		setIsOpen( false );
	};

	return (
		<div style={ { paddingTop: '0.5em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<ImageLink onClick={ handleClick }>{ __( 'Generate with Elementor AI', 'elementor' ) }</ImageLink>
				{ isOpen && <AIMedia onClose={ handleClose } /> }
			</RequestIdsProvider>
		</div> );
};

export default GenerateImageWithAI;

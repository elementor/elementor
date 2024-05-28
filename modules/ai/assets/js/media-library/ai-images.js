import React from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

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
  &:hover {
    color: #C00BB9;
  }
`;

const GenerateImageWithAI = ( { pt = '0.5em', pb = '0.5em' } ) => {
	const handleButtonClick = ( event ) => {
		event.preventDefault();
		console.log( 'click' );
	};

	return (
		// <div style={ { paddingTop: pt, paddingBottom: pb } }>
		< >
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<ImageLink style={ { paddingTop: pt, paddingBottom: pb } } onClick={ handleButtonClick }>{ __( 'Edit with Elementor AI', 'elementor' ) }</ImageLink>
			</RequestIdsProvider>
		</> );
};

export default GenerateImageWithAI;

GenerateImageWithAI.propTypes = {
	pb: PropTypes.string,
	pt: PropTypes.string,
};

import React from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';

const Icon = styled.i`
  padding-right: 0.5em;
  cursor: pointer;
  color: #C00BB9;
`;

const ImageLink = styled.a`
  color: #C00BB9;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  &:hover {
    text-decoration: underline;
    color: #C00BB9;
  }
`;

const GenerateImageWithAI = () => {
	const handleButtonClick = ( event ) => {
		event.preventDefault();
		console.log( 'click' );
	};

	return (
		<div style={ { padding: '0.5em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<ImageLink onClick={ handleButtonClick }>{ __( 'Edit with Elementor AI', 'elementor' ) }</ImageLink>
			</RequestIdsProvider>
		</div> );
};

export default GenerateImageWithAI;


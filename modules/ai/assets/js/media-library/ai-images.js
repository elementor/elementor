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
  //display: inline-block;
  &:hover {
    color: #C00BB9;
  }
`;

const GenerateImageWithAI = () => {
	const handleClick = () => {
		console.log( 'click' );
	};

	return (
		<div style={ { paddingTop: '0.5em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<ImageLink onClick={ handleClick }>{ __( 'Edit with Elementor AI', 'elementor' ) }</ImageLink>
			</RequestIdsProvider>
		</div> );
};

export default GenerateImageWithAI;

GenerateImageWithAI.propTypes = {
	pb: PropTypes.string,
	pt: PropTypes.string,
};

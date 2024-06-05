import React, { useState } from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import { AIMedia, getImageId } from './utils';

const Icon = styled.i`
	color: #C00BB9;
	padding-right: 0.5em;
	cursor: pointer;
`;

const StyledButton = styled.a`
	font: inherit;
	display: inline-block;
	text-decoration: none;
	font-size: 13px;
	line-height: 2.15384615;
	padding: 0 10px;
	cursor: pointer;
	border-width: 1px;
	border-style: solid;
	border-radius: 3px;
	white-space: nowrap;
	box-sizing: border-box;
	background: #f6f7f7;
	color: #C00BB9;

	&:hover {
		color: #C00BB9;
		background: #eeefef;
	}
`;

const EditImageWithAIButton = () => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ imageId, setImageId ] = useState( getImageId );

	const handleClick = () => {
		setImageId( getImageId() );
		setIsOpen( true );
	};

	const handleClose = () => {
		wp.media.frame?.content?.get().collection?._requery( true ); // Refresh the media library
		setIsOpen( false );
	};

	return (
		<div style={ { marginLeft: '0.5em' } }>
			<RequestIdsProvider>
				<StyledButton onClick={ handleClick }>
					<Icon className={ 'eicon-ai' } />
					{ __( 'Edit with Elementor AI', 'elementor' ) }
				</StyledButton>
				{ isOpen && <AIMedia onClose={ handleClose } imageId={ imageId } /> }
			</RequestIdsProvider>
		</div> );
};

export default EditImageWithAIButton;

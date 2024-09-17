import React, { useState } from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import { getImageId } from './utils';
import { AIMediaEditApp } from './components';

const ImageLink = styled.a`
	&& {
		color: var(--e-a-color-primary-bold);
		cursor: pointer;
		font-size: inherit;
		display: inline-block;

		&:hover {
			color: var(--e-a-color-primary-bold);
		}
	}
`;

const AIMediaEditAppLinkWrapper = () => {
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
		<div style={ { paddingTop: '0.2em' } }>
			<RequestIdsProvider>
				<ImageLink onClick={ handleClick }>{ __( 'Edit with Elementor AI', 'elementor' ) }</ImageLink>
				{ isOpen && <AIMediaEditApp onClose={ handleClose } imageId={ imageId } /> }
			</RequestIdsProvider>
		</div> );
};

export default AIMediaEditAppLinkWrapper;

import React, { useState } from 'react';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import App from '../editor/app';
import { LOCATIONS } from '../editor/pages/form-media/constants';

const AIMedia = ( { onClose, imageId } ) => {
	const image = wp.media.attachment( imageId );

	return (
		<>
			<App
				type={ 'media' }
				getControlValue={ () => image.attributes }
				setControlValue={ () => {} }
				onClose={ onClose }
				isRTL={ elementorCommon.config.isRTL }
			/>
		</>
	);
};

AIMedia.propTypes = {
	onClose: PropTypes.func.isRequired,
	imageId: PropTypes.string,
};

const Icon = styled.i`
	color: #C00BB9;
	padding-right: 0.5em;
	cursor: pointer;
`;

const ImageLink = styled.a`
	&& {
		color: #C00BB9;
		cursor: pointer;
		font-size: inherit;
		display: inline-block;

		&:hover {
			color: #C00BB9;
		}
	}
`;
const EditImageWithAI = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const getImageId = () => {
		const url = new URL( window.location.href );
		return url.searchParams.get( 'item' );
	};

	const [ imageId, setImageId ] = useState( getImageId );

	const handleClick = () => {
		setImageId( getImageId() );
		setIsOpen( true );
	};

	const handleClose = () => {
		location.reload(); // Update media library with the new image
		setIsOpen( false );
	};

	return (
		<div style={ { paddingTop: '0.8em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<ImageLink onClick={ handleClick }>{ __( 'Edit with Elementor AI', 'elementor' ) }</ImageLink>
				{ isOpen && <AIMedia onClose={ handleClose } imageId={ imageId } /> }
			</RequestIdsProvider>
		</div> );
};

export default EditImageWithAI;

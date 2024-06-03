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
				additionalOptions={ {
					location: LOCATIONS.IMAGE_TOOLS,
				} }
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
		const imageId = wp.media?.frames?.edit?.model?.id?.toString();
		if ( imageId ) {
			return imageId;
		}

		// In case the image is not in the current frame, we need to find it from the media library
		return getImageIdByUrl();
	};
	const getImageIdByUrl = () => {
		const imageUrl = document.getElementById( 'attachment-details-copy-link' ).value;
		const images = wp.media.frame?.content?.get()?.collection?.models;
		const image = images.find( ( img ) => img.attributes.url === imageUrl );
		return image ? image.attributes.id.toString() : null;
	};

	const [ imageId, setImageId ] = useState( getImageId );

	const handleClick = () => {
		setImageId( getImageId() );
		setIsOpen( true );
	};

	const handleClose = () => {
		wp.media.frame.content.get().collection?._requery( true ); // Refresh the media library
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

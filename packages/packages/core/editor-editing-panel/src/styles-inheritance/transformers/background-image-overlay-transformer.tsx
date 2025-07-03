import * as React from 'react';
import { createTransformer } from '@elementor/editor-canvas';
import { EllipsisWithTooltip } from '@elementor/editor-ui';
import { CardMedia, Stack, type Theme } from '@elementor/ui';
import { useWpMediaAttachment } from '@elementor/wp-media';

type ImageSrcAttachment = { id: number; url: null };

type ImageSrcUrl = { url: string; id: null };

type Image = {
	image: {
		src: ImageSrcAttachment | ImageSrcUrl;
		size: 'thumbnail' | 'medium' | 'large' | 'full';
	};
};

export const backgroundImageOverlayTransformer = createTransformer( ( value: Image ) => (
	<Stack direction="row" gap={ 10 }>
		<ItemIconImage value={ value } />
		<ItemLabelImage value={ value } />
	</Stack>
) );

const ItemIconImage = ( { value }: { value: Image } ) => {
	const { imageUrl } = useImage( value );

	return (
		<CardMedia
			image={ imageUrl }
			sx={ ( theme: Theme ) => ( {
				height: '1em',
				width: '1em',
				borderRadius: `${ theme.shape.borderRadius / 2 }px`,
				outline: `1px solid ${ theme.palette.action.disabled }`,
			} ) }
		/>
	);
};

const ItemLabelImage = ( { value }: { value: Image } ) => {
	const { imageTitle } = useImage( value );

	return (
		<EllipsisWithTooltip title={ imageTitle }>
			<span>{ imageTitle }</span>
		</EllipsisWithTooltip>
	);
};

const useImage = ( image: Image ) => {
	let imageTitle,
		imageUrl: string | null = null;

	const imageSrc = image?.image.src;
	const { data: attachment } = useWpMediaAttachment( imageSrc.id || null );

	if ( imageSrc.id ) {
		const imageFileTypeExtension = getFileExtensionFromFilename( attachment?.filename );
		imageTitle = `${ attachment?.title }${ imageFileTypeExtension }` || null;
		imageUrl = attachment?.url || null;
	} else if ( imageSrc.url ) {
		imageUrl = imageSrc.url;
		imageTitle = imageUrl?.substring( imageUrl.lastIndexOf( '/' ) + 1 ) || null;
	}

	return { imageTitle, imageUrl };
};

const getFileExtensionFromFilename = ( filename?: string ) => {
	if ( ! filename ) {
		return '';
	}

	// get the substring after the last . in the filename
	const extension = filename.substring( filename.lastIndexOf( '.' ) + 1 );

	return `.${ extension }`;
};

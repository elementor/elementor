import * as React from 'react';
import { imageSrcPropTypeUtil, stringPropTypeUtil, urlPropTypeUtil } from '@elementor/editor-props';
import { Card, CardMedia, CardOverlay, CircularProgress, Stack } from '@elementor/ui';
import { type MediaType, useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { MediaSelectActions } from './media-select-actions';

type ImageMediaControlProps = {
	mediaTypes?: MediaType[];
};

export const ImageMediaControl = createControl( ( { mediaTypes = [ 'image' ] }: ImageMediaControlProps ) => {
	const { value, setValue, propType, placeholder } = useBoundProp( imageSrcPropTypeUtil );
	const { id, url } = value ?? {};

	const { data: attachment, isFetching } = useWpMediaAttachment( id?.value || null );
	const { data: placeholderAttachment } = useWpMediaAttachment( placeholder?.id?.value || null );
	const src = attachment?.url ?? url?.value ?? placeholderAttachment?.url ?? null;

	const defaultUrl = imageSrcPropTypeUtil.extract( propType.default ?? null )?.url?.value;
	const currentUrlForModal = url?.value && url.value !== defaultUrl ? url.value : undefined;
	const currentAltForModal = ( value as { alt?: { value?: string } | null } | null | undefined )?.alt?.value;

	const { open } = useWpMediaFrame( {
		mediaTypes,
		multiple: false,
		selected: id?.value || null,
		allowUrlImport: true,
		onSelect: ( selectedAttachment ) => {
			setValue( {
				id: {
					$$type: 'image-attachment-id',
					value: selectedAttachment.id,
				},
				url: null,
			} );
		},
		onSelectUrl: ( selectedUrl, alt ) => {
			setValue( {
				id: null,
				url: urlPropTypeUtil.create( selectedUrl ),
				alt: alt ? stringPropTypeUtil.create( alt ) : null,
			} );
		},
	} );

	return (
		<ControlActions>
			<Card variant="outlined">
				<CardMedia image={ src } sx={ { height: propType.meta.isDynamic ? 134 : 150 } }>
					{ isFetching ? (
						<Stack justifyContent="center" alignItems="center" width="100%" height="100%">
							<CircularProgress />
						</Stack>
					) : (
						<></>
					) }
				</CardMedia>
				<CardOverlay>
					<MediaSelectActions
						onSelect={ () => open( { mode: 'browse' } ) }
						onUpload={ () => open( { mode: 'upload' } ) }
						onInsertUrl={ () =>
							open( { mode: 'url', currentUrl: currentUrlForModal, currentAlt: currentAltForModal } )
						}
					/>
				</CardOverlay>
			</Card>
		</ControlActions>
	);
} );

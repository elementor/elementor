import * as React from 'react';
import {
	backgroundColorOverlayPropTypeUtil,
	backgroundImageOverlayPropTypeUtil,
	type BackgroundOverlayItemPropValue,
	backgroundOverlayPropTypeUtil,
	colorPropTypeUtil,
	type PropKey,
} from '@elementor/editor-props';
import { Box, CardMedia, styled, Tab, TabPanel, Tabs, type Theme, UnstableColorIndicator } from '@elementor/ui';
import { useWpMediaAttachment } from '@elementor/wp-media';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { PopoverContent } from '../../../components/popover-content';
import { Repeater } from '../../../components/repeater';
import { createControl } from '../../../create-control';
import { env } from '../../../env';
import { ColorControl } from '../../color-control';
import { ImageControl } from '../../image-control';
import {
	BackgroundGradientColorControl,
	type ColorStop,
	initialBackgroundGradientOverlay,
} from '../background-gradient-color-control';
import { BackgroundImageOverlayAttachment } from './background-image-overlay/background-image-overlay-attachment';
import { BackgroundImageOverlayPosition } from './background-image-overlay/background-image-overlay-position';
import { BackgroundImageOverlayRepeat } from './background-image-overlay/background-image-overlay-repeat';
import { BackgroundImageOverlaySize } from './background-image-overlay/background-image-overlay-size';
import { type BackgroundImageOverlay } from './types';
import { useBackgroundTabsHistory } from './use-background-tabs-history';

const DEFAULT_BACKGROUND_COLOR_OVERLAY_COLOR = '#00000033';

export const initialBackgroundColorOverlay: BackgroundOverlayItemPropValue = backgroundColorOverlayPropTypeUtil.create(
	{
		color: colorPropTypeUtil.create( DEFAULT_BACKGROUND_COLOR_OVERLAY_COLOR ),
	}
);

export const getInitialBackgroundOverlay = (): BackgroundOverlayItemPropValue => ( {
	$$type: 'background-image-overlay',
	value: {
		image: {
			$$type: 'image',
			value: {
				src: {
					$$type: 'image-src',
					value: {
						url: {
							$$type: 'url',
							value: env.background_placeholder_image,
						},
						id: null,
					},
				},
				size: {
					$$type: 'string',
					value: 'large',
				},
			},
		},
	},
} );

const backgroundResolutionOptions = [
	{ label: __( 'Thumbnail - 150 x 150', 'elementor' ), value: 'thumbnail' },
	{ label: __( 'Medium - 300 x 300', 'elementor' ), value: 'medium' },
	{ label: __( 'Large 1024 x 1024', 'elementor' ), value: 'large' },
	{ label: __( 'Full', 'elementor' ), value: 'full' },
];

export const BackgroundOverlayRepeaterControl = createControl( () => {
	const { propType, value: overlayValues, setValue, disabled } = useBoundProp( backgroundOverlayPropTypeUtil );

	return (
		<PropProvider propType={ propType } value={ overlayValues } setValue={ setValue } isDisabled={ () => disabled }>
			<Repeater
				openOnAdd
				disabled={ disabled }
				values={ overlayValues ?? [] }
				setValues={ setValue }
				label={ __( 'Overlay', 'elementor' ) }
				itemSettings={ {
					Icon: ItemIcon,
					Label: ItemLabel,
					Content: ItemContent,
					initialValues: getInitialBackgroundOverlay(),
				} }
			/>
		</PropProvider>
	);
} );

export const ItemContent = ( { anchorEl = null, bind }: { anchorEl?: HTMLElement | null; bind: PropKey } ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<Content anchorEl={ anchorEl } />
		</PropKeyProvider>
	);
};

const Content = ( { anchorEl }: { anchorEl: HTMLElement | null } ) => {
	const { getTabsProps, getTabProps, getTabPanelProps } = useBackgroundTabsHistory( {
		image: getInitialBackgroundOverlay().value,
		color: initialBackgroundColorOverlay.value,
		gradient: initialBackgroundGradientOverlay.value,
	} );

	return (
		<Box sx={ { width: '100%' } }>
			<Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
				<Tabs
					size="small"
					variant="fullWidth"
					{ ...getTabsProps() }
					aria-label={ __( 'Background Overlay', 'elementor' ) }
				>
					<Tab label={ __( 'Image', 'elementor' ) } { ...getTabProps( 'image' ) } />
					<Tab label={ __( 'Gradient', 'elementor' ) } { ...getTabProps( 'gradient' ) } />
					<Tab label={ __( 'Color', 'elementor' ) } { ...getTabProps( 'color' ) } />
				</Tabs>
			</Box>
			<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( 'image' ) }>
				<PopoverContent>
					<ImageOverlayContent />
				</PopoverContent>
			</TabPanel>
			<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( 'gradient' ) }>
				<BackgroundGradientColorControl />
			</TabPanel>
			<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( 'color' ) }>
				<PopoverContent>
					<ColorOverlayContent anchorEl={ anchorEl } />
				</PopoverContent>
			</TabPanel>
		</Box>
	);
};

const ItemIcon = ( { value }: { value: BackgroundOverlayItemPropValue } ) => {
	switch ( value.$$type ) {
		case 'background-image-overlay':
			return <ItemIconImage value={ value as BackgroundImageOverlay } />;
		case 'background-color-overlay':
			return <ItemIconColor value={ value } />;
		case 'background-gradient-overlay':
			return <ItemIconGradient value={ value } />;
		default:
			return null;
	}
};

const extractColorFrom = ( prop: BackgroundOverlayItemPropValue ) => {
	if ( prop?.value?.color?.value ) {
		return prop.value.color.value;
	}

	return '';
};

const ItemIconColor = ( { value: prop }: { value: BackgroundOverlayItemPropValue } ) => {
	const color = extractColorFrom( prop );
	return <StyledUnstableColorIndicator size="inherit" component="span" value={ color } />;
};

const ItemIconImage = ( { value }: { value: BackgroundImageOverlay } ) => {
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

const ItemIconGradient = ( { value }: { value: BackgroundOverlayItemPropValue } ) => {
	const gradient = getGradientValue( value );

	return <StyledUnstableColorIndicator size="inherit" component="span" value={ gradient } />;
};

const ItemLabel = ( { value }: { value: BackgroundOverlayItemPropValue } ) => {
	switch ( value.$$type ) {
		case 'background-image-overlay':
			return <ItemLabelImage value={ value as BackgroundImageOverlay } />;
		case 'background-color-overlay':
			return <ItemLabelColor value={ value } />;
		case 'background-gradient-overlay':
			return <ItemLabelGradient value={ value } />;
		default:
			return null;
	}
};

const ItemLabelColor = ( { value: prop }: { value: BackgroundOverlayItemPropValue } ) => {
	const color = extractColorFrom( prop );
	return <span>{ color }</span>;
};

const ItemLabelImage = ( { value }: { value: BackgroundImageOverlay } ) => {
	const { imageTitle } = useImage( value );

	return <span>{ imageTitle }</span>;
};

const ItemLabelGradient = ( { value }: { value: BackgroundOverlayItemPropValue } ) => {
	if ( value.value.type.value === 'linear' ) {
		return <span>{ __( 'Linear Gradient', 'elementor' ) }</span>;
	}

	return <span>{ __( 'Radial Gradient', 'elementor' ) }</span>;
};

const ColorOverlayContent = ( { anchorEl }: { anchorEl: HTMLElement | null } ) => {
	const propContext = useBoundProp( backgroundColorOverlayPropTypeUtil );
	return (
		<PropProvider { ...propContext }>
			<PropKeyProvider bind={ 'color' }>
				<ColorControl anchorEl={ anchorEl } />
			</PropKeyProvider>
		</PropProvider>
	);
};

const ImageOverlayContent = () => {
	const propContext = useBoundProp( backgroundImageOverlayPropTypeUtil );

	return (
		<PropProvider { ...propContext }>
			<PropKeyProvider bind={ 'image' }>
				<ImageControl sizes={ backgroundResolutionOptions } />
			</PropKeyProvider>
			<PropKeyProvider bind={ 'position' }>
				<BackgroundImageOverlayPosition />
			</PropKeyProvider>
			<PropKeyProvider bind={ 'repeat' }>
				<BackgroundImageOverlayRepeat />
			</PropKeyProvider>
			<PropKeyProvider bind={ 'size' }>
				<BackgroundImageOverlaySize />
			</PropKeyProvider>
			<PropKeyProvider bind={ 'attachment' }>
				<BackgroundImageOverlayAttachment />
			</PropKeyProvider>
		</PropProvider>
	);
};

const StyledUnstableColorIndicator = styled( UnstableColorIndicator )( ( { theme } ) => ( {
	borderRadius: `${ theme.shape.borderRadius / 2 }px`,
} ) );

const useImage = ( image: BackgroundImageOverlay ) => {
	let imageTitle,
		imageUrl: string | null = null;

	const imageSrc = image?.value.image.value?.src.value;
	const { data: attachment } = useWpMediaAttachment( imageSrc.id?.value || null );

	if ( imageSrc.id ) {
		const imageFileTypeExtension = getFileExtensionFromFilename( attachment?.filename );
		imageTitle = `${ attachment?.title }${ imageFileTypeExtension }` || null;
		imageUrl = attachment?.url || null;
	} else if ( imageSrc.url ) {
		imageUrl = imageSrc.url.value;
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

const getGradientValue = ( value: BackgroundOverlayItemPropValue ) => {
	const gradient = value.value;

	const stops = gradient.stops.value
		?.map( ( { value: { color, offset } }: ColorStop ) => `${ color.value } ${ offset.value ?? 0 }%` )
		?.join( ',' );

	if ( gradient.type.value === 'linear' ) {
		return `linear-gradient(${ gradient.angle.value }deg, ${ stops })`;
	}

	return `radial-gradient(circle at ${ gradient.positions.value }, ${ stops })`;
};

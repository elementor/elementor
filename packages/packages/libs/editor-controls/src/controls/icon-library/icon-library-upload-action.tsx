import * as React from 'react';
import { forwardRef, type MouseEvent, useRef, useState } from 'react';
import { PromotionPopover, useCanvasClickHandler } from '@elementor/editor-ui';
import { UploadIcon } from '@elementor/icons';
import { createReplaceableLocation } from '@elementor/locations';
import { Box, IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { trackUpgradePromotionClick, trackViewPromotion } from '../../utils/tracking';

export const ICON_LIBRARY_UPLOAD_UPGRADE_URL = 'https://go.elementor.com/go-pro-svg-library-upload-upgrade/';

const TRACKING_DATA = { target_name: 'icon_library_upload', location_l2: 'general' } as const;

export const { Slot: IconLibraryUploadActionSlot, inject: injectIntoIconLibraryUploadAction } =
	createReplaceableLocation();

type IconLibraryUploadButtonProps = {
	onClick: () => void;
	'aria-haspopup'?: 'dialog';
	'aria-expanded'?: boolean;
};

export const IconLibraryUploadButton = forwardRef< HTMLButtonElement, IconLibraryUploadButtonProps >(
	( props, ref ) => {
		const label = __( 'Upload library', 'elementor' );

		return (
			<Tooltip title={ label } placement="top">
				<IconButton ref={ ref } size="tiny" aria-label={ label } { ...props }>
					<UploadIcon fontSize="tiny" />
				</IconButton>
			</Tooltip>
		);
	}
);

type IconLibraryUploadPromotionProps = {
	ctaUrl?: string;
	ctaText?: string;
	title?: string;
	content?: string;
};

export const IconLibraryUploadPromotion = ( {
	ctaUrl = ICON_LIBRARY_UPLOAD_UPGRADE_URL,
	ctaText = __( 'Upgrade now', 'elementor' ),
	title = __( 'Upload custom icons', 'elementor' ),
	content = __( 'Add your own icon font library to use across your site.', 'elementor' ),
}: IconLibraryUploadPromotionProps ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef< HTMLButtonElement >( null );

	const canSeePromotions = !! window.elementor?.config?.v4Promotions;

	const close = () => {
		setIsOpen( false );
		triggerRef.current?.focus();
	};

	useCanvasClickHandler( isOpen, close );

	const toggle = () => {
		if ( ! isOpen ) {
			trackViewPromotion( TRACKING_DATA );
		}

		setIsOpen( ! isOpen );
	};

	if ( ! canSeePromotions ) {
		return null;
	}

	return (
		<PromotionPopover
			open={ isOpen }
			placement="top"
			arrow
			title={ title }
			content={ content }
			ctaText={ ctaText }
			ctaUrl={ ctaUrl }
			onClose={ ( event: MouseEvent ) => {
				event.stopPropagation();
				close();
			} }
			onCtaClick={ () => trackUpgradePromotionClick( TRACKING_DATA ) }
		>
			<Box component="span" sx={ { display: 'inline-flex' } }>
				<IconLibraryUploadButton
					ref={ triggerRef }
					aria-haspopup="dialog"
					aria-expanded={ isOpen }
					onClick={ toggle }
				/>
			</Box>
		</PromotionPopover>
	);
};

export const IconLibraryUploadAction = () => {
	if ( window.elementorPro ) {
		return null;
	}

	return <IconLibraryUploadPromotion />;
};

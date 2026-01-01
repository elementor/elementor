import * as React from 'react';
import { PromotionalModal } from '@elementor/editor-ui';
import { Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const ANGIE_INSTALL_URL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=angie';
const PLACEHOLDER_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/components-angie-promo.svg';

type AngiePromotionModalProps = {
	open: boolean;
	onClose: () => void;
	anchorEl: HTMLElement | null;
};

export const AngiePromotionModal = ( { open, onClose, anchorEl }: AngiePromotionModalProps ) => {
	return (
		<PromotionalModal
			open={ open }
			onClose={ onClose }
			anchorEl={ anchorEl }
			title={ __( 'Add new component with AI', 'elementor' ) }
			imageUrl={ PLACEHOLDER_IMAGE_URL }
			ctaText={ __( 'Get Angie', 'elementor' ) }
			ctaHref={ ANGIE_INSTALL_URL }
		>
			<Typography variant="body2">
				{ __(
					'Angie our AI assistant can easily create new components and save you the hassle of doing it yourself',
					'elementor'
				) }
			</Typography>
		</PromotionalModal>
	);
};

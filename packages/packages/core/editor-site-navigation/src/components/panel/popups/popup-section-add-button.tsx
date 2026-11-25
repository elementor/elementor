import * as React from 'react';
import { forwardRef, type MouseEvent, useCallback, useImperativeHandle, useRef } from 'react';
import { Stack } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { env } from '../../../env';
import ContentPanelAddIconButton from '../content-panel-add-icon-button';
import {
	SiteContentPopupsPromotionChip,
	type SiteContentPopupsPromotionChipRef,
} from './site-content-popups-promotion-chip';

export type PopupSectionAddButtonRef = {
	togglePromotion: () => void;
};

type PopupSectionAddButtonProps = {
	disabled?: boolean;
	onBeforeCreate?: () => void;
	onCreate: () => void;
};

export const PopupSectionAddButton = forwardRef< PopupSectionAddButtonRef, PopupSectionAddButtonProps >(
	( { disabled, onBeforeCreate, onCreate }, ref ) => {
		const promotionRef = useRef< SiteContentPopupsPromotionChipRef >( null );
		const canCreate = env.popups?.can_use ?? false;

		const togglePromotion = useCallback( () => {
			promotionRef.current?.toggle();
		}, [] );

		useImperativeHandle( ref, () => ( { togglePromotion } ), [ togglePromotion ] );

		const ariaLabel = sprintf(
			/* translators: %s: Document type singular name. */
			__( 'New %s', 'elementor' ),
			__( 'Popup', 'elementor' )
		);

		if ( canCreate ) {
			return (
				<ContentPanelAddIconButton
					aria-label={ ariaLabel }
					disabled={ disabled }
					onClick={ ( event: MouseEvent ) => {
						event.stopPropagation();
						onBeforeCreate?.();
						onCreate();
					} }
				/>
			);
		}

		return (
			<Stack
				alignItems="center"
				direction="row"
				onClick={ ( event: MouseEvent ) => {
					event.stopPropagation();
					onBeforeCreate?.();
					togglePromotion();
				} }
				sx={ { cursor: 'pointer' } }
			>
				<ContentPanelAddIconButton aria-label={ ariaLabel } tabIndex={ -1 } />
				<SiteContentPopupsPromotionChip ref={ promotionRef } />
			</Stack>
		);
	}
);

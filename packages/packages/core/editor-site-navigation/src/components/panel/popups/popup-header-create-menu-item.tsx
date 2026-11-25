import * as React from 'react';
import { useRef } from 'react';
import { PopupTemplateIcon } from '@elementor/icons';
import { ListItemIcon, ListItemText, MenuItem, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { env } from '../../../env';
import {
	SiteContentPopupsPromotionChip,
	type SiteContentPopupsPromotionChipRef,
} from './site-content-popups-promotion-chip';

type PopupHeaderCreateMenuItemProps = {
	onSelect: () => void;
};

export default function PopupHeaderCreateMenuItem( { onSelect }: PopupHeaderCreateMenuItemProps ) {
	const promotionRef = useRef< SiteContentPopupsPromotionChipRef >( null );
	const canCreate = env.popups?.can_use ?? false;
	const label = __( 'Popup', 'elementor' );

	const handleClick = () => {
		if ( ! canCreate ) {
			promotionRef.current?.toggle();
			return;
		}

		onSelect();
	};

	return (
		<MenuItem onClick={ handleClick } sx={ { gap: 1.5 } }>
			<ListItemIcon>
				<PopupTemplateIcon fontSize="small" color={ canCreate ? 'action' : 'disabled' } />
			</ListItemIcon>
			<ListItemText
				primary={ label }
				primaryTypographyProps={ {
					variant: 'body2',
					color: canCreate ? 'text.primary' : 'text.disabled',
				} }
			/>
			{ ! canCreate && (
				<>
					<Typography component="span" sx={ { flexGrow: 1 } } />
					<SiteContentPopupsPromotionChip ref={ promotionRef } />
				</>
			) }
		</MenuItem>
	);
}
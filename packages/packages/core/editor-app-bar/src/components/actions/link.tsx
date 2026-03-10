import * as React from 'react';
import { type ElementType, useCallback } from 'react';

import { useMenuContext } from '../../contexts/menu-context';
import PopoverMenuItem from '../ui/popover-menu-item';
import ToolbarMenuItem from '../ui/toolbar-menu-item';
import { type ActionWithPromotionsProps, type PromotionModalProps } from './promotion-modal/types';
import { usePromotionModalProps } from './promotion-modal/use-prmotion-modal-props';
import { usePromotionModal } from './promotion-modal/use-promotion-modal';

type BaseProps = {
	id?: string;
	title: string;
	icon: ElementType;
	href?: string;
	visible?: boolean;
	target?: string;
	showExternalLinkIcon?: boolean;
	onClick?: ( event: React.MouseEvent< HTMLElement > ) => void;
	promotionModal?: PromotionModalProps;
};

export type Props = ActionWithPromotionsProps< BaseProps >;

export default function Link( {
	id,
	icon: Icon,
	title,
	visible = true,
	showExternalLinkIcon = false,
	href,
	target,
	onClick,
	promotionModal,
	...rest
}: Props ) {
	const { type } = useMenuContext();

	const handleCtaClick = useCallback( () => {
		if ( href ) {
			window.open( href, target || '_blank' );
		}
	}, [ href, target ] );

	const modalProps = usePromotionModalProps( { id, title, promotionModal }, handleCtaClick );
	const { renderWithModal } = usePromotionModal( modalProps );

	if ( ! visible ) {
		return null;
	}

	const actionElement =
		type === 'toolbar' ? (
			<ToolbarMenuItem title={ title } href={ href } target={ target } onClick={ onClick } { ...rest }>
				<Icon />
			</ToolbarMenuItem>
		) : (
			<PopoverMenuItem
				href={ href }
				target={ target }
				onClick={ onClick }
				{ ...rest }
				text={ title }
				icon={ <Icon /> }
				showExternalLinkIcon={ showExternalLinkIcon }
			/>
		);

	return renderWithModal( actionElement );
}

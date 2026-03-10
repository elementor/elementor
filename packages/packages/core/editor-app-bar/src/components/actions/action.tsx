import * as React from 'react';
import { type ElementType } from 'react';

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
	disabled?: boolean;
	visible?: boolean;
	onClick?: () => void;
	promotionModal?: PromotionModalProps;
};

export type Props = ActionWithPromotionsProps< BaseProps >;

export default function Action( { id, icon: Icon, title, visible = true, onClick, promotionModal, ...rest }: Props ) {
	const { type } = useMenuContext();
	const modalProps = usePromotionModalProps( { id, title, promotionModal }, onClick );
	const { renderWithModal } = usePromotionModal( modalProps );

	if ( ! visible ) {
		return null;
	}

	const actionElement =
		type === 'toolbar' ? (
			<ToolbarMenuItem title={ title } onClick={ onClick } { ...rest }>
				<Icon />
			</ToolbarMenuItem>
		) : (
			<PopoverMenuItem onClick={ onClick } { ...rest } text={ title } icon={ <Icon /> } />
		);

	return renderWithModal( actionElement );
}

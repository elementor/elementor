import { useMemo } from 'react';

import { type PromotionModalProps, type PromotionProps } from './types';

type UsePromotionModalPropsInput = {
	id?: string;
	title: string;
	promotionModal?: PromotionModalProps;
};

export const usePromotionModalProps = (
	props: UsePromotionModalPropsInput,
	onClick: ( () => void ) | null | undefined
): PromotionProps | null => {
	return useMemo( () => {
		const { promotionModal, title, id } = props;

		if ( ! promotionModal || ! onClick || ! id ) {
			return null;
		}

		const { content } = promotionModal;

		if ( ! content ) {
			return null;
		}

		const validImage =
			promotionModal.image && isValidImageUrl( promotionModal.image ) ? promotionModal.image : undefined;

		return {
			id,
			title,
			onClick,
			...promotionModal,
			image: validImage,
		};
	}, [ props, onClick ] );
};

function isValidImageUrl( url: string ): boolean {
	try {
		const parsedUrl = new URL( url );
		const pathname = parsedUrl.pathname.toLowerCase();
		return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/.test( pathname ) || url.startsWith( 'data:image/' );
	} catch {
		return false;
	}
}

export type PromotionModalProps = {
	content: string;
	ctaLabel: string;
	title?: string;
	image?: string;
	condition?: () => boolean | Promise< boolean >;
	version?: number;
};

export type ActionWithPromotionsProps< T = object > =
	| ( T & {
			id: string;
			title: string;
			promotionModal: PromotionModalProps;
	  } )
	| T;

export type PromotionProps = PromotionModalProps & {
	id: string;
	title: string;
	onClick: () => void;
};

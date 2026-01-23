type V4PromotionData = {
	title: string;
	content: string;
	ctaUrl: string;
	image: string;
};

export type CanvasExtendedWindow = Window & {
	elementor?: {
		config?: {
			v4Promotions?: Record< string, V4PromotionData >;
		};
	};
};

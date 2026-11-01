type PromotionConfig = {
	state: string;
};

export function fetchPromotionConfigAfterConnect< T extends PromotionConfig | null >(
	fetchConfig: () => Promise< T >
): Promise< T >;

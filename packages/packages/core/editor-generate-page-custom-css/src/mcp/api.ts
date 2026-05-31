import apiFetch from '@wordpress/api-fetch';

export const GENERATE_PAGE_ENDPOINT = '/elementor/v1/generate-page';

export type GeneratePageParams = {
	dbContent: string;
	classesContent?: string;
	createNewPage?: boolean;
	pageTitle?: string;
	targetPostId?: number;
};

export type GeneratePageResponse = {
	postId: number;
	viewUrl: string;
	editUrl: string;
};

export async function generatePage( params: GeneratePageParams ): Promise< GeneratePageResponse > {
	return apiFetch< GeneratePageResponse >( {
		path: GENERATE_PAGE_ENDPOINT,
		method: 'POST',
		data: params,
	} );
}

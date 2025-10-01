import { APIRequestContext } from '@playwright/test';

export interface CssConverterOptions {
	postType?: string;
	createGlobalClasses?: boolean;
}

export interface CssConverterRequest {
	type: string;
	content: string;
	options?: CssConverterOptions;
}

export interface CssConverterResponse {
	success: boolean;
	widgets_created: number;
	global_classes_created: number;
	variables_created: number;
	post_id: number;
	edit_url: string;
	conversion_log: unknown;
	warnings: unknown[];
	errors: unknown[];
}

export class CssConverterHelper {
	private readonly devToken: string;

	constructor( devToken?: string ) {
		this.devToken = devToken || process.env.ELEMENTOR_CSS_CONVERTER_DEV_TOKEN || 'my-dev-token';
	}

	async convertHtmlWithCss(
		request: APIRequestContext,
		cssContent: string,
		options: CssConverterOptions = {},
	): Promise<CssConverterResponse> {
		const defaultOptions: CssConverterOptions = {
			postType: 'page',
			createGlobalClasses: true,
			...options,
		};

		const apiResponse = await request.post( '/wp-json/elementor/v2/widget-converter', {
			headers: {
				'X-DEV-TOKEN': this.devToken,
				'Content-Type': 'application/json',
			},
			data: {
				type: 'html',
				content: cssContent,
				options: defaultOptions,
			},
		} );

		return await apiResponse.json() as CssConverterResponse;
	}

	getEditUrl( postId: number ): string {
		return `/wp-admin/post.php?post=${ postId }&action=elementor`;
	}

	/**
	 * Validates API result and returns skip information if the result is invalid
	 * @param apiResult - The API response to validate
	 * @returns Object with shouldSkip boolean and skipReason string
	 */
	validateApiResult( apiResult: CssConverterResponse | null ): { shouldSkip: boolean; skipReason: string } {
		if ( !apiResult ) {
			return {
				shouldSkip: true,
				skipReason: 'API returned null/undefined response'
			};
		}

		if ( apiResult.errors && apiResult.errors.length > 0 ) {
			return {
				shouldSkip: true,
				skipReason: 'Skipping due to backend property mapper issues: ' + apiResult.errors.join(', ')
			};
		}

		if ( !apiResult.post_id || !apiResult.edit_url ) {
			return {
				shouldSkip: true,
				skipReason: 'Skipping due to missing postId or editUrl in API response'
			};
		}

		return {
			shouldSkip: false,
			skipReason: ''
		};
	}
}

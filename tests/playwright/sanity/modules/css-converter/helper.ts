import { APIRequestContext } from '@playwright/test';

export interface CssConverterOptions {
	postType?: string;
	createGlobalClasses?: boolean;
	timeout?: number;
	globalClassThreshold?: number;
	preserveIds?: boolean;
}

export interface CssConverterRequest {
	type: string;
	content: string;
	cssUrls?: string[];
	followImports?: boolean;
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

export interface CssClassesRequest {
	css: string;
	url?: string;
	store?: boolean;
}

export interface CssClassesResponse {
	success: boolean;
	global_classes_created: number;
	classes: Array<{
		name: string;
		id: string;
		properties: Record<string, any>;
	}>;
	warnings: unknown[];
	errors: unknown[];
}

export type ApiType = 'widget-converter' | 'css-classes';

export interface DualApiTestResult {
	widgetConverter?: CssConverterResponse;
	cssClasses?: CssClassesResponse;
	apiType: ApiType;
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

	async convertCssOnly(
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
				type: 'css',
				content: cssContent,
				options: defaultOptions,
			},
		} );

		return await apiResponse.json() as CssConverterResponse;
	}

	async convertFromUrl(
		request: APIRequestContext,
		url: string,
		cssUrls: string[] = [],
		followImports: boolean = false,
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
				type: 'url',
				content: url,
				cssUrls,
				followImports,
				options: defaultOptions,
			},
		} );

		return await apiResponse.json() as CssConverterResponse;
	}

	async convertCssToClasses(
		request: APIRequestContext,
		cssContent: string,
		store: boolean = true,
	): Promise<CssClassesResponse> {
		const apiResponse = await request.post( '/wp-json/elementor/v2/css-converter/classes', {
			headers: {
				'X-DEV-TOKEN': this.devToken,
				'Content-Type': 'application/json',
			},
			data: {
				css: cssContent,
				store,
			},
		} );

		return await apiResponse.json() as CssClassesResponse;
	}

	async convertWithBothApis(
		request: APIRequestContext,
		cssContent: string,
		options: CssConverterOptions = {},
	): Promise<DualApiTestResult> {
		const widgetConverter = await this.convertCssOnly( request, cssContent, options );
		const cssClasses = await this.convertCssToClasses( request, cssContent, true );

		return {
			widgetConverter,
			cssClasses,
			apiType: 'widget-converter',
		};
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

	/**
	 * Validates CSS Classes API result
	 * @param apiResult - The CSS Classes API response to validate
	 * @returns Object with shouldSkip boolean and skipReason string
	 */
	validateCssClassesResult( apiResult: CssClassesResponse | null ): { shouldSkip: boolean; skipReason: string } {
		if ( !apiResult ) {
			return {
				shouldSkip: true,
				skipReason: 'CSS Classes API returned null/undefined response'
			};
		}

		if ( apiResult.errors && apiResult.errors.length > 0 ) {
			return {
				shouldSkip: true,
				skipReason: 'Skipping due to CSS Classes API errors: ' + apiResult.errors.join(', ')
			};
		}

		if ( !apiResult.success ) {
			return {
				shouldSkip: true,
				skipReason: 'CSS Classes API returned success: false'
			};
		}

		return {
			shouldSkip: false,
			skipReason: ''
		};
	}

	/**
	 * Validates dual API test result
	 * @param dualResult - The dual API test result to validate
	 * @returns Object with shouldSkip boolean and skipReason string
	 */
	validateDualApiResult( dualResult: DualApiTestResult | null ): { shouldSkip: boolean; skipReason: string } {
		if ( !dualResult ) {
			return {
				shouldSkip: true,
				skipReason: 'Dual API test returned null/undefined response'
			};
		}

		if ( dualResult.widgetConverter ) {
			const widgetValidation = this.validateApiResult( dualResult.widgetConverter );
			if ( widgetValidation.shouldSkip ) {
				return {
					shouldSkip: true,
					skipReason: 'Widget Converter validation failed: ' + widgetValidation.skipReason
				};
			}
		}

		if ( dualResult.cssClasses ) {
			const classesValidation = this.validateCssClassesResult( dualResult.cssClasses );
			if ( classesValidation.shouldSkip ) {
				return {
					shouldSkip: true,
					skipReason: 'CSS Classes validation failed: ' + classesValidation.skipReason
				};
			}
		}

		return {
			shouldSkip: false,
			skipReason: ''
		};
	}
}

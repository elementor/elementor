const DEFAULT_SAVE_STATUS = 'draft';

type ElementorCommonWindow = Window & {
	elementorCommon?: {
		ajax?: {
			addRequest: (
				action: string,
				options: {
					data: Record< string, unknown >;
				}
			) => Promise< unknown >;
		};
	};
};

type ElementorConfigWindow = Window & {
	ElementorConfig?: {
		initial_document?: {
			settings?: Record< string, unknown >;
			elements?: unknown[];
		};
	};
};

function getDocumentSettings(): Record< string, unknown > {
	const config = ( window as ElementorConfigWindow ).ElementorConfig;
	const settings = config?.initial_document?.settings ?? {};

	return { ...settings };
}

export async function saveDocument( elements: unknown[], status: string = DEFAULT_SAVE_STATUS ): Promise< unknown > {
	const ajax = ( window as ElementorCommonWindow ).elementorCommon?.ajax;

	if ( ! ajax ) {
		throw new Error( 'elementorCommon.ajax is not available.' );
	}

	const settings = getDocumentSettings();
	settings.post_status = status;

	return ajax.addRequest( 'save_builder', {
		data: {
			status,
			elements,
			settings,
		},
	} );
}

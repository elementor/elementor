type PipelineMimeMap = Record< string, string >;

declare global {
	interface Window {
		_wpMediaUploadPipelineSettings?: {
			allowedMimeTypes?: PipelineMimeMap;
		};
		wp?: {
			data?: {
				select: ( store: object ) => {
					getSettings?: () => {
						allowedMimeTypes?: PipelineMimeMap;
					};
				};
			};
			uploadMedia?: {
				store?: object;
			};
		};
	}
}

export {};

type PluploadFilters = {
	mime_types?: PluploadFiltersMimeTypes[];
	max_file_size?: number | string;
	prevent_duplicates?: boolean;
};

type PluploadFiltersMimeTypes = {
	title?: string;
	extensions: string;
};

export type WpPluploadSettingsWindow = Window & {
	_wpPluploadSettings?: {
		defaults: {
			filters: PluploadFilters;
		};
	};
};

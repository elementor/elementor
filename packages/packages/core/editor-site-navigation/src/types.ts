export type Post = {
	isHome?: boolean;
	id: number;
	link: string;
	status: string;
	type: string;
	title: {
		rendered: string;
	};
	user_can: {
		edit: boolean;
		delete: boolean;
	};
};

export type RecentPost = {
	id: number;
	title: string;
	edit_url: string;
	type: {
		post_type: string;
		doc_type: string;
		label: string;
	};
	date_modified: number;
	user_can: {
		edit: boolean;
	};
};

export type ExtendedWindow = Window & {
	elementor: {
		editorEvents: {
			dispatchEvent: ( name: string, data: Record< string, string > ) => void;
			config: {
				locations: Record< string, string >;
				secondaryLocations: Record< string, string >;
				triggers: Record< string, string >;
				elements: Record< string, string >;
				names: {
					topBar: Record< string, string >;
				};
			};
		};
	};
};

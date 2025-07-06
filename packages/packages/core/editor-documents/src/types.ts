export type ExitTo = 'dashboard' | 'all_posts' | 'this_post';

export type Document = {
	id: number;
	title: string;
	type: {
		value: string;
		label: string;
	};
	status: {
		value: string;
		label: string;
	};
	links: {
		platformEdit: string;
		permalink: string;
	};
	isDirty: boolean;
	isSaving: boolean;
	isSavingDraft: boolean;
	userCan: {
		publish?: boolean;
	};
	permissions: {
		allowAddingWidgets: boolean;
		showCopyAndShare: boolean;
	};
};

export type ExtendedWindow = Window & {
	elementor: {
		documents: {
			documents: Record< string, V1Document >;
			getCurrentId: () => number;
			getInitialId: () => number;
			getCurrent: () => V1Document;
			invalidateCache: () => void;
		};
		getPreferences: ( key: 'exit_to' ) => ExitTo;
	};
};

export type V1Document = {
	id: number;
	config: {
		type: string;
		user: {
			can_publish: boolean;
		};
		revisions: {
			current_id: number;
		};
		panel: {
			title: string;
			allow_adding_widgets: boolean;
			show_copy_and_share: boolean;
		};
		status: {
			value: string;
			label: string;
		};
		urls: {
			exit_to_dashboard: string;
			permalink: string;
			main_dashboard: string;
			all_post_type: string;
		};
	};
	editor: {
		isChanged: boolean;
		isSaving: boolean;
	};
	container: {
		settings: V1Model< {
			post_title: string;
			exit_to: ExitTo;
		} >;
	};
};

type V1Model< T > = {
	get: < K extends keyof T = keyof T >( key: K ) => T[ K ];
};

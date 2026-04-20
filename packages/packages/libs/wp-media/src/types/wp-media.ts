type PartialWpAttachmentJSON = {
	id: number;
};

export type BackboneAttachmentModel = {
	fetch: () => Promise< WpAttachmentJSON >;
	toJSON: () => WpAttachmentJSON | PartialWpAttachmentJSON;
};

export type CreateMediaFrameOptions = {
	title?: string;
	multiple?: boolean;
	frame?: string;
	library?: {
		type?: string[] | string;
	};
};

type CreateMediaFrame = ( options: CreateMediaFrameOptions ) => MediaFrame;

export type MediaFrame = {
	content: {
		mode: ( mode: string ) => void;
	};
	uploader: {
		uploader: {
			param: ( key: string, value: string ) => void;
		};
	};
	$el?: {
		find: ( selector: string ) => { remove: () => void };
	};
	state: () => {
		get: ( ( key: 'selection' ) => {
			set: ( attachments: BackboneAttachmentModel[] ) => void;
			toJSON: () => WpAttachmentJSON[];
		} ) &
			( ( key: 'id' ) => string );
		props?: { get: ( key: string ) => string | undefined };
	};
	setState: ( id: string ) => MediaFrame;
	on: ( event: string, callback: () => void ) => MediaFrame;
	open: () => void;
	detach: () => void;
	remove: () => void;
};

export type WpAttachmentJSON = {
	id: number;
	url: string;
	alt: string;
	filename: string;
	title: string;
	height: number;
	width: number;
	mime: string;
	sizes: Record<
		string,
		{
			url: string;
			width: number;
			height: number;
		}
	>;
	type: string;
	subtype: string;
	uploadedTo: number;
	filesizeInBytes: number;
	filesizeHumanReadable: string;
	author: string;
	authorName: string;
};

export type WpMediaWindow = {
	wp?: {
		media?: {
			attachment: ( id: number ) => BackboneAttachmentModel;
		} & CreateMediaFrame;
	};
};

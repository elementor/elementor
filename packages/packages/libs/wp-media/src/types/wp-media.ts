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
	state: () => {
		get: ( key: 'selection' ) => {
			set: ( attachments: BackboneAttachmentModel[] ) => void;
			toJSON: () => WpAttachmentJSON[];
		};
	};
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

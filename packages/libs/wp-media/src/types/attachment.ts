export type Attachment = {
	id: number;
	url: string;
	height: number;
	width: number;
	alt: string;
	filename: string;
	title: string;
	mime: string;
	type: string;
	subtype: string;
	uploadedTo: number;
	filesize: {
		inBytes: number;
		humanReadable: string;
	};
	author: {
		id: number;
		name: string;
	};
	sizes: Record<
		string,
		{
			width: number;
			height: number;
			url: string;
		}
	>;
};

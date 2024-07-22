export type Image = {
    title: string,
    description?: string,
    alt_text?: string,
    caption?: string,
    extension: string,
    filePath?: string
}

export type LinkOptions = {
    targetBlank?: boolean,
    noFollow?: boolean,
    customAttributes?: {key:string, value: string },
    linkTo?: boolean,
    linkInpSelector?: string
}

export type WpPage = {
	title: {
		rendered?: string,
	}
	date?: string,
	date_gmt?: string,
	guid?: string,
	id?: string,
	link?: string,
	modified?: string,
	modified_gmt?: string,
	slug: string,
	status?: 'publish' | 'future' | 'draft' | 'pending' | 'private',
	type?: string,
	password?: string,
	permalink_template?: string,
	generated_slug?: string,
	parent?: string,
	content: string,
	author?: string,
	excerpt?: string,
	featured_media?: string,
	comment_status?: string,
	ping_status?: string,
	menu_order?: string,
	meta?: string,
	template?: string,
}

export type Post = {
	id?: string,
	date?: string,
	date_gmt?: string,
	slug?: string,
	status?: 'publish' | 'future' | 'draft' | 'pending' | 'private',
	password?: string,
	title?: string,
	content?: string,
	author?: number,
	excerpt?: string,
	featured_media?: number,
	comment_status?: 'open' | 'closed',
	ping_status?: 'open' | 'closed',
	format?: 'standard' | 'aside' | 'chat' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio',
	meta?: string,
	sticky?: boolean,
	template?: string,
	tags?: number
}

export type WindowType = Window & {
	$e?: {
		run: ( s: string, o: object )=> unknown
	}
	wpApiSettings?: { nonce: string }
};
export type BackboneType = {
	Model: new ( o: {title: string} )=> unknown
};

export type $eType = {
	run: ( s: string, o: object )=> unknown
}

export type ElementorType = {
	navigator?: {
		isOpen: ()=> unknown
	},
	getContainer?: ( id: string )=> unknown,
	config?: {
		initial_document:{
			id: string
		}
	}
}

export type Device = 'mobile' | 'mobile_extra' | 'tablet' | 'tablet_extra' | 'laptop' | 'desktop' | 'widescreen';

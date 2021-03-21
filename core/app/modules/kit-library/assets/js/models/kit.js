import Document from './document';
import BaseModel from './base-model';

export default class Kit extends BaseModel {
	id = 0;
	title = '';
	description = '';
	isFavorite = false;
	thumbnailUrl = null;
	previewUrl = 'https://library.elementor.com/law-firm';
	accessLevel = 0;
	trendIndex = null;
	popularityIndex = null;
	featuredIndex = null;
	createdAt = null;
	updatedAt = null;
	keywords = [];
	rawTags = [];
	tags = [];
	documents = [];

	/**
	 * Create a kit from server response
	 *
	 * @param kit
	 */
	static createFromResponse( kit ) {
		const instance = new Kit();

		instance.id = kit.id;
		instance.title = kit.title;
		instance.description = kit.description;
		instance.isFavorite = kit.is_favorite;
		instance.thumbnailUrl = kit.thumbnail_url;
		instance.previewUrl = kit.preview_url;
		instance.accessLevel = kit.access_level;
		instance.trendIndex = kit.trend_index;
		instance.popularityIndex = kit.popularity_index;
		instance.featuredIndex = kit.featured_index;
		instance.createdAt = new Date( kit.created_at );
		instance.updatedAt = new Date( kit.updated_at );
		instance.keywords = kit.keywords;
		instance.tags = kit.tags;
		instance.documents = kit.documents ?
			kit.documents.map( ( document ) => Document.createFromResponse( document ) ) :
			[];

		return instance;
	}

	/**
	 * Get content types as param and group all the documents based on it.
	 *
	 * @param {ContentType[]} contentTypes
	 * @returns {ContentType[]}
	 */
	getGroupedDocumentsByContentTypes( contentTypes ) {
		return contentTypes.map( ( contentType ) => {
			contentType = contentType.clone();

			contentType.documents = this.documents
				.filter( ( document ) => contentType.documentTypes.includes( document.documentType ) );

			return contentType;
		} );
	}
}

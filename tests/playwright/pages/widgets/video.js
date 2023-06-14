const EditorPage = require( '../editor-page' );
import EditorSelectors from '../../selectors/editor-selectors';
import Content from '../elementor-panel-tabs/content';
import { expect } from '@playwright/test';

export default class VideoWidget extends Content {
	constructor( page, testInfo ) {
		super( page, testInfo );
		this.page = page;
		this.editorPage = new EditorPage( this.page, testInfo );
	}

	async setStartTime( value ) {
		await this.page.getByLabel( 'Start Time' ).click();
		await this.page.getByLabel( 'Start Time' ).clear( { force: true } );
		await this.page.getByLabel( 'Start Time' ).type( value );
	}

	async setEndTime( value ) {
		await this.page.getByLabel( 'End Time' ).click();
		await this.page.getByLabel( 'End Time' ).clear( { force: true } );
		await this.page.getByLabel( 'End Time' ).type( value );
	}

	async selectSuggestedVideos( option ) {
		await this.page.locator( EditorSelectors.video.suggestedVideoSelect ).selectOption( option );
	}

	async parseSrc( src ) {
		const options = await src.split( '?' )[ 1 ].split( '&' ).reduce( ( acc, cur ) => {
			let [ key, value ] = cur.split( '=' );
			if ( Number.isInteger( Number( value ) ) && ! [ 'start', 'end' ].includes( key ) ) {
				value = Boolean( Number( value ) ).toString();
			}
			acc[ key ] = value;
			return acc;
		}, {} );
		return options;
	}

	async getVideoSrc( isPublished ) {
		const page = true === isPublished ? this.page : this.editorPage.getPreviewFrame();
		const src = await page.locator( EditorSelectors.video.iframe ).getAttribute( 'src' );
		return src;
	}

	async selectVideoSource( option ) {
		await this.page.locator( EditorSelectors.video.videoSourceSelect ).selectOption( option );
	}

	async verifyVideoParams( src, expectedValues, player ) {
		const videoOptions = await this.parseSrc( src );
		if ( 'vimeo' === player ) {
			videoOptions.start = src.split( '#' )[ 1 ];
		}
		for ( const key in expectedValues ) {
			expect( videoOptions[ key ], { message: `Parameter is ${ key }` } ).toEqual( String( expectedValues[ key ] ) );
		}
	}

	async verifyVideoLightBox( isPublished ) {
		const page = true === isPublished ? this.page : this.editorPage.getPreviewFrame();
		await expect( page.locator( EditorSelectors.video.lightBoxSetting ) ).toBeVisible();
		await page.locator( EditorSelectors.video.image ).click( );
		await expect( page.locator( EditorSelectors.video.lightBoxDialog ) ).toBeVisible();
	}
}

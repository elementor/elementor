const BasePage = require( './base-page.js' );

module.exports = class EditorPage extends BasePage {
	/**
	 * @return {Promise<void>}
	 */
	async ensureLoaded() {
		await Promise.all( [
			this.page.waitForSelector( '.elementor-panel-loading', { state: 'detached' } ),
			this.page.waitForSelector( '#elementor-loading', { state: 'hidden' } ),
		] );
	}

	/**
	 * @return {Promise<void>}
	 */
	async ensureNavigatorClosed() {
		const navigatorCloseButton = await this.page.$( '#elementor-navigator__close' );

		if ( navigatorCloseButton ) {
			await navigatorCloseButton.click();
		}
	}

	/**
	 * @return {Promise<void>}
	 */
	async ensureNoticeBarClosed() {
		const noticeBarCloseButton = await this.page.$( '#e-notice-bar__close' );

		if ( noticeBarCloseButton ) {
			await noticeBarCloseButton.click();
		}
	}

	/**
	 * Add element to the page using a model.
	 *
	 * @param {Object} model     - Model definition.
	 * @param {string} container - Optional Container to create the element in.
	 *
	 * @return {Promise<*>} Element ID
	 */
	async addElement( model, container = null ) {
		return await this.page.evaluate( async ( args ) => {
			let parent;

			if ( args.container ) {
				parent = elementor.getContainer( args.container );
			} else {
				// If a `container` isn't supplied - create a new Section.
				const section = $e.run(
					'document/elements/create',
					{
						model: { elType: 'section' },
						columns: 1,
						container: elementor.getContainer( 'document' ),
					},
				);

				parent = section.children[ 0 ];
			}

			const element = $e.run(
				'document/elements/create',
				{
					model: args.model,
					container: parent,
				},
			);

			return element.id;
		}, { model, container } );
	}

	/**
	 * Add a widget by `widgetType`.
	 *
	 * @param {string} widgetType
	 * @param {string} container  - Optional Container to create the element in.
	 */
	async addWidget( widgetType, container = null ) {
		return await this.addElement( { widgetType, elType: 'widget' }, container );
	}

	/**
	 * @return {Frame}
	 */
	getPreviewFrame() {
		return this.page.frame( { name: 'elementor-preview-iframe' } );
	}

	/**
	 * @param {import('../widgets/widget').Widget} widget
	 * @return {Promise<Buffer>}
	 */
	async screenshotWidget( widget ) {
		let isLoading;

		try {
			await this.getPreviewFrame().waitForSelector( `.elementor-element-${ widget.id }.elementor-loading`, { timeout: 500 } );

			isLoading = true;
		} catch ( e ) {
			isLoading = false;
		}

		if ( isLoading ) {
		 	await this.getPreviewFrame().waitForSelector(
				 `.elementor-element-${ widget.id }.elementor-loading`,
				{ state: 'detached' },
			);

			await this.page.waitForTimeout( 400 );
		}

		const frameRect = await this.page.locator( '#elementor-preview-iframe' ).boundingBox();
		const elementRect = await ( await widget.getElement() ).boundingBox();

		return await this.page.screenshot( {
			type: 'jpeg',
			quality: 70,
			clip: {
				x: elementRect.x,
				y: elementRect.y,
				width: Math.min( elementRect.width, frameRect.width ) || 1,
				height: Math.min( elementRect.height, frameRect.height ) || 1,
			},
		} );
	}
};

import PreviewElementHandler from '../bases/preview-element-handler';

export default class ColorsHandler extends PreviewElementHandler {
	constructor( editorHelper, config ) {
		super( editorHelper, config );
	}

	scrollToMain( document ) {
		const container = this.helper.findElementById( document.container, this.getSelector( 'colors_injection_container' ) );

		if ( ! container ) {
			throw new Error( 'No main element found' );
		}

		elementor.helpers.scrollToView( container.view?.$el );
	}

	/**
	 * Apply changes to the document
	 * @param document {Document}
	 * @param config {Object}
	 */
	applyChanges( document ) {
		const rootContainer = document.container;

		// Custom colors comes with right hex from the backend
		this.modifyHexInWidgets( rootContainer, this.config[ 'systemColors' ] );
	}

	/**
	 * Change text value of hex to the current color.
	 * @param rootContainer {Container}
	 * @param colors {Array} - Array of colors values { _id, color: {hex string}}
	 */
	modifyHexInWidgets( rootContainer, colors ) {
		const mappedColors = colors.reduce( ( acc, color ) => {
			acc[ color._id ] = color;
			return acc;
		}, {} );
		let selector = this.getSelector( 'color_widget' );
		const colorWidgets = this.helper.findElementsByClass( rootContainer, selector );

		if ( ! colorWidgets.length ) {
			throw new Error( 'Could not find color widgets of system colors' );
		}

		colorWidgets.forEach( ( colorWidget ) => {
			const global = this.helper.getElementId( colorWidget.parent ).split( '__' )[ 1 ];
			const color = mappedColors[ global ];

			if ( ! color ) {
				return;
			}

			this.helper.setElementSettings( colorWidget, {
				title: color.color,
			} )
		} );
	}

	changeColor( color ) {
		let id = 428;
		let document = elementor.documents.get( id );

		const container = this.helper.findElementById( document.container, this.getSelector( 'color_container' ) + '__' + color._id );
		const colorWidgets = this.helper.findElementsByClass( container, this.getSelector( 'color_widget' ) );
		const colorWidget = colorWidgets[ 0 ];
		console.log( colorWidget);

		window.abcde = true;

		this.setHexString( colorWidget, color.color );
	}

	/**
	 * Inject custom colors into the document
	 * @param rootContainer {Container}
	 * @param customColors {Array} - Array of colors values { _id, title, color: {hex string}}
	 */
	injectCustomElements( rootContainer, customColors ) {
		const systemColorsSection = this.helper.findElementById( rootContainer, this.getSelector( 'default_colors_section' ) );

		if ( ! systemColorsSection ) {
			throw new Error( 'Could not find system colors section' );
		}
		// Inject title
		const injectedTitle = this.injectCustomTitle( rootContainer, systemColorsSection );

		// Inject colors in sections
		const chunkSize = 6; // How many colors per section

		let injectionPoint = injectedTitle;
		for ( let i = 0; i < customColors.length; i += chunkSize ) {
			const chunk = customColors.slice( i, i + chunkSize );
			injectionPoint = this.addColorsSection( rootContainer, injectionPoint, systemColorsSection, chunk );

			if ( ! injectionPoint ) {
				throw new Error( 'Error injecting custom colors section' );
			}
		}

	}

	/**
	 * Inject custom title
	 * @param rootContainer {Container}
	 * @param injectionContainer {Container} - Container to inject after
	 * @return {Container}
	 */
	injectCustomTitle( rootContainer, injectionContainer ) {
		const defaultTitleContainer = this.getDefaultTitleContainer( rootContainer );

		if ( ! defaultTitleContainer ) {
			throw new Error( 'Could not find default title container' );
		}

		const newTitle = this.helper.injectAfter( injectionContainer, defaultTitleContainer.model.toJSON() );

		if ( ! newTitle ) {
			throw new Error( 'Could not inject custom title' );
		}

		this.helper.setElementSettings( newTitle, {
			title: 'Custom Colors',
			_element_id: this.getSelector( 'custom_colors_title' ),
		} );

		return newTitle;
	}

	/**
	 * Get default title container
	 * @param rootContainer {Container}
	 * @return {Container}
	 */
	getDefaultTitleContainer( rootContainer ) {
		return this.helper.findElementById( rootContainer, this.getSelector( 'default_title_container' ) );
	}

	/**
	 * Create a new colors section with given colors
	 * @param rootContainer {Container} - Root container of the document
	 * @param injectionContainer {Container} - Container to inject after
	 * @param defaultSectionContainer {Container} - Default section container to clone
	 * @param colors {Array} - Array of colors values { _id, title, color: {hex string}}
	 * @return {Container} - The new section container
	 */
	addColorsSection( rootContainer, injectionContainer, defaultSectionContainer, colors ) {
		const defaultColorContainer = this.getDefaultColorContainer( rootContainer );

		if ( ! defaultColorContainer ) {
			throw new Error( 'Could not find default color container' );
		}

		// Created with first color inside
		const customColorsSection = this.createColorsSection( injectionContainer, defaultSectionContainer, colors[ 0 ] );

		if ( ! customColorsSection ) {
			throw new Error( 'Could not create custom colors section' );
		}

		// Add other colors
		for ( let i = 1; i < colors.length; i ++ ) {
			const color = colors[ i ];
			this.addColorToCustomSection( customColorsSection, defaultColorContainer, color );
		}

		return customColorsSection;
	}

	/**
	 * Get default color container
	 * @param rootContainer {Container}
	 * @return {Container|null}
	 */
	getDefaultColorContainer( rootContainer ) {
		const defaultColorId = this.getSelector( 'default_colors_container' );
		return this.helper.findElementById( rootContainer, defaultColorId );
	}

	/**
	 * Create empty color section with one color
	 * @param injectionContainer {Container} - Container to inject after
	 * @param defaultContainer  {Container} - Default container to clone
	 * @param firstColor {Object} - Color object { _id, title, color: {hex string}}
	 * @return {Container} - The new section container
	 */
	createColorsSection( injectionContainer, defaultContainer, firstColor ) {
		const maxItems = 6;

		let injected = this.helper.injectAfter( injectionContainer, defaultContainer.model.toJSON() );

		if ( ! injected ) {
			throw new Error( 'Could not inject custom colors section' );
		}

		this.helper.addClass( injected, this.getSelector( 'custom_colors_section' ) );

		const toDelete = [ ...injected.children ];

		toDelete.shift();

		// Delete all columns except for the first
		this.helper.deleteElements( toDelete );

		// Set values of first column
		this.setColorValues( injected.children[ 0 ], firstColor );

		// Add rest of columns as empty
		for ( let i = 0; i < maxItems - 1; i ++ ) {
			const newColumn = this.helper.cloneWithoutChildren( injected.children[ 0 ] );

			if ( ! newColumn ) {
				throw new Error( 'Could not create empty column' );
			}

			this.helper.setElementSettings( newColumn, {
				_element_id: '',
			} );
			this.helper.addClass( newColumn, this.getSelector( 'empty_color_container' ) );
		}

		return injected;
	}

	/**
	 * Add color to custom section
	 * @param customColorsSection {Container}
	 * @param defaultColorContainer {Container}
	 * @param color {Object} - Color object { _id, title, color: {hex string}}
	 * @return {Container|null} - The new color container or null if no empty column was found
	 */
	addColorToCustomSection( customColorsSection, defaultColorContainer, color ) {
		const emptyColors = this.helper.findElementsByClass( customColorsSection, this.getSelector( 'empty_color_container' ) );

		if ( 0 === emptyColors.length ) {
			return null;
		}

		let emptyColor = emptyColors[ 0 ];
		this.helper.removeClass( emptyColor, this.getSelector( 'empty_color_container' ) );

		this.addColorContainerContent( emptyColor, defaultColorContainer, color );

		return emptyColor;
	}

	/**
	 * Add content to color column
	 * @param parentContainer {Container} - The color column
	 * @param defaultColorContainer {Container} - The default color column
	 * @param color {Object} - Color object { _id, title, color: {hex string}}
	 */
	addColorContainerContent( parentContainer, defaultColorContainer, color ) {
		// Add widgets from default container
		defaultColorContainer.children.forEach( ( child ) => {
			const success = this.helper.appendInContainer( parentContainer, child.model.toJSON() );
			if ( ! success ) {
				throw new Error( 'Could not populate color column' );
			}
		} );

		// Set widgets values
		this.setColorValues( parentContainer, color );
	}

	/**
	 *  Set color values
	 * @param container {Container} - The color column
	 * @param color {Object} - Color object { _id, title, color: {hex string}}
	 */
	setColorValues( container, color ) {
		const { _id: id, title, color: hexString } = color;

		// Get the title widgets by class - should be only one
		const titles = this.helper.findElementsByClass( container, this.getSelector( 'color_title_widget' ) );
		// Get the color widgets by class - should be only one
		const colorWidgets = this.helper.findElementsByClass( container, this.getSelector( 'color_widget' ) );

		const colorWidget = colorWidgets[ 0 ];
		let titleWidget = titles[ 0 ];

		if ( ! colorWidget ) {
			throw new Error( 'Could not find color widget' );
		}

		if ( ! titleWidget ) {
			throw new Error( 'Could not find color title' );
		}

		// Set the new global
		this.setGlobalInColorContainer( colorWidget, id );

		this.setColorTitle( titleWidget, title );

		// Set id

		let settings = {
			_element_id: this.getSelector( 'color_widget' ) + '__' + id,
		};

		this.helper.setElementSettings( container, settings );

		if ( hexString ) {
			this.setHexString( colorWidget, hexString );
		} else {
			this.setHexString( colorWidget, '     ' );
		}
	}

	/**
	 * Set hex string in color widget
	 * @param colorWidget {Container} - The color widget
	 * @param hexString {string} - The hex string
	 */
	setHexString( container, hexString ) {
		this.helper.setElementSettings( container, {
			title: hexString,
		} );
	}

	/**
	 *  Set color title
	 * @param titleWidget {Container} - The title widget
	 * @param title {string} - The title
	 */
	setColorTitle( titleWidget, title ) {
		this.helper.setElementSettings( titleWidget, {
			title: title,
		} );
	}

	/**
	 * Set global in color widget
	 * @param widget {Container} - The color widget
	 * @param id {string} - The global id
	 */
	setGlobalInColorContainer( widget, id ) {
		this.helper.setGlobalValues(
			widget,
			{
				content_bg_color: `globals/colors?id=${ id }`,
			},
		);
	}
}

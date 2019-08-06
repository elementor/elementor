/*
 * By Elementor Team
 */
( ( $ ) => {
	class Gallery {
		constructor( userSettings ) {
			this.settings = $.extend( true, this.getDefaultSettings(), userSettings );

			this.initGalleriesTypes();

			this.createGallery();
		}

		getDefaultSettings() {
			return {
				container: null,
				type: 'justified',
				columns: 5,
				horizontalGap: 10,
				verticalGap: 10,
				classesPrefix: 'gallery-',
				classes: {
					container: 'container',
					item: 'item',
					image: 'image',
					firstRowItem: 'first-row-item',
				},
				breakpoints: {
					1024: {
						horizontalGap: 5,
						verticalGap: 5,
						columns: 4,
					},
					768: {
						horizontalGap: 1,
						verticalGap: 1,
						columns: 2,
					},
				},
			};
		}

		initGalleriesTypes() {
			this.galleriesTypes = {
				justified: Justified,
				masonry: Masonry,
			};
		}

		/*calculateItemSpot( itemIndex ) {
			return {
				row: Math.ceil( ( itemIndex + 1 ) / this.settings.columns ),
				column: ( itemIndex % this.settings.columns ) + 1,
			};
		}

		setItemsSize() {
			this.itemsSize = {};

			this.$items.each( ( index, item ) => {
				const itemSize = {
					width: 200,
					height: 150,
				};

				$( item ).css( itemSize );

				const spot = this.calculateItemSpot( index );

				if ( ! this.itemsSize[ spot.row ] ) {
					this.itemsSize[ spot.row ] = {};
				}

				this.itemsSize[ spot.row ][ spot.column ] = itemSize;
			} );
		}

		setItemsPosition() {
			const columnsHeight = {};

			let currentRowWidth;

			this.$items.each( ( index, item ) => {
				const itemSpot = this.calculateItemSpot( index ),
					itemSize = this.itemsSize[ itemSpot.row ][ itemSpot.column ];

				if ( ! columnsHeight[ itemSpot.column ] ) {
					columnsHeight[ itemSpot.column ] = 0;
				}

				if ( 1 === itemSpot.column ) {
					currentRowWidth = 0;
				}

				if ( 1 !== itemSpot.column ) {
					currentRowWidth += this.settings.verticalGap;
				}

				if ( 1 !== itemSpot.row ) {
					columnsHeight[ itemSpot.column ] += this.settings.horizontalGap;
				}

				$( item ).css( {
					top: columnsHeight[ itemSpot.column ],
					left: currentRowWidth,
				} );

				currentRowWidth += itemSize.width;

				columnsHeight[ itemSpot.column ] += itemSize.height;
			} );

			this.columnsHeight = columnsHeight;
		}

		setContainerSize() {
			const highestColumnSize = Math.max( ...Object.values( this.columnsHeight ) );

			this.$container.height( highestColumnSize );
		}

		layOutGallery() {
			this.setItemsSize();

			this.setItemsPosition();

			this.setContainerSize();
		}*/

		createGallery() {
			const GalleryHandlerType = this.galleriesTypes[ this.settings.type ];

			this.galleryHandler = new GalleryHandlerType( this.settings );
		}

		destroy() {
			this.galleryHandler.destroy();
		}
	}

	class GalleryType {
		constructor( settings ) {
			this.settings = $.extend( true, settings, this.getDefaultSettings() );

			this.$container = $( this.settings.container );

			this.runGallery = this.debounce( this.runGallery.bind( this ), 300 );

			this.initElements();

			this.prepareGallery();

			this.bindEvents();
		}

		getDefaultSettings() {
			return {};
		}

		getItemClass( className ) {
			return this.settings.classesPrefix + className;
		}

		initElements() {
			this.elements = {
				$window: $( window ),
			};

			this.$container.addClass( this.getItemClass( this.settings.classes.container ) + ' ' + this.getItemClass( this.settings.type ) );
		}

		bindEvents() {
			this.elements.$window.on( 'resize', this.runGallery );
		}

		createItem( itemData ) {
			const classes = this.settings.classes,
				$item = $( '<div>', { class: this.getItemClass( classes.item ) } ),
				$image = $( '<div>', { class: this.getItemClass( classes.image ) } ).css( 'background-image', 'url(' + itemData.thumbnail + ')' );

			$item.append( $image );

			return $item;
		}

		debounce( func, wait ) {
			let timeout;

			return function() {
				const context = this,
					args = arguments;

				const later = () => {
					timeout = null;

					func.apply( context, args );
				};

				clearTimeout( timeout );

				timeout = setTimeout( later, wait );
			};
		}

		getCurrentBreakpoint() {
			const breakpoints = Object.keys( this.settings.breakpoints ).map( Number ).sort( ( a, b ) => a - b );

			let currentBreakpoint = 0;

			breakpoints.some( ( breakpoint ) => {
				if ( innerWidth < breakpoint ) {
					currentBreakpoint = breakpoint;

					return true;
				}
			} );

			return currentBreakpoint;
		}

		getCurrentDeviceSetting( settingKey ) {
			const currentBreakpoint = this.getCurrentBreakpoint();

			if ( currentBreakpoint ) {
				return this.settings.breakpoints[ currentBreakpoint ][ settingKey ];
			}

			return this.settings[ settingKey ];
		}

		buildGallery() {
			const items = this.settings.items;

			this.$items = jQuery();

			items.forEach( ( item ) => {
				const $item = this.createItem( item );

				this.$items = this.$items.add( $item );

				this.$container.append( $item );
			} );
		}

		calculateImageSize( image, index ) {
			this.imagesData[ index ] = {
				width: image.width,
				height: image.height,
				ratio: image.width / image.height,
			};
		}

		loadImages() {
			const allPromises = [];

			this.imagesData = [];

			jQuery.each( this.settings.items, ( index ) => {
				const image = new Image(),
					promise = new Promise( ( resolve ) => {
						image.onload = resolve;
					} );

				allPromises.push( promise );

				promise.then( () => this.calculateImageSize( image, index ) );

				image.src = this.settings.items[ index ].thumbnail;
			} );

			Promise.all( allPromises ).then( () => this.runGallery() );
		}

		prepareGallery() {
			this.buildGallery();

			this.loadImages();
		}

		runGallery() {
			const containerStyle = this.$container[ 0 ].style;

			containerStyle.setProperty( '--hgap', this.getCurrentDeviceSetting( 'horizontalGap' ) + 'px' );
			containerStyle.setProperty( '--vgap', this.getCurrentDeviceSetting( 'verticalGap' ) + 'px' );

			this.run();
		}

		unbindEvents() {
			this.elements.$window.off( 'resize', this.runGallery );
		}

		destroy() {
			unbindEvents();
		}
	}

	class Justified extends GalleryType {
		getDefaultSettings() {
			return {
				idealRowHeight: 200,
				lastRow: 'normal',
				breakpoints: {
					1024: {
						idealRowHeight: 150,
						lastRow: 'normal',
					},
					768: {
						idealRowHeight: 100,
						lastRow: 'normal',
					},
				},
			};
		}

		run() {
			this.makeJustifiedRow( 0, this.$container.width() );
		}

		makeJustifiedRow( startIndex, containerWidth ) {
			let oldRowWidth = 0;

			for ( let index = startIndex; ; index++ ) {
				const itemComputedWidth = Math.round( this.getCurrentDeviceSetting( 'idealRowHeight' ) * this.imagesData[ index ].ratio ),
					newRowWidth = oldRowWidth + itemComputedWidth;

				if ( newRowWidth > containerWidth ) {
					const oldDiff = containerWidth - oldRowWidth,
						newDiff = newRowWidth - containerWidth;

					if ( oldDiff < newDiff ) {
						this.fitImagesInContainer( startIndex, index, oldRowWidth );

						this.makeJustifiedRow( index, containerWidth );

						break;
					}
				}

				const isLastItem = index === this.settings.items.length - 1;

				this.imagesData[ index ].computedWidth = itemComputedWidth;

				if ( isLastItem ) {
					const lastRowMode = this.getCurrentDeviceSetting( 'lastRow' );

					if ( 'hide' !== lastRowMode ) {
						const totalRowWidth = 'fit' === lastRowMode ? newRowWidth : containerWidth;

						this.fitImagesInContainer( startIndex, index + 1, totalRowWidth );
					}

					break;
				}

				oldRowWidth = newRowWidth;
			}
		}

		fitImagesInContainer( startIndex, endIndex, rowWidth ) {
			const gapCount = endIndex - startIndex - 1;

			for ( let index = startIndex; index < endIndex; index++ ) {
				const imageData = this.imagesData[ index ],
					percentWidth = imageData.computedWidth / rowWidth,
					item = this.$items.get( index ),
					firstRowItemClass = this.getItemClass( this.settings.classes.firstRowItem );

				item.style.setProperty( '--item-width', percentWidth );
				item.style.setProperty( '--gap-count', gapCount );

				if ( index === startIndex ) {
					item.classList.add( firstRowItemClass );

					item.style.setProperty( '--item-height', ( ( imageData.height / imageData.width ) * 100 ) + '%' );
				} else {
					item.classList.remove( firstRowItemClass );
				}
			}
		}
	}

	class Masonry extends GalleryType {
		run() {
			const currentBreakpoint = this.getCurrentBreakpoint();

			if ( currentBreakpoint === this.currentBreakpoint ) {
				return;
			}

			this.currentBreakpoint = currentBreakpoint;

			const heights = [],
				aggregatedHeights = [],
				columns = this.getCurrentDeviceSetting( 'columns' ),
				containerWidth = this.$container.width(),
				horizontalGap = this.getCurrentDeviceSetting( 'horizontalGap' ),
				itemWidth = ( containerWidth - ( horizontalGap * ( columns - 1 ) ) ) / columns;

			this.$items.each( ( index, item ) => {
				const row = Math.floor( index / columns ),
					indexAtRow = index % columns,
					imageData = this.imagesData[ index ],
					itemHeight = itemWidth / imageData.ratio;

				item.style.setProperty( '--item-height', ( imageData.height / imageData.width * 100 ) + '%' );
				item.style.setProperty( '--column', indexAtRow );

				if ( row ) {
					aggregatedHeights[ index ] = heights[ indexAtRow ];

					heights[ indexAtRow ] += itemHeight;
				} else {
					heights.push( itemHeight );
				}
			} );

			const highestColumn = Math.max( ...heights ),
				highestColumnIndex = heights.indexOf( highestColumn ),
				rows = Math.floor( this.settings.items.length / this.settings.columns ),
				rowsRemainder = this.settings.items.length % this.settings.columns,
				highestColumnsGapsCount = rowsRemainder > highestColumnIndex ? rows : rows - 1,
				containerAspectRatio = highestColumn / containerWidth;

			this.$container[ 0 ].style.setProperty( '--columns', columns );
			this.$container[ 0 ].style.setProperty( '--highest-column-gap-count', highestColumnsGapsCount );

			this.$container.css( 'padding-bottom', ( containerAspectRatio * 100 ) + '%' );

			this.$items.each( ( index, item ) => {
				const percentHeight = aggregatedHeights[ index ] ? aggregatedHeights[ index ] / highestColumn * 100 : 0,
					row = Math.floor( index / columns );

				item.style.setProperty( '--percent-height', percentHeight + '%' );
				item.style.setProperty( '--row', row );
			} );
		}
	}

	$.fn.gallery = function( settings ) {
		const isCommand = 'string' === typeof settings;

		this.each( function() {
			const $this = $( this );

			if ( ! isCommand ) {
				settings.container = this;

				$this.data( 'gallery', new Gallery( settings ) );

				return;
			}

			const instance = $this.data( 'gallery' );

			if ( ! instance ) {
				throw Error( 'Trying to perform the `' + settings + '` method prior to initialization' );
			}

			if ( ! instance[ settings ] ) {
				throw ReferenceError( 'Method `' + settings + '` not found in gallery instance' );
			}

			instance[ settings ].apply( instance, Array.prototype.slice.call( arguments, 1 ) );

			if ( 'destroy' === settings ) {
				$this.removeData( 'gallery' );
			}
		} );

		return this;
	};

	window.Gallery = Gallery;
} )( jQuery );

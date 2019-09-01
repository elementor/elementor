/*
 * By Elementor Team
 */
( ( $ ) => {
	class EGallery {
		constructor( userSettings ) {
			this.settings = $.extend( true, this.getDefaultSettings(), userSettings );

			this.initGalleriesTypes();

			this.createGallery();
		}

		getDefaultSettings() {
			return {
				container: null,
				type: 'grid',
				columns: 5,
				horizontalGap: 10,
				verticalGap: 10,
				animationDuration: 300,
				classesPrefix: 'gallery-',
				classes: {
					container: 'container',
					item: 'item',
					image: 'image',
					link: 'link',
					firstRowItem: 'first-row-item',
					animated: '-animated',
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
				grid: Grid,
				justified: Justified,
				masonry: Masonry,
			};
		}

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
			this.settings = $.extend( true, this.getDefaultSettings(), settings );

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

			if ( itemData.url ) {
				const $link = $( '<a>', { class: this.getItemClass( classes.link ), href: itemData.url } );

				$image.wrap( $link );
			}

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
			containerStyle.setProperty( '--animation-duration', this.settings.animationDuration + 'ms' );

			this.run();
		}

		unbindEvents() {
			this.elements.$window.off( 'resize', this.runGallery );
		}

		destroy() {
			this.unbindEvents();

			this.$container.empty();
		}
	}

	class Grid extends GalleryType {
		getDefaultSettings() {
			return {
				aspectRatio: '16:9',
			};
		}

		setItemsPosition() {
			const columns = this.getCurrentDeviceSetting( 'columns' );

			this.$items.each( ( index, item ) => {
				item.style.setProperty( '--column', index % columns );
				item.style.setProperty( '--row', Math.floor( index / columns ) );
			} );
		}

		setContainerSize() {
			const columns = this.getCurrentDeviceSetting( 'columns' ),
				rows = Math.ceil( this.settings.items.length / columns ),
				containerStyle = this.$container[ 0 ].style;

			containerStyle.setProperty( '--columns', columns );

			containerStyle.setProperty( '--rows', rows );

			const itemWidth = this.$items.width(),
				aspectRatio = this.settings.aspectRatio.split( ':' ),
				aspectRatioPercents = aspectRatio[ 1 ] / aspectRatio[ 0 ],
				itemHeight = aspectRatioPercents * itemWidth,
				totalHeight = itemHeight * rows + ( this.getCurrentDeviceSetting( 'horizontalGap' ) * ( rows - 1 ) ),
				calculatedAspectRatio = totalHeight / this.$container.width() * 100;

			containerStyle.setProperty( '--aspect-ratio', ( aspectRatioPercents * 100 ) + '%' );
			containerStyle.setProperty( '--container-aspect-ratio', calculatedAspectRatio + '%' );
		}

		run() {
			const animatedClass = this.getItemClass( this.settings.classes.animated );

			this.$container.addClass( animatedClass );

			setTimeout( () => {
				this.setItemsPosition();

				this.setContainerSize();

				setTimeout( () => this.$container.removeClass( animatedClass ), this.settings.animationDuration );
			}, 100 );
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
						lastRow: 'fit',
					},
					768: {
						idealRowHeight: 100,
						lastRow: 'fit',
					},
				},
			};
		}

		run() {
			this.rowsHeights = [];

			this.rowsCount = 0;

			this.containerWidth = this.$container.width();

			this.makeJustifiedRow( 0 );
		}

		makeJustifiedRow( startIndex ) {
			let oldRowWidth = 0;

			for ( let index = startIndex; ; index++ ) {
				let itemComputedWidth = Math.round( this.getCurrentDeviceSetting( 'idealRowHeight' ) * this.imagesData[ index ].ratio );

				if ( itemComputedWidth > this.containerWidth ) {
					itemComputedWidth = this.containerWidth;
				}

				const newRowWidth = oldRowWidth + itemComputedWidth;

				if ( newRowWidth > this.containerWidth ) {
					const oldDiff = this.containerWidth - oldRowWidth,
						newDiff = newRowWidth - this.containerWidth;

					if ( oldDiff < newDiff ) {
						this.fitImagesInContainer( startIndex, index, oldRowWidth );

						this.rowsCount++;

						this.makeJustifiedRow( index );

						break;
					}
				}

				const isLastItem = index === this.settings.items.length - 1;

				this.imagesData[ index ].computedWidth = itemComputedWidth;

				if ( isLastItem ) {
					const lastRowMode = this.getCurrentDeviceSetting( 'lastRow' );

					if ( 'hide' !== lastRowMode ) {
						const totalRowWidth = 'fit' === lastRowMode ? newRowWidth : this.containerWidth;

						this.fitImagesInContainer( startIndex, index + 1, totalRowWidth );
					}

					this.inflateGalleryHeight();

					break;
				}

				oldRowWidth = newRowWidth;
			}
		}

		fitImagesInContainer( startIndex, endIndex, rowWidth ) {
			const gapCount = endIndex - startIndex - 1;

			let aggregatedWidth = 0;

			for ( let index = startIndex; index < endIndex; index++ ) {
				const imageData = this.imagesData[ index ],
					percentWidth = imageData.computedWidth / rowWidth,
					item = this.$items.get( index ),
					firstRowItemClass = this.getItemClass( this.settings.classes.firstRowItem );

				item.style.setProperty( '--item-width', percentWidth );
				item.style.setProperty( '--gap-count', gapCount );
				item.style.setProperty( '--item-height', ( ( imageData.height / imageData.width ) * 100 ) + '%' );
				item.style.setProperty( '--item-left', aggregatedWidth );
				item.style.setProperty( '--item-row-index', index - startIndex );

				aggregatedWidth += percentWidth;

				if ( index === startIndex ) {
					item.classList.add( firstRowItemClass );

					const imagePxWidth = percentWidth * ( this.containerWidth - ( gapCount * this.getCurrentDeviceSetting( 'horizontalGap' ) ) );

					this.rowsHeights.push( imagePxWidth / imageData.ratio );
				} else {
					item.classList.remove( firstRowItemClass );
				}
			}
		}

		inflateGalleryHeight() {
			const totalRowsHeight = this.rowsHeights.reduce( (total, item ) => total + item ),
				finalContainerHeight = totalRowsHeight + this.rowsCount * this.getCurrentDeviceSetting( 'verticalGap' ),
				containerAspectRatio = finalContainerHeight / this.containerWidth,
				percentRowsHeights = this.rowsHeights.map( ( rowHeight ) => rowHeight / finalContainerHeight * 100 );

			let currentRow = -1,
				accumulatedTop = 0;

			this.$items.each( ( index, item ) => {
				const itemRowIndex = item.style.getPropertyValue( '--item-row-index' ),
					isFirstItem = '0' === itemRowIndex;

				if ( isFirstItem ) {
					currentRow++;

					if ( currentRow ) {
						accumulatedTop += percentRowsHeights[ currentRow - 1 ];
					}
				}

				item.style.setProperty( '--item-top', accumulatedTop + '%' );
				item.style.setProperty( '--item-height', percentRowsHeights[ currentRow ] + '%' );
				item.style.setProperty( '--row', currentRow );
			} );

			this.$container[ 0 ].style.setProperty( '--container-aspect-ratio', containerAspectRatio );
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

				$this.data( 'gallery', new EGallery( settings ) );

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

	window.EGallery = EGallery;
} )( jQuery );

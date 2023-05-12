import screenfull from './screenfull';
import {
	chevronLeft,
	chevronRight,
	close,
	downloadBold,
	facebook,
	frameExpand,
	frameMinimize,
	loading,
	pinterest,
	shareArrow,
	twitter,
	zoomInBold,
	zoomOutBold,
} from '@elementor/e-icons';

module.exports = elementorModules.ViewModule.extend( {
	oldAspectRatio: null,

	oldAnimation: null,

	swiper: null,

	player: null,

	isFontIconSvgExperiment: elementorFrontend.config.experimentalFeatures.e_font_icon_svg,

	getDefaultSettings() {
		return {
			classes: {
				aspectRatio: 'elementor-aspect-ratio-%s',
				item: 'elementor-lightbox-item',
				image: 'elementor-lightbox-image',
				videoContainer: 'elementor-video-container',
				videoWrapper: 'elementor-fit-aspect-ratio',
				playButton: 'elementor-custom-embed-play',
				playButtonIcon: 'fa',
				playing: 'elementor-playing',
				hidden: 'elementor-hidden',
				invisible: 'elementor-invisible',
				preventClose: 'elementor-lightbox-prevent-close',
				slideshow: {
					container: elementorFrontend.config.swiperClass,
					slidesWrapper: 'swiper-wrapper',
					prevButton: 'elementor-swiper-button elementor-swiper-button-prev',
					nextButton: 'elementor-swiper-button elementor-swiper-button-next',
					prevButtonIcon: 'eicon-chevron-left',
					nextButtonIcon: 'eicon-chevron-right',
					slide: 'swiper-slide',
					header: 'elementor-slideshow__header',
					footer: 'elementor-slideshow__footer',
					title: 'elementor-slideshow__title',
					description: 'elementor-slideshow__description',
					counter: 'elementor-slideshow__counter',
					iconExpand: 'eicon-frame-expand',
					iconShrink: 'eicon-frame-minimize',
					iconZoomIn: 'eicon-zoom-in-bold',
					iconZoomOut: 'eicon-zoom-out-bold',
					iconShare: 'eicon-share-arrow',
					shareMenu: 'elementor-slideshow__share-menu',
					shareLinks: 'elementor-slideshow__share-links',
					hideUiVisibility: 'elementor-slideshow--ui-hidden',
					shareMode: 'elementor-slideshow--share-mode',
					fullscreenMode: 'elementor-slideshow--fullscreen-mode',
					zoomMode: 'elementor-slideshow--zoom-mode',
				},
			},
			selectors: {
				image: '.elementor-lightbox-image',
				links: 'a, [data-elementor-lightbox]',
				slideshow: {
					activeSlide: '.swiper-slide-active',
					prevSlide: '.swiper-slide-prev',
					nextSlide: '.swiper-slide-next',
				},
			},
			modalOptions: {
				id: 'elementor-lightbox',
				entranceAnimation: 'zoomIn',
				videoAspectRatio: 169,
				position: {
					enable: false,
				},
			},
		};
	},

	getModal() {
		if ( ! module.exports.modal ) {
			this.initModal();
		}

		return module.exports.modal;
	},

	initModal() {
		const closeIcon = {};

		// If the experiment is active the closeIcon should be an entire SVG element otherwise it should pass the eicon class name.
		if ( this.isFontIconSvgExperiment ) {
			closeIcon.iconElement = close.element;
		} else {
			closeIcon.iconClass = 'eicon-close';
		}

		const modal = module.exports.modal = elementorFrontend.getDialogsManager().createWidget( 'lightbox', {
			className: 'elementor-lightbox',
			closeButton: true,
			closeButtonOptions: {
				...closeIcon,
				attributes: {
					role: 'button',
					tabindex: 0,
					'aria-label': elementorFrontend.config.i18n.close + ' (Esc)',
				},
			},
			selectors: {
				preventClose: '.' + this.getSettings( 'classes.preventClose' ),
			},
			hide: {
				onClick: true,
			},
		} );

		modal.on( 'hide', function() {
			modal.setMessage( '' );
		} );
	},

	showModal( options ) {
		if ( options.url && ! options.url.startsWith( 'http' ) ) {
			return;
		}

		this.elements.$closeButton = this.getModal().getElements( 'closeButton' );

		this.$buttons = this.elements.$closeButton;

		this.focusedButton = null;

		const self = this,
			defaultOptions = self.getDefaultSettings().modalOptions;

		self.id = options.id;

		self.setSettings( 'modalOptions', jQuery.extend( defaultOptions, options.modalOptions ) );

		const modal = self.getModal();

		modal.setID( self.getSettings( 'modalOptions.id' ) );

		modal.onShow = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onShow.apply( modal, arguments );

			self.setEntranceAnimation();
		};

		modal.onHide = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onHide.apply( modal, arguments );

			modal.getElements( 'message' ).removeClass( 'animated' );

			if ( screenfull.isFullscreen ) {
				self.deactivateFullscreen();
			}

			self.unbindHotKeys();
		};

		switch ( options.type ) {
			case 'video':
				self.setVideoContent( options );

				break;
			case 'image': {
					const slides = [ {
						image: options.url,
						index: 0,
						title: options.title,
						description: options.description,
						hash: options.hash,
					} ];

					options.slideshow = {
						slides,
						swiper: {
							loop: false,
							pagination: false,
						},
					};
					self.setSlideshowContent( options.slideshow );
					break;
				}
			case 'slideshow':
				self.setSlideshowContent( options.slideshow );
				break;
			default:
				self.setHTMLContent( options.html );
		}

		modal.show();
	},

	createLightbox( element ) {
		let lightboxData = {};

		if ( element.dataset.elementorLightbox ) {
			lightboxData = JSON.parse( element.dataset.elementorLightbox );
		}

		if ( lightboxData.type && 'slideshow' !== lightboxData.type ) {
			this.showModal( lightboxData );

			return;
		}

		if ( ! element.dataset.elementorLightboxSlideshow ) {
			const slideshowID = 'single-img';

			this.showModal( {
				type: 'image',
				id: slideshowID,
				url: element.href,
				hash: element.getAttribute( 'data-e-action-hash' ),
				title: element.dataset.elementorLightboxTitle,
				description: element.dataset.elementorLightboxDescription,
				modalOptions: {
					id: 'elementor-lightbox-slideshow-' + slideshowID,
				},
			} );

			return;
		}

		const initialSlideURL = element.dataset.elementorLightboxVideo || element.href;

		this.openSlideshow( element.dataset.elementorLightboxSlideshow, initialSlideURL );
	},

	setHTMLContent( html ) {
		if ( window.elementorCommon ) {
			elementorDevTools.deprecation.deprecated( 'elementorFrontend.utils.lightbox.setHTMLContent', '3.1.4' );
		}

		this.getModal().setMessage( html );
	},

	setVideoContent( options ) {
		const $ = jQuery;

		let $videoElement;

		if ( 'hosted' === options.videoType ) {
			const videoParams = $.extend( { src: options.url, autoplay: '' }, options.videoParams );

			$videoElement = $( '<video>', videoParams );
		} else {
			let apiProvider;

			if ( -1 !== options.url.indexOf( 'vimeo.com' ) ) {
				apiProvider = elementorFrontend.utils.vimeo;
			} else if ( options.url.match( /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com|youtube-nocookie\.com)/ ) ) {
				apiProvider = elementorFrontend.utils.youtube;
			} else {
				return;
			}

			$videoElement = $( '<iframe>', { src: apiProvider.getAutoplayURL( options.url ), allowfullscreen: 1 } );
		}

		const classes = this.getSettings( 'classes' ),
			$videoContainer = $( '<div>', { class: `${ classes.videoContainer } ${ classes.preventClose }` } ),
			$videoWrapper = $( '<div>', { class: classes.videoWrapper } );

		$videoWrapper.append( $videoElement );
		$videoContainer.append( $videoWrapper );

		const modal = this.getModal();
		modal.setMessage( $videoContainer );

		this.setVideoAspectRatio();

		const onHideMethod = modal.onHide;

		modal.onHide = function() {
			onHideMethod();

			this.$buttons = jQuery();
			this.focusedButton = null;

			modal.getElements( 'message' ).removeClass( 'elementor-fit-aspect-ratio' );
		};
	},

	getShareLinks() {
		const { i18n } = elementorFrontend.config,
			socialNetworks = {
				facebook: {
					label: i18n.shareOnFacebook,
					iconElement: facebook,
				},
				twitter: {
					label: i18n.shareOnTwitter,
					iconElement: twitter,
				},
				pinterest: {
					label: i18n.pinIt,
					iconElement: pinterest,
				},
			},
			$ = jQuery,
			classes = this.getSettings( 'classes' ),
			selectors = this.getSettings( 'selectors' ),
			$linkList = $( '<div>', { class: classes.slideshow.shareLinks } ),
			$activeSlide = this.getSlide( 'active' ),
			$image = $activeSlide.find( selectors.image ),
			videoUrl = $activeSlide.data( 'elementor-slideshow-video' );

		let itemUrl;

		if ( videoUrl ) {
			itemUrl = videoUrl;
		} else {
			itemUrl = $image.attr( 'src' );
		}

		$.each( socialNetworks, ( key, data ) => {
			const networkLabel = data.label,
				$link = $( '<a>', { href: this.createShareLink( key, itemUrl, $activeSlide.attr( 'data-e-action-hash' ) ), target: '_blank' } ).text( networkLabel ),
				$socialNetworkIconElement = this.isFontIconSvgExperiment ? $( data.iconElement.element ) : $( '<i>', { class: 'eicon-' + key, 'aria-hidden': 'true' } );

			$link.prepend( $socialNetworkIconElement );
			$linkList.append( $link );
		} );

		if ( ! videoUrl ) {
			const $downloadIcon = this.isFontIconSvgExperiment ? $( downloadBold.element ) : $( '<i>', { class: 'eicon-download-bold' } );

			$downloadIcon.attr( 'aria-label', i18n.download );

			$linkList.append( $( '<a>', { href: itemUrl, download: '' } )
				.text( i18n.downloadImage )
				.prepend( $downloadIcon ) );
		}

		return $linkList;
	},

	createShareLink( networkName, itemUrl, hash = null ) {
		const options = {};

		if ( 'pinterest' === networkName ) {
			options.image = encodeURIComponent( itemUrl );
		} else {
			options.url = encodeURIComponent( location.href.replace( /#.*/, '' ) + hash );
		}

		return ShareLink.getNetworkLink( networkName, options );
	},

	getSlideshowHeader() {
		const { i18n } = elementorFrontend.config,
			$ = jQuery,
			showCounter = 'yes' === elementorFrontend.getKitSettings( 'lightbox_enable_counter' ),
			showFullscreen = 'yes' === elementorFrontend.getKitSettings( 'lightbox_enable_fullscreen' ),
			showZoom = 'yes' === elementorFrontend.getKitSettings( 'lightbox_enable_zoom' ),
			showShare = 'yes' === elementorFrontend.getKitSettings( 'lightbox_enable_share' ),
			classes = this.getSettings( 'classes' ),
			slideshowClasses = classes.slideshow,
			elements = this.elements;

		if ( ! ( showCounter || showFullscreen || showZoom || showShare ) ) {
			return;
		}

		elements.$header = $( '<header>', { class: slideshowClasses.header + ' ' + classes.preventClose } );

		if ( showShare ) {
			const iconElement = this.isFontIconSvgExperiment ? shareArrow.element : '<i>';

			elements.$iconShare = $( iconElement, {
				class: slideshowClasses.iconShare,
				role: 'button',
				tabindex: 0,
				'aria-label': i18n.share,
				'aria-expanded': false,
			} ).append( $( '<span>' ) );

			const $shareLinks = $( '<div>' );

			$shareLinks.on( 'click', ( e ) => {
				e.stopPropagation();
			} );

			elements.$shareMenu = $( '<div>', { class: slideshowClasses.shareMenu } ).append( $shareLinks );

			elements.$iconShare.add( elements.$shareMenu ).on( 'click', this.toggleShareMenu );

			elements.$header.append( elements.$iconShare, elements.$shareMenu );

			this.$buttons = this.$buttons.add( elements.$iconShare );
		}

		if ( showZoom ) {
			const iconElement = this.isFontIconSvgExperiment ? zoomInBold.element : '<i>',
				showZoomElements = [],
				showZoomAttrs = {
					role: 'switch',
					tabindex: 0,
					'aria-checked': false,
					'aria-label': i18n.zoom,
				},
				zoomAttrs = {
					...showZoomAttrs,
				};

			if ( ! this.isFontIconSvgExperiment ) {
				zoomAttrs.class = slideshowClasses.iconZoomIn;
			}

			elements.$iconZoom = $( iconElement ).attr( zoomAttrs ).on( 'click', this.toggleZoomMode );

			showZoomElements.push( elements.$iconZoom );

			if ( this.isFontIconSvgExperiment ) {
				elements.$iconZoomOut = $( zoomOutBold.element )
					.attr( showZoomAttrs )
					.addClass( classes.hidden )
					.on( 'click', this.toggleZoomMode );

				showZoomElements.push( elements.$iconZoomOut );
			}

			elements.$header.append( showZoomElements );

			this.$buttons = this.$buttons.add( showZoomElements );
		}

		if ( showFullscreen ) {
			const iconElement = this.isFontIconSvgExperiment ? frameExpand.element : '<i>',
				fullScreenElements = [],
				fullScreenAttrs = {
					role: 'switch',
					tabindex: 0,
					'aria-checked': false,
					'aria-label': i18n.fullscreen,
				},
				expandAttrs = {
					...fullScreenAttrs,
				};

			// Only if the experiment is not active, we use the class-name in order to render the icon.
			if ( ! this.isFontIconSvgExperiment ) {
				expandAttrs.class = slideshowClasses.iconExpand;
			}

			elements.$iconExpand = $( iconElement )
				.append( $( '<span>' ), $( '<span>' ) )
				.attr( expandAttrs )
				.on( 'click', this.toggleFullscreen );

			fullScreenElements.push( elements.$iconExpand );

			if ( this.isFontIconSvgExperiment ) {
				elements.$iconMinimize = $( frameMinimize.element )
					.attr( fullScreenAttrs )
					.addClass( classes.hidden )
					.on( 'click', this.toggleFullscreen );

				fullScreenElements.push( elements.$iconMinimize );
			}

			elements.$header.append( fullScreenElements );
			this.$buttons = this.$buttons.add( fullScreenElements );
		}

		if ( showCounter ) {
			elements.$counter = $( '<span>', { class: slideshowClasses.counter } );
			elements.$header.append( elements.$counter );
		}

		return elements.$header;
	},

	toggleFullscreen() {
		if ( screenfull.isFullscreen ) {
			this.deactivateFullscreen();
		} else if ( screenfull.isEnabled ) {
			this.activateFullscreen();
		}
	},

	toggleZoomMode() {
		if ( 1 !== this.swiper.zoom.scale ) {
			this.deactivateZoom();
		} else {
			this.activateZoom();
		}
	},

	toggleShareMenu() {
		if ( this.shareMode ) {
			this.deactivateShareMode();
		} else {
			this.elements.$shareMenu.html( this.getShareLinks() );

			this.activateShareMode();
		}
	},

	activateShareMode() {
		const classes = this.getSettings( 'classes' );

		this.elements.$container.addClass( classes.slideshow.shareMode );

		this.elements.$iconShare.attr( 'aria-expanded', true );

		// Prevent swiper interactions while in share mode
		this.swiper.detachEvents();

		// Temporarily replace tabbable buttons with share-menu items
		this.$originalButtons = this.$buttons;
		this.$buttons = this.elements.$iconShare.add( this.elements.$shareMenu.find( 'a' ) );

		this.shareMode = true;
	},

	deactivateShareMode() {
		const classes = this.getSettings( 'classes' );

		this.elements.$container.removeClass( classes.slideshow.shareMode );
		this.elements.$iconShare.attr( 'aria-expanded', false );

		this.swiper.attachEvents();

		this.$buttons = this.$originalButtons;

		this.shareMode = false;
	},

	activateFullscreen() {
		const classes = this.getSettings( 'classes' );
		screenfull.request( this.elements.$container.parents( '.dialog-widget' )[ 0 ] );

		if ( this.isFontIconSvgExperiment ) {
			this.elements.$iconExpand.addClass( classes.hidden ).attr( 'aria-checked', 'false' );
			this.elements.$iconMinimize.removeClass( classes.hidden ).attr( 'aria-checked', 'true' );
		} else {
			this.elements.$iconExpand
				.removeClass( classes.slideshow.iconExpand )
				.addClass( classes.slideshow.iconShrink )
				.attr( 'aria-checked', 'true' );
		}

		this.elements.$container.addClass( classes.slideshow.fullscreenMode );
	},

	deactivateFullscreen() {
		const classes = this.getSettings( 'classes' );
		screenfull.exit();

		if ( this.isFontIconSvgExperiment ) {
			this.elements.$iconExpand.removeClass( classes.hidden ).attr( 'aria-checked', 'true' );
			this.elements.$iconMinimize.addClass( classes.hidden ).attr( 'aria-checked', 'false' );
		} else {
			this.elements.$iconExpand
				.removeClass( classes.slideshow.iconShrink )
				.addClass( classes.slideshow.iconExpand )
				.attr( 'aria-checked', 'false' );
		}

		this.elements.$container.removeClass( classes.slideshow.fullscreenMode );
	},

	activateZoom() {
		const swiper = this.swiper,
			elements = this.elements,
			classes = this.getSettings( 'classes' );

		swiper.zoom.in();
		swiper.allowSlideNext = false;
		swiper.allowSlidePrev = false;
		swiper.allowTouchMove = false;
		elements.$container.addClass( classes.slideshow.zoomMode );

		if ( this.isFontIconSvgExperiment ) {
			elements.$iconZoom.addClass( classes.hidden ).attr( 'aria-checked', 'false' );
			elements.$iconZoomOut.removeClass( classes.hidden ).attr( 'aria-checked', 'true' );
		} else {
			elements.$iconZoom.removeClass( classes.slideshow.iconZoomIn ).addClass( classes.slideshow.iconZoomOut );
		}
	},

	deactivateZoom() {
		const swiper = this.swiper,
			elements = this.elements,
			classes = this.getSettings( 'classes' );

		swiper.zoom.out();
		swiper.allowSlideNext = true;
		swiper.allowSlidePrev = true;
		swiper.allowTouchMove = true;
		elements.$container.removeClass( classes.slideshow.zoomMode );

		if ( this.isFontIconSvgExperiment ) {
			elements.$iconZoom.removeClass( classes.hidden ).attr( 'aria-checked', 'true' );
			elements.$iconZoomOut.addClass( classes.hidden ).attr( 'aria-checked', 'false' );
		} else {
			elements.$iconZoom.removeClass( classes.slideshow.iconZoomOut ).addClass( classes.slideshow.iconZoomIn );
		}
	},

	getSlideshowFooter() {
		const $ = jQuery,
			classes = this.getSettings( 'classes' ),
			$footer = $( '<footer>', { class: classes.slideshow.footer + ' ' + classes.preventClose } ),
			$title = $( '<div>', { class: classes.slideshow.title } ),
			$description = $( '<div>', { class: classes.slideshow.description } );

		$footer.append( $title, $description );

		return $footer;
	},

	setSlideshowContent( options ) {
		const { i18n } = elementorFrontend.config,
			$ = jQuery,
			isSingleSlide = 1 === options.slides.length,
			hasTitle = '' !== elementorFrontend.getKitSettings( 'lightbox_title_src' ),
			hasDescription = '' !== elementorFrontend.getKitSettings( 'lightbox_description_src' ),
			showFooter = hasTitle || hasDescription,
			classes = this.getSettings( 'classes' ),
			slideshowClasses = classes.slideshow,
			$container = $( '<div>', { class: slideshowClasses.container } ),
			$slidesWrapper = $( '<div>', { class: slideshowClasses.slidesWrapper } );

		let $prevButton, $nextButton;

		options.slides.forEach( ( slide ) => {
			let slideClass = slideshowClasses.slide + ' ' + classes.item;

			if ( slide.video ) {
				slideClass += ' ' + classes.video;
			}

			const $slide = $( '<div>', { class: slideClass } );

			if ( slide.video ) {
				$slide.attr( 'data-elementor-slideshow-video', slide.video );

				const playVideoLoadingElement = this.isFontIconSvgExperiment ? loading.element : '<i>',
					$playIcon = $( '<div>', { class: classes.playButton } )
						.html( $( playVideoLoadingElement ).attr( 'aria-label', i18n.playVideo ).addClass( classes.playButtonIcon ) );

				$slide.append( $playIcon );
			} else {
				const $zoomContainer = $( '<div>', { class: 'swiper-zoom-container' } ),
					$slidePlaceholder = $( '<div class="swiper-lazy-preloader"></div>' ),
					imageAttributes = {
						'data-src': slide.image,
						class: classes.image + ' ' + classes.preventClose + ' swiper-lazy',
					};

				if ( slide.title ) {
					imageAttributes[ 'data-title' ] = slide.title;
					imageAttributes.alt = slide.title;
				}

				if ( slide.description ) {
					imageAttributes[ 'data-description' ] = slide.description;
					imageAttributes.alt += ' - ' + slide.description;
				}

				const $slideImage = $( '<img>', imageAttributes );

				$zoomContainer.append( [ $slideImage, $slidePlaceholder ] );
				$slide.append( $zoomContainer );
			}

			if ( slide.hash ) {
				$slide.attr( 'data-e-action-hash', slide.hash );
			}

			$slidesWrapper.append( $slide );
		} );

		this.elements.$container = $container;
		this.elements.$header = this.getSlideshowHeader();

		$container
			.prepend( this.elements.$header )
			.append( $slidesWrapper );

		if ( ! isSingleSlide ) {
			const $prevButtonIcon = this.isFontIconSvgExperiment ? $( chevronLeft.element ) : $( '<i>', { class: slideshowClasses.prevButtonIcon, 'aria-hidden': 'true' } ),
				$nextButtonIcon = this.isFontIconSvgExperiment ? $( chevronRight.element ) : $( '<i>', { class: slideshowClasses.nextButtonIcon, 'aria-hidden': 'true' } ),
				$prevButtonLabel = $( '<span>', { class: 'screen-reader-text' } ).html( i18n.previous ),
				$nextButtonLabel = $( '<span>', { class: 'screen-reader-text' } ).html( i18n.next );

			$prevButton = $( '<div>', { class: slideshowClasses.prevButton + ' ' + classes.preventClose } ).append( $prevButtonIcon, $prevButtonLabel );
			$nextButton = $( '<div>', { class: slideshowClasses.nextButton + ' ' + classes.preventClose } ).append( $nextButtonIcon, $nextButtonLabel );

			$container.append(
				$nextButton,
				$prevButton,
			);

			this.$buttons = this.$buttons.add( $nextButton ).add( $prevButton );
		}

		if ( showFooter ) {
			this.elements.$footer = this.getSlideshowFooter();
			$container.append( this.elements.$footer );
		}

		this.setSettings( 'hideUiTimeout', '' );

		$container.on( 'click mousemove keypress', this.showLightboxUi );

		const modal = this.getModal();

		modal.setMessage( $container );

		const onShowMethod = modal.onShow;

		modal.onShow = async () => {
			onShowMethod();

			const swiperOptions = {
				pagination: {
					el: '.' + slideshowClasses.counter,
					type: 'fraction',
				},
				on: {
					slideChangeTransitionEnd: this.onSlideChange,
				},
				lazy: {
					loadPrevNext: true,
				},
				zoom: true,
				spaceBetween: 100,
				grabCursor: true,
				runCallbacksOnInit: false,
				loop: true,
				keyboard: true,
				handleElementorBreakpoints: true,
			};

			if ( ! isSingleSlide ) {
				swiperOptions.navigation = {
					prevEl: $prevButton[ 0 ],
					nextEl: $nextButton[ 0 ],
				};
			}

			if ( options.swiper ) {
				$.extend( swiperOptions, options.swiper );
			}

			const Swiper = elementorFrontend.utils.swiper;

			this.swiper = await new Swiper( $container, swiperOptions );

			// Expose the swiper instance in the frontend
			$container.data( 'swiper', this.swiper );

			this.setVideoAspectRatio();

			this.playSlideVideo();

			if ( showFooter ) {
				this.updateFooterText();
			}

			this.bindHotKeys();

			this.makeButtonsAccessible();
		};
	},

	makeButtonsAccessible() {
		this.$buttons
			.attr( 'tabindex', 0 )
			.on( 'keypress', ( event ) => {
				const ENTER_KEY = 13,
					SPACE_KEY = 32;

				if ( ENTER_KEY === event.which || SPACE_KEY === event.which ) {
					jQuery( event.currentTarget ).trigger( 'click' );
				}
			} );
	},

	showLightboxUi() {
		const slideshowClasses = this.getSettings( 'classes' ).slideshow;

		this.elements.$container.removeClass( slideshowClasses.hideUiVisibility );

		clearTimeout( this.getSettings( 'hideUiTimeout' ) );

		this.setSettings( 'hideUiTimeout', setTimeout( () => {
			if ( ! this.shareMode ) {
				this.elements.$container.addClass( slideshowClasses.hideUiVisibility );
			}
		}, 3500 ) );
	},

	bindHotKeys() {
		this.getModal().getElements( 'window' ).on( 'keydown', this.activeKeyDown );
	},

	unbindHotKeys() {
		this.getModal().getElements( 'window' ).off( 'keydown', this.activeKeyDown );
	},

	activeKeyDown( event ) {
		this.showLightboxUi();

		const TAB_KEY = 9;

		if ( event.which === TAB_KEY ) {
			const $buttons = this.$buttons;

			let focusedButton,
				isFirst = false,
				isLast = false;

			$buttons.each( ( index ) => {
				const item = $buttons[ index ];

				if ( jQuery( item ).is( ':focus' ) ) {
					focusedButton = item;
					isFirst = 0 === index;
					isLast = $buttons.length - 1 === index;
					return false;
				}
			} );

			if ( event.shiftKey ) {
				if ( isFirst ) {
					event.preventDefault();

					$buttons.last().trigger( 'focus' );
				}
			} else if ( isLast || ! focusedButton ) {
				event.preventDefault();

				$buttons.first().trigger( 'focus' );
			}
		}
	},

	setVideoAspectRatio( aspectRatio ) {
		aspectRatio = aspectRatio || this.getSettings( 'modalOptions.videoAspectRatio' );

		const $widgetContent = this.getModal().getElements( 'widgetContent' ),
			oldAspectRatio = this.oldAspectRatio,
			aspectRatioClass = this.getSettings( 'classes.aspectRatio' );

		this.oldAspectRatio = aspectRatio;

		if ( oldAspectRatio ) {
			$widgetContent.removeClass( aspectRatioClass.replace( '%s', oldAspectRatio ) );
		}

		if ( aspectRatio ) {
			$widgetContent.addClass( aspectRatioClass.replace( '%s', aspectRatio ) );
		}
	},

	getSlide( slideState ) {
		return jQuery( this.swiper.slides ).filter( this.getSettings( 'selectors.slideshow.' + slideState + 'Slide' ) );
	},

	updateFooterText() {
		if ( ! this.elements.$footer ) {
			return;
		}

		const classes = this.getSettings( 'classes' ),
			$activeSlide = this.getSlide( 'active' ),
			$image = $activeSlide.find( '.elementor-lightbox-image' ),
			titleText = $image.data( 'title' ),
			descriptionText = $image.data( 'description' ),
			$title = this.elements.$footer.find( '.' + classes.slideshow.title ),
			$description = this.elements.$footer.find( '.' + classes.slideshow.description );

		$title.text( titleText || '' );
		$description.text( descriptionText || '' );
	},

	playSlideVideo() {
		const $activeSlide = this.getSlide( 'active' ),
			videoURL = $activeSlide.data( 'elementor-slideshow-video' );

		if ( ! videoURL ) {
			return;
		}

		const classes = this.getSettings( 'classes' ),
			$videoContainer = jQuery( '<div>', { class: classes.videoContainer + ' ' + classes.invisible } ),
			$videoWrapper = jQuery( '<div>', { class: classes.videoWrapper } ),
			$playIcon = $activeSlide.children( '.' + classes.playButton );

		let videoType, apiProvider;

		$videoContainer.append( $videoWrapper );

		$activeSlide.append( $videoContainer );

		if ( -1 !== videoURL.indexOf( 'vimeo.com' ) ) {
			videoType = 'vimeo';
			apiProvider = elementorFrontend.utils.vimeo;
		} else if ( videoURL.match( /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com)/ ) ) {
			videoType = 'youtube';
			apiProvider = elementorFrontend.utils.youtube;
		}

		const videoID = apiProvider.getVideoIDFromURL( videoURL );

		apiProvider.onApiReady( ( apiObject ) => {
			if ( 'youtube' === videoType ) {
				this.prepareYTVideo( apiObject, videoID, $videoContainer, $videoWrapper, $playIcon );
			} else if ( 'vimeo' === videoType ) {
				this.prepareVimeoVideo( apiObject, videoURL, $videoContainer, $videoWrapper, $playIcon );
			}
		} );

		$playIcon.addClass( classes.playing ).removeClass( classes.hidden );
	},

	prepareYTVideo( YT, videoID, $videoContainer, $videoWrapper, $playIcon ) {
		const classes = this.getSettings( 'classes' ),
			$videoPlaceholderElement = jQuery( '<div>' );
		let startStateCode = YT.PlayerState.PLAYING;

		$videoWrapper.append( $videoPlaceholderElement );

		// Since version 67, Chrome doesn't fire the `PLAYING` state at start time
		if ( window.chrome ) {
			startStateCode = YT.PlayerState.UNSTARTED;
		}

		$videoContainer.addClass( 'elementor-loading' + ' ' + classes.invisible );

		this.player = new YT.Player( $videoPlaceholderElement[ 0 ], {
			videoId: videoID,
			events: {
				onReady: () => {
					$playIcon.addClass( classes.hidden );

					$videoContainer.removeClass( classes.invisible );

					this.player.playVideo();
				},
				onStateChange: ( event ) => {
					if ( event.data === startStateCode ) {
						$videoContainer.removeClass( 'elementor-loading' + ' ' + classes.invisible );
					}
				},
			},
			playerVars: {
				controls: 0,
				rel: 0,
			},
		} );
	},

	prepareVimeoVideo( Vimeo, videoURL, $videoContainer, $videoWrapper, $playIcon ) {
		const classes = this.getSettings( 'classes' ),
			vimeoOptions = {
				url: videoURL,
				autoplay: true,
				transparent: false,
				playsinline: false,
			};

		this.player = new Vimeo.Player( $videoWrapper, vimeoOptions );

		this.player.ready().then( () => {
			$playIcon.addClass( classes.hidden );

			$videoContainer.removeClass( classes.invisible );
		} );
	},

	setEntranceAnimation( animation ) {
		animation = animation || elementorFrontend.getCurrentDeviceSetting( this.getSettings( 'modalOptions' ), 'entranceAnimation' );

		const $widgetMessage = this.getModal().getElements( 'message' );

		if ( this.oldAnimation ) {
			$widgetMessage.removeClass( this.oldAnimation );
		}

		this.oldAnimation = animation;

		if ( animation ) {
			$widgetMessage.addClass( 'animated ' + animation );
		}
	},

	openSlideshow( slideshowID, initialSlideURL ) {
		const $allSlideshowLinks = jQuery( this.getSettings( 'selectors.links' ) ).filter( ( index, element ) => {
			const $element = jQuery( element );

			return slideshowID === element.dataset.elementorLightboxSlideshow && ! $element.parent( '.swiper-slide-duplicate' ).length && ! $element.parents( '.slick-cloned' ).length;
		} );

		const slides = [];

		let initialSlideIndex = 0;

		$allSlideshowLinks.each( function() {
			const slideVideo = this.dataset.elementorLightboxVideo;

			let slideIndex = this.dataset.elementorLightboxIndex;

			if ( undefined === slideIndex ) {
				slideIndex = $allSlideshowLinks.index( this );
			}

			if ( initialSlideURL === this.href || ( slideVideo && initialSlideURL === slideVideo ) ) {
				initialSlideIndex = slideIndex;
			}

			const slideData = {
				image: this.href,
				index: slideIndex,
				title: this.dataset.elementorLightboxTitle,
				description: this.dataset.elementorLightboxDescription,
				hash: this.getAttribute( 'data-e-action-hash' ),
			};

			if ( slideVideo ) {
				slideData.video = slideVideo;
			}

			slides.push( slideData );
		} );

		slides.sort( ( a, b ) => a.index - b.index );

		this.showModal( {
			type: 'slideshow',
			id: slideshowID,
			modalOptions: {
				id: 'elementor-lightbox-slideshow-' + slideshowID,
			},
			slideshow: {
				slides,
				swiper: {
					initialSlide: +initialSlideIndex,
				},
			},
		} );
	},

	onSlideChange() {
		this
			.getSlide( 'prev' )
			.add( this.getSlide( 'next' ) )
			.add( this.getSlide( 'active' ) )
			.find( '.' + this.getSettings( 'classes.videoWrapper' ) )
			.remove();

		this.playSlideVideo();

		this.updateFooterText();
	},
} );

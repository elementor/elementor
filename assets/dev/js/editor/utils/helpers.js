import ColorPicker from './color-picker';
import DocumentHelper from 'elementor-editor/document/helper-bc';
import ContainerHelper from 'elementor-editor-utils/container-helper';
import DOMPurify, { isValidAttribute } from 'dompurify';

const allowedHTMLWrapperTags = [
	'article',
	'aside',
	'div',
	'footer',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'main',
	'nav',
	'p',
	'section',
	'span',
];

module.exports = {
	container: ContainerHelper,
	document: DocumentHelper,

	_enqueuedFonts: {
		editor: [],
		preview: [],
	},
	_enqueuedIconFonts: [],
	_inlineSvg: [],

	elementsHierarchy: {
		document: {
			section: {
				column: {
					widget: null,
					section: null,
					container: {
						widget: null,
						container: null,
					},
				},
			},
			container: {
				widget: null,
				container: null,
			},
		},
	},

	/**
	 * @param {string}                   url
	 * @param {jQuery}                   $document
	 * @param {{ crossOrigin: boolean }} options
	 */
	enqueueCSS( url, $document, options = {} ) {
		const selector = 'link[href="' + url + '"]';
		const link = document.createElement( 'link' );

		link.href = url;
		link.rel = 'stylesheet';
		link.type = 'text/css';

		if ( options.crossOrigin ) {
			link.crossOrigin = 'anonymous';
		}

		if ( ! $document ) {
			return;
		}

		if ( ! $document.find( selector ).length ) {
			$document.find( 'link' ).last().after( link );
		}
	},

	enqueuePreviewStylesheet( url ) {
		this.enqueueCSS( url, elementor.$previewContents );
	},

	enqueueEditorStylesheet( url ) {
		this.enqueueCSS( url, elementorCommon.elements.$document );
	},

	/**
	 * @param {string} url
	 * @deprecated since 2.6.0, use `elementor.helpers.enqueuePreviewStylesheet()` instead.
	 */
	enqueueStylesheet( url ) {
		elementorDevTools.deprecation.deprecated( 'elementor.helpers.enqueueStylesheet()', '2.6.0', 'elementor.helpers.enqueuePreviewStylesheet()' );
		this.enqueuePreviewStylesheet( url );
	},

	fetchInlineSvg( svgUrl, callback = false ) {
		fetch( svgUrl )
			.then( ( response ) => response.ok ? response.text() : '' )
			.then( ( data ) => {
				if ( callback ) {
					callback( data );
				}
			} );
	},

	getInlineSvg( value, view ) {
		if ( ! value.id ) {
			return;
		}

		if ( Object.prototype.hasOwnProperty.call( this._inlineSvg, value.id ) ) {
			return this._inlineSvg[ value.id ];
		}

		const self = this;
		this.fetchInlineSvg( value.url, ( data ) => {
			if ( data ) {
				self._inlineSvg[ value.id ] = data; // $( data ).find( 'svg' )[ 0 ].outerHTML;
				if ( view ) {
					view.render();
				}
				elementor.channels.editor.trigger( 'svg:insertion', data, value.id );
			}
		} );
	},

	enqueueIconFonts( iconType ) {
		if ( -1 !== this._enqueuedIconFonts.indexOf( iconType ) || !! elementor.config.icons_update_needed ) {
			return;
		}

		const iconSetting = this.getIconLibrarySettings( iconType );
		if ( ! iconSetting ) {
			return;
		}

		if ( iconSetting.enqueue ) {
			iconSetting.enqueue.forEach( ( assetURL ) => {
				const versionAddedURL = `${ assetURL }${ iconSetting?.ver ? '?ver=' + iconSetting.ver : '' }`;
				this.enqueuePreviewStylesheet( versionAddedURL );
				this.enqueueEditorStylesheet( versionAddedURL );
			} );
		}

		if ( iconSetting.url ) {
			const versionAddedURL = `${ iconSetting.url }${ iconSetting?.ver ? '?ver=' + iconSetting.ver : '' }`;
			this.enqueuePreviewStylesheet( versionAddedURL );
			this.enqueueEditorStylesheet( versionAddedURL );
		}

		this._enqueuedIconFonts.push( iconType );

		elementor.channels.editor.trigger( 'fontIcon:insertion', iconType, iconSetting );
	},

	getIconLibrarySettings( iconType ) {
		const iconSetting = elementor.config.icons.libraries.filter( ( library ) => iconType === library.name );
		if ( iconSetting[ 0 ] && iconSetting[ 0 ].name ) {
			return iconSetting[ 0 ];
		}
		return false;
	},

	/**
	 *
	 * @param {*}      view       - view to refresh if needed
	 * @param {*}      icon       - icon control data
	 * @param {*}      attributes - default {} - attributes to attach to rendered html tag
	 * @param {string} tag        - default i - html tag to render
	 * @param {*}      returnType - default value - return type
	 * @return {string|undefined|*} result
	 */
	renderIcon( view, icon, attributes = {}, tag = 'i', returnType = 'value' ) {
		if ( ! icon || ! icon.library ) {
			if ( 'object' === returnType ) {
				return {
					rendered: false,
				};
			}
			return;
		}

		const iconType = icon.library,
			iconValue = icon.value;
		if ( 'svg' === iconType ) {
			if ( 'panel' === returnType ) {
				return '<img src="' + iconValue.url + '">';
			}
			return {
				rendered: true,
				value: this.getInlineSvg( iconValue, view ),
			};
		}
		const iconSettings = this.getIconLibrarySettings( iconType );
		if ( iconSettings && ! Object.prototype.hasOwnProperty.call( iconSettings, 'isCustom' ) ) {
			this.enqueueIconFonts( iconType );
			if ( 'panel' === returnType ) {
				return '<' + tag + ' class="' + iconValue + '"></' + tag + '>';
			}
			const tagUniqueID = tag + elementorCommon.helpers.getUniqueId();
			view.addRenderAttribute( tagUniqueID, attributes );
			view.addRenderAttribute( tagUniqueID, 'class', iconValue );
			const htmlTag = '<' + tag + ' ' + view.getRenderAttributeString( tagUniqueID ) + '></' + tag + '>';
			if ( 'object' === returnType ) {
				return {
					rendered: true,
					value: htmlTag,
				};
			}
			return htmlTag;
		}
		elementor.channels.editor.trigger( 'Icon:insertion', iconType, iconValue, attributes, tag, view );
		if ( 'object' === returnType ) {
			return {
				rendered: false,
			};
		}
	},

	isIconMigrated( settings, controlName ) {
		return settings.__fa4_migrated && settings.__fa4_migrated[ controlName ];
	},

	fetchFa4ToFa5Mapping() {
		const storageKey = 'fa4Tofa5Mapping';
		let mapping = elementorCommon.storage.get( storageKey );
		if ( ! mapping ) {
			jQuery.getJSON( elementor.config.fa4_to_fa5_mapping_url, ( data ) => {
				mapping = data;
				elementorCommon.storage.set( storageKey, data );
			} );
		}
		return mapping;
	},

	mapFa4ToFa5( fa4Value ) {
		const mapping = this.fetchFa4ToFa5Mapping();
		if ( mapping[ fa4Value ] ) {
			return mapping[ fa4Value ];
		}
		// Every thing else is converted to solid
		return {
			value: 'fas' + fa4Value.replace( 'fa ', ' ' ),
			library: 'fa-solid',
		};
	},

	// The target parameter = 'editor'/'preview'. Defaults to 'preview' for backwards compatibility.
	enqueueFont( font, target = 'preview' ) {
		if ( $e.devTools ) {
			$e.devTools.log.info( `enqueueFont font: '${ font }', target: '${ target }'` );
		}

		if ( -1 !== this._enqueuedFonts[ target ].indexOf( font ) ) {
			return;
		}

		const fontType = elementor.config.controls.font.options[ font ],
			subsets = {
				ru_RU: 'cyrillic',
				uk: 'cyrillic',
				bg_BG: 'cyrillic',
				vi: 'vietnamese',
				el: 'greek',
				he_IL: 'hebrew',
			};

		const enqueueOptions = {};

		let	fontUrl;

		switch ( fontType ) {
			case 'googlefonts':
				fontUrl = 'https://fonts.googleapis.com/css?family=' + font + ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic';

				if ( subsets[ elementor.config.locale ] ) {
					fontUrl += '&subset=' + subsets[ elementor.config.locale ];
				}

				enqueueOptions.crossOrigin = true;

				break;

			case 'earlyaccess': {
				const fontLowerString = font.replace( /\s+/g, '' ).toLowerCase();
				fontUrl = 'https://fonts.googleapis.com/earlyaccess/' + fontLowerString + '.css';

				enqueueOptions.crossOrigin = true;
				break;
			}
		}

		if ( ! _.isEmpty( fontUrl ) ) {
			if ( 'editor' === target ) {
				// TODO: Find better solution, temporary fix, covering issue: 'fonts does not rendered in global styles'.
				this.enqueueCSS( fontUrl, elementorCommon.elements.$document );
			} else {
				this.enqueueCSS( fontUrl, elementor.$previewContents, enqueueOptions );
			}
		}

		this._enqueuedFonts[ target ].push( font );

		elementor.channels.editor.trigger( 'font:insertion', fontType, font );
	},

	resetEnqueuedFontsCache() {
		this._enqueuedFonts = {
			editor: [],
			preview: [],
		};
		this._enqueuedIconFonts = [];
	},

	getElementChildType( elementType, container ) {
		if ( ! container ) {
			container = this.elementsHierarchy;
		}

		if ( undefined !== container[ elementType ] ) {
			if ( jQuery.isPlainObject( container[ elementType ] ) ) {
				return Object.keys( container[ elementType ] );
			}

			return null;
		}

		let result = null;

		jQuery.each( container, ( index, type ) => {
			if ( ! jQuery.isPlainObject( type ) ) {
				return;
			}

			const childType = this.getElementChildType( elementType, type );

			if ( childType ) {
				result = childType;
				return false;
			}
		} );

		return result;
	},

	/**
	 * @deprecated since 3.0.0, use `elementorCommon.helpers.getUniqueId()` instead.
	 */
	getUniqueID() {
		elementorDevTools.deprecation.deprecated( 'elementor.helpers.getUniqueID()', '3.0.0', 'elementorCommon.helpers.getUniqueId()' );

		return elementorCommon.helpers.getUniqueId();
	},

	getSocialNetworkNameFromIcon( iconsControl, fallbackControl, toUpperCase = false, migrated = null, withIcon = false ) {
		let social = '',
			icon = '';
		if ( fallbackControl && ! migrated ) {
			social = fallbackControl.replace( 'fa fa-', '' );
			icon = '<i class="' + fallbackControl + '"></i>';
		} else if ( iconsControl.value && 'svg' !== iconsControl.library ) {
			social = iconsControl.value.split( ' ' )[ 1 ];
			if ( ! social ) {
				social = '';
			} else {
				social = social.replace( 'fa-', '' );
			}
			icon = this.renderIcon( null, iconsControl, {}, 'i', 'panel' );
		} else {
			icon = this.renderIcon( null, iconsControl, {}, 'i', 'panel' );
		}
		if ( '' !== social && toUpperCase ) {
			social = social.split( '-' ).join( ' ' );
			social = social.replace( /\b\w/g, ( letter ) => letter.toUpperCase() );
		}
		social = elementor.hooks.applyFilters( 'elementor/social_icons/network_name', social, iconsControl, fallbackControl, toUpperCase, withIcon );
		if ( withIcon ) {
			social = icon + ' ' + social;
		}
		return social;
	},

	getSimpleDialog( id, title, message, confirmString, onConfirm ) {
		return elementorCommon.dialogsManager.createWidget( 'confirm', {
			id,
			headerMessage: title,
			message,
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: confirmString,
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm,
		} );
	},

	maybeDisableWidget( givenWidgetType = null ) {
		if ( ! elementor.config.icons_update_needed ) {
			return false;
		}

		const elementView = elementor.channels.panelElements.request( 'element:selected' ),
			widgetType = givenWidgetType || elementView.model.get( 'widgetType' ),
			widgetData = elementor.widgetsCache[ widgetType ],
			hasControlOfType = ( controls, type ) => {
				let has = false;
				jQuery.each( controls, ( controlName, controlData ) => {
					if ( type === controlData.type ) {
						has = true;
						return false;
					}
					if ( controlData.is_repeater ) {
						has = hasControlOfType( controlData.fields, type );
						if ( has ) {
							return false;
						}
					}
				} );
				return has;
			};

		if ( widgetData ) {
			const hasIconsControl = hasControlOfType( widgetData.controls, 'icons' );
			if ( hasIconsControl ) {
				const onConfirm = () => {
					window.location.href = elementor.config.tools_page_link +
						'&redirect_to_document=' + elementor.documents.getCurrent()?.id +
						'&_wpnonce=' + elementor.config.tools_page_nonce +
						'#tab-fontawesome4_migration';
				};
				elementor.helpers.getSimpleDialog(
					'elementor-enable-fa5-dialog',
					__( 'Elementor\'s New Icon Library', 'elementor' ),
					__( 'Elementor v2.6 includes an upgrade from Font Awesome 4 to 5. In order to continue using icons, be sure to click "Update".', 'elementor' ) + ' <a href="https://go.elementor.com/fontawesome-migration/" target="_blank">' + __( 'Learn More', 'elementor' ) + '</a>',
					__( 'Update', 'elementor' ),
					onConfirm,
				).show();
				return true;
			}
		}
		return false;
	},

	/**
	 * @param {string} string
	 * @param {string} replaces
	 * @deprecated since 2.0.0, use native JS `.replace()` method.
	 */
	stringReplaceAll( string, replaces ) {
		elementorDevTools.deprecation.deprecated( 'elementor.helpers.stringReplaceAll()', '2.0.0', 'Use native JS `.replace()` method.' );

		var re = new RegExp( Object.keys( replaces ).join( '|' ), 'gi' );

		return string.replace( re, function( matched ) {
			return replaces[ matched ];
		} );
	},

	isActiveControl( controlModel, values, controls ) {
		const condition = controlModel.condition || controlModel.get?.( 'condition' );
		let conditions = controlModel.conditions || controlModel.get?.( 'conditions' );

		// If there is a 'condition' format, convert it to a 'conditions' format.
		if ( condition ) {
			const terms = [];

			Object.entries( condition ).forEach( ( [ conditionName, conditionValue ] ) => {
				const convertedCondition = elementor.conditions.convertConditionToConditions( conditionName, conditionValue, controlModel, values, controls );

				terms.push( convertedCondition );
			} );

			conditions = {
				relation: 'and',
				terms: conditions ? terms.concat( conditions ) : terms,
			};
		}

		return ! ( conditions && ! elementor.conditions.check( conditions, values, controls ) );
	},

	/**
	 * @param {Object} object - An object to clone.
	 * @deprecated since 2.3.0, use `elementorCommon.helpers.cloneObject()` instead.
	 */
	cloneObject( object ) {
		elementorDevTools.deprecation.deprecated( 'elementor.helpers.cloneObject( object )', '2.3.0', 'elementorCommon.helpers.cloneObject( object )' );

		return elementorCommon.helpers.cloneObject( object );
	},

	disableElementEvents( $element ) {
		$element.each( function() {
			const currentPointerEvents = this.style.pointerEvents;

			if ( 'none' === currentPointerEvents ) {
				return;
			}

			jQuery( this )
				.data( 'backup-pointer-events', currentPointerEvents )
				.css( 'pointer-events', 'none' );
		} );
	},

	enableElementEvents( $element ) {
		$element.each( function() {
			const $this = jQuery( this ),
				backupPointerEvents = $this.data( 'backup-pointer-events' );

			if ( undefined === backupPointerEvents ) {
				return;
			}

			$this
				.removeData( 'backup-pointer-events' )
				.css( 'pointer-events', backupPointerEvents );
		} );
	},

	/**
	 * @param {*} $element
	 * @deprecated since 2.8.0, use `new ColorPicker( { picker: { el: $element } } )` instead.
	 */
	wpColorPicker( $element ) {
		elementorDevTools.deprecation.deprecated( 'elementor.helpers.wpColorPicker( $element )', '2.8.0', 'new ColorPicker( { picker: { el: $element } } )' );

		return new ColorPicker( { picker: { el: $element } } );
	},

	isInViewport( element, html ) {
		const rect = element.getBoundingClientRect();
		html = html || document.documentElement;
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= ( window.innerHeight || html.clientHeight ) &&
			rect.right <= ( window.innerWidth || html.clientWidth )
		);
	},

	scrollToView( $element, timeout, $parent ) {
		if ( undefined === timeout ) {
			timeout = 500;
		}

		let $scrolled = $parent;
		const $elementorFrontendWindow = elementorFrontend.elements.$window;

		if ( ! $parent ) {
			$parent = $elementorFrontendWindow;

			$scrolled = elementor.$previewContents.find( 'html, body' );
		}

		setTimeout( function() {
			// Sometimes element removed during the timeout.
			if ( ! $element[ 0 ].isConnected ) {
				return;
			}

			const parentHeight = $parent.height(),
				parentScrollTop = $parent.scrollTop(),
				elementTop = $parent === $elementorFrontendWindow ? $element.offset().top : $element[ 0 ].offsetTop,
				topToCheck = elementTop - parentScrollTop;

			if ( topToCheck > 0 && topToCheck < parentHeight ) {
				return;
			}

			const scrolling = elementTop - ( parentHeight / 2 );

			$scrolled.stop( true ).animate( { scrollTop: scrolling }, 1000 );
		}, timeout );
	},

	getElementInlineStyle( $element, properties ) {
		const style = {},
			elementStyle = $element[ 0 ].style;

		properties.forEach( ( property ) => {
			style[ property ] = undefined !== elementStyle[ property ] ? elementStyle[ property ] : '';
		} );

		return style;
	},

	cssWithBackup( $element, backupState, rules ) {
		const cssBackup = this.getElementInlineStyle( $element, Object.keys( rules ) );

		$element
			.data( 'css-backup-' + backupState, cssBackup )
			.css( rules );
	},

	recoverCSSBackup( $element, backupState ) {
		const backupKey = 'css-backup-' + backupState;

		$element.css( $element.data( backupKey ) );

		$element.removeData( backupKey );
	},

	elementSizeToUnit( $element, size, unit ) {
		const window = elementorFrontend.elements.window;

		switch ( unit ) {
			case '%':
				size = ( size / ( $element.offsetParent().width() / 100 ) );
				break;
			case 'vw':
				size = ( size / ( window.innerWidth / 100 ) );
				break;
			case 'vh':
				size = ( size / ( window.innerHeight / 100 ) );
		}

		return Math.round( size * 1000 ) / 1000;
	},

	compareVersions( versionA, versionB, operator ) {
		const prepareVersion = ( version ) => {
			version = version + '';

			return version.replace( /[^\d.]+/, '.-1.' );
		};

		versionA = prepareVersion( versionA );
		versionB = prepareVersion( versionB );

		if ( versionA === versionB ) {
			return ! operator || /^={2,3}$/.test( operator );
		}

		const versionAParts = versionA.split( '.' ).map( Number ),
			versionBParts = versionB.split( '.' ).map( Number ),
			longestVersionParts = Math.max( versionAParts.length, versionBParts.length );

		for ( let i = 0; i < longestVersionParts; i++ ) {
			const valueA = versionAParts[ i ] || 0,
				valueB = versionBParts[ i ] || 0;

			if ( valueA !== valueB ) {
				return elementor.conditions.compare( valueA, valueB, operator );
			}
		}
	},

	getModelLabel( model ) {
		let result;

		if ( ! ( model instanceof Backbone.Model ) ) {
			model = new Backbone.Model( model );
		}

		if ( model.get( 'labelSuffix' ) ) {
			result = model.get( 'title' ) + ' ' + model.get( 'labelSuffix' );
		} else if ( 'global' === model.get( 'widgetType' ) ) {
			if ( model.getTitle ) {
				result = model.getTitle();
			}
		}

		if ( ! result ) {
			result = elementor.getElementData( model ).title;
		}

		return result;
	},

	hasPro() {
		return !! window.elementorPro;
	},

	hasProAndNotConnected() {
		return elementor.helpers.hasPro() && elementorProEditorConfig.urls.connect;
	},

	/**
	 * Function validateHTMLTag().
	 *
	 * Validate an HTML tag against a safe allowed list.
	 *
	 * @param {string} tag
	 *
	 * @return {string} the tag, if it is valid, otherwise, 'div'
	 */
	validateHTMLTag( tag ) {
		return allowedHTMLWrapperTags.includes( tag.toLowerCase() ) ? tag : 'div';
	},

	convertSizeToFrString( size ) {
		if ( 'number' !== typeof size || size <= 0 ) {
			return size;
		}

		const frString = Array.from( { length: size }, () => '1fr' ).join( ' ' );
		return frString;
	},

	sanitize( value, options ) {
		return DOMPurify.sanitize( value, options );
	},

	sanitizeUrl( url ) {
		const isValidUrl = !! url ? isValidAttribute( 'a', 'href', url ) : false;

		return isValidUrl ? url : '';
	},
};

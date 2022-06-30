export default class View extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-templates-responsive-bar';
	}

	id() {
		return 'e-responsive-bar';
	}

	ui() {
		const prefix = '#' + this.id();

		return {
			viewPage: '#elementor-panel-footer-sub-menu-item-view-page',
			wpDashboard: '#elementor-panel-footer-sub-menu-item-wp-dashboard',
			themeBuilder: '#elementor-panel-footer-sub-menu-item-theme-builder',
			addWidgets: '#elementor-panel-footer-add-widgets',
			globalStyles: '#elementor-panel-footer-global-styles',
			pageSettings: '#elementor-panel-footer-sub-menu-item-page-settings',
			siteSettings: '#elementor-panel-footer-sub-menu-item-site-settings',
			moreItems: '.e-more-item',
			menuButtons: '.elementor-panel-footer-tool',
			switcherInput: '.e-responsive-bar-switcher__option input',
			switcherLabel: '.e-responsive-bar-switcher__option',
			switcher: prefix + '-switcher',
			sizeInputWidth: prefix + '__input-width',
			sizeInputHeight: prefix + '__input-height',
			scaleValue: prefix + '-scale__value',
			scalePlusButton: prefix + '-scale__plus',
			scaleMinusButton: prefix + '-scale__minus',
			scaleResetButton: prefix + '-scale__reset',
			breakpointSettingsButton: prefix + '__settings-button',
			buttonPreview: '#elementor-panel-footer-saver-preview',
			settings: '#elementor-panel-footer-page-settings',
			saveTemplate: '#elementor-panel-footer-sub-menu-item-save-template',
			history: '#elementor-panel-footer-history',
			navigator: '#elementor-panel-footer-navigator',
			finder: '#elementor-panel-footer-finder',
			subItems: '.elementor-toggle-state .elementor-panel-footer-sub-menu-item',
		};
	}

	events() {
		return {
			'click @ui.viewPage': 'onViewPageClick',
			'click @ui.subItems': 'onSubItemClick',
			'click @ui.themeBuilder': 'onThemeBuilderClick',
			'click @ui.wpDashboard': 'onWpDashboardClick',
			'click @ui.addWidgets': 'onAddWidgetsClick',
			'click @ui.pageSettings': 'onPageSettingsClick',
			'click @ui.siteSettings': 'onSiteSettingsClick',
			'click @ui.moreItems': 'onMoreItemClick',
			'click @ui.menuButtons': 'onMenuButtonsClick',
			'change @ui.switcherInput': 'onBreakpointSelected',
			'input @ui.sizeInputWidth': 'onSizeInputChange',
			'input @ui.sizeInputHeight': 'onSizeInputChange',
			'click @ui.scalePlusButton': 'onScalePlusButtonClick',
			'click @ui.scaleMinusButton': 'onScaleMinusButtonClick',
			'click @ui.scaleResetButton': 'onScaleResetButtonClick',
			'click @ui.breakpointSettingsButton': 'onBreakpointSettingsOpen',
			'click @ui.buttonPreview': 'onClickButtonPreview',
			'click @ui.settings': 'onSettingsClick',
			'click @ui.saveTemplate': 'onSaveTemplateClick',
			'click @ui.history': 'onHistoryClick',
			'click @ui.navigator': 'onNavigatorClick',
			'click @ui.finder': 'onFinderClick',

		};
	}

	syncState() {
		const activeHandlers = [
			{
				element: this.ui.addWidgets,
				isActive: () => 'elements' === elementor.panel.currentView.getCurrentPageName() && elementor.panel.$el.is( ':visible' ),
			},
			{
				element: this.ui.navigator,
				isActive: () => elementor.navigator.isOpen(),
			},
			{
				element: this.ui.history,
				isActive: () => 'historyPage' === elementor.panel.currentView.getCurrentPageName() && elementor.panel.$el.is( ':visible' ),
			},
			{
				element: this.ui.globalStyles,
				isActive: () => [ 'kit_menu', 'page_settings' ].includes( elementor.panel.currentView.getCurrentPageName() ) && elementor.panel.$el.is( ':visible' ),
			},
		];

		activeHandlers.forEach( ( handler ) => {
			handler.element.toggleClass( 'active', handler.isActive() );
		} );
	}

	behaviors() {
		var behaviors = {
			saver: {
				behaviorClass: elementor.modules.components.saver.behaviors.FooterSaver,
			},
		};

		return elementor.hooks.applyFilters( 'panel/footer/behaviors', behaviors, this );
	}

	initialize() {
		this.listenTo( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
		this.listenTo( elementor.channels.responsivePreview, 'resize', this.onPreviewResize );
		this.listenTo( elementor.channels.responsivePreview, 'open', this.onPreviewOpen );
		this.listenTo( elementor.channels.deviceMode, 'close', this.resetScale );

		document.addEventListener( 'click', this.syncState.bind( this ) );
		document.addEventListener( 'mousemove', this.syncState.bind( this ) );
	}

	// addTipsyToIconButtons() {
	// 	this.ui.switcherLabel.add( this.ui.breakpointSettingsButton ).tipsy(
	// 		{
	// 			html: true,
	// 			gravity: 'n',
	// 			title() {
	// 				return jQuery( this ).data( 'tooltip' );
	// 			},
	// 		}
	// 	);
	// }

	restoreLastValidPreviewSize() {
		const lastSize = elementor.channels.responsivePreview.request( 'size' );

		this.ui.sizeInputWidth
			.val( lastSize.width )
			.tipsy( {
				html: true,
				trigger: 'manual',
				gravity: 'n',
				title: () => __( 'The value inserted isn\'t in the breakpoint boundaries', 'elementor' ),
			} );

		const tipsy = this.ui.sizeInputWidth.data( 'tipsy' );

		tipsy.show();

		setTimeout( () => tipsy.hide(), 3000 );
	}

	autoScale() {
		const handlesWidth = 40 * this.scalePercentage / 100,
			previewWidth = elementor.$previewWrapper.width() - handlesWidth,
			iframeWidth = parseInt( elementor.$preview.css( '--e-editor-preview-width' ) ),
			iframeScaleWidth = iframeWidth * this.scalePercentage / 100;

		if ( iframeScaleWidth > previewWidth ) {
			const scalePercentage = previewWidth / iframeWidth * 100;

			this.setScalePercentage( scalePercentage );
		} else {
			this.setScalePercentage();
		}

		this.scalePreview();
	}

	scalePreview() {
		const scale = this.scalePercentage / 100;
		elementor.$previewWrapper.css( '--e-preview-scale', scale );
	}

	resetScale() {
		this.setScalePercentage();
		this.scalePreview();
	}

	setScalePercentage( scalePercentage = 100 ) {
		this.scalePercentage = scalePercentage;
		this.ui.scaleValue.text( parseInt( this.scalePercentage ) );
	}

	onRender() {
		// this.addTipsyToIconButtons();
		this.setScalePercentage();
		this.addMoreItems();
	}

	onDeviceModeChange() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			$currentDeviceSwitcherInput = this.ui.switcherInput.filter( '[value=' + currentDeviceMode + ']' );

		this.setWidthHeightInputsEditableState();

		this.ui.switcherLabel.attr( 'aria-selected', false );
		$currentDeviceSwitcherInput.closest( 'label' ).attr( 'aria-selected', true );

		if ( ! $currentDeviceSwitcherInput.prop( 'checked' ) ) {
			$currentDeviceSwitcherInput.prop( 'checked', true );
		}
	}

	onBreakpointSelected( e ) {
		const selectedDeviceMode = e.target.value;

		elementor.changeDeviceMode( selectedDeviceMode, false );

		this.autoScale();
	}

	onBreakpointSettingsOpen() {
		const isWPPreviewMode = elementorCommon.elements.$body.hasClass( 'elementor-editor-preview' );

		if ( isWPPreviewMode ) {
			elementor.exitPreviewMode();
		}

		const isInSettingsPanelActive = 'panel/global/menu' === elementor.documents.currentDocument.config.panel.default_route;

		if ( isInSettingsPanelActive ) {
			$e.run( 'panel/global/close' );

			return;
		}

		//  Open Settings Panel for Global/Layout/Breakpoints Settings
		$e.run( 'editor/documents/switch', {
			id: elementor.config.kit_id,
			mode: 'autosave',
		} )
			.then( () => $e.route( 'panel/global/settings-layout' ) )
			// TODO: Replace with a standard routing solution once one is available
			.then( () => jQuery( '.elementor-control-section_breakpoints' ).trigger( 'click' ) );
	}

	onPreviewResize() {
		if ( this.updatingPreviewSize ) {
			return;
		}

		const size = elementor.channels.responsivePreview.request( 'size' );

		this.ui.sizeInputWidth.val( Math.round( size.width ) );
		this.ui.sizeInputHeight.val( Math.round( size.height ) );
	}

	onPreviewOpen() {
		this.setWidthHeightInputsEditableState();
	}

	setWidthHeightInputsEditableState() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
		// TODO: disable inputs
		if ( 'desktop' === currentDeviceMode ) {
			this.ui.sizeInputWidth.attr( 'disabled', 'disabled' );
			this.ui.sizeInputHeight.attr( 'disabled', 'disabled' );
		} else {
			this.ui.sizeInputWidth.removeAttr( 'disabled' );
			this.ui.sizeInputHeight.removeAttr( 'disabled' );
		}
	}

	onCloseButtonClick() {
		elementor.changeDeviceMode( 'desktop' );
		// Force exit if device mode is already desktop
		elementor.exitDeviceMode();
	}

	onSizeInputChange() {
		clearTimeout( this.restorePreviewSizeTimeout );

		const size = {
			width: this.ui.sizeInputWidth.val(),
			height: this.ui.sizeInputHeight.val(),
		};

		const currentDeviceConstrains = elementor.getCurrentDeviceConstrains();

		if ( size.width < currentDeviceConstrains.minWidth || size.width > currentDeviceConstrains.maxWidth ) {
			this.restorePreviewSizeTimeout = setTimeout( () => this.restoreLastValidPreviewSize(), 1500 );

			return;
		}

		this.updatingPreviewSize = true;

		setTimeout( () => this.updatingPreviewSize = false, 300 );

		elementor.updatePreviewSize( size );

		this.autoScale();
	}

	onScalePlusButtonClick() {
		const scaleUp = 0 === this.scalePercentage % 10 ? this.scalePercentage + 10 : Math.ceil( this.scalePercentage / 10 ) * 10;

		if ( scaleUp > 200 ) {
			return;
		}

		this.setScalePercentage( scaleUp );
		this.scalePreview();
	}

	onScaleMinusButtonClick() {
		const scaleDown = 0 === this.scalePercentage % 10 ? this.scalePercentage - 10 : Math.floor( this.scalePercentage / 10 ) * 10;

		if ( scaleDown < 50 ) {
			return;
		}

		this.setScalePercentage( scaleDown );
		this.scalePreview();
	}

	onScaleResetButtonClick() {
		this.resetScale();
	}

	onMenuButtonsClick( event ) {
		var $tool = jQuery( event.currentTarget );

		// If the tool is not toggleable or the click is inside of a tool
		if ( ! $tool.hasClass( 'elementor-toggle-state' ) || jQuery( event.target ).closest( '.elementor-panel-footer-sub-menu-item' ).length ) {
			return;
		}

		var isOpen = $tool.hasClass( 'elementor-open' );

		this.ui.menuButtons.not( '.elementor-leave-open' ).removeClass( 'elementor-open' );

		if ( ! isOpen ) {
			$tool.addClass( 'elementor-open' );
		}
	}

	onSubItemClick( event ) {
		const $tool = jQuery( event.currentTarget );

		$tool.parents( '.elementor-toggle-state' ).removeClass( 'elementor-open' );
	}

	onClickButtonPreview() {
		$e.run( 'editor/documents/preview', { id: elementor.documents.getCurrent().id } );
	}

	onSettingsClick() {
		$e.route( 'panel/page-settings/settings' );
	}

	onSaveTemplateClick() {
		$e.route( 'library/save-template' );
	}

	onHistoryClick() {
		if ( elementor.panel.$el.is( ':visible' ) ) {
			elementor.panel.close();
		} else {
			$e.run( 'panel/open' );
			$e.route( 'panel/history/actions' );
		}
	}

	onNavigatorClick() {
		if ( elementor.navigator.isOpen() ) {
			if ( elementor.navigator.isDocked && elementor.panel.$el.is( ':visible' ) ) {
				elementor.panel.close();
			} else {
				elementor.navigator.close();
			}
		} else {
			$e.run( 'navigator/open' );
		}
	}

	onFinderClick() {
		$e.route( 'finder' );
	}

	onViewPageClick() {
		window.open( elementor.documents.getCurrent().config.urls.permalink, '_blank' );
	}

	onThemeBuilderClick() {
		$e.run( 'app/open' );
	}

	onWpDashboardClick() {
		window.location.href = elementor.config.document.urls.exit_to_dashboard;
	}

	onAddWidgetsClick() {
		if ( elementor.panel.$el.is( ':visible' ) ) {
			elementor.panel.close();
		} else {
			$e.run( 'panel/open' );
			$e.route( 'panel/elements/categories' );
		}
	}

	onPageSettingsClick() {
		$e.run( 'panel/open' );
		$e.route( 'panel/page-settings/settings' );
	}

	onSiteSettingsClick() {
		$e.run( 'panel/open' );

		$e.run( 'panel/global/open', {
			route: $e.routes.getHistory( 'panel' ).reverse()[ 0 ].route,
		} );
	}

	getMoreItems() {
		return elementor.modules.layouts.panel.pages.menu.Menu.getGroups().toJSON().find( ( g ) => 'navigate_from_page' === g.name ).items;
	}

	addMoreItems() {
		const items = this.getMoreItems();
		const parent = this.$el.find( '#elementor-panel-footer-more .elementor-panel-footer-sub-menu' );

		items.forEach( ( item ) => {
			parent.append(
				`<div class="elementor-panel-footer-sub-menu-item e-more-item" data-item-id="${ item.name }">
					${ item.svg ?? `<i class="eicon ${ item.icon }"></i>` }
					<span class="elementor-title">${ item.title }</span>
				</div>
			` );
		} );
	}

	onMoreItemClick( e ) {
		const { itemId } = e.currentTarget.dataset;

		const { callback = () => {} } = this.getMoreItems().find( ( item ) => item.name === itemId ) || {};

		callback( e.currentTarget );
	}
}

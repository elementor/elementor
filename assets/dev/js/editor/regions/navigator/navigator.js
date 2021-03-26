import Component from './component';
import Layout from './layout';

const BaseRegion = require( 'elementor-regions/base' );

export default class Navigator extends BaseRegion {
	constructor( options ) {
		super( options );

		this.component = $e.components.register( new Component( { manager: this } ) );

		this.isDocked = false;
		this.storage.size.width = this.storage.size.width || this.$el.css( 'width' );

		this.indicators = {
			customPosition: {
				title: __( 'Custom Positioning', 'elementor' ),
				icon: 'cursor-move',
				settingKeys: [ '_position', '_element_width' ],
				section: '_section_position',
			},
		};

		this.ensurePosition = this.ensurePosition.bind( this );

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );
	}

	getStorageKey() {
		return 'navigator';
	}

	getDefaultStorage() {
		return {
			visible: false,
			size: {
				width: '',
				height: '',
				top: '',
				bottom: '',
				right: '',
				left: '',
			},
		};
	}

	getLayout() {
		return this.currentView;
	}

	getDraggableOptions() {
		return {
			iframeFix: true,
			handle: '#elementor-navigator__header',
			drag: this.onDrag.bind( this ),
			stop: this.onDragStop.bind( this ),
		};
	}

	getResizableOptions() {
		return {
			handles: 'all',
			containment: 'document',
			minWidth: 150,
			maxWidth: 500,
			minHeight: 240,
			start: () => {
				elementor.$previewWrapper.addClass( 'ui-resizable-resizing' );
			},
			stop: () => {
				elementor.$previewWrapper.removeClass( 'ui-resizable-resizing' );

				if ( this.isDocked ) {
					this.storage.size.width = elementor.helpers.getElementInlineStyle( this.$el, [ 'width' ] ).width;

					elementorCommon.storage.set( 'navigator', this.storage );
				} else {
					this.saveSize();
				}
			},
		};
	}

	initLayout() {
		this.show( new Layout() );

		this.$el.draggable( this.getDraggableOptions() );
		this.$el.resizable( this.getResizableOptions() );
	}

	open( model ) {
		this.$el.show();

		if ( this.storage.docked ) {
			$e.run( 'navigator/dock' );

			this.setDockedSize();
		} else {
			this.setSize();
		}

		if ( model ) {
			model.trigger( 'request:edit' );
		}

		this.saveStorage( 'visible', true );

		this.ensurePosition();

		elementorCommon.elements.$window.on( 'resize', this.ensurePosition );
	}

	close( silent ) {
		this.$el.hide();

		if ( this.isDocked ) {
			$e.run( 'navigator/undock', { silent: true } );
		}

		if ( ! silent ) {
			this.saveStorage( 'visible', false );
		}

		if ( this.$el.resizable( 'instance' ) ) {
			this.$el.resizable( 'destroy' );
		}

		elementorCommon.elements.$window.off( 'resize', this.ensurePosition );
	}

	isOpen() {
		return this.component.isOpen;
	}

	dock() {
		elementorCommon.helpers.softDeprecated( 'elementor.navigator.dock()',
			'3.0.2',
			"$e.run( 'navigator/dock' )"
		);

		$e.run( 'navigator/dock' );
	}

	undock( silent ) {
		elementorCommon.helpers.softDeprecated( 'elementor.navigator.undock()',
			'3.0.2',
			"$e.run( 'navigator/undock', { silent } )"
		);

		$e.run( 'navigator/undock', { silent } );
	}

	setSize() {
		if ( this.storage.size ) {
			this.$el.css( this.storage.size );
		}
	}

	setDockedSize() {
		this.$el.css( 'width', this.storage.size.width );
	}

	ensurePosition() {
		if ( this.isDocked ) {
			return;
		}

		const offset = this.$el.offset();

		if ( offset.left > innerWidth ) {
			this.$el.css( {
				left: '',
				right: '',
			} );
		}

		if ( offset.top > innerHeight ) {
			this.$el.css( {
				top: '',
				bottom: '',
			} );
		}
	}

	onDrag( event, ui ) {
		if ( this.isDocked ) {
			if ( ui.position.left === ui.originalPosition.left ) {
				if ( ui.position.top !== ui.originalPosition.top ) {
					return false;
				}
			} else {
				$e.run( 'navigator/undock' );
			}

			return;
		}

		if ( 0 > ui.position.top ) {
			ui.position.top = 0;
		}

		const isOutOfLeft = 0 > ui.position.left,
			isOutOfRight = ui.position.left + this.el.offsetWidth > innerWidth;

		if ( elementorCommon.config.isRTL ) {
			if ( isOutOfRight ) {
				ui.position.left = innerWidth - this.el.offsetWidth;
			}
		} else if ( isOutOfLeft ) {
			ui.position.left = 0;
		}

		elementorCommon.elements.$body.toggleClass( 'elementor-navigator--dock-hint', elementorCommon.config.isRTL ? isOutOfLeft : isOutOfRight );
	}

	onDragStop( event, ui ) {
		if ( this.isDocked ) {
			return;
		}

		this.saveSize();

		const elementRight = ui.position.left + this.el.offsetWidth;

		if ( 0 > ui.position.left || elementRight > innerWidth ) {
			$e.run( 'navigator/dock' );
		}

		elementorCommon.elements.$body.removeClass( 'elementor-navigator--dock-hint' );
	}

	onEditModeSwitched( activeMode ) {
		if ( 'edit' === activeMode && this.storage.visible ) {
			this.open();
		} else {
			this.close( true );
		}
	}
}

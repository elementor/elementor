module.exports = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-navigator__elements',

	childViewContainer: '.elementor-navigator__elements',

	ui: {
		item: '> .elementor-navigator__item',
		toggle: '> .elementor-navigator__item > .elementor-navigator__element__toggle',
		elements: '> .elementor-navigator__elements'
	},

	events: {
		'contextmenu': 'onContextMenu',
		'click @ui.item': 'onItemClick',
		'click @ui.toggle': 'onToggleClick',
		'sortstart @ui.elements': 'onSortStart',
		'sortover @ui.elements': 'onSortOver',
		'sortout @ui.elements': 'onSortOut',
		'sortstop @ui.elements': 'onSortStop',
		'sortupdate @ui.elements': 'onSortUpdate',
		'sortreceive @ui.elements': 'onSortReceive'
	},

	getEmptyView: function() {
		if ( this.hasChildren() ) {
			return require( 'elementor-layouts/navigator/empty' );
		}

		return null;
	},

	childViewOptions: function() {
		return {
			distance: this.getDistance() + 10
		};
	},

	className: function() {
		var classes = 'elementor-navigator__element',
			elType = this.model.get( 'elType' );

		if ( elType ) {
			classes += ' elementor-navigator__element-' + elType;
		}

		if ( this.hasChildren() ) {
			classes += ' elementor-navigator__element--has-children';
		}

		return classes;
	},

	attributes: function() {
		return {
			'data-model-cid': this.model.cid
		};
	},

	initialize: function() {
		this.collection = this.model.get( 'elements' );

		this.listenTo( this.model, 'request:edit', this.onEditRequest )
			.listenTo( this.model, 'change', this.onModelChange );
	},

	getDistance: function() {
		return this.getOption( 'distance' ) || 0;
	},

	isRoot: function() {
		return ! this.model.get( 'elType' );
	},

	hasChildren: function() {
		return 'widget' !== this.model.get( 'elType' );
	},

	toggleList: function( state, callback ) {
		if ( ! this.hasChildren() || this.isRoot() ) {
			return;
		}

		var isActive = this.ui.item.hasClass( 'elementor-active' );

		if ( isActive === state ) {
			return;
		}

		this.ui.item.toggleClass( 'elementor-active', state );

		var slideMethod = 'slideToggle';

		if ( undefined !== state ) {
			slideMethod = 'slide' + ( state ? 'Down' : 'Up' );
		}

		this.ui.elements[ slideMethod ]( 300, callback );
	},

	toggleHiddenClass: function() {
		this.$el.toggleClass( 'elementor-navigator__element--hidden', !! this.model.get( 'hidden' ) );
	},

	recursiveChildInvoke: function() {
		var args = Array.prototype.slice.call( arguments ),
			method = args.slice( 0, 1 ),
			restArgs = args.slice( 1 );

		this[ method ].apply( this, restArgs );

		this.children.each( function( child ) {
			if ( ! ( child instanceof module.exports ) ) {
				return;
			}

			child.recursiveChildInvoke.apply( child, args );
		} );
	},

	recursiveParentInvoke: function() {
		var args = Array.prototype.slice.call( arguments ),
			method = args.slice( 0, 1 ),
			restArgs = args.slice( 1 );

		if ( ! ( this._parent instanceof module.exports ) ) {
			return;
		}

		this._parent[ method ].apply( this._parent, restArgs );

		this._parent.recursiveParentInvoke.apply( this._parent, args );
	},

	recursiveChildAgreement: function() {
		var args = Array.prototype.slice.call( arguments ),
			method = args.slice( 0, 1 ),
			restArgs = args.slice( 1 );

		if ( ! this[ method ].apply( this, restArgs ) ) {
			return false;
		}

		var hasAgreement = true;

		// Using jQuery loop to allow break
		jQuery.each( this.children._views, function() {
			if ( ! ( this instanceof module.exports ) ) {
				return;
			}

			if ( ! this.recursiveChildAgreement.apply( this, args ) ) {
				return hasAgreement = false;
			}
		} );

		return hasAgreement;
	},

	activateMouseInteraction: function() {
		this.$el.on( {
			mouseenter: this.onMouseEnter.bind( this ),
			mouseleave: this.onMouseLeave.bind( this )
		} );
	},

	deactivateMouseInteraction: function() {
		this.$el.off( 'mouseenter mouseleave' );
	},

	dragShouldBeIgnored: function( draggedModel ) {
		var childTypes = elementor.helpers.getElementChildType( this.model.get( 'elType' ) ),
			draggedElType = draggedModel.get( 'elType' );

		if ( 'section' === draggedElType && ! draggedModel.get( 'isInner' ) ) {
			return true;
		}

		return ! childTypes || -1 === childTypes.indexOf( draggedModel.get( 'elType' ) );
	},

	addEditingClass: function() {
		this.ui.item.addClass( 'elementor-editing' );
	},

	removeEditingClass: function() {
		this.ui.item.removeClass( 'elementor-editing' );
	},

	onRender: function() {
		var self = this;

		self.ui.elements.sortable( {
			items: '> .elementor-navigator__element',
			placeholder: 'ui-sortable-placeholder',
			axis: 'y',
			forcePlaceholderSize: true,
			connectWith: '.elementor-navigator__element-' + self.model.get( 'elType' ) + ' ' + self.ui.elements.selector
		} );

		this.ui.item.css( 'padding-' + ( elementor.config.is_rtl ? 'right' : 'left' ), this.getDistance() );

		this.toggleHiddenClass();
	},

	onModelChange: function() {
		if ( undefined !== this.model.changed.hidden ) {
			this.toggleHiddenClass();
		}
	},

	onItemClick: function() {
		this.model.trigger( 'request:edit' );

		this.toggleList();
	},

	onToggleClick: function( event ) {
		event.stopPropagation();

		this.model.trigger( 'request:toggleVisibility' );
	},

	onSortStart: function( event, ui ) {
		this.model.trigger( 'request:sort:start', event, ui );

		elementor.navigator.getLayout().activateElementsMouseInteraction();
	},

	onSortStop: function() {
		elementor.navigator.getLayout().deactivateElementsMouseInteraction();
	},

	onSortOver: function( event ) {
		event.stopPropagation();

		this.$el.addClass( 'elementor-dragging-on-child' );
	},

	onSortOut: function( event ) {
		event.stopPropagation();

		this.$el.removeClass( 'elementor-dragging-on-child' );
	},

	onSortUpdate: function( event, ui ) {
		event.stopPropagation();

		if ( ! this.el.contains( ui.item[0] ) ) {
			return;
		}

		this.model.trigger( 'request:sort:update', ui );
	},

	onSortReceive: function( event, ui ) {
		this.model.trigger( 'request:sort:receive', event, ui );
	},

	onMouseEnter: function( event ) {
		event.stopPropagation();

		var self = this;

		var dragShouldBeIgnored = this.recursiveChildAgreement( 'dragShouldBeIgnored', elementor.channels.data.request( 'dragging:model' ) );

		if ( dragShouldBeIgnored ) {
			return;
		}

		self.autoExpandTimeout = setTimeout( function() {
			self.toggleList( true, function() {
				self.ui.elements.sortable( 'refreshPositions' );
			} );
		}, 500 );
	},

	onMouseLeave: function( event ) {
		event.stopPropagation();

		clearTimeout( this.autoExpandTimeout );
	},

	onContextMenu: function( event ) {
		this.model.trigger( 'request:contextmenu', event );
	},

	onEditRequest: function() {
		this.recursiveParentInvoke( 'toggleList', true );

		elementor.navigator.getLayout().elements.currentView.recursiveChildInvoke( 'removeEditingClass' );

		this.addEditingClass();

		elementor.helpers.scrollToView( this.$el, 400, elementor.navigator.getLayout().elements.$el );
	}
} );

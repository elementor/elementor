const INLINE_CHILD_INDENT_INCREMENT = 20;
const INLINE_CHILD_ICON_MAP = {
	b: 'eicon-editor-bold',
	strong: 'eicon-editor-bold',
	i: 'eicon-editor-italic',
	em: 'eicon-editor-italic',
	u: 'eicon-editor-underline',
	a: 'eicon-editor-link',
	del: 'eicon-editor-strikethrough',
	s: 'eicon-editor-strikethrough',
	sup: 'eicon-editor-list-ol',
	sub: 'eicon-editor-list-ol',
	span: 'eicon-edit',
};
const INLINE_CHILD_DEFAULT_ICON = 'eicon-edit';
const HTML_V3_TYPE = 'html-v3';

export default class InlineChildren {
	constructor( elementView ) {
		this.elementView = elementView;
		this.invalidateCache();
	}

	getChildren() {
		if ( undefined !== this._cache ) {
			return this._cache;
		}

		this._cache = this._compute();

		return this._cache;
	}

	_compute() {
		const model = this.elementView.model;

		if ( 'widget' !== model.get( 'elType' ) ) {
			return null;
		}

		const settings = model.get( 'settings' );

		if ( ! settings ) {
			return null;
		}

		const allChildren = [];

		Object.values( settings.attributes ).forEach( ( setting ) => {
			if ( HTML_V3_TYPE === setting?.$$type && Array.isArray( setting?.value?.children ) ) {
				allChildren.push( ...setting.value.children );
			}
		} );

		return allChildren.length > 0 ? allChildren : null;
	}

	invalidateCache() {
		this._cache = undefined;
	}

	render() {
		const view = this.elementView;

		view.ui.elements.children( '.elementor-navigator__inline-child' ).remove();

		const inlineChildren = this.getChildren();

		view.$el.toggleClass( 'elementor-navigator__element--has-children', !! view.hasChildren() );

		if ( ! inlineChildren ) {
			return;
		}

		this.appendItems( inlineChildren, view.getIndent() );
		view.ui.item.addClass( 'elementor-active' );
		view.ui.elements.css( 'display', 'block' );
	}

	appendItems( children, indent ) {
		indent += INLINE_CHILD_INDENT_INCREMENT;
		const $container = this.elementView.ui.elements;

		children.forEach( ( child ) => {
			const title = child.content || child.type;
			const iconClass = INLINE_CHILD_ICON_MAP[ child.type ] || INLINE_CHILD_DEFAULT_ICON;

			const $item = jQuery( '<div>', {
				class: 'elementor-navigator__element elementor-navigator__inline-child',
				'data-inline-id': child.id,
			} );

			const $inner = jQuery( '<div>', {
				class: 'elementor-navigator__item',
			} ).css( 'padding-inline-start', indent + 'px' );

			$inner.append(
				jQuery( '<div>', { class: 'elementor-navigator__element__element-type' } )
					.html( '<i class="' + iconClass + '" aria-hidden="true"></i>' ),
				jQuery( '<div>', { class: 'elementor-navigator__element__title' } )
					.append(
						jQuery( '<span>', {
							class: 'elementor-navigator__element__title__text',
							text: title,
						} ),
					),
			);

			$inner.on( 'click', ( event ) => {
				event.stopPropagation();
				this.onChildClick( child.id );
			} );

			this.clearEvents( $inner );

			$item.append( $inner );
			$container.append( $item );

			if ( Array.isArray( child.children ) && child.children.length > 0 ) {
				this.appendItems( child.children, indent );
			}
		} );
	}

	clearEvents( $inner ) {
		$inner.on( 'contextmenu', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
		} );

		$inner.on( 'dblclick', ( event ) => {
			event.stopPropagation();
		} );
	}

	onChildClick( inlineId ) {
		this.clearHighlights();

		this.elementView.ui.elements
			.find( '.elementor-navigator__inline-child[data-inline-id="' + inlineId + '"] > .elementor-navigator__item' )
			.addClass( 'elementor-editing' );

		this.elementView.model.trigger( 'request:edit', { scrollIntoView: true } );
	}

	clearHighlights() {
		jQuery( '.elementor-navigator__inline-child .elementor-navigator__item' )
			.removeClass( 'elementor-editing' );
	}
}

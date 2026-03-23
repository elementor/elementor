import { __ } from '@wordpress/i18n';

import { type ElementType, type ElementView, type LegacyWindow } from './types';

const UPGRADE_URL = 'https://go.elementor.com/go-pro-atomic-form/';

export function createProPlaceholderElementType( type: string ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Base {
		getType() {
			return type;
		}

		getView() {
			return createProPlaceholderView( type );
		}

		getModel() {
			return legacyWindow.elementor.modules.elements.models.AtomicElementBase;
		}
	};
}

function createProPlaceholderView( type: string ): typeof ElementView {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.views.Widget {
		render() {
			this.$el.html( buildPlaceholderHTML() );

			this.$el.on( 'click', '.e-form-placeholder__remove-btn', ( e: Event ) => {
				e.preventDefault();
				e.stopPropagation();

				( window as unknown as { $e: { run: ( command: string, args: object ) => void } } )
					.$e.run( 'document/elements/delete', {
						container: this.container,
					} );
			} );

			this.bindUIElements();

			window.top?.dispatchEvent(
				new CustomEvent( 'elementor/preview/atomic-widget/render', {
					detail: { id: this.model.get( 'id' ) },
				} ),
			);

			this.isRendered = true;
		}

		_renderChildren() {
			// No-op: children data is preserved in the model but not rendered.
		}

		onDestroy( ...args: unknown[] ) {
			super.onDestroy( ...args );

			this.$el.off( 'click', '.e-form-placeholder__remove-btn' );

			window.top?.dispatchEvent(
				new CustomEvent( 'elementor/preview/atomic-widget/destroy', {
					detail: { id: this.model.get( 'id' ) },
				} ),
			);
		}

		behaviors() {
			const disabledBehaviors = [ 'InlineEditing', 'Draggable', 'Resizable' ];

			const behaviorsAsEntries = Object.entries( super.behaviors() ).filter(
				( [ key ] ) => ! disabledBehaviors.includes( key ),
			);

			return Object.fromEntries( behaviorsAsEntries );
		}

		getHandlesOverlay() {
			return null;
		}

		getContextMenuGroups() {
			return super.getContextMenuGroups().filter(
				( group: { name: string } ) => group.name !== 'save',
			);
		}
	};
}

function buildPlaceholderHTML(): string {
	const title = __( 'Atomic Form is a Pro feature', 'elementor' );
	const description = __( 'Upgrade now to access advanced styling and build fully custom forms.', 'elementor' );
	const removeLabel = __( 'Remove', 'elementor' );
	const unlockLabel = __( 'Unlock with Pro', 'elementor' );

	return `<div class="e-form-placeholder">
		<i class="eicon-upgrade-crown e-form-placeholder__icon"></i>
		<div class="e-form-placeholder__title">${ title }</div>
		<div class="e-form-placeholder__description">${ description }</div>
		<div class="e-form-placeholder__actions">
			<button type="button" class="e-form-placeholder__remove-btn">${ removeLabel }</button>
			<a href="${ UPGRADE_URL }" target="_blank" rel="noopener noreferrer" class="e-form-placeholder__unlock-btn">${ unlockLabel }</a>
		</div>
	</div>`;
}

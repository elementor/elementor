const createAtomicFormStatusView = ( status ) => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( `e-form-${ status }` );

	return class AtomicFormStatusView extends AtomicElementBaseView {
		initialize( ...args ) {
			super.initialize( ...args );
			this._formContainer = null;
		}

		onRender() {
			super.onRender();
			this._bindFormState();
			this._updateVisibility();
		}

		isDroppingAllowed() {
			return this._shouldShow();
		}

		_bindFormState() {
			const formContainer = this._getFormContainer();

			if ( ! formContainer ) {
				return;
			}

			this.stopListening( formContainer.model );
			this.listenTo( formContainer.model, 'change:settings', this._updateVisibility );
		}

		_getFormContainer() {
			if ( this._formContainer ) {
				return this._formContainer;
			}

			let current = this.getContainer();
			while ( current ) {
				const elementType = current.model.get( 'widgetType' ) || current.model.get( 'elType' );
				if ( 'e-form' === elementType ) {
					this._formContainer = current;
					return current;
				}
				current = current.parent;
			}

			return null;
		}

		_getFormState() {
			const formContainer = this._getFormContainer();
			const setting = formContainer?.model.getSetting?.( 'form-state' );
			const value = setting?.value ?? setting;

			return value || 'default';
		}

		_shouldShow() {
			return this._getFormState() === status;
		}

		_updateVisibility = () => {
			const shouldShow = this._shouldShow();
			this.$el.toggle( shouldShow );
		};
	};
};

export default createAtomicFormStatusView;

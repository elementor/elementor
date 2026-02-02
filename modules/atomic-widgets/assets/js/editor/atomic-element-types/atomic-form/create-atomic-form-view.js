const STATE_ATTRIBUTE = 'data-e-state';
const STATE_SELECTOR = `[${ STATE_ATTRIBUTE }]`;

const createAtomicFormView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-form' );

	return class AtomicFormView extends AtomicElementBaseView {
		initialize( ...args ) {
			super.initialize( ...args );
			this._updateStatusVisibility = this._updateStatusVisibility.bind( this );
		}

		onRender() {
			super.onRender();
			this._bindStatusVisibility();
			this._updateStatusVisibility();
		}

		getChildType() {
			const childTypes = super.getChildType();

			return childTypes.filter( ( type ) => type !== 'e-form' );
		}

		_bindStatusVisibility() {
			this.stopListening( this.model, 'change:settings', this._updateStatusVisibility );
			this.listenTo( this.model, 'change:settings', this._updateStatusVisibility );
		}

		_getFormState() {
			const setting = this.model.getSetting( 'form-state' );
			const renderContext = this.getResolverRenderContext?.();
			const resolvedSetting = this._resolvePropValue?.( setting, renderContext ) ?? setting;
			const value = resolvedSetting?.value ?? resolvedSetting;

			return value || 'default';
		}

		_updateStatusVisibility() {
			const formState = this._getFormState();

			this.$el.find( STATE_SELECTOR ).toArray().forEach( ( element ) => {
				const state = element.getAttribute( STATE_ATTRIBUTE );
				jQuery( element ).toggle( state === formState );
			} );
		}
	};
};

export default createAtomicFormView;

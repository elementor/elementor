export default class AiPromotionBehavior extends Marionette.Behavior {
	initialize() {
		this.promotionLabel = __( 'Coming soon', 'elementor' );
	}

	onRender() {
		const promotionLabel = this.getOption( 'promotionLabel' );

		const $button = jQuery( '<button>', {
			class: 'e-ai-button',
		} );

		$button.html( '<i class="eicon-ai"></i>' );

		$button.tipsy( {
			gravity: 's',
			title() {
				return promotionLabel;
			},
		} );

		this.$el.find( '.elementor-control-title:eq(0)' ).after(
			$button,
		);
	}
}

export default class AiPromotionBehavior extends Marionette.Behavior {
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

		this.$el.find( '.elementor-control-title' ).after(
			$button,
		);
	}
}

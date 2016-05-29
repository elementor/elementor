<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Dimensions extends Control_Base_Units {

	public function get_type() {
		return 'dimensions';
	}

	public function get_default_value() {
		return array_merge( parent::get_default_value(), [
			'top' => '',
			'right' => '',
			'bottom' => '',
			'left' => '',
			'isLinked' => true,
		] );
	}

	protected function get_default_settings() {
		return array_merge( parent::get_default_settings(), [
			'label_block' => true,
			'allowed_dimensions' => 'all',
			'placeholder' => '',
		] );
	}

	public function content_template() {
		$dimensions = [
			'top' => __( 'Top', 'elementor' ),
			'right' => __( 'Right', 'elementor' ),
			'bottom' => __( 'Bottom', 'elementor' ),
			'left' => __( 'Left', 'elementor' ),
		];
		?>
		<label class="elementor-control-title">
			<%= data.label %>
			<?php $this->print_units_template(); ?>
		</label>
		<div class="elementor-control-input-wrapper">
			<ul class="elementor-control-dimensions">
				<?php foreach ( $dimensions as $dimension_key => $dimension_title ) : ?>
					<li class="elementor-control-dimension">
						<input type="number" data-setting="<?php echo esc_attr( $dimension_key ); ?>"
						       placeholder="<%
						       if ( _.isObject( data.placeholder ) ) {
						        if ( ! _.isUndefined( data.placeholder.<?php echo $dimension_key; ?> ) ) {
						            print( data.placeholder.<?php echo $dimension_key; ?> );
						        }
						       } else {
						        print( data.placeholder );
						       } %>"
						<% if ( -1 === _.indexOf( allowed_dimensions, '<?php echo $dimension_key; ?>' ) ) { %>
						disabled
						<% } %>
						/>
						<span><?php echo $dimension_title; ?></span>
					</li>
				<?php endforeach; ?>
				<li>
					<button class="elementor-link-dimensions">
						<span class="elementor-linked tooltip-target" data-tooltip-pos="s" data-tooltip="<?php _e( 'Link', 'elementor' ); ?>"><i class="fa fa-link"></i></span>
						<span class="elementor-unlinked tooltip-target" data-tooltip-pos="s" data-tooltip="<?php _e( 'Unlink', 'elementor' ); ?>"><i class="fa fa-chain-broken"></i></span>
					</button>
				</li>
			</ul>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}

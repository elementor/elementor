<?php
namespace Elementor\Core\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Tag extends Base_Tag {

	final public function get_content( array $options = [] ) {
		$settings = $this->get_settings();

		ob_start();

		if ( ! empty( $options['wrap'] ) ) : ?>
			<span id="elementor-tag-<?php echo esc_attr( $this->get_id() ); ?>" class="elementor-tag">
		<?php
		endif;

		if ( ! empty( $settings['before'] ) ) {
			echo wp_kses_post( $settings['before'] );
		}

		$this->render();

		if ( ! empty( $settings['after'] ) ) {
			echo wp_kses_post( $settings['after'] );
		}

		if ( ! empty( $options['wrap'] ) ) :
		?>
			</span>
		<?php
		endif;

		$value = ob_get_clean();

		if ( ! $value && ! empty( $settings['fallback'] ) ) {
			$value = $settings['fallback'];
		}

		return $value;
	}

	final public function get_content_type() {
		return 'ui';
	}

	protected function register_advanced_section() {
		$this->start_controls_section(
			'advanced',
			[
				'label' => __( 'Advanced', 'elementor' ),
			]
		);

		$this->add_control(
			'before',
			[
				'label' => __( 'Before', 'elementor' ),
			]
		);

		$this->add_control(
			'after',
			[
				'label' => __( 'After', 'elementor' ),
			]
		);

		$this->add_control(
			'fallback',
			[
				'label' => __( 'Fallback', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}
}

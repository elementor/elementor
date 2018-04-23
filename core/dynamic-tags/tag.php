<?php
namespace Elementor\Core\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor tag.
 *
 * An abstract class to register new Elementor tag.
 *
 * @since 2.0.0
 * @abstract
 */
abstract class Tag extends Base_Tag {

	/**
	 * @since 2.0.0
	 * @access public
	 *
	 * @param array $options
	 *
	 * @return string
	 */
	public function get_content( array $options = [] ) {
		$settings = $this->get_settings();

		ob_start();

		$this->render();

		$value = ob_get_clean();

		if ( $value ) {
			if ( ! empty( $settings['before'] ) ) {
				$before = str_replace( ' ', '&nbsp;', $settings['before'] );
				$value = wp_kses_post( $before ) . $value;
			}

			if ( ! empty( $settings['after'] ) ) {
				$after = str_replace( ' ', '&nbsp;', $settings['after'] );
				$value .= wp_kses_post( $after );
			}

			if ( ! empty( $options['wrap'] ) ) :
				$value = '<span id="elementor-tag-' . esc_attr( $this->get_id() ) . '" class="elementor-tag">' . $value . '</span>';
			endif;

		} elseif ( ! empty( $settings['fallback'] ) ) {
			$value = $settings['fallback'];
		}

		return $value;
	}

	/**
	 * @since 2.0.0
	 * @access public
	 */
	final public function get_content_type() {
		return 'ui';
	}

	/**
	 * @since 2.0.0
	 * @access protected
	 */
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

<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webmcp_Utils {
	public static function build_tool_name( string $form_name ): string {
		$slug = sanitize_title( $form_name );
		$slug = str_replace( '-', '_', $slug );

		if ( '' === $slug ) {
			return 'submit_form';
		}

		return $slug;
	}

	public static function build_tool_description( string $form_name ): string {
		$label = trim( $form_name );

		if ( '' === $label ) {
			return esc_html__( 'Submit this form with the provided field values.', 'elementor' );
		}

		return sprintf(
			/* translators: %s: form name */
			esc_html__( 'Submit the %s form with the provided field values.', 'elementor' ),
			$label
		);
	}
}

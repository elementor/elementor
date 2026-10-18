<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webmcp_Utils {
	public static function resolve_tool_name( string $tool_name, string $form_name, string $element_id = '' ): string {
		return self::build_tool_name( '' !== trim( $tool_name ) ? $tool_name : $form_name, $element_id );
	}

	public static function resolve_tool_description( string $tool_description, string $form_name ): string {
		if ( '' !== trim( $tool_description ) ) {
			return $tool_description;
		}

		return self::build_tool_description( $form_name );
	}

	public static function build_tool_name( string $form_name, string $element_id = '' ): string {
		$slug = sanitize_title( $form_name );
		$slug = str_replace( '-', '_', $slug );

		if ( '' === $slug ) {
			$slug = 'submit_form';
		}

		$id_suffix = self::build_element_id_suffix( $element_id );

		if ( '' === $id_suffix ) {
			return $slug;
		}

		return $slug . '_' . $id_suffix;
	}

	private static function build_element_id_suffix( string $element_id ): string {
		$suffix = sanitize_title( $element_id );
		$suffix = str_replace( '-', '_', $suffix );

		return $suffix;
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

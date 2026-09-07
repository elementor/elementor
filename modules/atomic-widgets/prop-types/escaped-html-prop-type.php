<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Escaped_Html_Prop_Type extends Html_Prop_Type {
	public static function get_key(): string {
		return 'escaped-html';
	}

	public static function button_text_tags(): array {
		return [ 'b', 'strong', 'sup', 'sub', 's', 'em', 'i', 'u', 'del', 'span', 'br' ];
	}

	public static function heading_text_tags(): array {
		return [ 'b', 'strong', 'sup', 'sub', 's', 'em', 'i', 'u', 'a', 'del', 'span', 'br' ];
	}

	public static function paragraph_text_tags(): array {
		return [ 'b', 'strong', 'sup', 'sub', 's', 'em', 'u', 'ul', 'ol', 'li', 'blockquote', 'a', 'del', 'span', 'br' ];
	}

	public function allowed_html_tags( array $tags ): self {
		$this->settings['allowed_html_tags'] = array_values( $tags );

		return $this;
	}

	public function get_allowed_html_tags(): ?array {
		return $this->settings['allowed_html_tags'] ?? null;
	}

	public function to_json_schema(): array {
		$value_schema = [ 'type' => 'string' ];

		$allowed_html_tags = $this->get_allowed_html_tags();

		if ( null !== $allowed_html_tags ) {
			$value_schema['allowed_html_tags'] = $allowed_html_tags;
		}

		return $this->wrap_json_schema( $value_schema );
	}
}

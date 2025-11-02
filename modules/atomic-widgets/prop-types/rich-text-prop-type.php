<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rich_Text_Prop_Type implements Transformable_Prop_Type {
	const KIND = 'plain';

	use Concerns\Has_Default;
	use Concerns\Has_Generate;
	use Concerns\Has_Meta;
	use Concerns\Has_Required_Setting;
	use Concerns\Has_Settings;
	use Concerns\Has_Transformable_Validation;

	private ?array $dependencies = null;

	public static function get_key(): string {
		return 'rich-text';
	}

	public static function make(): self {
		return new static();
	}

	public function get_type(): string {
		return 'plain';
	}

	public function validate( $value ): bool {
		if ( is_null( $value ) ) {
			return ! $this->is_required();
		}

		return (
			$this->is_transformable( $value ) &&
			$this->validate_value( $value['value'] )
		);
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $value as $node ) {
			if ( ! $this->validate_node( $node ) ) {
				return false;
			}
		}

		return true;
	}

	private function validate_node( $node ): bool {
		if ( ! is_array( $node ) ) {
			return false;
		}

		if ( ! array_key_exists( 'tag', $node ) || ! array_key_exists( 'content', $node ) ) {
			return false;
		}

		if ( ! is_null( $node['tag'] ) && ! is_string( $node['tag'] ) ) {
			return false;
		}

		if ( is_array( $node['content'] ) ) {
			foreach ( $node['content'] as $child_node ) {
				if ( ! $this->validate_node( $child_node ) ) {
					return false;
				}
			}
		} elseif ( ! is_string( $node['content'] ) ) {
			return false;
		}

		return true;
	}

	public function sanitize( $value ) {
		$value['value'] = $this->sanitize_value( $value['value'] );

		return $value;
	}

	protected function sanitize_value( $value ) {
		if ( ! is_array( $value ) ) {
			return [];
		}

		return array_map( [ $this, 'sanitize_node' ], $value );
	}

	private function sanitize_node( $node ) {
		if ( ! is_array( $node ) ) {
			return null;
		}

		$sanitized = [
			'tag' => isset( $node['tag'] ) && is_string( $node['tag'] )
				? sanitize_text_field( $node['tag'] )
				: null,
			'content' => $this->sanitize_content( $node['content'] ?? '' ),
		];

		return $sanitized;
	}

	private function sanitize_content( $content ) {
		if ( is_string( $content ) ) {
			return sanitize_text_field( $content );
		}

		if ( is_array( $content ) ) {
			return array_map( [ $this, 'sanitize_node' ], $content );
		}

		return '';
	}

	public function jsonSerialize(): array {
		return [
			'kind' => static::KIND,
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => (object) $this->get_meta(),
			'settings' => (object) $this->get_settings(),
			'dependencies' => $this->get_dependencies(),
		];
	}

	public function set_dependencies( ?array $dependencies ): self {
		$this->dependencies = empty( $dependencies ) ? null : $dependencies;

		return $this;
	}

	public function get_dependencies(): ?array {
		return $this->dependencies;
	}
}

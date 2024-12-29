<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Query_Control extends Atomic_Control_Base {
	private ?string $placeholder = null;
	private ?array $options = null;
	private ?bool $is_free_solo = null;

	public function get_type(): string {
		return 'query';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function set_options( array $options ): self {
		if ( ! $this->validate_options_scheme( $options ) ) {
			Utils::safe_throw( 'Each option must have a label property' );
		}

		$this->options = $options;

		return $this;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->placeholder,
			'options' => $this->options,
			'isFreeSolo' => $this->is_free_solo,
		];
	}

	public function set_is_free_solo( bool $is_free_solo ): self {
		$this->is_free_solo = $is_free_solo;

		return $this;
	}

	public function set_post_query(): self {
		$excluded_post_types = Utils::get_excluded_post_types();
		$posts_map = Utils::get_posts_per_post_type_map( $excluded_post_types );
		$options = [];

		foreach ( $posts_map as $post_type_slug => $data ) {
			foreach ( $data['items'] as $post ) {
				$options[ $post->guid ] = [
					'label' => $post->post_title,
					'groupValue' => $post_type_slug,
					'groupLabel' => $posts_map[ $post_type_slug ]['label'],
				];
			}
		}

		return $this->set_options( $options );
	}

	private function validate_options_scheme( ?array $options = [] ) {
		foreach ( $options as $option ) {
			if ( ! is_array( $option ) || ! array_key_exists( 'label', $option ) ) {
				return false;
			}
		}

		return true;
	}
}

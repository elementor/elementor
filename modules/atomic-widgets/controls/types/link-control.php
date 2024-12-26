<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Link_Control extends Atomic_Control_Base {
	private ?string $placeholder = null;
	private ?array $options = [];
	private bool $is_autocomplete = false;
	private bool $free_solo = false;

	public function get_type(): string {
		return 'link';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function set_options( array $options ): self {
		$this->options = $options;

		return $this;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->placeholder,
			'options' => $this->options,
			'isAutocomplete' => $this->is_autocomplete,
			'freeSolo' => $this->free_solo,
		];
	}

	public function set_is_autocomplete( bool $is_autocomplete ): self {
		$this->is_autocomplete = $is_autocomplete;

		return $this;
	}

	public function set_free_solo( bool $free_solo ): self {
		$this->free_solo = $free_solo;

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
					'groupLabel' => $posts_map[ $post_type_slug ]['label'],
				];
			}
		}

		$this->options = $options;

		return $this;
	}
}

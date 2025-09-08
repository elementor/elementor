<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Traits;

use Elementor\Modules\WpRest\Classes\Post_Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Http {
	private bool $allow_custom_values = true;
	private int $minimum_input_length = 2;
	private ?array $post_types = null;
	private ?string $endpoint = null;
	private ?string $namespace = null;

	public function set_endpoint( string $endpoint ): self {
		$this->endpoint = $endpoint;

		return $this;
	}

	public function set_namespace( string $namespace ): self {
		$this->namespace = $namespace;

		return $this;
	}

	public function set_post_types( ?array $post_types ): self {
		$this->post_types = $post_types;

		return $this;
	}

	public function set_minimum_input_length( int $input_length ): self {
		$this->minimum_input_length = $input_length;

		return $this;
	}

	public function set_allow_custom_values( bool $allow_custom_values ): self {
		$this->allow_custom_values = $allow_custom_values;

		return $this;
	}

	protected function get_query_options(): array {
		$params = Post_Query::build_query_params( [
			Post_Query::POST_KEYS_CONVERSION_MAP => [
				'ID' => 'id',
				'post_title' => 'label',
				'post_type' => 'groupLabel',
			],
			Post_Query::ALLOWED_POST_TYPES => $this->post_types,
		] );
		$endpoint = $this->endpoint ?? Post_Query::ENDPOINT;
		$namespace = $this->namespace ?? Post_Query::NAMESPACE;
		$url = $namespace . '/' . $endpoint;

		return [
			'params' => $params,
			'url' => $url,
		];
	}
}
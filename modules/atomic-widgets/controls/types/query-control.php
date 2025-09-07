<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\WpRest\Classes\Post_Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Query_Control extends Atomic_Control_Base {
	private int $minimum_input_length = 2;
	private ?string $placeholder = null;
	private array $query_options = [
		'endpoint' => '',
		'requestParams' => [],
	];

	public static function bind_to( string $prop_name, array $config = [] ) {
		$namespace = $config['namespace'] ?? Post_Query::NAMESPACE;
		$endpoint = $config['endpoint'] ?? Post_Query::ENDPOINT;
		$post_types = $config[ Post_Query::ALLOWED_POST_TYPES ] ?? null;
		$instance = parent::bind_to( $prop_name );
		$instance->set_placeholder( __( 'Type or paste your URL', 'elementor' ) );
		$instance->set_endpoint( $namespace . '/' . $endpoint );
		$instance->set_request_params( Post_Query::build_query_params( [
			Post_Query::POST_KEYS_CONVERSION_MAP => [
				'ID' => 'id',
				'post_title' => 'label',
				'post_type' => 'groupLabel',
			],
			Post_Query::ALLOWED_POST_TYPES => $post_types,
		], ) );

		return $instance;
	}

	public function get_type(): string {
		return 'query';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->placeholder,
			'queryOptions' => $this->query_options,
			'minInputLength' => $this->minimum_input_length,
		];
	}

	public function set_endpoint( string $url ): self {
		$this->query_options['endpoint'] = $url;

		return $this;
	}

	public function set_request_params( array $params ): self {
		$this->query_options['requestParams'] = $params;

		return $this;
	}

	public function set_minimum_input_length( int $input_length ): self {
		$this->minimum_input_length = $input_length;

		return $this;
	}
}

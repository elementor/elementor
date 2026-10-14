<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Controls_Manager;
use Elementor\Core\DynamicTags\Data_Tag;
use Elementor\Modules\DynamicTags\Module as Dynamic_Tags_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Image_Tag extends Data_Tag {
	const NAME = 'e-state-image';

	public function get_name() {
		return self::NAME;
	}

	public function get_title() {
		return esc_html__( 'Element state image', 'elementor' );
	}

	public function get_group() {
		return State_Tag::GROUP;
	}

	public function get_categories() {
		return [ Dynamic_Tags_Module::IMAGE_CATEGORY ];
	}

	protected function register_controls() {
		$this->add_control( 'key', [
			'label' => esc_html__( 'State key', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => '',
		] );

		$this->add_control( 'scope', [
			'label' => esc_html__( 'State scope', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => '',
		] );
	}

	protected function get_value( array $options = [] ) {
		$key = (string) ( $this->get_settings( 'key' ) ?? '' );
		$scope = (string) ( $this->get_settings( 'scope' ) ?? '' );
		$state = State_Tag::resolve_state( [ 'scope' => $scope ] );
		$value = State_Params::get_by_path( $state, $key );
		$url = is_array( $value ) ? (string) ( $value['url'] ?? '' ) : (string) $value;

		if ( '' === $url ) {
			return [];
		}

		$binding = [
			'key' => $key . '.url',
			'scope' => $scope,
			'format' => State_Formatter::FORMAT_RAW,
			'prefix' => '',
			'suffix' => '',
		];

		return [
			'id' => is_array( $value ) ? ( $value['id'] ?? null ) : null,
			'url' => Binding_Collector::wrap( $binding, $url ),
		];
	}
}

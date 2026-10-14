<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Controls_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\DynamicTags\Module as Dynamic_Tags_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Tag extends Tag {
	const NAME = 'e-state';
	const GROUP = 'element-state';
	const RENDER_CONTEXT_KEY = 'data-flow';
	const PAGE_SCOPE = 'page';

	public function get_name() {
		return self::NAME;
	}

	public function get_title() {
		return esc_html__( 'Element state', 'elementor' );
	}

	public function get_group() {
		return self::GROUP;
	}

	public function get_categories() {
		return [
			Dynamic_Tags_Module::TEXT_CATEGORY,
			Dynamic_Tags_Module::NUMBER_CATEGORY,
			Dynamic_Tags_Module::URL_CATEGORY,
			Dynamic_Tags_Module::COLOR_CATEGORY,
		];
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

		$this->add_control( 'format', [
			'label' => esc_html__( 'Format', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => State_Formatter::FORMAT_RAW,
			'options' => [
				State_Formatter::FORMAT_RAW => esc_html__( 'Raw', 'elementor' ),
				State_Formatter::FORMAT_NUMBER => esc_html__( 'Number', 'elementor' ),
				State_Formatter::FORMAT_PERCENT => esc_html__( 'Percent', 'elementor' ),
			],
		] );

		$this->add_control( 'prefix', [
			'label' => esc_html__( 'Prefix', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => '',
		] );

		$this->add_control( 'suffix', [
			'label' => esc_html__( 'Suffix', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => '',
		] );
	}

	public function render() {
		$settings = $this->get_settings();
		$state = self::resolve_state( $settings );

		$value = State_Params::get_by_path( $state, (string) ( $settings['key'] ?? '' ) );

		$binding = [
			'key' => (string) ( $settings['key'] ?? '' ),
			'scope' => (string) ( $settings['scope'] ?? '' ),
			'format' => (string) $settings['format'],
			'prefix' => (string) $settings['prefix'],
			'suffix' => (string) $settings['suffix'],
		];

		$text = esc_html( State_Formatter::format( $value, $binding['format'], $binding['prefix'], $binding['suffix'] ) );

		echo Binding_Collector::wrap( $binding, $text ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	public static function resolve_state( array $settings ): array {
		$context = Render_Context::get( self::RENDER_CONTEXT_KEY );
		$scope = (string) ( $settings['scope'] ?? '' );

		return $context['scopes'][ $scope ] ?? $context['state'] ?? [];
	}
}

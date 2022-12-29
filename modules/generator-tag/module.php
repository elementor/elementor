<?php
namespace Elementor\Modules\GeneratorTag;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'generator-tag';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'wp_head', [ $this, 'render_generator_tag' ] );
	}

	public function render_generator_tag() {
		$generator_content = $this->get_generator_content();

		echo '<meta name="generator" content="' . esc_attr( $generator_content ) . '">' . PHP_EOL;
	}

	private function get_generator_content(): string {
		$active_features = $this->get_active_features();
		$settings = $this->get_generator_tag_settings();

		$tags = [
			'Elementor ' . ELEMENTOR_VERSION,
		];

		if ( ! empty( $active_features ) ) {
			$tags[] = 'features: ' . implode( ', ', $active_features );
		}

		if ( ! empty( $settings ) ) {
			$tags[] = 'settings: ' . implode( ', ', $settings );
		}

		return implode( '; ', $tags );
	}

	private function get_active_features(): array {
		$active_features = [];

		foreach ( Plugin::$instance->experiments->get_active_features() as $feature_slug => $feature ) {
			if ( isset( $feature['generator_tag'] ) && $feature['generator_tag'] ) {
				$active_features[] = $feature_slug;
			}
		}

		return $active_features;
	}

	private function get_generator_tag_settings(): array {
		return apply_filters( 'elementor/generator_tag/settings', [] );
	}
}

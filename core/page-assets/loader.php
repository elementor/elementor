<?php
namespace Elementor\Core\Page_Assets;

use Elementor\Core\Base\Module;
use Elementor\Plugin;
use Elementor\Control_Animation;
use Elementor\Control_Exit_Animation;
use Elementor\Control_Hover_Animation;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor assets loader.
 *
 * A class that is responsible for conditionally enqueuing styles and script assets that were pre-enabled.
 *
 * @since 3.3.0
 */
class Loader extends Module {
	private array $assets = [];

	public function get_name(): string {
		return 'assets-loader';
	}

	private function init_assets(): void {
		$assets = [
			'styles' => $this->init_styles(),
			'scripts' => [],
		];

		$this->assets = $assets;
	}

	private function init_styles(): array {
		$styles = [
			// TODO: Remove the 'e-animations' registration in v3.26.0 [ED-15471].
			'e-animations' => [
				'src' => $this->get_css_assets_url( 'animations', 'assets/lib/animations/', true ),
				'version' => ELEMENTOR_VERSION,
				'dependencies' => [],
			],
			'e-shapes' => [
				'src' => $this->get_css_assets_url( 'shapes', 'assets/css/conditionals/' ),
				'version' => ELEMENTOR_VERSION,
				'dependencies' => [],
			],
			'e-swiper' => [
				'src' => $this->get_css_assets_url( 'e-swiper', 'assets/css/conditionals/' ),
				'version' => ELEMENTOR_VERSION,
				'dependencies' => [ 'swiper' ],
			],
			'swiper' => [
				'src' => $this->get_css_assets_url( 'swiper', $this->getSwiperPath() ),
				'version' => $this->getSwiperVersion(),
				'dependencies' => [],
			],
		];

		return array_merge( $styles, $this->get_animation_styles() );
	}

	private function getSwiperPath(): string {
		return Plugin::$instance->experiments->is_feature_active( 'e_swiper_latest' ) ? 'assets/lib/swiper/v8/css/' : 'assets/lib/swiper/css/';
	}

	private function getSwiperVersion(): string {
		return Plugin::$instance->experiments->is_feature_active( 'e_swiper_latest' ) ? '8.4.5' : '5.3.6';
	}

	private function get_animations(): array {
		$grouped_animations = Control_Animation::get_default_animations();
		$grouped_animations['hover'] = Control_Hover_Animation::get_default_animations();
		$exit_animations = Control_Exit_Animation::get_default_animations();

		$grouped_animations = array_merge( $grouped_animations, $exit_animations );

		$animations = [];

		foreach ( $grouped_animations as $group_label => $group ) {
			foreach ( $group as $animation_key => $animation_label ) {
				$animations[ $animation_key ] = $group_label;
			}
		}

		return $animations;
	}

	private function get_animation_styles(): array {
		$animations = $this->get_animations();
		$styles = [];

		foreach ( $animations as $animation => $group_label ) {
			$style_prefix = 'hover' === $group_label ? 'e-animation-' : '';

			$styles[ 'e-animation-' . $animation ] = [
				'src' => $this->get_css_assets_url( $style_prefix . $animation, 'assets/lib/animations/styles/' ),
				'version' => ELEMENTOR_VERSION,
				'dependencies' => [],
			];
		}

		return $styles;
	}

	public function get_assets(): array {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		return $this->assets;
	}

	/**
	 * @param array $assets {
	 *     @type array 'styles'
	 *     @type array 'scripts'
	 * }
	 */
	public function enable_assets( array $assets_data ): void {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		foreach ( $assets_data as $assets_type => $assets_list ) {
			foreach ( $assets_list as $asset_name ) {
				$this->assets[ $assets_type ][ $asset_name ]['enabled'] = true;

				if ( 'scripts' === $assets_type ) {
					wp_enqueue_script( $asset_name );
				} else {
					wp_enqueue_style( $asset_name );
				}
			}
		}
	}

	/**
	 * @param array $assets {
	 *     @type array 'styles'
	 *     @type array 'scripts'
	 * }
	 */
	public function add_assets( array $assets ): void {
		if ( ! $this->assets ) {
			$this->init_assets();
		}

		$this->assets = array_replace_recursive( $this->assets, $assets );
	}

	/**
	 * @deprecated 3.22.0
	 */
	public function enqueue_assets(): void {
		$assets = $this->get_assets();
		$is_preview_mode = Plugin::$instance->preview->is_preview_mode();

		foreach ( $assets as $assets_type => $assets_type_data ) {
			foreach ( $assets_type_data as $asset_name => $asset_data ) {
				if ( empty( $asset_data['src'] ) ) {
					continue;
				}

				if ( ! empty( $asset_data['enabled'] ) || $is_preview_mode ) {
					if ( 'scripts' === $assets_type ) {
						wp_enqueue_script( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'], true );
					} else {
						// TODO: Remove the 'e-animations' registration in v3.26.0 [ED-15471].
						if ( $this->skip_animations_style( $asset_name ) ) {
							continue;
						}

						wp_enqueue_style( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'] );
					}
				}
			}
		}
	}

	// TODO: Remove the 'e-animations' registration in v3.26.0 [ED-15471].
	private function skip_animations_style( $asset_name ): bool {
		$is_preview = Plugin::$instance->preview->is_preview_mode();

		return $is_preview && 'e-animations' === $asset_name;
	}

	private function register_assets(): void {
		$assets = $this->get_assets();

		foreach ( $assets as $assets_type => $assets_type_data ) {
			foreach ( $assets_type_data as $asset_name => $asset_data ) {
				if ( 'scripts' === $assets_type ) {
					wp_register_script( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'], true );
				} else {
					wp_register_style( $asset_name, $asset_data['src'], $asset_data['dependencies'], $asset_data['version'] );
				}
			}
		}
	}

	public function __construct() {
		parent::__construct();

		$this->register_assets();
	}
}

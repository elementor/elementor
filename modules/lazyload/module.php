<?php
namespace Elementor\Modules\LazyLoad;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Element_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_lazyload';

	public function get_name() {
		return 'lazyload';
	}

	public static function get_experimental_data() {
		return [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Lazy Load Background Images', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'Lazy loading images that are not in the viewport improves initial page load performance and user experience. By activating this experiment all background images except the first one on your page will be lazy loaded to improve your LCP score', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
		];
	}

	private function enqueue_styles() {
		wp_enqueue_style(
			'elementor-lazyload',
			$this->get_css_assets_url( 'modules/lazyload/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	private function get_repeaters_selectors( $controls, $settings ) {
		$selectors = [];
		$repeater = array_filter( $controls, function( $control ) {
			if ( 'repeater' === $control['type'] && Utils::get_array_value_by_keys( $control, [ 'fields', 'background_image', 'fields_options', 'image', 'background_lazyload', 'active' ] ) ) {
				return true;
			}
		} );
		if ( empty( $repeater ) ) {
			return false;
		}
		$repeater = array_shift( $repeater );

		if ( $repeater ) {
			$repeater_settings = $settings[ $repeater['name'] ][0];
			$repeater_selector = $this->get_repeater_selector( $repeater_settings, $repeater );
			if ( $repeater_selector ) {
				$selectors[] = $repeater_selector;
			}
		}

		return $selectors;
	}

	private function get_repeater_selector( $repeater_settings, $repeater ) {
		$lazyload_options = Utils::get_array_value_by_keys( $repeater, [ 'fields', 'background_image', 'fields_options', 'image', 'background_lazyload' ] );
		if ( ! $lazyload_options['active'] ) {
			return false;
		}

		$repeater_selector = Utils::get_array_value_by_keys( $lazyload_options, [ 'selector' ] );
		if ( ! $repeater_selector ) {
			return false;
		}

		$repeater_keys = Utils::get_array_value_by_keys( $repeater_settings, [ 'background_lazyload', 'keys' ] );
		$repeater_background_image_url = Utils::get_array_value_by_keys( $repeater_settings, $repeater_keys );

		if ( $repeater_background_image_url ) {
			return $repeater_selector;
		}

		return false;
	}

	private function update_element_attributes( Element_Base $element ) {

		$settings = $element->get_settings_for_display();
		$controls = $element->get_controls();
		$lazyload_attribute_name = 'data-e-bg-lazyload';
		$attributes = [];
		$controls_with_background_image = array_filter( $controls, function( $control ) {
			return Utils::get_array_value_by_keys( $control, [ 'background_lazyload', 'active' ] );
		} );

		$repeaters_selectors = $this->get_repeaters_selectors( $controls, $settings );

		foreach ( $controls_with_background_image as $control_name => $control_data ) {

			$selectors = [];

			if ( $repeaters_selectors ) {
				$selectors = array_merge( $repeaters_selectors, $selectors );
			}

			$keys = Utils::get_array_value_by_keys( $control_data, [ 'background_lazyload', 'keys' ] );
			$background_image_url = Utils::get_array_value_by_keys( $settings, $keys );

			if ( $background_image_url || $selectors ) {

				$has_attribute = $element->get_render_attributes( '_wrapper', $lazyload_attribute_name );
				if ( ! $has_attribute ) {

					$wrapper_bg_selector = Utils::get_array_value_by_keys( $control_data, [ 'background_lazyload', 'selector' ] );
					$bg_selector = $wrapper_bg_selector ?? '';

					$bg_selector = implode( ',', $selectors ) . $bg_selector;
					$selectors[] = $bg_selector;

					$wrapper_selector = $element->get_unique_selector();
					$selectors = array_map( function( $selector ) use ( $wrapper_selector ) {
						return $wrapper_selector . ' ' . $selector;
					}, $selectors );

					if ( $background_image_url && ! $wrapper_bg_selector ) {
						$selectors[] = $wrapper_selector;
					}

					// Trim spaces and remove duplicates.
					$selectors = array_unique( array_map( 'trim', $selectors ) );

					$attributes[ $lazyload_attribute_name ] = implode( ',', $selectors );

				}
			}
		}

		if ( ! empty( $attributes ) ) {
			$element->add_render_attribute( '_wrapper',
				$attributes
			);
		}

	}

	private function append_lazyload_selector( $control, $value ) {

		// If the control is a repeater, we need to loop over the repeater fields options to get the background_lazyload property.
		$is_background_lazyload = Utils::get_array_value_by_keys( $control, [ 'background_lazyload', 'active' ] ) ?? Utils::get_array_value_by_keys( $control, [ 'fields_options', 'image', 'background_lazyload', 'active' ] );

		if ( $is_background_lazyload ) {
			foreach ( $control['selectors'] as $selector => $css_property ) {
				if ( 0 === strpos( $css_property, 'background-image' ) ) {
					if ( ! empty( $value['url'] ) ) {

						$css_property  = str_replace( 'url("{{URL}}")', 'var(--e-bg-lazyload-loaded)', $css_property );
						// Support for background repeaters, control is without quotes.
						$css_property  = str_replace( 'url({{URL}})', 'var(--e-bg-lazyload-loaded)', $css_property );

						$control['selectors'][ $selector ] = $css_property . ';--e-bg-lazyload: url("' . $value['url'] . '");';
						$control = $this->apply_dominant_color_background( $control, $value, $selector );
					}
				}
			}
		}
		return $control;
	}

	private function apply_dominant_color_background( $control, $value, $selector ) {
		$metadata = wp_get_attachment_metadata( $value['id'] );
		$dominant_color = Utils::get_array_value_by_keys( $metadata, [ 'dominant_color' ] );
		if ( $dominant_color ) {
			$control['selectors'][ $selector ] .= "background-color: #{$dominant_color};";
		}
		return $control;
	}

	private function is_document_support_lazyload( $post_id ) {
		if ( ! $post_id ) {
			return false;
		}

		$document = \Elementor\Plugin::$instance->documents->get( $post_id );

		if ( $document ) {
			$support_lazyload = $document->get_property( 'support_lazyload' );
			if ( false === $support_lazyload ) {
				return false;
			}
		}

		return true;
	}

	public function __construct() {
		parent::__construct();

		// Disable lazyload in admin area (true if inside WordPress administration interface - Editor, Admin, etc.)
		if ( is_admin() ) {
			return;
		}

		add_action( 'elementor/element/after_add_attributes', function( Element_Base $element ) {

			$current_document = \Elementor\Plugin::$instance->documents->get_current();

			if ( ! $current_document ) {
				return;
			}

			$post_id = $current_document->get_main_id();

			if ( ! $this->is_document_support_lazyload( $post_id ) ) {
				return;
			}

			$this->update_element_attributes( $element );
		} );

		add_filter('elementor/files/css/selectors', function( $control, $value, $css_instance ) {

			$post_id = method_exists( $css_instance, 'get_post_id' ) ? $css_instance->get_post_id() : false;

			if ( ! $post_id ) {
				return $control;
			}

			if ( ! $this->is_document_support_lazyload( $post_id ) ) {
				return $control;
			}

			return $this->append_lazyload_selector( $control, $value );
		}, 10, 3);

		add_filter( 'body_class', function( $classes ) {
			$classes[] = 'e-lazyload';
			return $classes;
		} );

		add_action( 'wp_enqueue_scripts', function() {
			$this->enqueue_styles();
		} );

		add_action( 'wp_footer', function() {
			?>
			<script type='text/javascript'>

				const lazyloadRunObserver = () => {
					const dataAttribute = 'data-e-bg-lazyload';
					const reapterAttribute = 'data-e-bg-repeater';

					const lazyloadBackgroundObserver = new IntersectionObserver( ( entries ) => {
					entries.forEach( ( entry ) => {
						if ( entry.isIntersecting ) {
							entry.target.classList.add( 'lazyloaded' );
							lazyloadBackgroundObserver.unobserve( entry.target );
						}
					});
					}, { rootMargin: '100px 0px 100px 0px' } );

					let lazyloadBackgrounds = document.querySelectorAll( `[${ dataAttribute }]:not(.lazyloaded)` );
					let elementsToObserve = [];

					lazyloadBackgrounds.forEach( ( lazyloadBackgroundWrapper ) => {
						const selectors = lazyloadBackgroundWrapper.getAttribute( dataAttribute );
						if ( selectors ) {
							const innerSelectors = document.querySelectorAll( selectors );
							elementsToObserve = [...elementsToObserve, ...innerSelectors];
						}
					} );

					elementsToObserve.forEach( ( lazyloadBackground ) => {
						lazyloadBackgroundObserver.observe( lazyloadBackground );
					} );
				};
				const events = [
					'DOMContentLoaded',
					'elementor/lazyload/observe',
				];
				events.forEach( ( event ) => {
					document.addEventListener( event, lazyloadRunObserver );
				} );
			</script>
			<?php
		} );

	}
}

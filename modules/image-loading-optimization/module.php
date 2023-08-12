<?php
namespace Elementor\Modules\ImageLoadingOptimization;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	private $min_priority_img_pixels;
	private static $image_visited = [];

	public function get_name() {
		return 'image-loading-optimization';
	}

	public function __construct() {
		parent::__construct();

		$this->min_priority_img_pixels = 50000;

		// Stop wp core logic.
		add_action( 'init', [ $this, 'stop_core_fetchpriority_high_logic' ] );
		add_filter( 'wp_lazy_loading_enabled', '__return_false' );

		// Run optimization logic on header.
		add_action( 'get_header', [ $this, 'set_buffer' ] );
		add_action( 'elementor/page_templates/header-footer/before_content', [ $this, 'flush_buffer' ] );

		// Run optimization logic on content.
		add_filter( 'wp_content_img_tag', [ $this, 'loading_optimization_content_image' ] );

		// Run optimization logic on footer.
		add_action( 'elementor/page_templates/header-footer/after_content', [ $this, 'set_buffer' ] );
		add_action( 'elementor/page_templates/header-footer/after_footer', [ $this, 'flush_buffer' ] );
	}

	public function set_buffer() {
		ob_start( [ $this, 'handel_buffer_content' ] );
	}

	public function flush_buffer() {
		ob_end_flush();
	}

	public function handel_buffer_content( $buffer ) {
		return $this->filter_images( $buffer );
	}

	private function filter_images( $content ) {
		if ( ! preg_match_all( '/<img\s[^>]+>/', $content, $matches, PREG_SET_ORDER ) ) {
			return $content;
		}

		// Iterate through the matches in order of occurrence as it is relevant for whether or not to lazy-load.
		foreach ( $matches as $match ) {
			$tag = $match[0];

			// Filter an image match.
			$filtered_image = $tag;
			$attachment_id  = $images[ $tag ];

			if ( isset( self::$image_visited[ $tag ] ) ) {
				$filtered_image = self::$image_visited[ $tag ];
			} else {
				// Add loading optimization attributes if applicable.
				$filtered_image = $this->add_loading_optimization_attrs( $filtered_image );
			}

			if ( $filtered_image !== $tag ) {
				$content = str_replace( $tag, $filtered_image, $content );
			}

			self::$image_visited[ $tag ] = $filtered_image;
		}

		return $content;
	}

	public function stop_core_fetchpriority_high_logic() {
		// wp_high_priority_element_flag was only introduced in 6.3.0
		if ( function_exists( 'wp_high_priority_element_flag' ) ) {
			wp_high_priority_element_flag( false );
		}
	}

	public function loading_optimization_content_image( $image ) {
		if ( isset( self::$image_visited[ $image ] ) ) {
			return self::$image_visited[ $image ];
		}

		$filtered_image = $this->add_loading_optimization_attrs( $image );
		self::$image_visited[ $image ] = $filtered_image;
		return $filtered_image;
	}

	private function add_loading_optimization_attrs( $image ) {
		$width             = preg_match( '/ width=["\']([0-9]+)["\']/', $image, $match_width ) ? (int) $match_width[1] : null;
		$height            = preg_match( '/ height=["\']([0-9]+)["\']/', $image, $match_height ) ? (int) $match_height[1] : null;
		$loading_val       = preg_match( '/ loading=["\']([A-Za-z]+)["\']/', $image, $match_loading ) ? $match_loading[1] : null;
		$fetchpriority_val = preg_match( '/ fetchpriority=["\']([A-Za-z]+)["\']/', $image, $match_fetchpriority ) ? $match_fetchpriority[1] : null;

		// Images should have height and dimension width for the loading optimization attributes to be added.
		if ( ! str_contains( $image, ' width="' ) || ! str_contains( $image, ' height="' ) ) {
			return $image;
		}

		$optimization_attrs = $this->get_loading_optimization_attributes(
			array(
				'width'         => $width,
				'height'        => $height,
				'loading'       => $loading_val,
				'fetchpriority' => $fetchpriority_val,
			)
		);

		if ( ! empty( $optimization_attrs['fetchpriority'] ) ) {
			$image = str_replace( '<img', '<img fetchpriority="' . esc_attr( $optimization_attrs['fetchpriority'] ) . '"', $image );
		}

		if ( ! empty( $optimization_attrs['loading'] ) ) {
			$image = str_replace( '<img', '<img loading="' . esc_attr( $optimization_attrs['loading'] ) . '"', $image );
		}

		return $image;
	}

	private function get_loading_optimization_attributes( $attr ) {
		$loading_attrs = array();

		// For any resources, width and height must be provided, to avoid layout shifts.
		if ( ! isset( $attr['width'], $attr['height'] ) ) {
			return $loading_attrs;
		}

		/*
		 * The key function logic starts here.
		 */
		$maybe_in_viewport    = null;
		$increase_count       = false;
		$maybe_increase_count = false;

		// Logic to handle a `loading` attribute that is already provided.
		if ( isset( $attr['loading'] ) ) {
			/*
			 * Interpret "lazy" as not in viewport. Any other value can be
			 * interpreted as in viewport (realistically only "eager" or `false`
			 * to force-omit the attribute are other potential values).
			 */
			if ( 'lazy' === $attr['loading'] ) {
				$maybe_in_viewport = false;
			} else {
				$maybe_in_viewport = true;
			}
		}

		// Logic to handle a `fetchpriority` attribute that is already provided.
		if ( isset( $attr['fetchpriority'] ) && 'high' === $attr['fetchpriority'] ) {
			/*
			 * If the image was already determined to not be in the viewport (e.g.
			 * from an already provided `loading` attribute), trigger a warning.
			 * Otherwise, the value can be interpreted as in viewport, since only
			 * the most important in-viewport image should have `fetchpriority` set
			 * to "high".
			 */
			if ( false === $maybe_in_viewport ) {
				_doing_it_wrong(
					__FUNCTION__,
					__( 'An image should not be lazy-loaded and marked as high priority at the same time.', 'elementor' ),
					''
				);
				/*
				 * Set `fetchpriority` here for backward-compatibility as we should
				 * not override what a developer decided, even though it seems
				 * incorrect.
				 */
				$loading_attrs['fetchpriority'] = 'high';
			} else {
				$maybe_in_viewport = true;
			}
		}

		if ( null === $maybe_in_viewport ) {
			if ( ! is_admin() ) {
				$content_media_count = $this->increase_content_media_count( 0 );
				$increase_count      = true;
				if ( $content_media_count < $this->omit_loading_attr_threshold() ) {
					$maybe_in_viewport = true;
				} else {
					$maybe_in_viewport = false;
				}
			}
		}

		if ( $maybe_in_viewport ) {
			$loading_attrs = $this->maybe_add_fetchpriority_high_attr( $loading_attrs, $attr );
		} else {
			$loading_attrs['loading'] = 'lazy';
		}

		if ( $increase_count ) {
			$this->increase_content_media_count();
		} elseif ( $maybe_increase_count ) {
			if ( $this->min_priority_img_pixels <= $attr['width'] * $attr['height'] ) {
				$this->increase_content_media_count();
			}
		}

		return $loading_attrs;
	}

	private function increase_content_media_count( $amount = 1 ) {
		static $content_media_count = 0;

		$content_media_count += $amount;

		return $content_media_count;
	}

	private function omit_loading_attr_threshold( $force = false ) {
		static $omit_threshold;
		if ( ! isset( $omit_threshold ) || $force ) {
			$omit_threshold = 3;
		}

		return $omit_threshold;
	}

	private function maybe_add_fetchpriority_high_attr( $loading_attrs, $attr ) {
		if ( isset( $attr['fetchpriority'] ) ) {
			if ( 'high' === $attr['fetchpriority'] ) {
				$loading_attrs['fetchpriority'] = 'high';
				$this->high_priority_element_flag( false );
			}
			return $loading_attrs;
		}

		// Lazy-loading and `fetchpriority="high"` are mutually exclusive.
		if ( isset( $loading_attrs['loading'] ) && 'lazy' === $loading_attrs['loading'] ) {
			return $loading_attrs;
		}

		if ( ! $this->high_priority_element_flag() ) {
			return $loading_attrs;
		}

		if ( $this->min_priority_img_pixels <= $attr['width'] * $attr['height'] ) {
			$loading_attrs['fetchpriority'] = 'high';
			$this->high_priority_element_flag( false );
		}
		return $loading_attrs;
	}

	private function high_priority_element_flag( $value = null ) {
		static $high_priority_element = true;

		if ( is_bool( $value ) ) {
			$high_priority_element = $value;
		}
		return $high_priority_element;
	}
}

<?php
namespace Elementor\Modules\ImageLoadingOptimization;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function get_name() {
		return 'image-loading-optimization';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'wp_get_attachment_image_attributes', [ $this, 'remove_get_attachment_loading_attributes' ], 10, 3 );
		add_action( 'wp_content_img_tag', [ $this, 'remove_content_img_tag_loading_attributes' ], 10, 3 );
		add_filter( 'the_content', [ $this, 'filter_images' ], 10, 1 );
	}

	public function remove_get_attachment_loading_attributes( $attr, $attachment, $size ) {
		unset( $attr['fetchpriority'] );
		unset( $attr['loading'] );
		return $attr;
	}

	public function remove_content_img_tag_loading_attributes( $filtered_image, $context, $attachment_id ) {
		$tag = new \WP_HTML_Tag_Processor( $filtered_image );
		if ( $tag->next_tag() ) {
			$tag->remove_attribute( 'fetchpriority' );
			$tag->remove_attribute( 'loading' );
		}
		return $tag->get_updated_html();
	}

	public function filter_images( $content ) {
		if ( ! preg_match_all( '/<img\s[^>]+>/', $content, $matches, PREG_SET_ORDER ) ) {
			return $content;
		}
	
		// List of the unique `img` tags found in $content.
		$images = array();

		foreach ( $matches as $match ) {
			$tag = $match[0];
			if ( preg_match( '/wp-image-([0-9]+)/i', $tag, $class_id ) ) {
					$attachment_id = absint( $class_id[1] );

					if ( $attachment_id ) {
						/*
							* If exactly the same image tag is used more than once, overwrite it.
							* All identical tags will be replaced later with 'str_replace()'.
							*/
						$images[ $tag ] = $attachment_id;
					}
			}
			$images[ $tag ] = 0;
		}

		// Reduce the array to unique attachment IDs.
		$attachment_ids = array_unique( array_filter( array_values( $images ) ) );

		if ( count( $attachment_ids ) > 1 ) {
			/*
			* Warm the object cache with post and meta information for all found
			* images to avoid making individual database calls.
			*/
			_prime_post_caches( $attachment_ids, false, true );
		}

		// Iterate through the matches in order of occurrence as it is relevant for whether or not to lazy-load.
		foreach ( $matches as $match ) {
			// Filter an image match.
			if ( isset( $images[ $match[0] ] ) ) {
				$filtered_image = $match[0];
				$attachment_id  = $images[ $match[0] ];

				// Add loading optimization attributes if applicable.
				$filtered_image = $this->add_loading_optimization_attrs( $filtered_image );
				if ( $filtered_image !== $match[0] ) {
					$content = str_replace( $match[0], $filtered_image, $content );
				}

				/*
				* Unset image lookup to not run the same logic again unnecessarily if the same image tag is used more than
				* once in the same blob of content.
				*/
				unset( $images[ $match[0] ] );
			}
		}

		return $content;
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
					__( 'An image should not be lazy-loaded and marked as high priority at the same time.' )
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
			$loading_attrs = $this->maybe_add_fetchpriority_high_attr( $loading_attrs, $tag_name, $attr );
		} else {
			$loading_attrs['loading'] = 'lazy';
		}
	
		if ( $increase_count ) {
			$this->increase_content_media_count();
		} elseif ( $maybe_increase_count ) {
			$min_priority_img_pixels = apply_filters( 'min_priority_img_pixels', 50000 );
	
			if ( $min_priority_img_pixels <= $attr['width'] * $attr['height'] ) {
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

	private function maybe_add_fetchpriority_high_attr( $loading_attrs, $tag_name, $attr ) {
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
	
		/**
		 * Filters the minimum square-pixels threshold for an image to be eligible as the high-priority image.
		 *
		 * @since 6.3.0
		 *
		 * @param int $threshold Minimum square-pixels threshold. Default 50000.
		 */
		$min_priority_img_pixels = apply_filters( 'min_priority_img_pixels', 50000 );
		if ( $min_priority_img_pixels <= $attr['width'] * $attr['height'] ) {
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

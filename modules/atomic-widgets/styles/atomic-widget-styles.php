<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Utils as ElementorUtils;
use Elementor\Plugin;

class Atomic_Widget_Styles {
	const STYLES_KEY = 'local';
	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW = 'preview';

	public function register_hooks() {
		add_action( 'elementor/atomic-widgets/styles/register', function( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
			$this->register_styles( $styles_manager, $post_ids );
		}, 30, 2 );

		add_action( 'elementor/document/after_save', fn( Document $document ) => $this->invalidate_cache(
			[ $document->get_main_post()->ID ],
			$this->get_context( ! Utils::is_post_published( $document ) )
		), 20, 2 );

		add_action(
			'elementor/core/files/clear_cache',
			fn() => $this->invalidate_cache(),
		);

		add_action(
			'deleted_post',
			fn( $post_id ) => $this->invalidate_cache( [ $post_id ] )
		);

		add_action( 'update_option__elementor_pro_license_v2_data', fn() => Plugin::$instance->files_manager->clear_cache() );
		add_action( 'delete_option__elementor_pro_license_v2_data', fn() => Plugin::$instance->files_manager->clear_cache() );
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
		$context = $this->get_context( is_preview() );

		foreach ( $post_ids as $post_id ) {
			$get_styles = fn() => $this->parse_post_styles( $post_id );

			$styles_manager->register( [ self::STYLES_KEY, $post_id, $context ], $get_styles );
		}
	}

	private function parse_post_styles( $post_id ) {
		$post_styles = [];

		Utils::traverse_post_elements( $post_id, function( $element_data ) use ( &$post_styles ) {
			$post_styles = array_merge( $post_styles, $this->parse_element_style( $element_data ) );
		} );

		return self::get_license_based_filtered_styles( $post_styles );
	}

	private function parse_element_style( array $element_data ) {
		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! Utils::is_atomic( $element_instance ) ) {
			return [];
		}

		return $element_data['styles'] ?? [];
	}

	private function invalidate_cache( ?array $post_ids = null, ?string $context = null ) {
		if ( empty( $post_ids ) ) {
			do_action( 'elementor/atomic-widgets/styles/clear', [ self::STYLES_KEY ] );

			return;
		}

		$is_post_status_publish = self::CONTEXT_FRONTEND === $context;

		// When a user publishes a post, we should invalidate the styles of the draft too
		foreach ( $post_ids as $post_id ) {
			do_action( 'elementor/atomic-widgets/styles/clear',
				empty( $context ) || $is_post_status_publish
					? [ self::STYLES_KEY, $post_id ]
					: [ self::STYLES_KEY, $post_id, $context ]
			);
		}
	}

	private function get_context( bool $is_preview ) {
		return $is_preview ? self::CONTEXT_PREVIEW : self::CONTEXT_FRONTEND;
	}

	public static function get_license_based_filtered_styles( $styles ) {
		if ( ElementorUtils::has_pro() && version_compare( ELEMENTOR_PRO_VERSION, '3.35', '<' ) ) {
			return $styles;
		}

		return apply_filters(
			'elementor/atomic_widgets/editor_data/element_styles',
			self::remove_custom_css_from_styles( $styles ),
			$styles
		);
	}

	public static function remove_custom_css_from_styles( array $styles ) {
		if ( empty( $styles ) ) {
			return $styles;
		}

		foreach ( $styles as $style_id => $style ) {
			if ( isset( $style['variants'] ) && is_array( $style['variants'] ) ) {
				foreach ( $style['variants'] as $variant_index => $variant ) {
					unset( $styles[ $style_id ]['variants'][ $variant_index ]['custom_css'] );
				}
			}
		}

		return $styles;
	}
}

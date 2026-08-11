<?php

namespace Elementor\Modules\DefaultStyles;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\DefaultStyles\Concerns\Has_Kit_Dependency;
use Elementor\Modules\DefaultStyles\Concerns\Has_Preview_Context;
use Elementor\Modules\DefaultStyles\Utils\Default_Style_Data_Normalizer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Styles_Repository {
	use Has_Kit_Dependency;
	use Has_Preview_Context;

	const CONTEXT_FRONTEND = 'frontend';
	const CONTEXT_PREVIEW = 'preview';

	private ?array $cache = null;

	public function __construct( ?Kit $kit = null ) {
		if ( null !== $kit ) {
			$this->set_kit( $kit );
		}
	}

	public static function make( ?Kit $kit = null ): self {
		return new self( $kit );
	}

	protected function on_preview_change(): void {
		$this->cache = null;
	}

	public function all( bool $force = false ): array {
		if ( ! $force && null !== $this->cache ) {
			return $this->cache;
		}

		$items = [];
		$tag_post_ids = Default_Styles_Tag_Post_IDs::make( $this->get_kit() )->get_all();

		foreach ( $tag_post_ids as $tag => $post_id ) {
			$post = Default_Style_Post::from_post_id( $post_id, $this->is_preview() );

			if ( $post ) {
				$items[ $tag ] = $post->to_array();
			}
		}

		$this->cache = $items;

		return $items;
	}

	public function get( string $tag ): ?array {
		$post = Default_Style_Post::find_by_tag( $tag, $this->is_preview(), $this->get_kit() );

		return $post ? $post->to_array() : null;
	}

	public function put( string $tag, array $data ): void {
		if ( ! self::is_allowed_tag( $tag ) ) {
			return;
		}

		$post = Default_Style_Post::find_by_tag( $tag, $this->is_preview(), $this->get_kit() );
		$normalized = Default_Style_Data_Normalizer::normalize_style_fields( $data );

		if ( $post ) {
			$post->set_preview( $this->is_preview() )->update_data( $normalized );
			clean_post_cache( $post->get_post_id() );
		} else {
			$created = Default_Style_Post::create( $tag, [], $this->get_kit() );

			if ( $created ) {
				$created->set_preview( $this->is_preview() )->update_data( $normalized );
				clean_post_cache( $created->get_post_id() );
			}
		}

		$this->cache = null;

		do_action( 'elementor/default_styles/update', $this->get_context_key( 'event' ), [ 'tag' => $tag ] );
	}

	public function delete( string $tag ): void {
		$post = Default_Style_Post::find_by_tag( $tag, false, $this->get_kit() );

		if ( ! $post ) {
			return;
		}

		if ( $this->is_preview() ) {
			$post->set_preview( true )->update_data( [] );
			clean_post_cache( $post->get_post_id() );
		} else {
			Default_Styles_Tag_Post_IDs::make( $this->get_kit() )->remove_tag( $tag );
			$post->delete();
		}

		$this->cache = null;

		do_action( 'elementor/default_styles/update', $this->get_context_key( 'event' ), [ 'tag' => $tag, 'deleted' => true ] );
	}

	public function publish_all(): void {
		$tag_post_ids = Default_Styles_Tag_Post_IDs::make( $this->get_kit() )->get_all();

		foreach ( $tag_post_ids as $tag => $post_id ) {
			$post = Default_Style_Post::from_post_id( $post_id, true );

			if ( $post ) {
				$post->publish_preview();
				clean_post_cache( $post_id );
			}
		}

		$this->cache = null;

		do_action( 'elementor/default_styles/publish', self::CONTEXT_FRONTEND );
	}

	public static function is_allowed_tag( string $tag ): bool {
		return in_array( $tag, Utils::ALLOWED_HTML_WRAPPER_TAGS, true );
	}

	protected array $context_keys = [
		'event' => [
			'frontend' => self::CONTEXT_FRONTEND,
			'preview' => self::CONTEXT_PREVIEW,
		],
	];
}

<?php

namespace Elementor\Modules\DefaultStyles;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\DefaultStyles\Concerns\Has_Kit_Dependency;
use Elementor\Modules\DefaultStyles\Utils\Default_Style_Data_Normalizer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Styles_Repository {
	use Has_Kit_Dependency;

	private ?array $cache = null;

	public function __construct( ?Kit $kit = null ) {
		if ( null !== $kit ) {
			$this->set_kit( $kit );
		}
	}

	public static function make( ?Kit $kit = null ): self {
		return new self( $kit );
	}

	public function all( bool $force = false ): array {
		if ( ! $force && null !== $this->cache ) {
			return $this->cache;
		}

		$items = [];
		$tag_post_ids = Default_Styles_Tag_Post_IDs::make( $this->get_kit() )->get_all();

		foreach ( $tag_post_ids as $tag => $post_id ) {
			$post = Default_Style_Post::from_post_id( $post_id );

			if ( $post ) {
				$items[ $tag ] = $post->to_array();
			}
		}

		$this->cache = $items;

		return $items;
	}

	public function get( string $tag ): ?array {
		$post = Default_Style_Post::find_by_tag( $tag, $this->get_kit() );

		return $post ? $post->to_array() : null;
	}

	public function each_item( callable $cb, bool $skip_migration = false ): void {
		$tag_post_ids = Default_Styles_Tag_Post_IDs::make( $this->get_kit() )->get_all();

		foreach ( $tag_post_ids as $post_id ) {
			$post = Default_Style_Post::from_post_id( $post_id );

			if ( $post ) {
				$cb( $post->to_array( $skip_migration ) );
			}
		}
	}

	public function put( string $tag, array $data ): void {
		if ( ! self::is_allowed_tag( $tag ) ) {
			return;
		}

		$post = Default_Style_Post::find_by_tag( $tag, $this->get_kit() );
		$normalized = Default_Style_Data_Normalizer::normalize_style_fields( $data );

		if ( $post ) {
			$post->update_data( $normalized );
			clean_post_cache( $post->get_post_id() );
		} else {
			$created = Default_Style_Post::create( $tag, [], $this->get_kit() );

			if ( $created ) {
				$created->update_data( $normalized );
				clean_post_cache( $created->get_post_id() );
			}
		}

		$this->cache = null;

		do_action( 'elementor/default_styles/update', [ 'tag' => $tag ] );
	}

	public function delete( string $tag ): void {
		$post = Default_Style_Post::find_by_tag( $tag, $this->get_kit() );

		if ( ! $post ) {
			return;
		}

		Default_Styles_Tag_Post_IDs::make( $this->get_kit() )->remove_tag( $tag );
		$post->delete();

		$this->cache = null;

		do_action(
			'elementor/default_styles/update',
			[
				'tag'     => $tag,
				'deleted' => true,
			]
		);
	}

	public static function is_allowed_tag( string $tag ): bool {
		return in_array( $tag, Utils::ALLOWED_HTML_WRAPPER_TAGS, true );
	}
}

<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Library\User_Favorites;
use Elementor\Core\App\Modules\KitLibrary\Connect\Kit_Library;
use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Wp_Error_Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repository {
	const TAXONOMIES_KEYS = [ 'tags', 'categories', 'features', 'types' ];

	const KITS_CACHE_KEY = 'elementor_remote_kits';
	const KITS_TAXONOMIES_CACHE_KEY = 'elementor_remote_kits_taxonomies';

	const KITS_CACHE_TTL_HOURS = 12;
	const KITS_TAXONOMIES_CACHE_TTL_HOURS = 12;

	/**
	 * @var Kit_Library
	 */
	protected $api;

	/**
	 * @var User_Favorites
	 */
	protected $user_favorites;

	/**
	 * Get all kits.
	 *
	 * @param false $force_api_request
	 *
	 * @return Collection
	 * @throws Wp_Error_Exception
	 */
	public function get_all( $force_api_request = false ) {
		return $this->get_kits_data( $force_api_request )
			->map( function ( $kit ) {
				return $this->transform_kit_api_response( $kit );
			} );
	}

	/**
	 * Get specific kit.
	 *
	 * @param       $id
	 * @param array $options
	 *
	 * @return array|null
	 * @throws Wp_Error_Exception
	 */
	public function find( $id, $options = [] ) {
		$options = wp_parse_args( $options, [
			'manifest_included' => true,
		] );

		$item = $this->get_kits_data()
			->find( function ( $kit ) use ( $id ) {
				return $kit->_id === $id;
			} );

		if ( ! $item ) {
			return null;
		}

		$manifest = null;

		if ( $options['manifest_included'] ) {
			$manifest = $this->api->get_manifest( $id );

			if ( is_wp_error( $manifest ) ) {
				throw new Wp_Error_Exception( $manifest );
			}
		}

		return $this->transform_kit_api_response( $item, $manifest );
	}

	/**
	 * @param false $force_api_request
	 *
	 * @return mixed|null
	 * @throws Wp_Error_Exception
	 */
	public function get_taxonomies( $force_api_request = false ) {
		return $this->get_taxonomies_data( $force_api_request )
			->only( static::TAXONOMIES_KEYS )
			->map( function ( $values ) {
				return array_unique( $values );
			} )
			->reduce( function ( Collection $carry, $taxonomies, $type ) {
				return $carry->merge( array_map( function ( $text ) use ( $type ) {
					return [
						'text' => $text,
						'type' => $type,
					];
				}, $taxonomies ) );
			}, new Collection( [] ) );
	}

	/**
	 * @param $id
	 *
	 * @return array
	 * @throws Wp_Error_Exception
	 */
	public function get_download_link( $id ) {
		$response = $this->api->download_link( $id );

		if ( is_wp_error( $response ) ) {
			throw new Wp_Error_Exception( $response );
		}

		return [ 'download_link' => $response->download_link ];
	}

	/**
	 * @param $id
	 *
	 * @return array
	 * @throws Wp_Error_Exception
	 * @throws \Exception
	 */
	public function add_to_favorites( $id ) {
		$kit = $this->find( $id, [ 'manifest_included' => false ] );

		if ( ! $kit ) {
			throw new Wp_Error_Exception(
				new \WP_Error( 404, __( 'Kit not found', 'elementor' ) )
			);
		}

		$this->user_favorites->add( 'elementor', 'kits', $kit['id'] );

		$kit['is_favorite'] = true;

		return $kit;
	}

	/**
	 * @param $id
	 *
	 * @return array
	 * @throws Wp_Error_Exception
	 * @throws \Exception
	 */
	public function remove_from_favorites( $id ) {
		$kit = $this->find( $id, [ 'manifest_included' => false ] );

		if ( ! $kit ) {
			throw new Wp_Error_Exception(
				new \WP_Error( 404, __( 'Kit not found', 'elementor' ) )
			);
		}

		$this->user_favorites->remove( 'elementor', 'kits', $kit['id'] );

		$kit['is_favorite'] = false;

		return $kit;
	}

	/**
	 * @param bool $force_api_request
	 *
	 * @return Collection
	 * @throws Wp_Error_Exception
	 */
	private function get_kits_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api->get_all();

			if ( is_wp_error( $data ) ) {
				throw new Wp_Error_Exception( $data );
			}

			set_transient( static::KITS_CACHE_KEY, $data, static::KITS_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return new Collection( $data );
	}

	/**
	 * @param bool $force_api_request
	 *
	 * @return Collection
	 * @throws Wp_Error_Exception
	 */
	private function get_taxonomies_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_TAXONOMIES_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api->get_taxonomies();

			if ( is_wp_error( $data ) ) {
				throw new Wp_Error_Exception( $data );
			}

			set_transient( static::KITS_TAXONOMIES_CACHE_KEY, $data, static::KITS_TAXONOMIES_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return new Collection( (array) $data );
	}

	/**
	 * @param      $kit
	 * @param null $manifest
	 *
	 * @return array
	 */
	private function transform_kit_api_response( $kit, $manifest = null ) {
		$taxonomies = array_reduce( static::TAXONOMIES_KEYS, function ( $current, $key ) use ( $kit ) {
			return array_merge( $current, $kit->{$key} );
		}, [] );

		return array_merge(
			[
				'id' => $kit->_id,
				'title' => $kit->title,
				'thumbnail_url' => $kit->thumbnail,
				'access_level' => $kit->access_level,
				'keywords' => $kit->keywords,
				'taxonomies' => $taxonomies,
				'is_favorite' => $this->user_favorites->exists( 'elementor', 'kits', $kit->_id ),
			],
			$manifest ? $this->transform_manifest_api_response( $manifest ) : []
		);
	}

	/**
	 * @param $manifest
	 *
	 * @return array
	 */
	private function transform_manifest_api_response( $manifest ) {
		$content = ( new Collection( (array) $manifest->templates ) )
			->union(
				array_reduce( (array) $manifest->content, function ( $carry, $content ) {
					return $carry + $content;
				}, [] )
			)
			->map( function ( $manifest_item, $key ) {
				return [
					'id' => isset( $manifest_item->id ) ? $manifest_item->id : $key,
					'title' => $manifest_item->title,
					'doc_type' => $manifest_item->doc_type,
					'thumbnail_url' => $manifest_item->thumbnail,
					'preview_url' => isset( $manifest_item->url ) ? $manifest_item->url : null,
				];
			} );

		return [
			'description' => $manifest->description,
			'preview_url' => isset( $manifest->site ) ? $manifest->site : '',
			'documents' => $content->values(),
		];
	}

	/**
	 * Repository constructor.
	 *
	 * @param Kit_Library    $kit_library
	 * @param User_Favorites $user_favorites
	 */
	public function __construct( Kit_Library $kit_library ) {
		$this->api = $kit_library;
	}
}

<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data;

use Elementor\Core\App\Modules\KitLibrary\Data\Exceptions\Kit_Not_Found_Exception;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repository {
	const FAVORITES_USER_META_KEY = 'elementor_kit_library_favorites';

	const TAXONOMIES_KEYS = [ 'tags', 'categories', 'features', 'types' ];

	const KITS_CACHE_KEY = 'elementor_remote_kits';
	const KITS_TAXONOMIES_CACHE_KEY = 'elementor_remote_kits_taxonomies';

	const KITS_CACHE_TTL_HOURS = 12;
	const KITS_TAXONOMIES_CACHE_TTL_HOURS = 12;

	/**
	 * @var Api_Client
	 */
	protected $api_client;

	/**
	 * Get all kits.
	 *
	 * @param null  $user_id
	 * @param false $force_api_request
	 *
	 * @return Collection
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	public function get_all( $user_id = null, $force_api_request = false ) {
		$favorites = $this->get_user_favorites_meta( $user_id );

		return $this->get_kits_data( $force_api_request )
			->map( function ( $kit ) use ( $favorites ) {
				return $this->transform_kit_api_response( $kit, $favorites );
			} );
	}

	/**
	 * Get specific kit.
	 *
	 * @param      $id
	 * @param null $user_id
	 * @param bool $manifest_included
	 *
	 * @return array
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 * @throws Kit_Not_Found_Exception
	 */
	public function find( $id, $user_id = null, $manifest_included = true ) {
		$item = $this->get_kits_data()
			->find( function ( $kit ) use ( $id ) {
				return $kit['_id'] === $id;
			} );

		if ( ! $item ) {
			throw new Kit_Not_Found_Exception( $id );
		}

		$manifest = null;

		if ( $manifest_included ) {
			$manifest = $this->api_client->get_manifest( $id );
		}

		return $this->transform_kit_api_response(
			$item,
			$this->get_user_favorites_meta( $user_id ),
			$manifest
		);
	}

	/**
	 * Get all the available taxonomies
	 *
	 * @param false $force_api_request
	 *
	 * @return mixed|null
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
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
	 * @param $user_id
	 * @param $id
	 *
	 * @return array
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 * @throws Kit_Not_Found_Exception
	 */
	public function add_to_favorites( $user_id, $id ) {
		// To check that the kit is exists.
		$kit = $this->find( $id, $user_id, false );
		$favorites = $this->get_user_favorites_meta( $user_id );

		if ( in_array( $kit['id'], $favorites, true ) ) {
			return $kit;
		}

		$favorites[] = $kit['id'];

		$this->save_user_favorites_meta( $user_id, $favorites );

		$kit['is_favorite'] = true;

		return $kit;
	}

	/**
	 * @param $user_id
	 * @param $id
	 *
	 * @return array
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 * @throws Kit_Not_Found_Exception
	 */
	public function remove_from_favorites( $user_id, $id ) {
		// To check that the kit is exists.
		$kit = $this->find( $id, $user_id, false );
		$favorites = $this->get_user_favorites_meta( $user_id );

		if ( ! in_array( $kit['id'], $favorites, true ) ) {
			return $kit;
		}

		$favorites = array_filter( $favorites, function ( $item ) use ( $kit ) {
			return $item !== $kit['id'];
		} );

		$this->save_user_favorites_meta( $user_id, $favorites );

		$kit['is_favorite'] = false;

		return $kit;
	}

	/**
	 * @param bool $force_api_request
	 *
	 * @return Collection
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	private function get_kits_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api_client->get_all();

			set_transient( static::KITS_CACHE_KEY, $data, static::KITS_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return new Collection( $data );
	}

	/**
	 * @param false $force_api_request
	 *
	 * @return Collection
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	private function get_taxonomies_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_TAXONOMIES_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api_client->get_taxonomies();

			set_transient( static::KITS_TAXONOMIES_CACHE_KEY, $data, static::KITS_TAXONOMIES_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return new Collection( $data );
	}

	/**
	 * @param             $kit
	 * @param array       $favorites
	 * @param array|null  $manifest
	 *
	 * @return array
	 */
	private function transform_kit_api_response( $kit, $favorites = [], $manifest = null ) {
		$taxonomies = array_reduce( static::TAXONOMIES_KEYS, function ( $current, $key ) use ( $kit ) {
			return array_merge( $current, $kit[ $key ] );
		}, [] );

		return array_merge(
			[
				'id' => $kit['_id'],
				'title' => $kit['title'],
				'thumbnail_url' => $kit['thumbnail'],
				'access_level' => $kit['access_level'],
				'keywords' => $kit['keywords'],
				'taxonomies' => $taxonomies,
				'is_favorite' => in_array( $kit['_id'], $favorites, true ),
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
		$content = ( new Collection( $manifest['templates'] ) )
			->union(
				array_reduce( $manifest['content'], function ( $carry, $content ) {
					return $carry + $content;
				}, [] )
			)
			->map( function ( $manifest_item, $key ) {
				return [
					'id' => $key,
					'title' => $manifest_item['title'],
					'doc_type' => $manifest_item['doc_type'],
					'thumbnail_url' => $manifest_item['thumbnail'],
					'preview_url' => isset( $manifest_item['url'] ) ? $manifest_item['url'] : null,
				];
			} );

		return [
			'description' => $manifest['description'],
			'preview_url' => isset( $manifest['site'] ) ? $manifest['site'] : '',
			'documents' => $content->values(),
		];
	}

	/**
	 * @param $user_id
	 *
	 * @return array|mixed
	 */
	private function get_user_favorites_meta( $user_id ) {
		$meta = get_user_meta( $user_id, static::FAVORITES_USER_META_KEY, true );

		if ( ! $meta || ! is_array( $meta ) ) {
			return [];
		}

		return $meta;
	}

	/**
	 * @param       $user_id
	 * @param array $favorites
	 */
	private function save_user_favorites_meta( $user_id, array $favorites ) {
		update_user_meta( $user_id, static::FAVORITES_USER_META_KEY, $favorites );
	}

	/**
	 * Repository constructor.
	 *
	 * @param Api_Client $api_client
	 */
	public function __construct( Api_Client $api_client ) {
		$this->api_client = $api_client;
	}
}

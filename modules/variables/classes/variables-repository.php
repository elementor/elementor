<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Utils;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variables_Repository {
	const VARIABLES_META_KEY = '_elementor_global_variables';

	private Kit $kit;

	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public function all(): array {
		$meta_key = $this->get_meta_key();
		$meta_data = $this->kit->get_json_meta( $meta_key );

		if ( is_array( $meta_data ) && ! empty( $meta_data ) ) {
			return $meta_data;
		}

		return $this->get_default_meta();
	}

	/**
	 * @throws Exception
	 */
	public function create( array $payload ): string {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		$existing_ids = array_keys( $data );

		$id = $this->generate_id( $existing_ids );

		$data[ $id ] = $this->only_from_array( $payload, [ 'type', 'label', 'value' ] );

		$meta_data['data'] = $data;

		$saved = $this->save( $meta_data );

		if ( ! $saved ) {
			throw new Exception( 'Failed to create variable' );
		}

		return $id;
	}

	/**
	 * @throws Exception
	 */
	public function update( array $payload, string $id ): bool {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		$variable = $this->only_from_array( $payload, [ 'label', 'value' ] );

		$data[ $id ] = [
			...$data[ $id ],
			...$variable,
		];

		$meta_data['data'] = $data;

		$value = $this->save( $meta_data );

		if ( ! $value ) {
			throw new Exception( 'Failed to update variables' );
		}

		return true;
	}

	public function delete( string $id ): bool | int {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		if ( ! isset( $data[ $id ] ) ) {
			return false;
		}

		$data[ $id ]['deleted'] = true;
		$data[ $id ]['deleted_at'] = gmdate( 'Y-m-d H:i:s' );

		$meta_data['data'] = $data;

		return $this->save( $meta_data );
	}

	public function restore( string $id ): bool|int {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		if ( ! isset( $data[ $id ] ) ) {
			return false;
		}

		unset( $data[ $id ]['deleted'] );
		unset( $data[ $id ]['deleted_at'] );

		$meta_data['data'] = $data;

		return $this->save( $meta_data );
	}

	private function get_meta_key(): string {
		return self::VARIABLES_META_KEY;
	}

	private function get_default_meta(): array {
		return [
			'data' => [],
			'watermark' => 0,
			'version' => 1,
		];
	}

	private function save( array $data ) {
		if ( PHP_INT_MAX === $data['watermark'] ) {
			$data['watermark'] = 0;
		}

		$data['watermark']++;

		return $this->kit->update_json_meta( $this->get_meta_key(), $data );
	}

	private function generate_id( array $existing_ids ): string {
		return Utils::generate_id( 'e-', $existing_ids );
	}

	private function only_from_array( array $array, array $keys ): array {
		return array_intersect_key( $array, array_flip( $keys ) );
	}
}

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

	// should we return the deleted variables as well?
	public function all(): array {
		$meta_key = $this->get_meta_key();
		$data = $this->kit->get_json_meta( $meta_key );

		if ( is_array( $data ) && ! empty( $data ) ) {
			return $data;
		}

		return $this->get_default_meta();
	}

	/**
	 * @throws Exception
	 */
	public function create( array $payload, string $group_name ): string {
		$variables_data = $this->all();
		$variables_items = $variables_data['data'];

		if ( ! isset( $variables_items[ $group_name ] ) ) {
			$variables_items[ $group_name ] = [];
		}

		$id = Utils::generate_id( 'e-', array_keys( $variables_items[ $group_name ] ) );

		$variables_items[ $group_name ][ $id ] = [
			'label' => $payload['label'],
			'value' => $payload['value'],
		];

		$variables_data['data'] = $variables_items;

		$saved = $this->save( $variables_data );

		if ( ! $saved ) {
			throw new Exception( 'Failed to create variable' );
		}

		return $id;
	}

	/**
	 * @throws Exception
	 */
	public function update( string $group_name, string $id, array $payload ) {
		$variables_data = $this->all();
		$variables_items = $variables_data['data'];

		// check if the payload is validated outside
		$variables_items[ $group_name ][ $id ] = $payload;
		// if we pass id of something that no longer exist should we throw an error?
		// if variables are empty

		$variables_data['data'] = $variables_items;

		$value = $this->save( $variables_data );

		if ( ! $value ) {
			throw new Exception( 'Failed to update variables' );
		}

		return true;
	}

	public function delete( string $id, string $group_name ) {
		$variables = $this->all();
		$data = $variables['data'];

		if ( ! isset( $data[ $group_name ][ $id ] ) ) {
			return false;
		}

		$data[ $group_name ][ $id ]['deleted'] = true;
		$data[ $group_name ][ $id ]['deleted_at'] = gmdate( 'Y-m-d H:i:s' );

		$variables['data'] = $data;

		return $this->save( $variables );
	}

	public function restore( string $id, string $group_name ) {
		$variables = $this->all();

		if ( ! isset( $variables[ $group_name ][ $id ] ) ) {
			return false;
		}

		$variables[ $group_name ][ $id ]['deleted'] = false;
		$variables[ $group_name ][ $id ]['deleted_at'] = null;

		return $this->save( $variables );
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
}

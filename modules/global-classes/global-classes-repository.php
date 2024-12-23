<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Styles\Utils as Atomic_Styles_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Repository {
	const META_KEY = '_elementor_global_classes';

	public static function make(): Global_Classes_Repository {
		return new self();
	}

	public function all() {
		$all = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( self::META_KEY );

		return Global_Classes::make( $all['items'] ?? [], $all['order'] ?? [] );
	}

	public function get( string $id ) {
		return $this->all()->get_items()->get( $id );
	}

	public function delete( string $id ) {
		$all = $this->all();

		if ( ! isset( $all->get_items()[ $id ] ) ) {
			throw new \Exception( "Global class with id ${id} not found" );
		}

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( self::META_KEY, [
			'items' => $all->get_items()->except( [ $id ] )->all(),
			'order' => $all->get_order()->filter( fn( $item ) => $item !== $id )->all(),
		] );
	}

	public function put( string $id, array $value ) {
		$all = $this->all();

		unset( $value['id'] );

		if ( ! isset( $all->get_items()[ $id ] ) ) {
			throw new \Exception( "Global class with id {$id} not found" );
		}

		if ( $value === $all->get_items()[ $id ] ) {
			return $value;
		}

		$value = Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( self::META_KEY, [
			'items' => $all->get_items()->merge( [ $id => $value ] )->all(),
			'order' => $all->get_order()->all(),
		] );

		if ( ! $value ) {
			throw new \Exception( 'Failed to update global class' );
		}

		return $this->get( $id );
	}

	public function create( array $value ) {
		$all = $this->all();
		$id = $this->generate_global_class_id();

		$value['id'] = $id;

		$updated = Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( self::META_KEY, [
			'items' => $all->get_items()->merge( [ $id => $value ] )->all(),
			'order' => $all->get_order()->push( $id )->all(),
		] );

		if ( ! $updated ) {
			throw new \Exception( 'Failed to create global class' );
		}

		return $this->get( $id );
	}

	public function arrange( array $value ) {
		$all = $this->all();

		if ( $all->get_order()->all() === $value ) {
			return $value;
		}

		$updated = Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( self::META_KEY, [
			'items' => $all->get_items()->all(),
			'order' => $value,
		] );

		if ( ! $updated ) {
			throw new \Exception( 'Failed to arrange global classes' );
		}

		return $this->all()->get_order()->all();
	}

	private function generate_global_class_id() {
		$existing_ids = $this->all()->get_items()->keys();
		$kit_id = Plugin::$instance->kits_manager->get_active_kit()->get_id();

		return Atomic_Styles_Utils::generate_id( 'g-' . $kit_id . '-', $existing_ids );
	}
}

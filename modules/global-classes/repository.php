<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Styles\Utils as Atomic_Styles_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repository {
	const META_KEY = '_elementor_global_classes';

	private Kit $kit;

	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public function all() {
		$all = $this->kit->get_json_meta( self::META_KEY );

		return Global_Classes::make( $all['data'] ?? [], $all['order'] ?? [] );
	}

	public function get( string $id ) {
		return $this->all()->get_data()->get( $id );
	}

	public function delete( string $id ) {
		$all = $this->all();

		if ( ! isset( $all->get_data()[ $id ] ) ) {
			throw new \Exception( "Global class with id ${id} not found" );
		}

		$this->kit->update_json_meta( self::META_KEY, [
			'data' => $all->get_data()->except( [ $id ] )->all(),
			'order' => $all->get_order()->filter( fn( $item ) => $item !== $id )->all(),
		] );
	}

	public function patch( string $id, array $updated ) {
		$all = $this->all();

		if ( ! isset( $all->get_data()[ $id ] ) ) {
			throw new \Exception( "Global class with id ${id} not found" );
		}

		$updated = $this->kit->update_json_meta( self::META_KEY, [
			'data' => $all->get_data()->merge( [ $id => $updated ] )->all(),
			'order' => $all->get_order()->all(),
		] );

		if ( ! $updated ) {
			throw new \Exception( 'Failed to update global class' );
		}

		return $this->get( $id );
	}

	public function create( array $class ) {
		$all = $this->all();
		$id = Atomic_Styles_Utils::generate_id();

		if ( isset( $all->get_data()[ $id ] ) ) {
			throw new \Exception( "Global class with id ${id} already exists" );
		}

		$updated = $this->kit->update_json_meta( self::META_KEY, [
			'data' => $all->get_data()->merge( [ $id => $class ] )->all(),
			'order' => $all->get_order()->push( $id )->all(),
		] );

		if ( ! $updated ) {
			throw new \Exception( 'Failed to create global class' );
		}

		return $this->get( $id );
	}

	public function arrange( array $order ) {
		$all = $this->all();

		$updated = $this->kit->update_json_meta( self::META_KEY, [
			'data' => $all->get_data()->all(),
			'order' => $order,
		] );

		if ( ! $updated ) {
			throw new \Exception( 'Failed to arrange global classes' );
		}

		return $this->all()->get_order()->all();
	}
}

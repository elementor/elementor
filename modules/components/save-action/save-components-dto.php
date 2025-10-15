<?php

namespace Elementor\Modules\Components\SaveAction;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Save_Components_DTO {
	private Collection $data;
	private Collection $added;
	private Collection $modified;
	private Collection $deleted;

	/**
	 * @param array[]  $data
	 * @param string[] $added
	 * @param string[] $modified
	 * @param string[] $deleted
	 */
	public function __construct( array $data, array $added, array $modified, array $deleted ) {
		$this->data = Collection::make( $data );
		$this->added = Collection::make( $added );
		$this->modified = Collection::make( $modified );
		$this->deleted = Collection::make( $deleted );
	}

	public static function from_request( \WP_REST_Request $request ) {
		return new static(
			$request->get_param( 'data' ) ?? [],
			$request->get_param( 'changes' )['added'] ?? [],
			$request->get_param( 'changes' )['modified'] ?? [],
			$request->get_param( 'changes' )['deleted'] ?? []
		);
	}

	public function get_data(): Collection {
		return $this->data;
	}

	public function get_added(): Collection {
		return $this->added;
	}

	public function get_modified(): Collection {
		return $this->modified;
	}

	public function get_deleted(): Collection {
		return $this->deleted;
	}
}

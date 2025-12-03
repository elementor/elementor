<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;

class Variables_Repository {
	private const VARIABLES_META_KEY = '_elementor_global_variables';

	private Kit $kit;

	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public function load(): Variables_Collection {
		$db_record = $this->kit->get_json_meta( self::VARIABLES_META_KEY );

		if ( is_array( $db_record ) && ! empty( $db_record ) ) {
			$collection = Variables_Collection::hydrate( $db_record );

			Prop_Type_Adapter::from_storage( $collection );

			return $collection;
		}

		return Variables_Collection::default();
	}

	public function save( Variables_Collection $collection ) {
		$collection->increment_watermark();

		$record = Prop_Type_Adapter::to_storage( $collection );

		if ( $this->kit->update_json_meta( static::VARIABLES_META_KEY, $record ) ) {
			return $collection->watermark();
		}

		return false;
	}
}

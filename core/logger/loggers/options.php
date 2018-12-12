<?php

namespace Elementor\Core\Logger\Loggers;

use Elementor\Core\Logger\Items\Log_Item_Interface as Log_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Options extends Base {

	public function save_log( Log_Item $item ) {
		/** @var Log_Item[] $log */
		$log = get_option( self::LOG_NAME, [] );

		$id = $item->get_fingerprint();

		if ( empty( $log[ $id ] ) ) {
			$log[ $id ] = $item;
		}

		$log[ $id ]->increase_times( $item );


		update_option( self::LOG_NAME, $log, 'no' );
	}

	public function get_formatted_log_entries( $max_entries, $table = true ) {
		$entries = get_option( self::LOG_NAME, [] );

		$sorted_entries = [];
		$open_tag = $table ? '<tr><td>' : '';
		$close_tab = $table ? '</td></tr>' : '';

		foreach ( $entries as $entry ) {
			/** @var Log_Item $entry */
			$sorted_entries[ $entry->get_name() ][] = $open_tag . $entry->format() . $close_tab;
		}

		$formatted_entries = [];
		foreach ( $sorted_entries as $key => $sorted_entry ) {
			$sorted_entry =  array_slice( $sorted_entry, -$max_entries );
			$formatted_entries[ $key ] = implode( $sorted_entry );
		}
		return $formatted_entries;
	}
}

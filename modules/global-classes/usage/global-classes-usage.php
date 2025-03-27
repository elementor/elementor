<?php

namespace Elementor\Modules\GlobalClasses\Usage;

use Elementor\Modules\Global_Classes\Usage\Applied_Global_Classes_Usage;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

class Global_Classes_Usage {
	public function register_hooks() {
		add_filter( 'elementor/tracker/send_tracking_data_params', fn( $params ) => $this->add_tracking_data( $params ) );
	}

	private function add_tracking_data( $params ) {
		$params['usages']['global_classes']['total_count'] = Global_Classes_Repository::make()->all()->get_items()->count();

		if ( 0 === $params['usages']['global_classes']['total_count'] ) {
			return $params;
		}

		$applied_global_classes_usage = ( new Applied_Global_Classes_Usage() )->get();

		if ( $applied_global_classes_usage ) {
			$params['usages']['global_classes']['applied_classes_per_element_type'] = $applied_global_classes_usage;
		}

		return $params;
	}}

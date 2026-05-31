<?php

namespace Elementor\Modules\Audits;

use Elementor\Modules\Audits\Audits\Audit_Descriptor;
use Elementor\Modules\Audits\Audits\Default_Design_System;
use Elementor\Modules\Audits\Audits\Heading_Structure;
use Elementor\Modules\Audits\Audits\Icon_Widget_Link_Missing_Aria_Label;
use Elementor\Modules\Audits\Audits\Image_Carousel_Default_Name;
use Elementor\Modules\Audits\Audits\Images_Missing_Alt;
use Elementor\Modules\Audits\Audits\Images_Too_Large;
use Elementor\Modules\Audits\Audits\Nested_Boxed_Containers;
use Elementor\Modules\Audits\Audits\Page_Excerpt;
use Elementor\Modules\Audits\Audits\Page_Featured_Image;
use Elementor\Modules\Audits\Audits\Page_Title;
use Elementor\Modules\Audits\Audits\Prefer_Global_Colors;
use Elementor\Modules\Audits\Audits\Uses_Sections_Or_Columns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Audits_Manager {

	public function get_descriptors(): array {
		$audits = $this->get_built_in_audits();
		$audits = apply_filters( Module::FILTER_AUDITS, $audits );

		$arrays = [];

		foreach ( $audits as $audit ) {
			if ( ! $audit instanceof Audit_Descriptor ) {
				continue;
			}

			if ( ! $audit->is_visible() ) {
				continue;
			}

			$arrays[] = $audit->to_array();
		}

		return $arrays;
	}

	/**
	 * @return Audit_Descriptor[]
	 */
	private function get_built_in_audits(): array {
		return [
			// page settings
			new Page_Title(),
			new Page_Excerpt(),
			new Page_Featured_Image(),
			
			// site settings
			new Default_Design_System(),
			new Prefer_Global_Colors(),

			// general
			new Heading_Structure(),
			new Images_Missing_Alt(),
			new Images_Too_Large(),

			// layout
			new Uses_Sections_Or_Columns(),
			new Nested_Boxed_Containers(),

			// widgets
			new Image_Carousel_Default_Name(),
			new Icon_Widget_Link_Missing_Aria_Label(),
		];
	}
}

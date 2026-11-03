<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Webmcp\Webmcp_Browser_Tools;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Robots_Txt_Handler;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module_Availability {

	private Seo_Llms_Txt_Detector $seo_detector;
	private Robots_Txt_Handler $robots_handler;

	public function __construct( Seo_Llms_Txt_Detector $seo_detector, Robots_Txt_Handler $robots_handler ) {
		$this->seo_detector     = $seo_detector;
		$this->robots_handler   = $robots_handler;
	}

	public function get_unavailable_reasons(): array {
		$reasons = [];

		$llms_reason = $this->get_llms_txt_unavailable_reason();
		if ( null !== $llms_reason ) {
			$reasons[ Agent_Ready_Settings::MODULE_LLMS_TXT ] = $llms_reason;
		}

		$bot_access_reason = $this->get_bot_access_unavailable_reason();
		if ( null !== $bot_access_reason ) {
			$reasons[ Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL ] = $bot_access_reason;
		}

		$browser_tools_reason = $this->get_browser_tools_unavailable_reason();
		if ( null !== $browser_tools_reason ) {
			$reasons[ Agent_Ready_Settings::MODULE_BROWSER_TOOLS ] = $browser_tools_reason;
		}

		return $reasons;
	}

	public function get_reason( string $module ): ?array {
		return $this->get_unavailable_reasons()[ $module ] ?? null;
	}

	public function is_available( string $module ): bool {
		return null === $this->get_reason( $module );
	}

	private function get_llms_txt_unavailable_reason(): ?array {
		$seo_owner = $this->seo_detector->get_owner();

		if ( null !== $seo_owner ) {
			return [
				'code'    => 'seo_plugin',
				'message' => sprintf(
					/* translators: %s: SEO plugin name */
					__( '%s already creates your llms.txt. Turn it off there to use this one.', 'elementor' ),
					$this->seo_detector->get_owner_label()
				),
			];
		}

		if ( Module::has_physical_llms_file() ) {
			return [
				'code'    => 'physical_file',
				'message' => __( 'An llms.txt file already exists on your server and is served instead. Take it over here to turn this on.', 'elementor' ),
			];
		}

		return null;
	}

	private function get_bot_access_unavailable_reason(): ?array {
		if ( $this->robots_handler->has_physical_robots_txt() ) {
			return [
				'code'    => 'physical_robots_txt',
				'message' => __( 'A robots.txt file on your server stops WordPress from adding bot rules. Delete it to turn this on.', 'elementor' ),
			];
		}

		return null;
	}

	private function get_browser_tools_unavailable_reason(): ?array {
		if ( ! Webmcp_Browser_Tools::is_available() ) {
			return [
				'code'    => 'abilities_api_missing',
				'message' => __( 'Browser tools need WordPress 6.9 or later.', 'elementor' ),
			];
		}

		return null;
	}
}

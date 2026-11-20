<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Llms_Manual_Content;
use Elementor\Modules\Agents\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Llms_Takeover_Ajax {

	const ACTION = 'agents_ready_takeover_llms_file';

	private Agent_Ready_Settings $settings;
	private Llms_Manual_Content $manual_content;

	public function __construct( Agent_Ready_Settings $settings, Llms_Manual_Content $manual_content ) {
		$this->settings       = $settings;
		$this->manual_content = $manual_content;
	}

	/**
	 * @throws \Exception When the user can't manage options, there is no physical file, or the file can't be deleted.
	 */
	public function handle(): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( ! Module::has_physical_llms_file() ) {
			throw new \Exception( esc_html__( 'There is no llms.txt file to take over.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( ! Module::delete_physical_llms_file() ) {
			throw new \Exception( esc_html__( 'The llms.txt file couldn’t be replaced. Delete it from your server manually and try again.', 'elementor' ), Exceptions::INTERNAL_SERVER_ERROR ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$this->manual_content->delete();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'is_manually_edited', false );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', true );

		return [
			'hasPhysicalFile'  => false,
			'enabled'          => true,
			'isManuallyEdited' => false,
		];
	}
}

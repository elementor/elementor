<?php

namespace Elementor;

use Elementor\Core\Breakpoints\Breakpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// TODO: Use API data instead of this static array, once it is available.
$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();
$active_devices = Plugin::$instance->breakpoints->get_active_devices_list( [ 'reverse' => true ] );

$breakpoint_classes_map = array_intersect_key( Plugin::$instance->breakpoints->get_responsive_icons_classes_map(), array_flip( $active_devices ) );

/* translators: %1$s: Device Name */
$breakpoint_label = esc_html__( '%1$s <br> Settings added for the %1$s device will apply to %2$spx screens and down', 'elementor' );
?>

<script type="text/template" id="tmpl-elementor-templates-responsive-bar">
	<div id="e-responsive-bar__start">
		<div id="elementor-panel-footer-logo" class="elementor-panel-footer-tool e-logo elementor-toggle-state">
			<div class="e-responsive-bar__menu">
				<div class="e-responsive-bar__menu-logo">
					<span class="e-responsive-bar__menu-logo-fragment e-responsive-bar__menu-logo-fragment--vertical"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
					<span class="e-responsive-bar__menu-logo-fragment"></span>
				</div>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Elementor Logo', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-view-page" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8.00008 7.33341C7.63189 7.33341 7.33341 7.63189 7.33341 8.00008C7.33341 8.36827 7.63189 8.66675 8.00008 8.66675C8.36827 8.66675 8.66675 8.36827 8.66675 8.00008C8.66675 7.63189 8.36827 7.33341 8.00008 7.33341ZM6.00008 8.00008C6.00008 6.89551 6.89551 6.00008 8.00008 6.00008C9.10465 6.00008 10.0001 6.89551 10.0001 8.00008C10.0001 9.10465 9.10465 10.0001 8.00008 10.0001C6.89551 10.0001 6.00008 9.10465 6.00008 8.00008Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M2.10665 8.00008C3.77194 10.7538 5.74194 12.0001 8.00008 12.0001C10.2582 12.0001 12.2282 10.7538 13.8935 8.00008C12.2282 5.2464 10.2582 4.00008 8.00008 4.00008C5.74194 4.00008 3.77194 5.2464 2.10665 8.00008ZM0.754594 7.66931C2.60488 4.43148 5.01341 2.66675 8.00008 2.66675C10.9868 2.66675 13.3953 4.43148 15.2456 7.66931C15.3627 7.87427 15.3627 8.12589 15.2456 8.33085C13.3953 11.5687 10.9868 13.3334 8.00008 13.3334C5.01341 13.3334 2.60488 11.5687 0.754594 8.33085C0.637466 8.12589 0.637466 7.87427 0.754594 7.66931Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'View Page', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-theme-builder" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.33325 4.00008C1.33325 3.2637 1.93021 2.66675 2.66659 2.66675H13.3333C14.0696 2.66675 14.6666 3.2637 14.6666 4.00008V12.0001C14.6666 12.7365 14.0696 13.3334 13.3333 13.3334H2.66659C1.93021 13.3334 1.33325 12.7365 1.33325 12.0001V4.00008ZM13.3333 4.00008H2.66659V12.0001H13.3333V4.00008Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.33325 6.00008C1.33325 5.63189 1.63173 5.33341 1.99992 5.33341H13.9999C14.3681 5.33341 14.6666 5.63189 14.6666 6.00008C14.6666 6.36827 14.3681 6.66675 13.9999 6.66675H1.99992C1.63173 6.66675 1.33325 6.36827 1.33325 6.00008Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M4.66659 2.66675C5.03478 2.66675 5.33325 2.96522 5.33325 3.33341V6.00008C5.33325 6.36827 5.03478 6.66675 4.66659 6.66675C4.2984 6.66675 3.99992 6.36827 3.99992 6.00008V3.33341C3.99992 2.96522 4.2984 2.66675 4.66659 2.66675Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Theme Builder', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-wp-dashboard" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-folder" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8.00028 1.34375C4.32962 1.34375 1.34375 4.32936 1.34375 7.99972C1.34375 11.6702 4.32962 14.6562 8.00028 14.6562C11.6704 14.6562 14.6562 11.6702 14.6562 7.99972C14.6562 4.32977 11.6704 1.34375 8.00028 1.34375ZM2.10771 7.99973C2.10771 7.14562 2.29112 6.33447 2.61802 5.60207L5.42874 13.3026C3.46322 12.3477 2.10771 10.3323 2.10771 7.99973ZM8.00028 13.8925C7.4218 13.8925 6.86357 13.8071 6.33549 13.6523L8.10328 8.51539L9.91499 13.4769C9.92655 13.506 9.94101 13.5328 9.95685 13.5581C9.3445 13.7738 8.68616 13.8925 8.00028 13.8925ZM8.81201 5.23731C9.16673 5.21858 9.48619 5.18099 9.48619 5.18099C9.80386 5.14354 9.76668 4.67717 9.44887 4.6959C9.44887 4.6959 8.49434 4.77066 7.87841 4.77066C7.29966 4.77066 6.32626 4.6959 6.32626 4.6959C6.00887 4.67717 5.97196 5.16268 6.28908 5.18099C6.28908 5.18099 6.58968 5.21844 6.9068 5.23731L7.82485 7.75242L6.53557 11.6198L4.39007 5.23758C4.7452 5.21886 5.06452 5.1814 5.06452 5.1814C5.38165 5.14395 5.3446 4.67731 5.02666 4.69631C5.02666 4.69631 4.07254 4.77094 3.4562 4.77094C3.34521 4.77094 3.21536 4.76805 3.07711 4.76378C4.13023 3.16392 5.94153 2.10781 8.00028 2.10781C9.53452 2.10781 10.9309 2.69438 11.9792 3.65438C11.9535 3.65314 11.9291 3.64984 11.9027 3.64984C11.3241 3.64984 10.913 4.15393 10.913 4.69562C10.913 5.18099 11.1927 5.59201 11.4918 6.07724C11.7161 6.47008 11.9774 6.97418 11.9774 7.70244C11.9774 8.20681 11.7838 8.79215 11.5291 9.60715L10.9414 11.5711L8.81201 5.23731ZM10.9623 13.0926L12.7621 7.88916C13.0987 7.04868 13.2101 6.37646 13.2101 5.77859C13.2101 5.562 13.1958 5.36028 13.1705 5.17274C13.6311 6.01198 13.8927 6.97529 13.8924 7.99987C13.8924 10.1735 12.7139 12.0712 10.9623 13.0926Z" fill="#0173A9"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'WP Dashboard', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
		<div id="elementor-panel-footer-add-widgets" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Add Widgets', 'elementor' ); ?>">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M9.1 18.3332C9.1 18.7014 9.39848 18.9999 9.76667 18.9999H10.2333C10.6015 18.9999 10.9 18.7014 10.9 18.3332V10.9H18.3333C18.7015 10.9 19 10.6015 19 10.2333V9.76667C19 9.39848 18.7015 9.1 18.3333 9.1H10.9V1.66656C10.9 1.29837 10.6015 0.999889 10.2333 0.999889L9.76667 0.999889C9.39848 0.999889 9.1 1.29837 9.1 1.66656V9.1H1.66667C1.29848 9.1 1 9.39848 1 9.76667V10.2333C1 10.6015 1.29848 10.9 1.66667 10.9H9.1V18.3332Z" fill="white"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Add Widgets', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-navigator" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'Navigator', 'elementor' ); ?>">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M9.50286 0.117302C9.81566 -0.0391006 10.1838 -0.0391006 10.4966 0.117302L19.3853 4.56169C19.7617 4.7499 19.9995 5.13464 19.9995 5.55549C19.9995 5.97634 19.7617 6.36107 19.3853 6.54928L10.4966 10.9937C10.1838 11.1501 9.81566 11.1501 9.50286 10.9937L0.614192 6.54928C0.237775 6.36107 0 5.97634 0 5.55549C0 5.13464 0.237775 4.7499 0.614192 4.56169L9.50286 0.117302ZM3.59554 5.55549L9.99976 8.75763L16.404 5.55549L9.99976 2.35334L3.59554 5.55549Z" fill="white"/>
				<path d="M0.117544 9.50236C0.39197 8.9535 1.05937 8.73103 1.60822 9.00546L10 13.2014L18.3918 9.00546C18.9406 8.73103 19.608 8.9535 19.8825 9.50236C20.1569 10.0512 19.9344 10.7186 19.3856 10.993L10.4969 15.4374C10.1841 15.5938 9.81591 15.5938 9.50311 15.4374L0.614436 10.993C0.0655841 10.7186 -0.156882 10.0512 0.117544 9.50236Z" fill="white"/>
				<path d="M1.60822 13.4507C1.05937 13.1763 0.391969 13.3988 0.117544 13.9476C-0.156882 14.4965 0.0655842 15.1639 0.614436 15.4383L9.50311 19.8827C9.81591 20.0391 10.1841 20.0391 10.4969 19.8827L19.3856 15.4383C19.9344 15.1639 20.1569 14.4965 19.8825 13.9476C19.608 13.3988 18.9406 13.1763 18.3918 13.4507L10 17.6467L1.60822 13.4507Z" fill="white"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Navigator', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-history" class="elementor-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e( 'History', 'elementor' ); ?>">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1.41797 3.33301V7.99976H6.08472" stroke="white" stroke-width="1.8" stroke-linecap="square"/>
				<path d="M2.9392 12.8339C3.49758 14.4188 4.55592 15.7793 5.95475 16.7104C7.35358 17.6415 9.01713 18.0928 10.6947 17.9962C12.3723 17.8996 13.9731 17.2605 15.2559 16.1751C16.5387 15.0896 17.4339 13.6167 17.8068 11.9782C18.1796 10.3397 18.0099 8.62441 17.3231 7.09077C16.6364 5.55713 15.4698 4.28823 13.9992 3.47525C12.5286 2.66227 10.8335 2.34926 9.16955 2.58338C7.50556 2.81749 6.18585 3.60243 4.77351 4.77325C3.36118 5.94408 2.5 7.23585 2.5 7.23585" stroke="white" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="round"/>
				<path d="M10 6.83301V11.4163L12.0833 13.4997" stroke="white" stroke-width="1.8"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'History', 'elementor' ); ?></span>
		</div>
		<div id="elementor-panel-footer-global-styles" class="elementor-panel-footer-tool elementor-toggle-state">
			<div data-tooltip="<?php esc_attr_e( 'Global Styles', 'elementor' ); ?>" class="tooltip-target">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1 19H5L18 6C18.5304 5.46957 18.8284 4.75015 18.8284 4C18.8284 3.24986 18.5304 2.53044 18 2C17.4696 1.46957 16.7501 1.17158 16 1.17158C15.2499 1.17158 14.5304 1.46957 14 2L1 15V19Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M12.5 3.50002L16.5 7.50002" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M10 6L5 1L1 5L6 10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M5 5.99998L3.5 7.49998" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M14 10L19 15L15 19L10 14" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M14 15L12.5 16.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Global Styles', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-sub-menu-item-page-settings" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-save" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M6.34171 13.3129C6.54476 14.1251 7.22158 14.6666 8.03376 14.6666C8.84594 14.6666 9.52276 14.1251 9.65813 13.3806C9.65813 13.3806 9.72581 13.3129 9.72581 13.2453C9.86117 12.9745 10.2673 12.9069 10.538 13.0422C11.2825 13.4483 12.0947 13.3806 12.7038 12.7715C13.3129 12.1624 13.3806 11.2825 12.9745 10.6057C12.9745 10.6057 12.9069 10.538 12.9069 10.4703C12.7715 10.1319 12.9745 9.79349 13.3129 9.72581C14.1251 9.52276 14.6666 8.84594 14.6666 8.03376C14.6666 7.22158 14.1251 6.54476 13.3129 6.34171C13.3129 6.34171 13.2453 6.27403 13.1776 6.27403C13.0422 6.20635 12.9745 6.07098 12.9069 5.93562C12.8392 5.73258 12.9069 5.59721 12.9745 5.46185C13.3806 4.71735 13.3129 3.90516 12.7038 3.29603C12.0947 2.68689 11.2148 2.61921 10.538 3.0253C10.538 3.0253 10.4703 3.09298 10.4026 3.09298C10.0642 3.22835 9.72581 3.0253 9.65813 2.68689C9.45508 1.87471 8.77826 1.33325 7.96608 1.33325C7.1539 1.33325 6.47708 1.87471 6.27403 2.68689C6.27403 2.82225 6.13867 3.0253 5.93562 3.09298C5.73258 3.16066 5.52953 3.09298 5.39417 3.0253C4.71735 2.61921 3.83748 2.68689 3.29603 3.29603C2.68689 3.83748 2.61921 4.71735 3.0253 5.39417C3.0253 5.39417 3.09298 5.46185 3.09298 5.52953C3.22835 5.86794 3.0253 6.20635 2.68689 6.27403C1.87471 6.47708 1.33325 7.1539 1.33325 7.96608C1.33325 8.77826 1.87471 9.45508 2.68689 9.65813C2.68689 9.65813 2.75457 9.72581 2.82225 9.72581C3.09298 9.86117 3.22834 10.2673 3.0253 10.538C2.61921 11.2825 2.68689 12.0947 3.29603 12.7038C3.90516 13.3129 4.78503 13.3806 5.46185 12.9745C5.46185 12.9745 5.52953 12.9069 5.59721 12.9069C5.80026 12.8392 5.93562 12.9069 6.07098 12.9745C6.20635 13.0422 6.27403 13.1776 6.34171 13.3129ZM6.61244 12.027C6.34171 11.8239 6.07098 11.7563 5.73258 11.7563C5.59721 11.7563 5.46185 11.7563 5.32648 11.6886C5.2588 11.7224 5.1742 11.7563 5.0896 11.7901C5.00499 11.8239 4.92039 11.8578 4.85271 11.8916C4.44662 12.1624 4.17589 11.8916 4.10821 11.8239C4.04053 11.7563 3.83748 11.4179 4.04053 11.0794C4.5143 10.2673 4.24357 9.18435 3.43139 8.71058C3.29603 8.6429 3.16066 8.57522 2.95762 8.50753C2.48384 8.43985 2.48384 8.03376 2.48384 7.96608C2.48384 7.8984 2.48384 7.55999 2.95762 7.42462C3.83748 7.22158 4.44662 6.27403 4.24357 5.32648C4.20973 5.2588 4.17589 5.1742 4.14205 5.0896C4.10821 5.00499 4.07437 4.92039 4.04053 4.85271C3.7698 4.44662 4.04053 4.17589 4.10821 4.10821C4.17589 4.04053 4.5143 3.83748 4.85271 4.04053C5.32648 4.31126 5.86794 4.37894 6.40939 4.10821C6.95085 3.90516 7.28926 3.49907 7.49231 2.95762C7.55999 2.48384 7.8984 2.48384 8.03376 2.48384C8.10144 2.48384 8.43985 2.48384 8.57522 2.95762C8.77826 3.90516 9.72581 4.44662 10.6734 4.24357C10.741 4.20973 10.8256 4.17589 10.9102 4.14205C10.9948 4.10821 11.0794 4.07437 11.1471 4.04053C11.5532 3.7698 11.8239 4.04053 11.8916 4.10821C11.9593 4.17589 12.1624 4.5143 11.9593 4.85271C11.6886 5.19112 11.6209 5.66489 11.7563 6.13867C11.8916 6.61244 12.1624 6.95085 12.5684 7.22158C12.7038 7.28926 12.8392 7.35694 13.0422 7.42462C13.516 7.4923 13.516 7.83071 13.516 7.96608C13.516 8.10144 13.516 8.43985 13.0422 8.57522C12.5684 8.71058 12.23 9.04899 11.9593 9.3874C11.6886 9.72581 11.6209 10.1996 11.7563 10.6734C11.7901 10.741 11.8239 10.8256 11.8578 10.9102C11.8916 10.9948 11.9255 11.0794 11.9593 11.1471C12.23 11.5532 11.9593 11.8239 11.8916 11.8916C11.8239 11.9593 11.4855 12.1624 11.1471 11.9593C10.3349 11.4855 9.25203 11.7563 8.77826 12.5684C8.71058 12.7038 8.6429 12.8392 8.57522 13.0422C8.50753 13.516 8.16912 13.516 8.03376 13.516C7.8984 13.516 7.55999 13.516 7.42462 13.1099C7.28926 12.6361 7.01853 12.2977 6.61244 12.027ZM5.39417 8.03376C5.39417 9.45508 6.54476 10.6057 8.03376 10.6057C9.45508 10.6057 10.6057 9.45508 10.6057 8.03376C10.6057 6.54476 9.52276 5.39417 8.03376 5.39417C6.54476 5.39417 5.39417 6.54476 5.39417 8.03376ZM6.61244 7.96608C6.61244 7.22158 7.22158 6.54476 8.03376 6.54476C8.77826 6.54476 9.45508 7.22158 9.45508 8.03376C9.45508 8.77826 8.77826 9.3874 8.03376 9.3874C7.28926 9.3874 6.61244 8.77826 6.61244 7.96608Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Page Settings', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-site-settings" class="elementor-panel-footer-sub-menu-item">
					<!-- <i class="elementor-icon eicon-folder" aria-hidden="true"></i> -->
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M7.99992 2.66667C5.0544 2.66667 2.66659 5.05449 2.66659 8.00001C2.66659 10.9455 5.0544 13.3333 7.99992 13.3333C10.9454 13.3333 13.3333 10.9455 13.3333 8.00001C13.3333 5.05449 10.9454 2.66667 7.99992 2.66667ZM1.33325 8.00001C1.33325 4.31811 4.31802 1.33334 7.99992 1.33334C11.6818 1.33334 14.6666 4.31811 14.6666 8.00001C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00001Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.73326 6.00001C1.73326 5.63182 2.03174 5.33334 2.39993 5.33334H13.5999C13.9681 5.33334 14.2666 5.63182 14.2666 6.00001C14.2666 6.3682 13.9681 6.66668 13.5999 6.66668H2.39993C2.03174 6.66668 1.73326 6.3682 1.73326 6.00001Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M1.73326 10C1.73326 9.63182 2.03174 9.33334 2.39993 9.33334H13.5999C13.9681 9.33334 14.2666 9.63182 14.2666 10C14.2666 10.3682 13.9681 10.6667 13.5999 10.6667H2.39993C2.03174 10.6667 1.73326 10.3682 1.73326 10Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8.01951 1.43443C8.33187 1.62936 8.42707 2.04059 8.23215 2.35295C7.17511 4.04682 6.61471 6.00338 6.61471 8.00001C6.61471 9.99664 7.17511 11.9532 8.23215 13.6471C8.42707 13.9594 8.33187 14.3707 8.01951 14.5656C7.70715 14.7605 7.29592 14.6653 7.101 14.353C5.91182 12.4473 5.28137 10.2462 5.28137 8.00001C5.28137 5.7538 5.91182 3.55268 7.101 1.64707C7.29592 1.33471 7.70715 1.23951 8.01951 1.43443Z" fill="#6D7882"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M7.98032 1.43443C8.29268 1.23951 8.70392 1.33471 8.89884 1.64707C10.088 3.55268 10.7185 5.7538 10.7185 8.00001C10.7185 10.2462 10.088 12.4473 8.89884 14.353C8.70392 14.6653 8.29268 14.7605 7.98032 14.5656C7.66796 14.3707 7.57276 13.9594 7.76769 13.6471C8.82473 11.9532 9.38513 9.99664 9.38513 8.00001C9.38513 6.00338 8.82473 4.04682 7.76769 2.35295C7.57276 2.04059 7.66796 1.62936 7.98032 1.43443Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Site Settings', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
		<div id="elementor-panel-footer-more" class="elementor-panel-footer-tool elementor-toggle-state">
			<div class="tooltip-target" data-tooltip="<?php esc_attr_e( 'More', 'elementor' ); ?>">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="8" y="2" width="4" height="3.69231" fill="white"/>
					<rect x="8" y="8.15401" width="4" height="3.69231" fill="white"/>
					<rect x="8" y="14.3081" width="4" height="3.69231" fill="white"/>
				</svg>
			</div>
			<span class="elementor-screen-only"><?php echo esc_html__( 'More', 'elementor' ); ?></span>
			<div class="elementor-panel-footer-sub-menu"></div>
		</div>
	</div>
	<div id="e-responsive-bar__center">
		<div id="e-responsive-bar-switcher" class="e-responsive-bar--pipe">
			<?php
				$icon_maps = [
					'desktop' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.66675 4.16667C1.66675 3.24619 2.41294 2.5 3.33341 2.5H16.6667C17.5872 2.5 18.3334 3.24619 18.3334 4.16667V12.5C18.3334 13.4205 17.5872 14.1667 16.6667 14.1667H10.8334V15.8333H11.6667C12.127 15.8333 12.5001 16.2064 12.5001 16.6667C12.5001 17.1269 12.127 17.5 11.6667 17.5H8.33342C7.87318 17.5 7.50008 17.1269 7.50008 16.6667C7.50008 16.2064 7.87318 15.8333 8.33342 15.8333H9.16675V14.1667H3.33341C2.41294 14.1667 1.66675 13.4205 1.66675 12.5V4.16667ZM16.6667 12.5V4.16667H3.33341V12.5H16.6667Z" fill="white"/></svg>',
					'tablet' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.33325 4C3.33325 3.17157 4.07944 2.5 4.99992 2.5H14.9999C15.9204 2.5 16.6666 3.17157 16.6666 4V16C16.6666 16.8284 15.9204 17.5 14.9999 17.5H4.99992C4.07944 17.5 3.33325 16.8284 3.33325 16V4ZM14.9999 4H4.99992V16H14.9999V4ZM7.49992 14.5C7.49992 14.0858 7.87301 13.75 8.33325 13.75H11.6666C12.1268 13.75 12.4999 14.0858 12.4999 14.5C12.4999 14.9142 12.1268 15.25 11.6666 15.25H8.33325C7.87301 15.25 7.49992 14.9142 7.49992 14.5Z" fill="white"/></svg>',
					'mobile' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.28571 13.75C8.89123 13.75 8.57143 14.0858 8.57143 14.5C8.57143 14.9142 8.89123 15.25 9.28571 15.25H10.7143C11.1088 15.25 11.4286 14.9142 11.4286 14.5C11.4286 14.0858 11.1088 13.75 10.7143 13.75H9.28571Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.32653 2.5C5.49457 2.5 5 3.2842 5 4V16C5 16.7158 5.49457 17.5 6.32653 17.5H13.6735C14.5054 17.5 15 16.7158 15 16V4C15 3.2842 14.5054 2.5 13.6735 2.5H6.32653ZM6.42857 16V4H13.5714V16H6.42857Z" fill="white"/></svg>',
				]
				?>
			<?php foreach ( $active_devices as $device_key ) {
				if ( 'desktop' === $device_key ) {
					$tooltip_label = esc_html__( 'Desktop <br> Settings added for the base device will apply to all breakpoints unless edited', 'elementor' );
				} elseif ( 'widescreen' === $device_key ) {
					$tooltip_label = esc_html__( 'Widescreen <br> Settings added for the Widescreen device will apply to screen sizes %dpx and up', 'elementor' );

					$tooltip_label = sprintf( $tooltip_label, $active_breakpoints[ $device_key ]->get_value() );
				} else {
					$tooltip_label = sprintf( $breakpoint_label, $active_breakpoints[ $device_key ]->get_label(), $active_breakpoints[ $device_key ]->get_value() );
				}

				$icon = isset( $icon_maps[ $device_key ] ) ? $icon_maps[ $device_key ] : '<i class="' . $breakpoint_classes_map[ $device_key ] . '" aria-hidden="true"></i>';

				printf('<label
					id="e-responsive-bar-switcher__option-%1$s"
					class="e-responsive-bar-switcher__option elementor-panel-footer-tool tooltip-target"
					for="e-responsive-bar-switch-%1$s"
					data-tooltip="%2$s">

					<input type="radio" name="breakpoint" id="e-responsive-bar-switch-%1$s" value="%1$s">
					%3$s
					<span class="screen-reader-text">%2$s</span>
				</label>', esc_attr( $device_key ), esc_attr( $tooltip_label ), $icon ); // phpcs:ignore
			} ?>
		</div>
		<div id="e-responsive-bar-scale">
			<div id="e-responsive-bar-scale__minus"></div>
			<div id="e-responsive-bar-scale__value-wrapper"><span id="e-responsive-bar-scale__value">100</span>%</div>
			<div id="e-responsive-bar-scale__plus"><i class="eicon-plus" aria-hidden="true"></i></div>
			<div id="e-responsive-bar-scale__reset"><i class="eicon-undo" aria-hidden="true"></i></div>
		</div>
		<div id="e-responsive-bar__size-inputs-wrapper" class="e-flex e-align-items-center" style="display:none;">
			<label for="e-responsive-bar__input-width">W</label>
			<input type="number" id="e-responsive-bar__input-width" class="e-responsive-bar__input-size" autocomplete="off">
			<label for="e-responsive-bar__input-height">H</label>
			<input type="number" id="e-responsive-bar__input-height" class="e-responsive-bar__input-size" autocomplete="off">
		</div>
	</div>
	<div id="e-responsive-bar__end">
		<div id="elementor-panel-footer-finder" class="elementor-panel-footer-tool tooltip-target e-top-icon" data-tooltip="<?php esc_attr_e( 'Finder', 'elementor' ); ?>">
			<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M17.1653 6.90225C17.5046 7.04956 17.7062 7.40295 17.6603 7.77003L16.9441 13.5H23.5001C23.8234 13.5 24.1176 13.6871 24.2547 13.9799C24.3919 14.2727 24.3473 14.6184 24.1403 14.8668L15.8069 24.8668C15.5701 25.151 15.1743 25.2451 14.8349 25.0978C14.4956 24.9504 14.294 24.5971 14.3399 24.23L15.0561 18.5H8.50009C8.17674 18.5 7.88258 18.313 7.74543 18.0201C7.60828 17.7273 7.6529 17.3816 7.85991 17.1332L16.1932 7.13318C16.4301 6.84899 16.8259 6.75494 17.1653 6.90225ZM10.2793 16.8333H16.0001C16.2391 16.8333 16.4666 16.936 16.6248 17.1152C16.783 17.2944 16.8566 17.5329 16.827 17.77L16.3462 21.6163L21.7209 15.1667H16.0001C15.7611 15.1667 15.5335 15.064 15.3754 14.8848C15.2172 14.7056 15.1435 14.4672 15.1732 14.23L15.654 10.3837L10.2793 16.8333Z" fill="#495157"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Finder', 'elementor' ); ?></span>
		</div>
		<a href="/wp-admin/admin.php?page=go_knowledge_base_site" target="_blank" id="elementor-panel-footer-help" class="elementor-panel-footer-tool tooltip-target e-top-icon" data-tooltip="<?php esc_attr_e( 'Help', 'elementor' ); ?>">
			<!-- <a href="/wp-admin/admin.php?page=go_knowledge_base_site" target="_blank"> -->
			<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M16 8.8C12.0235 8.8 8.8 12.0235 8.8 16C8.8 19.9764 12.0235 23.2 16 23.2C19.9764 23.2 23.2 19.9764 23.2 16C23.2 12.0235 19.9764 8.8 16 8.8ZM7 16C7 11.0294 11.0294 7 16 7C20.9706 7 25 11.0294 25 16C25 20.9706 20.9706 25 16 25C11.0294 25 7 20.9706 7 16Z" fill="#495157"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M16 19.6C16.4971 19.6 16.9 20.0029 16.9 20.5V20.509C16.9 21.0061 16.4971 21.409 16 21.409C15.5029 21.409 15.1 21.0061 15.1 20.509V20.5C15.1 20.0029 15.5029 19.6 16 19.6Z" fill="#495157"/>
				<path fill-rule="evenodd" clip-rule="evenodd" d="M14.6273 10.9104C15.0767 10.688 15.5717 10.573 16.0732 10.5744C16.5746 10.5758 17.0689 10.6935 17.5172 10.9184C17.9654 11.1433 18.3553 11.4692 18.6562 11.8704C18.9571 12.2715 19.1607 12.7371 19.2511 13.2304C19.3415 13.7236 19.3162 14.2311 19.1771 14.7129C19.038 15.1947 18.789 15.6377 18.4496 16.0069C18.1103 16.3761 17.6899 16.6615 17.2215 16.8406C17.2139 16.8435 17.2062 16.8463 17.1986 16.849C17.1065 16.8814 17.0275 16.9428 16.9734 17.0239C16.9193 17.1051 16.893 17.2016 16.8986 17.299C16.9267 17.7953 16.5472 18.2204 16.051 18.2486C15.5547 18.2767 15.1296 17.8972 15.1014 17.401C15.0738 16.914 15.2052 16.4313 15.4757 16.0255C15.7435 15.6239 16.1332 15.3191 16.5871 15.156C16.7919 15.0763 16.9756 14.9507 17.1244 14.7888C17.2752 14.6247 17.3859 14.4279 17.4477 14.2137C17.5095 13.9996 17.5208 13.774 17.4806 13.5548C17.4404 13.3356 17.3499 13.1287 17.2162 12.9504C17.0825 12.7721 16.9092 12.6272 16.71 12.5273C16.5107 12.4273 16.2911 12.375 16.0682 12.3744C15.8453 12.3738 15.6253 12.4249 15.4256 12.5237C15.2258 12.6226 15.0517 12.7664 14.917 12.944C14.6166 13.34 14.052 13.4174 13.656 13.117C13.26 12.8166 13.1826 12.252 13.483 11.856C13.7861 11.4565 14.1778 11.1328 14.6273 10.9104Z" fill="#495157"/>
			</svg>
			<span class="elementor-screen-only"><?php echo esc_html__( 'Help', 'elementor' ); ?></span>
			<!-- </a> -->
		</a>
		<div id="elementor-panel-footer-saver-preview" class="elementor-panel-footer-tool tooltip-target e-top-icon" data-tooltip="<?php esc_attr_e( 'Preview Changes', 'elementor' ); ?>">
			<span id="elementor-panel-footer-saver-preview-label">
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13ZM15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16Z" fill="#495157"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C11.52 8 7.9072 10.6471 5.13177 15.5038C4.95608 15.8113 4.95608 16.1887 5.13177 16.4962C7.9072 21.3529 11.52 24 16 24C20.48 24 24.0928 21.3529 26.8682 16.4962C27.0439 16.1887 27.0439 15.8113 26.8682 15.5038C24.0928 10.6471 20.48 8 16 8ZM16 22C12.6128 22 9.65779 20.1305 7.15986 16C9.65779 11.8695 12.6128 10 16 10C19.3872 10 22.3422 11.8695 24.8401 16C22.3422 20.1305 19.3872 22 16 22Z" fill="#495157"/>
				</svg>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Preview Changes', 'elementor' ); ?></span>
			</span>
		</div>
		<div id="elementor-panel-footer-saver-publish" class="elementor-panel-footer-tool">
			<button id="elementor-panel-saver-button-publish" class="elementor-button elementor-button-success elementor-disabled">
				<span class="elementor-state-icon">
					<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
				</span>
				<span id="elementor-panel-saver-button-publish-label">
					<?php echo esc_html__( 'Publish', 'elementor' ); ?>
				</span>
			</button>
		</div>
		<div id="elementor-panel-footer-saver-options" class="elementor-panel-footer-tool elementor-toggle-state">
			<button id="elementor-panel-saver-button-save-options" class="elementor-button elementor-button-success tooltip-target elementor-disabled" data-tooltip="<?php esc_attr_e( 'Save Options', 'elementor' ); ?>" data-tooltip-offset="7">
				<div class="e-dropdown-arrow"></div>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Save Options', 'elementor' ); ?></span>
			</button>
			<div class="elementor-panel-footer-sub-menu">
				<p class="elementor-last-edited-wrapper elementor-panel-footer-sub-menu-item">
					<span class="elementor-state-icon">
						<i class="eicon-loading eicon-animation-spin" aria-hidden="true"></i>
					</span>
					<span class="elementor-last-edited"></span>
				</p>

				<div id="elementor-panel-footer-sub-menu-item-save-draft" class="elementor-panel-footer-sub-menu-item elementor-disabled">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M11.35 12L7.975 10.5467L4.6 12V3.33333H11.35V12ZM11.35 2H4.6C4.24196 2 3.89858 2.14048 3.64541 2.39052C3.39223 2.64057 3.25 2.97971 3.25 3.33333V14L7.975 12L12.7 14V3.33333C12.7 2.59333 12.0925 2 11.35 2Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Save Draft', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-sub-menu-item-save-template" class="elementor-panel-footer-sub-menu-item">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M3.33334 3.33333C3.15653 3.33333 2.98696 3.40357 2.86194 3.5286C2.73691 3.65362 2.66668 3.82319 2.66668 4V11.3333C2.66668 11.5101 2.73691 11.6797 2.86194 11.8047C2.98696 11.9298 3.15653 12 3.33334 12H12.6667C12.8435 12 13.0131 11.9298 13.1381 11.8047C13.2631 11.6797 13.3333 11.5101 13.3333 11.3333V6C13.3333 5.82319 13.2631 5.65362 13.1381 5.5286C13.0131 5.40357 12.8435 5.33333 12.6667 5.33333H8.00001C7.8232 5.33333 7.65363 5.2631 7.52861 5.13807L5.72387 3.33333H3.33334ZM1.91913 2.58579C2.2942 2.21071 2.80291 2 3.33334 2H6.00001C6.17682 2 6.34639 2.07024 6.47141 2.19526L8.27615 4H12.6667C13.1971 4 13.7058 4.21071 14.0809 4.58579C14.456 4.96086 14.6667 5.46957 14.6667 6V11.3333C14.6667 11.8638 14.456 12.3725 14.0809 12.7475C13.7058 13.1226 13.1971 13.3333 12.6667 13.3333H3.33334C2.80291 13.3333 2.2942 13.1226 1.91913 12.7475C1.54406 12.3725 1.33334 11.8638 1.33334 11.3333V4C1.33334 3.46957 1.54406 2.96086 1.91913 2.58579Z" fill="#6D7882"/>
					</svg>
					<span class="elementor-title"><?php echo esc_html__( 'Save as Template', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
</script>

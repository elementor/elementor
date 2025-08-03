import { openDialog } from "@elementor/editor-global-dialog";
import * as React from "react";
import { API_ERROR_CODES } from "../api";
import { DuplicatLabelDialog } from "./class-manager/duplicate-label-dialog";

export const showErrorDialog = (e: { response: { data: { data: { message: string; code: string; mata: any } } } }) => {
	const { code, data } = e.response.data;

	if ( code === API_ERROR_CODES.DUPLICATED_LABEL ) {
		openDialog( {
			title: 'ERROR',
			component: <DuplicatLabelDialog id={ data.meta.key } />,
		} );
	}
};
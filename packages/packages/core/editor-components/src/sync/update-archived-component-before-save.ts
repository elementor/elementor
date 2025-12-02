import { apiClient } from "../api";
import { selectArchivedComponents } from "../store/store";
import { __getState as getState } from "@elementor/store";

export const updateArchivedComponentBeforeSave = async () => {
 const archivedComponents = selectArchivedComponents(getState());

 if ( ! archivedComponents.length ) {
  return;
 }
  
  await apiClient.updateArchivedComponents(archivedComponents.map(component => component.id));


}
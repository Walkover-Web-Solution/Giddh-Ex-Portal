import { createAction, props } from '@ngrx/store';

export const setFolderData = createAction(
    '[Session] Set Folder Data',
    props<{ folderName: any, data: any, reset?: boolean }>()
);
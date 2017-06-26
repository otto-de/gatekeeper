import R from 'ramda';

const EDIT_SERVICE_DIALOG = 'editService';
const SET_EDIT_SERVICE_DIALOG = 'gatekeeper/dialog/edit_service_dialog/SET';

export default function reducer(state = {}, action = {}) {
    let gateEditDialogPath = R.lensPath([EDIT_SERVICE_DIALOG]);
    switch (action.type) {
        case SET_EDIT_SERVICE_DIALOG:
            return R.set(gateEditDialogPath,
                R.zipObj(['group', 'service', 'show'], [action.group, action.service, action.show]),
                state);
        default:
            return state;
    }
}

export function openEditServiceDialog(group, service) {
    return {type: SET_EDIT_SERVICE_DIALOG, dialog: EDIT_SERVICE_DIALOG, group: group, service: service, show: true};
}

export function openAddServiceDialog() {
    return {type: SET_EDIT_SERVICE_DIALOG, dialog: EDIT_SERVICE_DIALOG, group: '', service: '', show: true};
}

export function closeEditServiceDialog() {
    return {type: SET_EDIT_SERVICE_DIALOG, dialog: EDIT_SERVICE_DIALOG, group: '', service: '', show: false};
}

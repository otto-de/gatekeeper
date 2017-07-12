export const DELETE_SERVICE_REQUEST = 'gatekeeper/api/service/DELETE';
export const DELETE_SERVICE_RESPONSE = 'gatekeeper/api/service/delete/RESPONSE';
export const DELETE_SERVICE_ERROR = 'gatekeeper/api/service/delete/ERROR';

export default function backendRequests({ getState, dispatch }) {
    return next => action => {
        switch (action.type) {
            case DELETE_SERVICE_REQUEST:
                let { group, service } = action;
                fetch(`/api/gates/${group}/${service}`, {
                    method: 'delete'
                }).then(function (response) {
                    if(response.status === 204) {
                        dispatch(deleteServiceResponse());
                    } else if(response.status === 404) {
                        dispatch(handleDeleteServiceError(`unknown service: ${group}/${service}`));
                    } else {
                        dispatch(handleDeleteServiceError(response.json()));
                    }
                }).catch(function (error) {
                    dispatch(handleDeleteServiceError(error));
                });
                break;
            default:
                break;
        }
        return next(action);
    }
}

export function deleteServiceRequest(group, service) {
    return {type: DELETE_SERVICE_REQUEST, group, service};
}

export function deleteServiceResponse() {
    return {type: DELETE_SERVICE_REQUEST };
}

export function handleDeleteServiceError(error) {
    return {type: DELETE_SERVICE_ERROR, error};
}
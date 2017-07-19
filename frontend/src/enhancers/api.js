export const CREATE_OR_UPDATE_SERVICE_REQUEST = 'gatekeeper/api/service/CREATE';
export const CREATE_OR_UPDATE_SERVICE_RESPONSE = 'gatekeeper/api/service/create/RESPONSE';
export const CREATE_OR_UPDATE_SERVICE_ERROR = 'gatekeeper/api/service/create/ERROR';

export const UPDATE_COMMENT_REQUEST = 'gatekeeper/api/service/comment/UPDATE';
export const UPDATE_COMMENT_RESPONSE = 'gatekeeper/api/service/comment/update/RESPONSE';
export const UPDATE_COMMENT_ERROR = 'gatekeeper/api/service/comment/update/ERROR';

export const DELETE_SERVICE_REQUEST = 'gatekeeper/api/service/DELETE';
export const DELETE_SERVICE_RESPONSE = 'gatekeeper/api/service/delete/RESPONSE';
export const DELETE_SERVICE_ERROR = 'gatekeeper/api/service/delete/ERROR';

export const DELETE_TICKET_REQUEST = 'gatekeeper/api/tickets/DELETE';
export const DELETE_TICKET_RESPONSE = 'gatekeeper/api/tickets/delete/RESPONSE';
export const DELETE_TICKET_ERROR = 'gatekeeper/api/tickets/delete/ERROR';

export default function backendRequests({ getState, dispatch }) {
    return next => action => {
        switch (action.type) {
            case CREATE_OR_UPDATE_SERVICE_REQUEST: {
                let { group, service, environments } = action;
                fetch('/api/gates', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({group, service, environments})
                }).then(function (response) {
                    if(response.status === 204) {
                        dispatch(createOrUpdateServiceResponse(group, service, environments));
                    } else if(response.status === 500) {
                        dispatch(handleCreateServiceError(response.json()));
                    }
                }).catch(function (error) {
                    dispatch(handleCreateServiceError(error));
                });
                break;
            }
            case UPDATE_COMMENT_REQUEST: {
                let { group, service, environment, comment } = action;
                fetch(`/api/gates/${group}/${service}/${environment}`, {
                    method: 'put',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({message:comment})
                }).then(function (response) {
                    if (response.status === 204) {
                        dispatch(updateCommentResponse(group, service, environment, comment));
                    } else if (response.status === 404 || response.status === 500) {
                        dispatch(handleUpdateCommentError(response.json()));
                    }
                }).catch(function (error) {
                    dispatch(handleUpdateCommentError(error));
                });
                break;
            }
            case DELETE_SERVICE_REQUEST: {
                let { group, service } = action;
                fetch(`/api/gates/${group}/${service}`, {
                    method: 'delete'
                }).then(function (response) {
                    if(response.status === 204) {
                        dispatch(deleteServiceResponse(group, service));
                    } else if(response.status === 404) {
                        dispatch(handleDeleteServiceError(`unknown service: ${group}/${service}`));
                    } else {
                        dispatch(handleDeleteServiceError(response.json()));
                    }
                }).catch(function (error) {
                    dispatch(handleDeleteServiceError(error));
                });
                break;
            }
            case DELETE_TICKET_REQUEST: {
                let { group, service, environment, ticketId } = action;
                fetch(`/api/tickets/${group}/${service}/${environment}/${ticketId}`, {
                    method: 'delete'
                }).then(function (response) {
                    if(response.status === 204) {
                        dispatch(deleteTicketResponse(group, service, environment, ticketId));
                    } else if(response.status === 500) {
                        dispatch(handleDeleteTicketError(response.json()));
                    }
                }).catch(function (error) {
                    dispatch(handleDeleteTicketError(error));
                });
                break;
            }
            default:
                break;
        }
        return next(action);
    }
}

export function createOrUpdateServiceRequest(group, service, environments) {
    return { type: CREATE_OR_UPDATE_SERVICE_REQUEST, group, service, environments};
}

export function createOrUpdateServiceResponse(group, service, environments) {
    return { type: CREATE_OR_UPDATE_SERVICE_RESPONSE, group, service, environments};
}

export function handleCreateServiceError(error) {
    return {type: CREATE_OR_UPDATE_SERVICE_ERROR, error};
}

export function deleteServiceRequest(group, service) {
    return {type: DELETE_SERVICE_REQUEST, group, service};
}

export function deleteServiceResponse(group, service) {
    return {type: DELETE_SERVICE_RESPONSE, group, service};
}

export function handleDeleteServiceError(error) {
    return {type: DELETE_SERVICE_ERROR, error};
}

export function deleteTicketRequest(group, service, environment, ticketId) {
    return {type: DELETE_TICKET_REQUEST, group, service, environment, ticketId};
}

export function deleteTicketResponse(group, service, environment, ticketId) {
    return {type: DELETE_TICKET_RESPONSE, group, service, environment, ticketId};
}

export function handleDeleteTicketError(error) {
    return {type: DELETE_TICKET_ERROR, error};
}

export function updateCommentRequest(group, service, environment, comment) {
    return { type: UPDATE_COMMENT_REQUEST, group, service, environment, comment};
}

export function updateCommentResponse(group, service, environment, comment) {
    return { type: UPDATE_COMMENT_RESPONSE, group, service, environment, comment};
}

export function handleUpdateCommentError(error) {
    return {type: UPDATE_COMMENT_ERROR, error};
}
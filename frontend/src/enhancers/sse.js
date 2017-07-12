export const RECEIVE_STATE = 'gatekeeper/sse/receive/STATE';
export const RECEIVE_DELETE_SERVICE = 'gatekeeper/sse/receive/service/DELETE';
export const ERROR = 'gatekeeper/sse/ERROR';
export const CONNECT = 'gatekeeper/sse/CONNECT';
export const DISCONNECT = 'gatekeeper/sse/DISCONNECT';

let eventSource;

export default function middleware({getState, dispatch}) {
    return next => action => {
        switch (action.type) {
            case CONNECT:
                eventSource = new EventSource(action.path);
                eventSource.addEventListener('state', function (e) {
                    dispatch(receiveCompleteState(JSON.parse(e.data)));
                }, false);

                eventSource.addEventListener('deleteService', function (e) {
                    dispatch(receiveDeleteService(JSON.parse(e.data)));
                }, false);

                eventSource.onerror = (e) => dispatch(handleError(e));
                break;
            case DISCONNECT:
                if (eventSource) {
                    eventSource.close();
                }
                break;
            default:
                break;
        }
        return next(action);
    }
};

export function connect(path = '/stream') {
    return {type: CONNECT, path};
}

export function receiveCompleteState(state) {
    return {type: RECEIVE_STATE, state};
}

export function handleError(error) {
    return {type: ERROR, error};
}

function receiveDeleteService(serviceInfo) {
    return {type: RECEIVE_DELETE_SERVICE, ...serviceInfo}
}
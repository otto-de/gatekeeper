export const RECEIVE_STATE = 'gatekeeper/sse/receive/STATE';
export const RECEIVE_DELETE_SERVICE = 'gatekeeper/sse/receive/service/DELETE';
export const RECEIVE_UPDATE_GATE = 'gatekeeper/sse/receive/gate/UPDATE';
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

                eventSource.addEventListener('updateGate', function (e) {
                    dispatch(receiveUpdateGate(JSON.parse(e.data)));
                }, false);

                eventSource.onerror = (e) => dispatch(handleError(e));
                break;
            case DISCONNECT:
                if (eventSource) {
                    eventSource.close();
                    eventSource = undefined;
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

export function disconnect() {
    return {type: DISCONNECT};
}

export function receiveCompleteState(state) {
    return {type: RECEIVE_STATE, state};
}

export function handleError(error) {
    return {type: ERROR, error};
}

export function receiveDeleteService({group, service}) {
    return {type: RECEIVE_DELETE_SERVICE, group, service};
}

export function receiveUpdateGate({group, service, environment, gate}) {
    return {type: RECEIVE_UPDATE_GATE, group, service, environment, gate};
}
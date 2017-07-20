import enhancer, {connect, disconnect} from '../../enhancers/sse';

describe("Updating the State with Server Sent Events", ()=> {

    const dispatch = jest.fn();
    const getState = jest.fn();
    const next = jest.fn();
    const addEventListener = jest.fn();
    const close = jest.fn();
    let path;
    global.EventSource = function (streamPath) {
        path = streamPath;
        this.addEventListener = addEventListener;
        this.close = close;
    };

    const sse = (action) => {
        return enhancer({getState, dispatch})(next)(action);
    };

    beforeEach(() => {
        dispatch.mockReset();
        getState.mockReset();
        next.mockReset();
        path = undefined;
        addEventListener.mockReset();
        close.mockReset();
    });

    it("enhancer should call next dispatch in chain", () => {
        const anyAction = {type:"unknown"};

        sse(anyAction);

        expect(next).toHaveBeenCalledWith(anyAction);
    });

   it("initial connect should use given path", () => {
       const connectAction = connect("/stream-path");

       sse(connectAction);

       expect(path).toEqual("/stream-path");
   });

    // any way to invalidate "import" module cache?
    it.skip("diconnect should not call close on disconnected EventSource", () => {
        const disconnectAction = disconnect();

        sse(disconnectAction);

        expect(close).not.toBeCalled();
    });

    it("diconnect should call close on connected EventSource", () => {
        const disconnectAction = disconnect();

        sse(connect("/stream-path"));
        sse(disconnectAction);

        expect(close).toBeCalled();
    });

   it("initial connect should register relevant event listeners", () => {
       const connectAction = connect("/stream-path");

       sse(connectAction);

       expect(addEventListener.mock.calls).toEqual([
           ['state', expect.any(Function), false],
           ['deleteService', expect.any(Function), false],
           ['updateGate', expect.any(Function), false]
       ]);
   });

    it("'state' event listener should dispatch 'RECEIVE_STATE' with data", () => {
        sse(connect("/stream-path"));
        let stateDispatchFN = addEventListener.mock.calls.filter((call)=>call[0]==='state')[0][1];
        let event = { data: '{"gates":"gates"}'};

        stateDispatchFN(event);

        expect(dispatch).toHaveBeenCalledWith({"state": {"gates": "gates"}, "type": "gatekeeper/sse/receive/STATE"})
    });

    it("'deleteService' event listener should dispatch 'RECEIVE_DELETE_SERVICE' with data", () => {
        sse(connect("/stream-path"));
        let deleteServiceDispatchFN = addEventListener.mock.calls.filter((call)=>call[0]==='deleteService')[0][1];
        let event = { data: '{"group":"yada", "service":"service-yada"}'};

        deleteServiceDispatchFN(event);

        expect(dispatch).toHaveBeenCalledWith({
            group: 'yada',
            service: 'service-yada',
            type: 'gatekeeper/sse/receive/service/DELETE'
        });
    });

    it("'updateGate' event listener should dispatch 'RECEIVE_UPDATE_GATE' with data", () => {
        sse(connect("/stream-path"));
        let updateGateDispatchFN = addEventListener.mock.calls.filter((call)=>call[0]==='updateGate')[0][1];
        let event = { data: '{"group":"yada", "service":"service-yada", "environment":"live", "gate": {"queue":[]}}'};

        updateGateDispatchFN(event);

        expect(dispatch).toHaveBeenCalledWith({
            gate: {queue:[]},
            group: 'yada',
            service: 'service-yada',
            environment:'live',
            type: 'gatekeeper/sse/receive/gate/UPDATE'
        });
    });

});
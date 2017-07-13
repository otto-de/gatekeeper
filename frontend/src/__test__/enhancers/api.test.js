import enhancer,{deleteServiceRequest} from  '../../enhancers/api';

const mockResponse = (status, statusText, body) => {
    let response = new global.Response(body, {
        status: status,
        statusText: statusText,
        headers: {
            'Content-type': 'application/json'
        }
    });
    response.json = () => JSON.parse(body);
    return response;
};

const mockFetch = (mockResponse, mockError, pathCB) => {
    return jest.fn().mockImplementation((fetchPath) => {
        if(pathCB) {
            pathCB(fetchPath);
        }
        return { then:(impl) => {
            if(!mockError) {
                impl(mockResponse);
            }
            return { catch:(implError) => {
                implError(mockError)
            }};
        }}
    });
};

describe('Api', () => {

    const dispatch = jest.fn();
    const getState = jest.fn();
    const next = jest.fn();

    const api = (action) => {
        return enhancer({getState, dispatch})(next)(action);
    };

    beforeEach(() => {
        dispatch.mockReset();
        getState.mockReset();
        next.mockReset();
    });

    it('delete service with api path', () => {
        let path;
        global.fetch = jest.fn().mockImplementation((fetchPath) => {
            path = fetchPath;
            return Promise.resolve(mockResponse(204, null, undefined))
        });

        api(deleteServiceRequest('group1','service1'));

        expect(path).toEqual('/api/gates/group1/service1');
    });

    it('delete service success should trigger response action', () => {
        global.fetch = mockFetch(mockResponse(204, null, undefined));

        api(deleteServiceRequest('group2','service2'));

        expect(dispatch).toHaveBeenCalledWith({type: 'gatekeeper/api/service/DELETE', group:'group2', service:'service2' });
    });

    it('delete service failure with 404 should trigger error action', () => {
        global.fetch = mockFetch(mockResponse(404, null, '{"message":"error"}'));

        api(deleteServiceRequest('group3','service3'));

        expect(dispatch).toHaveBeenCalledWith({type: 'gatekeeper/api/service/delete/ERROR', error:'unknown service: group3/service3' });
    });

    it('delete service failure with 5XX should trigger error action', () => {
        global.fetch = mockFetch(mockResponse(500, null, '{"status": "error", "message": "error-message"}'));

        api(deleteServiceRequest('group3','service3'));

        expect(dispatch).toHaveBeenCalledWith({type: 'gatekeeper/api/service/delete/ERROR', error: {message: "error-message", status: "error"} });
    });

    it('delete service failure in the network should trigger error action', () => {
        global.fetch = mockFetch(undefined, "error!");

        api(deleteServiceRequest('group3','service3'));

        expect(dispatch).toHaveBeenCalledWith({type: 'gatekeeper/api/service/delete/ERROR', error: "error!" });
    });

});
describe("gates toggles", function () {
    "use strict";

    var gates,
        ajax_spy;

    beforeEach(function () {
        setFixtures('<td>' +
            '<a data-gate-id="0c3a0328-ee73-48c6-a94a-a701d21a99b8-1" data-gate-group="group" data-gate-name="name" data-gate-environment="environment" action="open"' +
            'class="js_gate_button btn btn-danger">Closed' +
            '</a>' +
            '<div class="label label-danger">api closed</div>' +
            '<br>' +
            '<div id="0c3a0328-ee73-48c6-a94a-a701d21a99b8-1-button-timestamp" class="timestamp" data-toggle="tooltip"' +
            'data-placement="bottom" title="" data-original-title="2016-03-10 17:19:47+0100">10 days ago' +
            '</div>' +
            '<div id="ticket_a73e5dcf-376b-4e2d-ae7c-53130934bcf6_env" class="timestamp">' +
            '<a href="https://github.com/otto-de/gatekeeper">a73e5dcf-376b-4e2d-ae7c-53130934bcf6</a>' +
            '<span class="label label-default" data-toggle="tooltip" data-placement="bottom" title=""' +
            'data-original-title="Updated: 2016-03-21 16:09:59+0100">5 seconds ago</span>' +
            '<a class="js_remove_button" data-ticket-id="a73e5dcf-376b-4e2d-ae7c-53130934bcf6">' +
            '<span class="glyphicon glyphicon-trash"></span>' +
            '</a>' +
            '</div>' +
            '</td>');

        gates = o_p13n.tools.gates();
    });

    describe("click on button and", function () {

        beforeEach(function() {
            gates.init();
            ajax_spy = spyOn($, "ajax");
        });

        it("sends request", function () {
            $('.js_gate_button').trigger('click');
            expect(ajax_spy.calls.mostRecent().args[0]["type"]).toEqual("PUT");
            expect(ajax_spy.calls.mostRecent().args[0]["url"]).toEqual("/api/gates/group/name/environment");
        });
    });

    describe("click on delete and", function () {

        beforeEach(function() {
            gates.init();
            ajax_spy = spyOn($, "ajax");
        });

        it("sends request", function () {
            $('.js_remove_button').trigger('click');
            expect(ajax_spy.calls.mostRecent().args[0]["type"]).toEqual("DELETE");
            expect(ajax_spy.calls.mostRecent().args[0]["url"]).toEqual("/api/tickets/a73e5dcf-376b-4e2d-ae7c-53130934bcf6");
        });
    });
});


describe("textarea", function () {
    "use strict";

    var gates,
        ajax_spy;

    beforeEach(function () {
        setFixtures('<textarea class="textarea js_gate_textarea" data-gate-group="some-group" data-gate-name="some-service" data-gate-environment="develop" rows="2" style="height: 50px;">Some Text</textarea>');

        gates = o_p13n.tools.gates();
    });

    describe("", function () {

        beforeEach(function(done) {
            gates.init();
            ajax_spy = spyOn($, "ajax");

            $('.js_gate_textarea').height(0)
            $('.js_gate_textarea').val('This is a very important message\n\n\n\n');
            $('.js_gate_textarea').keyup()
            $('.js_gate_textarea').focus()

            setTimeout(function() {
                done();
            }, 1000);
        });

        it("saves on input", function (done) {
            expect(ajax_spy.calls.mostRecent().args[0]["type"]).toEqual("PUT");
            expect(ajax_spy.calls.mostRecent().args[0]["url"]).toEqual("/api/gates/some-group/some-service/develop");
            expect(ajax_spy.calls.mostRecent().args[0]["data"]).toEqual('{"message":"This is a very important message\\n\\n\\n\\n"}');
            expect($('.js_gate_textarea').height()).toBeGreaterThan(50);
            done();
        });
    });
});

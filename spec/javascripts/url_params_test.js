describe("url params", function () {
    "use strict";

    var url_params,
        setSearchSpy,
        getSearchSpy,
        stateSpy,
        locationStub;

    beforeEach(function () {
        locationStub = {
            search: '',
            setSearch: function (s) {
                locationStub.search = s;
            },
            getSearch: function () {
                return locationStub.search;
            }
        };

        setFixtures(
            '<button id="style_change" data-style="night"></button>' +
            '<div class="tab-title" data-group="bar"></div>');

        url_params = o_p13n.tools.url_params();

        getSearchSpy = spyOn(url_params.currentLocation, 'getSearch')
            .and.callFake(locationStub.getSearch);
    });

    describe("when the style is set", function () {

        beforeEach(function() {
            setSearchSpy = spyOn(url_params.currentLocation, 'setSearch')
                .and.callFake(locationStub.setSearch);
        });

        it("should set night style param", function () {
            url_params.init();
            $('#style_change').trigger('click');
            expect(setSearchSpy).toHaveBeenCalledWith('style=night');
        });

        it("should add night style param", function () {
            locationStub.search = '?tab=p13n';
            url_params.init();
            $('#style_change').trigger('click');
            expect(setSearchSpy).toHaveBeenCalledWith('tab=p13n&style=night');
        });

        it("should update style param", function () {
            locationStub.search = '?tab=p13n&style=day';
            url_params.init();
            $('#style_change').trigger('click');
            expect(setSearchSpy).toHaveBeenCalledWith('tab=p13n&style=night');
        });

        it("should drop malformed url terms", function () {
            locationStub.search = '?hund';
            url_params.init();
            $('#style_change').trigger('click');
            expect(locationStub.search).toEqual('style=night');
        });
    });

    describe("when the tab is changed", function () {

        beforeEach(function() {
            stateSpy = spyOn(url_params.currentLocation, 'setState');
        });

        it("should set tab param", function () {
            url_params.init();
            $('.tab-title').trigger('click');
            expect(stateSpy).toHaveBeenCalledWith('?tab=bar');
        });

        it("should add tab param", function () {
            locationStub.search = '?style=awesome';
            url_params.init();
            $('.tab-title').trigger('click');
            expect(stateSpy).toHaveBeenCalledWith('?style=awesome&tab=bar');
        });

        it("should update tab param", function () {
            locationStub.search = '?tab=bad&style=awesome';
            url_params.init();
            $('.tab-title').trigger('click');
            expect(stateSpy).toHaveBeenCalledWith('?tab=bar&style=awesome');
        });

        it("should drop malformed url terms and set param", function () {
            locationStub.search = '?hund&tab=bad';
            url_params.init();
            $('.tab-title').trigger('click');
            expect(stateSpy).toHaveBeenCalledWith('?tab=bar');
        });
    });
});

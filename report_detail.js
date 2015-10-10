if (Meteor.isClient) {
    Template.reportDetail.onCreated(function () {
        var self = this;
        self.registers = new ReactiveVar([]);
        self.selectedLocation = new ReactiveVar();
        self.selectedYear = new ReactiveVar();
        self.selectedObject = new ReactiveVar();
        self.selectedIELTS = new ReactiveVar();
        self.selectedCountries = new ReactiveVar();
        self.selectedStatus = new ReactiveVar();
        self.setFilter = new ReactiveVar();
        self.subsIsReady = new ReactiveVar();
        self.params = new ReactiveVar();
        self.autorun(function (c) {
            if (self.setFilter.get() && self.setFilter.get() === true) {
                var params = {};
                if (self.selectedStatus.get()) {
                    if (self.selectedStatus.get() === "0") params = _.extend(params, {Daden: false});
                    if (self.selectedStatus.get() === "1") params = _.extend(params, {Daden: true});
                }
                if (self.selectedLocation.get()) {
                    params = _.extend(params, {Thamdutai: self.selectedLocation.get()});
                }
                if (self.selectedCountries.get()) {
                    if (self.selectedCountries.get().length > 0) params = _.extend(params, {Dudinhduhoctai: {$in: self.selectedCountries.get()}});
                }
                if (self.selectedIELTS.get()) {
                    if (self.selectedIELTS.get().length > 0) params = _.extend(params, {Conhucauluyen: {$in: self.selectedIELTS.get()}});
                }
                if(self.selectedObject.get()){
                    params = _.extend(params, {Nguoidangkyla : self.selectedObject.get()})
                }
                if(self.selectedYear.get()){
                    params = _.extend(params, {Thoigiandudinh : self.selectedYear.get()});
                }
                console.log('Params : ', params);
                var subsRegisters = subs.subscribe('getRegisters',params);
                self.params.set(params);
                self.subsIsReady.set(subsRegisters);
            }
        })
    });

    Template.reportDetail.helpers({
        isReady : function(){
            var subs = Template.instance().subsIsReady.get();
            return (subs && subs.ready());
        },
        settings: function () {
            var params = Template.instance().params.get() || {};
            var registers = RegistersCheckin.find(params);
            return {
                collection: registers,
                rowsPerPage: 50,
                fields: [
                    {key: 'Hovaten', label: 'Họ và tên', sortable: true, sortOrder: 1, sortDirection: 'ascending'},
                    {key: 'Sodienthoai', label: 'Điện thoại', sortable: false},
                    {key: 'Email', label: 'Email', sortable: false},
                    {key: 'Thamdutai', label: 'Địa điểm', sortable: false}
                ]
            }
        }
    });

    Template.reportDetail.events({
        'change #sltLocation': function (e, t) {
            e.preventDefault();
            var val = t.$('#sltLocation :selected').val(),
                val = val === "" ? null : val;
            t.selectedLocation.set(val);
        },
        'change #sltYear': function (e, t) {
            e.preventDefault();
            var val = t.$('#sltYear :selected').val(),
                val = val === "" ? null : val;
            t.selectedYear.set(val);
        },
        'change #sltObject': function (e, t) {
            e.preventDefault();
            var val = t.$('#sltObject :selected').val(),
                val = val === "" ? null : val;
            t.selectedObject.set(val);
        },
        'change #sltStatus': function (e, t) {
            e.preventDefault();
            t.selectedStatus.set(t.$('#sltStatus :selected').val())
        },
        'click button.btn-reset': function (e, t) {
            e.preventDefault();
            $('#sltLocation').val("Hà Nội");
            $('#sltYear').val("");
            $("#sltObject").val("");
            $("#sltStatus").val("1");
            $('#sltIELTS').multiselect('deselect', t.selectedIELTS.get());
            $('#sltCountry').multiselect('deselect', t.selectedCountries.get());
            t.registers.set([])
            t.setFilter.set(null);
            t.selectedLocation.set(null);
            t.selectedYear.set(null);
            t.selectedObject.set(null);
            t.selectedStatus.set(null);
            t.selectedIELTS.set(null);
            t.selectedCountries.set(null);
        },
        'click button.btn-filter' : function(e,t){
            e.preventDefault();
            t.$('#sltLocation').change();
            t.$('#sltYear').change();
            t.$("#sltObject").change();
            t.$("#sltStatus").change();
            t.setFilter.set(true);
        }
    })

    Template.reportDetail.rendered = function () {
        var self = Template.instance();
        $(document).ready(function () {
            $('#sltIELTS').multiselect({
                numberDisplayed: 1,
                inheritClass: true,
                nonSelectedText: 'Nhu cầu luyện thi',
                onChange: function (e) {
                    var brands = $('#sltIELTS option:selected'),
                        selected = [];
                    $(brands).each(function (index, brand) {
                        selected.push($(this).val());
                    });

                    self.selectedIELTS.set(selected);
                }
            });

            $('#sltCountry').multiselect({
                numberDisplayed: 1,
                inheritClass: true,
                nonSelectedText: 'Nước du học',
                onChange: function (e) {
                    var brands = $('#sltCountry option:selected'),
                        selected = [];
                    $(brands).each(function (index, brand) {
                        selected.push($(this).val());
                    });

                    self.selectedCountries.set(selected);
                }
            });
        })
    }
}
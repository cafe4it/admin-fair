//Meteor.connection = DDP.connect('http://fair.sunrisevietnam.com');
Registers = new Meteor.Collection('registers');
RegistersCheckin = new Meteor.Collection('registers_checkin');

FlowRouter.route('/', {
    name: 'home',
    subscriptions: function (p, q) {
        if (q.diadiem) {
            var params = {
                Thamdutai: q.diadiem
            }
            this.register('myRegisters', Meteor.subscribe('getRegisters', params));
        } else {
            this.register('myRegisters', Meteor.subscribe('getRegisters', {}));
        }
    },
    action: function (p, q) {
        BlazeLayout.render('layout', {main: 'adminFair'});
    }
});

FlowRouter.route('/nhap-lieu-thu-cong', {
    name: 'input1',
    subscriptions: function (p, q) {
        if (q.diadiem) {
            var params = {
                Thamdutai: q.diadiem,
                Nhapthucong : {$exists : true}
            }
            this.register('myRegisters', Meteor.subscribe('getRegisters', params));
        } else {
            this.register('myRegisters', Meteor.subscribe('getRegisters', {Nhapthucong : {$exists : true}}));
        }
    },
    action: function (p, q) {
        BlazeLayout.render('layout', {main: 'input1'});
    }
})

if (Meteor.isClient) {
    BlazeLayout.setRoot('body');
    Meteor.startup(function () {

        FlashMessages.configure({
            autoHide: true,
            hideDelay: 5000,
            autoScroll: true
        });

        listServer = [
            {
                value: 'http://fair.sunrisevietnam.com',
                name: 'server1'
            },
            {
                value: 'http://fair2.sunrisevietnam.com',
                name: 'server2'
            },
            {
                value: 'http://fair3.sunrisevietnam.com',
                name: 'server3'
            }
        ]
    });
    Template.adminFair.onCreated(function () {
        var self = this;
        self.Registers = new ReactiveVar();

        //Flash.clear();

        self.autorun(function () {
            if (self.subscriptionsReady()) {
                self.Registers.set(RegistersCheckin.find());
            }
        })
    });


    Template.adminFair.helpers({
        isReady: function () {
            var self = Template.instance();
            return (self.Registers.get());
        },
        getCount: function (key) {
            return RegistersCheckin.find({Thamdutai: key}).count()
        },
        getCountCheckIn: function (key) {
            return RegistersCheckin.find({Thamdutai: key, Daden: true}).count()
        },
        getCountTicket: function (key) {
            return RegistersCheckin.find({Thamdutai: key, Dalayve: true}).count()
        },
        registers: function () {
            return Template.instance().Registers.get();
        },
        settings: function () {
            var registers = RegistersCheckin.find({},{sort : {Dangkyluc : -1}});
            return {
                collection: registers,
                rowsPerPage: 100,
                fields: [
                    {key: 'Hovaten', label: 'Họ và tên'},
                    {key: 'Sodienthoai', label: 'Điện thoại', sortable: false},
                    {key: 'Email', label: 'Email', sortable: false},
                    {key: 'Thamdutai', label: 'Dự TL tại', sortable: false},
                    {
                        key: 'Dangkyluc', label: 'Đăng ký lúc', fn: function (v, o) {
                        return moment(v).format('DD/MM/YYYY , HH:mm:ss');
                    }, sortOrder: 0, sortDirection: 'descending'
                    },
                    {
                        key: 'Daden', label: 'Check In', tmpl: Template.checkIn, cellClass: function () {
                        return 'check-in'
                    }
                    },
                    {
                        key: 'Dalayve', label: 'Đến lấy vé', tmpl: Template.getTicket, cellClass: function () {
                        return 'get-ticket'
                    }
                    }
                ]
            }
        }
    });

    Template.checkIn.events({
        'change .CHECKIN': function (e, t) {
            e.preventDefault();
            var status = t.$('.CHECKIN').is(':checked');
            console.log(t.data._id, status);
            Meteor.call('checkIn', t.data._id, status, function (err, rs) {
                if (err) console.error('getTicket Error : ', err)
                if (rs && rs.msg) {
                    if (rs.isSet) {
                        FlashMessages.sendSuccess(rs.msg);
                    } else {
                        FlashMessages.sendWarning(rs.msg);
                    }
                }
            })
        }
    });

    Template.checkIn.helpers({
        isCheckIn: function () {
            return (Template.instance().data.Daden) ? 'checked' : ''
        }
    })

    Template.getTicket.events({
        'change input.GETTICKET': function (e, t) {
            e.preventDefault();
            var status = t.$('.GETTICKET').is(':checked');
            console.log(t.data._id, status);
            Meteor.call('getTicket', t.data._id, status, function (err, rs) {
                if (err) console.error('getTicket Error : ', err)
                if (rs && rs.msg) {
                    if (rs.isSet) {
                        FlashMessages.sendSuccess(rs.msg);
                    } else {
                        FlashMessages.sendWarning(rs.msg);
                    }
                }
            })
        }
    });

    Template.getTicket.helpers({
        isGotTicket: function () {
            return (Template.instance().data.Dalayve) ? 'checked' : ''
        },
        getTicketAt: function () {
            var getTiketAt = Template.instance().data.Layveluc;
            if (getTiketAt) {
                return 'Lấy vé lúc : ' + moment(getTiketAt).format('DD/MM/YYYY , HH:mm:ss');
            } else {
                return ''
            }
        }
    })

    Template.removeRegister.events({
        'click button.btn-remove' : function(e,t){
            e.preventDefault();

            Meteor.call('removeRegister', t.data._id, function(err,msg){
                if(err) console.log(err);
                if(msg.length > 0){
                    FlashMessages.sendSuccess(msg);
                }
            })
        }
    })

    Template.input1.onCreated(function () {
        this.selectedCountries = new ReactiveVar();
        this.selectedKnows = new ReactiveVar();
        this.selectedIELTS = new ReactiveVar();
    })

    Template.input1.helpers({
        settings: function () {
            var registers = RegistersCheckin.find();
            return {
                collection: registers,
                rowsPerPage: 100,
                fields: [
                    {
                        key : '_id', label : '', tmpl : Template.removeRegister, cellClass: function () {
                        return 'remove-cell'
                    }
                    },
                    {key: 'Hovaten', label: 'Họ và tên', sortable: true, sortOrder: 1, sortDirection: 'ascending'},
                    {key: 'Sodienthoai', label: 'Điện thoại', sortable: false},
                    {key: 'Email', label: 'Email', sortable: false},
                    {key: 'Thamdutai', label: 'Dự TL tại', sortable: false},
                    {
                        key: 'Dangkyluc', label: 'Đăng ký lúc', fn: function (v, o) {
                        return moment(v).format('DD/MM/YYYY , HH:mm:ss');
                    }, sortOrder: 0, sortDirection: 'descending'
                    },
                    {
                        key: 'Daden', label: 'Check In', tmpl: Template.checkIn, cellClass: function () {
                        return 'check-in'
                    }
                    },
                    {
                        key: 'Dalayve', label: 'Đến lấy vé', tmpl: Template.getTicket, cellClass: function () {
                        return 'get-ticket'
                    }
                    }
                ]
            }
        }
    })

    Template.input1.rendered = function () {
        var self = Template.instance();

        $(document).ready(function () {
            self.autorun(function(c){
                var diadiem = FlowRouter.getQueryParam('diadiem');
                if(diadiem && diadiem.length > 0) $('#sltLocation').val(diadiem);
            })
            $('#txtBod').mask("99/99/9999", {placeholder: "dd/mm/yyyy"});
            $('#sltIELTS').multiselect({
                numberDisplayed: 1,
                inheritClass: true,
                nonSelectedText: 'Có nhu cầu luyện thi ...',
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
                nonSelectedText: 'Đất nước bạn dự định du học',
                onChange: function (e) {
                    var brands = $('#sltCountry option:selected'),
                        selected = [];
                    $(brands).each(function (index, brand) {
                        selected.push($(this).val());
                    });

                    self.selectedCountries.set(selected);
                }
            });

            $('#sltKnowMe').multiselect({
                numberDisplayed: 1,
                inheritClass: true,
                nonSelectedText: 'Bạn biết Sunrise Vietnam qua',
                onChange: function (e) {
                    var brands = $('#sltKnowMe option:selected'),
                        selected = [];
                    $(brands).each(function (index, brand) {
                        selected.push($(this).val());
                    });

                    self.selectedKnows.set(selected);
                }
            });

            $('#myForm').validator({
                disable: true
            })
        })
    }

    Template.input1.events({
        'click button.btn-reset': function (e, t) {
            e.preventDefault();
            t.$('#txtFullName').val('');
            t.$('#txtEmail').val('');
            t.$('#txtBod').val('');
            t.$('#txtPhone').val('');
            t.$('#txtAddress').val('');
            t.$('#txtIELTS').val('');

            $('#sltIELTS').multiselect('deselect', t.selectedIELTS.get());
            $('#sltKnowMe').multiselect('deselect', t.selectedKnows.get());
            $('#sltCountry').multiselect('deselect', t.selectedCountries.get());

            t.selectedIELTS.set([]);
            t.selectedKnows.set([])
            t.selectedCountries.set([]);
        },
        'click button[type="submit"]': function (e, t) {
            e.preventDefault();
            var register = {
                Hovaten: s.titleize(t.$('#txtFullName').val()),
                Ngaysinh: t.$('#txtBod').val() || '',
                Email: t.$('#txtEmail').val() || '',
                Sodienthoai: t.$('#txtPhone').val() || '',
                Diachi: t.$('#txtAddress').val() || '',
                IELTSTOFEL: t.$('#txtIELTS').val() || '',
                Conhucauluyen: t.selectedIELTS.get() || [],
                Nguoidangkyla: t.$('#sltObject :selected').val() || '',
                Thamdutai: t.$('#sltLocation :selected').val() || '',
                Thoigiandudinh: t.$('#sltYears :selected').val() || '',
                Dudinhduhoctai: t.selectedCountries.get() || [],
                BietSrvnqua: t.selectedKnows.get() || [],
                Daden: true,
                Dalayve: false,
                Nhapthucong: true,
                Taiserver: 'http://kqfair.meteor.com'
            }
            if (register.BietSrvnqua.length > 0 && register.Dudinhduhoctai.length > 0) {
                Meteor.call('inputRegister', register, function(err, msg){
                    if(err) console.error(err);
                    if(msg.length > 0){
                        FlashMessages.sendSuccess(msg);
                        t.$('button.btn-reset').click();
                    }
                })
            }
        }
    })
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        RegistersCheckin._ensureIndex({Sodienthoai: 1, Email: 1});
        if (RegistersCheckin.find().count() === 0) {
            var registers = Assets.getText('registers.txt').split('\n');
            _.each(registers, function (r) {
                var register = EJSON.parse(r),
                    register = _.omit(register, '_id'),
                    Hovaten = s.titleize(register.Hovaten),
                    register = _.extend(register, {Hovaten: Hovaten, Daden: false, Dalayve: false});
                RegistersCheckin.upsert({Sodienthoai: register.Sodienthoai, Email: register.Email}, {
                    $set: register
                })
            })
        }
    });

    Meteor.methods({
        checkIn: function (id, status) {
            var rs = false;
            try {
                check(id, String);
                check(status, Boolean);
                RegistersCheckin.update({_id: id}, {
                    $set: {
                        Daden: status
                    }
                })
                if (status === true) {
                    return {
                        isSet: true,
                        msg: 'Đánh dấu khách check-in thành công!'
                    }
                } else {
                    return {
                        isSet: false,
                        msg: 'Huỷ bỏ khách check-in thành công!'
                    }
                }
            } catch (ex) {
                console.log(ex);
                return rs;
            }
            //return rs;
        },
        getTicket: function (id, status) {
            var rs = false;
            try {
                check(id, String);
                check(status, Boolean);
                var Layveluc = new Date;
                if (status == true) {
                    RegistersCheckin.update({_id: id}, {
                        $set: {
                            Dalayve: status,
                            Layveluc: Layveluc
                        }
                    })
                    return {
                        msg: 'Đánh dấu khách đã lấy vé thành công!',
                        isSet: true
                    }
                } else {
                    RegistersCheckin.update({_id: id}, {
                        $set: {
                            Dalayve: status
                        },
                        $unset: {
                            Layveluc: ""
                        }
                    })
                    return {
                        msg: 'Huỷ bỏ khách lấy vé thành công!',
                        isSet: false
                    }
                }
                //rs = true;
            } catch (ex) {
                console.log(ex);
                return rs;
            }
            //return rs;
        },

        inputRegister: function (register) {
            try {
                register = _.extend(register, {
                    Dangkyluc: new Date,
                    Nhapvaoluc: new Date
                });

                RegistersCheckin.insert(register);

                return 'Nhập liệu thành công!'
            } catch (ex) {
                console.log(ex);
                return '';
            }
        },
        removeRegister : function(id){
            try{
                RegistersCheckin.remove({_id : id});
                return 'Xoá đăng ký thành công!'
            }catch(ex){
                console.log(ex);
                return 'Có lỗi rồi'
            }
        }
    })

    Meteor.publish('getRegisters', function (params) {
        return RegistersCheckin.find(params);
    })
}

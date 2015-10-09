if (Meteor.isClient) {
    Template.report.onCreated(function () {
        //this.registers = RegistersCheckin.find().fetch();
    });

    Template.report.helpers({
        table1: function () {
            var registers = RegistersCheckin.find().fetch(),
                hanoi = _.where(registers, {"Thamdutai": "Hà Nội"}),
                haiphong = _.where(registers, {"Thamdutai": "Hải Phòng"}),
                hcm = _.where(registers, {"Thamdutai": "Tp.Hồ Chí Minh"});
            var online = {
                hanoi: _.filter(hanoi, function(i){ return (!i.Nhapthucong)}),
                haiphong: _.filter(haiphong, function(i){ return (!i.Nhapthucong)}),
                hcm: _.filter(hcm, function(i){ return (!i.Nhapthucong)})
                },
                offline = {
                    hanoi : _.filter(hanoi, function(a){ return a.Nhapthucong == true}),
                    haiphong : _.filter(haiphong, function(a){ return a.Nhapthucong == true}),
                    hcm : _.filter(hcm, function(a){ return a.Nhapthucong == true}),
                }
            return {
                online : {
                    hanoi : online.hanoi.length,
                    haiphong : online.haiphong.length,
                    hcm : online.hcm.length
                },
                offline : {
                    hanoi : offline.hanoi.length,
                    haiphong : offline.haiphong.length,
                    hcm : offline.hcm.length
                },
                sum : {
                    hanoi : hanoi.length,
                    haiphong: haiphong.length,
                    hcm : hcm.length
                },
                checkin : {
                    hanoi : {
                        online : _.filter(online.hanoi, function(i){ return i.Daden === true}).length,
                        offline : _.filter(offline.hanoi, function(i){ return i.Daden === true}).length,
                        sum : _.filter(hanoi, function(i){ return i.Daden === true}).length,
                    },
                    haiphong : {
                        online : _.filter(online.haiphong, function(i){ return i.Daden === true}).length,
                        offline : _.filter(offline.haiphong, function(i){ return i.Daden === true}).length,
                        sum : _.filter(haiphong, function(i){ return i.Daden === true}).length,
                    },
                    hcm : {
                        online : _.filter(online.hcm, function(i){ return i.Daden === true}).length,
                        offline : _.filter(offline.hcm, function(i){ return i.Daden === true}).length,
                        sum : _.filter(hcm, function(i){ return i.Daden === true}).length,
                    }
                },
                ticket : {
                    hanoi : _.filter(hanoi, function(i){return i.Dalayve === true}).length || 0,
                    haiphong : _.filter(haiphong, function(i){return i.Dalayve === true}).length || 0,
                    hcm : _.filter(hcm, function(i){return i.Dalayve === true}).length || 0,
                }
            }
        },
        table2 : function(cc,pp){
            return RegistersCheckin.find({Daden : true, Thamdutai : cc, BietSrvnqua : pp}).count()
        }
    });
    var ij = 1;
    var getLength1 = function(c, p){
        return _.size(_.filter(c, function(i){ return (_.indexOf(i.BietSrvnqua,p) > -1)}))
    }
}
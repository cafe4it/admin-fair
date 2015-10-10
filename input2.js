if(Meteor.isClient){
    Template.input2.helpers({
        settings: function () {
            var params = {
                Daden : true
            }
            var diadiem = FlowRouter.getQueryParam('diadiem');
            if(diadiem){
                params.Thamdutai = diadiem;
            }
            var registers = RegistersCheckin.find(params);
            return {
                collection: registers,
                rowsPerPage: 100,
                fields: [
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
                        key: 'Dalayve', label: 'Đến lấy vé', tmpl: Template.getTicket, cellClass: function () {
                        return 'get-ticket'
                    }
                    }
                ]
            }
        }
    })
}
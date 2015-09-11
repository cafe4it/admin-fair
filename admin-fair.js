Meteor.connection = DDP.connect('http://fair.sunrisevietnam.com');
if (Meteor.isClient) {
    Meteor.startup(function () {
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
    Registers = new Meteor.Collection('registers');
    Template.adminFair.onCreated(function(){
        var self = this;
        self.Registers = new ReactiveVar();
        self.autorun(function(){
            var isConnected = (Meteor.connection && Meteor.connection.status()) ? Meteor.connection.status().connected : false;
            if(isConnected){
                self.subsReg = Meteor.connection.subscribe('getRegisters','123456978');

                if(self.subsReg.ready()){
                    self.Registers.set(Registers.find());
                }
            }
        })
    });

    Template.adminFair.helpers({
        isReady : function(){
            var self = Template.instance();
            return (self.Registers.get());
        },
        registers : function(){
            return Template.instance().Registers.get();
        },
        settings : function(){
            var registers = Template.instance().Registers.get();
            return {
                collection : registers,
                rowsPerPage: 20,
                fields : [
                    {key : 'Hovaten', label : 'Họ và tên',sortable: true,sortOrder: 1, sortDirection: 'ascending'},
                    {key : 'Sodienthoai', label : 'Điện thoại', sortable: false},
                    {key : 'Email', label : 'Email', sortable: false},
                    {key : 'Nguoidangkyla', label : '', sortable: true},
                    {key : 'Thamdutai', label : 'Dự TL tại', sortable: false},
                    {key : 'Dangkyluc', label : 'Đăng ký lúc', fn : function(v,o){
                        return moment(v).format('DD/MM/YYYY , HH:mm:ss');
                    },sortOrder: 0, sortDirection: 'descending'},
                ]
            }
        }
    })
}

if (Meteor.isServer) {

}

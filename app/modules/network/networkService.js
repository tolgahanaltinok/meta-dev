'use strict';

app.factory('networkService',
    ['$http',
        function ($http) {
        	var networks = [
        	{id:15,name:"Yazılım"},
        	{id:11,name:"Tella"},
        	{id:12,name:"Sanitag"},
        	{id:13,name:"Arge Sunumları"},
        	{id:14,name:"Sosyal"}
        	];

        return{
        	getNetworks: function () {
	            return networks;
        	}
        }	
}]);

'use strict';

app.controller('dashboardCtrl', ['$scope', '$stateParams', '$state', 'networkService', function ($scope, $stateParams, $state, networkService) {
    $scope.topics = [];

    networkService.getTopics()
            .then(function (results) {
                $scope.topics = results.data;

                $scope.topics = results.data;


                var colors = [{ fill: "#84ffff", brush: "#00e5ff", hover: "#00b8d4", text: "black" },
                              { fill: "#ea80fc", brush: "#d500f9", hover: "#aa00ff", text: "black" },
                              { fill: "#ffd180", brush: "#ff9100", hover: "#ff6d00", text: "black" },
                              { fill: "#f4ff81", brush: "#c6ff00", hover: "#aeea00", text: "black" },
                              { fill: "#a2f78d", brush: "#14e715", hover: "#12c700", text: "black" },
                              { fill: "#bdbdbd", brush: "#757575", hover: "#323232", text: "black" }]

                var temp = [];
                $scope.topics.forEach(function (d, i) {
                    d.name = d.Name;
                    d.color = colors[i % colors.length];
                    d.Tasks.forEach(function (d) {
                        var task = {};

                        task.name = d.Name;
                        task.details = "";
                        task.priorty = d.Proirity;
                        task.time = Math.ceil(Math.random() * 20);
                        task.group = i;
                        task.people = [];

                        temp.push(task);
                    })
                })
                console.log(temp);
                $scope.group = $scope.topics;
                $scope.data = temp;

            }, function (error) {
                //alert(error.data.message);
            });

  }]);

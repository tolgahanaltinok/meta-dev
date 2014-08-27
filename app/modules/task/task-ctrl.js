app.controller('task-ctrl', ['$scope', 'networkService', '$stateParams',
    function ($scope, networksSrv, $stateParams) {

        $scope.toDate = function (date) {
            return moment(date).fromNow();
        };
     
        var serviceBase = 'http://localhost:16516/';

        //http://www.mono-software.com/blog/post/Mono/233/Async-upload-using-angular-file-upload-directive-and-net-WebAPI-service/

        $scope.ratingStates = [
           { stateOn: 'glyphicon-star rating-1', stateOff: 'glyphicon-star-empty rating-1' },
           { stateOn: 'glyphicon-star rating-2', stateOff: 'glyphicon-star-empty rating-2' },
           { stateOn: 'glyphicon-star rating-3', stateOff: 'glyphicon-star-empty rating-3' },
           { stateOn: 'glyphicon-star rating-4', stateOff: 'glyphicon-star-empty rating-4' },
           { stateOn: 'glyphicon-star rating-5', stateOff: 'glyphicon-star-empty rating-5' }
        ];

        $scope.setPriority = function (topic) {

            networksSrv.putTopic(topic)
          .then(function (results) {
              console.log(results.data);
          }, function (error) {
              //alert(error.data.message);
          });
        };

        var userExistsInTopic = function (topic, usr) {
            for (var x = 0; x < topic.member.length; x++) {
                if (topic.member[x].userId === usr.id) return true;
            }
            return false;
        }

        var labelExistInTopic = function (topic, item) {

            for (var x = 0; x < topic.topicTag.length; x++) {

                if (topic.topicTag[x].tag.id === item.id) {

                    return true;
                }
            }
            return false;
        }

        var labelNameExistInTopic = function (topic, model) {

            for (var x = 0; x < topic.topicTag.length; x++) {

                if (topic.topicTag[x].tag.name === model) {

                    return true;
                }
            }
            return false;
        }
        var labelNameExistInLabels = function (model) {
            if (typeof model !== "string") {
                var capModel = model.toUppercase();
                for (var x = 0; x < $scope.labels.length; x++) {

                    if ($scope.labels[x].name.toUppercase() === capModel) {

                        return true;
                    }
                }
            }
            else {
                capModel = model;
                for (var x = 0; x < $scope.labels.length; x++) {

                    if ($scope.labels[x].name === capModel) {

                        return true;
                    }
                }
            }

            return false;
        }

        var getLabelFromLabels = function (model) {

            for (var x = 0; x < $scope.labels.length; x++) {
                if ($scope.labels[x].name === model) {
                    return $scope.labels[x];
                }
            }
        }
   
        $scope.removeTag = function(tag){

            networksSrv.deleteTopicTag(tag)
                     .then(function (results) {
                         $scope.topic.topicTag.pop(tag);
                     }, function (error) {
                         //alert(error.data.message);
                     });
        }

        $scope.deleteTopic = function(index){

            networksSrv.deleteTopic($scope.topic).then(function (results) {

            
                $scope.topics.splice(index, 1);

            }, function (error) {

                //alert vs
            });
        }


        $scope.completeTopic = function (index) {

            $scope.topic.Status = 1;
            networksSrv.putTopic($scope.topic).then(function (results) {

            
                $scope.topics.splice(index, 1);

            }, function (error) {

                //alert vs
            });
        }

        $scope.onItemSelected = function (topic, model, item) { // this gets executed when an item is selected      

            // new label has id
            if (item.id === 'undefined') {
                var newTopicTag = new Object();
                newTopicTag.topicId = topic.id;
                newTopicTag.tag = new Object();
                newTopicTag.tag.name = model;
                newTopicTag.tag.color = '#7F00FF';
                newTopicTag.tag.networkId = topic.networkId;
             
                networksSrv.postTopicTag(newTopicTag)
                     .then(function (results) {
                         console.log(results.data);
                         topic.topicTag.push(results.data);
                         $scope.labels.push(results.data.tag);
                         console.log(results.data);
                     }, function (error) {
                         //alert(error.data.message);
                     });

                return;
            }
            // new label exist in TopicTags
            if (!labelExistInTopic(topic, item)) {

                var newTopicTag = new Object();
                newTopicTag.topicId = topic.id;
                newTopicTag.tagId = item.id;

                networksSrv.postTopicTag(newTopicTag)
                     .then(function (results) {
                         results.data.tag = item;
                         topic.topicTag.push(results.data);
                         console.log(results.data);
                         $scope.labelSelected = '';
                     }, function (error) {
                         //alert(error.data.message);
                     });
            }
            else {
                $scope.labelSelected = '';
            }
            $timeout(function () {
                $scope.addLabelFocus = false;
            }, 100);

        };

        $scope.onUserSelected = function (topic, item) { //this gets executed when an user is selected

            // user exists in topic
            if (userExistsInTopic(topic, item)) {
                return;
            }
            else { // assign selected user to current topic
                var newTopicUsr = new Object();
                newTopicUsr.topicId = topic.id;
                newTopicUsr.userId = item.id;
                newTopicUsr.memberRoleId = 3;
                networksSrv.postTopicUsr(topic.id, newTopicUsr)
         .then(function (results) {
             results.data.user = item;
             topic.member.push(results.data);
             console.log(results.data);
             $scope.userSelected = '';
         }, function (error) {
             //alert(error.data.message);
         });

            }

            $timeout(function () {
                $scope.addUserFocus = false;
            }, 100);
        }

        $scope.updateTopic = function (ev) {

            if (ev.which === 13) {
                ev.target.blur();
                ev.preventDefault();
                ev.stopPropagation();
                networksSrv.putTopic($scope.topic).then(function (results) {

                }, function (error) {
                    // alert falan
                });
            }

            if (ev.which === 27) {
                ev.target.blur();
                $scope.topic.description = $scope.preDesc;
            }
        }

        $scope.addNewLabel = function (ev, topic, model) {

            if (ev.which == '13') {
                if (model !== undefined && (!labelNameExistInLabels(model))) {

                    // Label yok yeni yaratılacak
                    var newTopicTag = new Object();
                    newTopicTag.topicId = topic.id;
                    newTopicTag.tag = new Object();
                    newTopicTag.tag.name = model;
                    newTopicTag.tag.color = '#7F00FF';
                    newTopicTag.tag.networkId = topic.networkId;
                    $scope.addLabelFocus = false;
                    networksSrv.postTopicTag(newTopicTag)
                         .then(function (results) {
                             topic.topicTag.push(results.data);
                             $scope.labels.push(results.data.tag);
                             console.log(results.data);
                         }, function (error) {
                             //alert(error.data.message);
                         });
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                else { // labelların içinde bu ada ait label var 
                    $scope.addLabelFocus = false;
                    //    if (model !== undefined && (!labelNameExistInTopic(topic, model))) {
                    //        // topic in içinde yok , item id ile kaydet
                    //        var newlbl = getLabelFromLabels(model);

                    //        networksSrv.postTopicTag(newlbl)
                    //         .then(function (results) {
                    //             results.data.tag = newlbl;
                    //             topic.topicTag.push(results.data);
                    //             console.log(results.data);
                    //             $scope.labelSelected = '';
                    //         }, function (error) {
                    //             //alert(error.data.message);
                    //         });
                    //    }
                    //    else {
                    //        $scope.addLabelFocus = false; //-> var ise -> un focus
                    //    }
                }
            }
        }

        $scope.updateTaskDate = function (tskDate) {
            if (tskDate !== undefined) {
                console.log("Date changed" + tskDate);
                $scope.task.DueDate = tskDate;
                networksSrv.putTopic($scope.task)
                    .then(function (results) {
                        console.log(results);
                    }, function (error) {
                        // alert falan
                        console.log(error);
                    });

            }

        }

        $scope.$watch('tpcDate', function () {
            if ($scope.tpcDate !== undefined) {
                updateTopicDate($scope.tpcDate);
            }
        });
        //#region datepicker
        $scope.today = function () {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        // Disable weekend selection
        $scope.disabled = function (date, mode) {
            return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
        };

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        $scope.open = function ($event, topic) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'yyyy-MM-dd'];
        $scope.format = $scope.formats[4];
        //#endregion

        //#region typeahead static 
        $scope.selected = undefined;
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        // Any function returning a promise object can be used to load values asynchronously
        $scope.getLocation = function (val) {
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: val,
                    sensor: false
                }
            }).then(function (res) {
                var addresses = [];
                angular.forEach(res.data.results, function (item) {
                    addresses.push(item.formatted_address);
                });
                return addresses;
            });
        };

        $scope.statesWithFlags = [{ 'name': 'Alabama', 'flag': '5/5c/Flag_of_Alabama.svg/45px-Flag_of_Alabama.svg.png' }, { 'name': 'Alaska', 'flag': 'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png' }, { 'name': 'Arizona', 'flag': '9/9d/Flag_of_Arizona.svg/45px-Flag_of_Arizona.svg.png' }, { 'name': 'Arkansas', 'flag': '9/9d/Flag_of_Arkansas.svg/45px-Flag_of_Arkansas.svg.png' }, { 'name': 'California', 'flag': '0/01/Flag_of_California.svg/45px-Flag_of_California.svg.png' }, { 'name': 'Colorado', 'flag': '4/46/Flag_of_Colorado.svg/45px-Flag_of_Colorado.svg.png' }, { 'name': 'Connecticut', 'flag': '9/96/Flag_of_Connecticut.svg/39px-Flag_of_Connecticut.svg.png' }, { 'name': 'Delaware', 'flag': 'c/c6/Flag_of_Delaware.svg/45px-Flag_of_Delaware.svg.png' }, { 'name': 'Florida', 'flag': 'f/f7/Flag_of_Florida.svg/45px-Flag_of_Florida.svg.png' }, { 'name': 'Georgia', 'flag': '5/54/Flag_of_Georgia_%28U.S._state%29.svg/46px-Flag_of_Georgia_%28U.S._state%29.svg.png' }, { 'name': 'Hawaii', 'flag': 'e/ef/Flag_of_Hawaii.svg/46px-Flag_of_Hawaii.svg.png' }, { 'name': 'Idaho', 'flag': 'a/a4/Flag_of_Idaho.svg/38px-Flag_of_Idaho.svg.png' }, { 'name': 'Illinois', 'flag': '0/01/Flag_of_Illinois.svg/46px-Flag_of_Illinois.svg.png' }, { 'name': 'Indiana', 'flag': 'a/ac/Flag_of_Indiana.svg/45px-Flag_of_Indiana.svg.png' }, { 'name': 'Iowa', 'flag': 'a/aa/Flag_of_Iowa.svg/44px-Flag_of_Iowa.svg.png' }, { 'name': 'Kansas', 'flag': 'd/da/Flag_of_Kansas.svg/46px-Flag_of_Kansas.svg.png' }, { 'name': 'Kentucky', 'flag': '8/8d/Flag_of_Kentucky.svg/46px-Flag_of_Kentucky.svg.png' }, { 'name': 'Louisiana', 'flag': 'e/e0/Flag_of_Louisiana.svg/46px-Flag_of_Louisiana.svg.png' }, { 'name': 'Maine', 'flag': '3/35/Flag_of_Maine.svg/45px-Flag_of_Maine.svg.png' }, { 'name': 'Maryland', 'flag': 'a/a0/Flag_of_Maryland.svg/45px-Flag_of_Maryland.svg.png' }, { 'name': 'Massachusetts', 'flag': 'f/f2/Flag_of_Massachusetts.svg/46px-Flag_of_Massachusetts.svg.png' }, { 'name': 'Michigan', 'flag': 'b/b5/Flag_of_Michigan.svg/45px-Flag_of_Michigan.svg.png' }, { 'name': 'Minnesota', 'flag': 'b/b9/Flag_of_Minnesota.svg/46px-Flag_of_Minnesota.svg.png' }, { 'name': 'Mississippi', 'flag': '4/42/Flag_of_Mississippi.svg/45px-Flag_of_Mississippi.svg.png' }, { 'name': 'Missouri', 'flag': '5/5a/Flag_of_Missouri.svg/46px-Flag_of_Missouri.svg.png' }, { 'name': 'Montana', 'flag': 'c/cb/Flag_of_Montana.svg/45px-Flag_of_Montana.svg.png' }, { 'name': 'Nebraska', 'flag': '4/4d/Flag_of_Nebraska.svg/46px-Flag_of_Nebraska.svg.png' }, { 'name': 'Nevada', 'flag': 'f/f1/Flag_of_Nevada.svg/45px-Flag_of_Nevada.svg.png' }, { 'name': 'New Hampshire', 'flag': '2/28/Flag_of_New_Hampshire.svg/45px-Flag_of_New_Hampshire.svg.png' }, { 'name': 'New Jersey', 'flag': '9/92/Flag_of_New_Jersey.svg/45px-Flag_of_New_Jersey.svg.png' }, { 'name': 'New Mexico', 'flag': 'c/c3/Flag_of_New_Mexico.svg/45px-Flag_of_New_Mexico.svg.png' }, { 'name': 'New York', 'flag': '1/1a/Flag_of_New_York.svg/46px-Flag_of_New_York.svg.png' }, { 'name': 'North Carolina', 'flag': 'b/bb/Flag_of_North_Carolina.svg/45px-Flag_of_North_Carolina.svg.png' }, { 'name': 'North Dakota', 'flag': 'e/ee/Flag_of_North_Dakota.svg/38px-Flag_of_North_Dakota.svg.png' }, { 'name': 'Ohio', 'flag': '4/4c/Flag_of_Ohio.svg/46px-Flag_of_Ohio.svg.png' }, { 'name': 'Oklahoma', 'flag': '6/6e/Flag_of_Oklahoma.svg/45px-Flag_of_Oklahoma.svg.png' }, { 'name': 'Oregon', 'flag': 'b/b9/Flag_of_Oregon.svg/46px-Flag_of_Oregon.svg.png' }, { 'name': 'Pennsylvania', 'flag': 'f/f7/Flag_of_Pennsylvania.svg/45px-Flag_of_Pennsylvania.svg.png' }, { 'name': 'Rhode Island', 'flag': 'f/f3/Flag_of_Rhode_Island.svg/32px-Flag_of_Rhode_Island.svg.png' }, { 'name': 'South Carolina', 'flag': '6/69/Flag_of_South_Carolina.svg/45px-Flag_of_South_Carolina.svg.png' }, { 'name': 'South Dakota', 'flag': '1/1a/Flag_of_South_Dakota.svg/46px-Flag_of_South_Dakota.svg.png' }, { 'name': 'Tennessee', 'flag': '9/9e/Flag_of_Tennessee.svg/46px-Flag_of_Tennessee.svg.png' }, { 'name': 'Texas', 'flag': 'f/f7/Flag_of_Texas.svg/45px-Flag_of_Texas.svg.png' }, { 'name': 'Utah', 'flag': 'f/f6/Flag_of_Utah.svg/45px-Flag_of_Utah.svg.png' }, { 'name': 'Vermont', 'flag': '4/49/Flag_of_Vermont.svg/46px-Flag_of_Vermont.svg.png' }, { 'name': 'Virginia', 'flag': '4/47/Flag_of_Virginia.svg/44px-Flag_of_Virginia.svg.png' }, { 'name': 'Washington', 'flag': '5/54/Flag_of_Washington.svg/46px-Flag_of_Washington.svg.png' }, { 'name': 'West Virginia', 'flag': '2/22/Flag_of_West_Virginia.svg/46px-Flag_of_West_Virginia.svg.png' }, { 'name': 'Wisconsin', 'flag': '2/22/Flag_of_Wisconsin.svg/45px-Flag_of_Wisconsin.svg.png' }, { 'name': 'Wyoming', 'flag': 'b/bc/Flag_of_Wyoming.svg/43px-Flag_of_Wyoming.svg.png' }];
        //#endregion


        //elastic textarea
        $scope.bar = 'test';

        $scope.submit = function () {
            $scope.bar = '';
        };

        //dummy comment
    }]);
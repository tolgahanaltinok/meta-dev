'use strict';

app.controller('mainCtrl', ['$scope', '$state', 'networkService', '$cookieStore', 'authService', function ($scope, $state, networkService, $cookieStore, authService) {

    $scope.networks = [];
    $scope.userNetworkRelations = [];

    networkService.getNetworks()
            .then(function (results) {
                $scope.networks = results.data;
            }, function (error) {
                //alert(error.data.message);
            });

    networkService.getUsersInDomainNetwork()
            .then(function (results) {
                $scope.userNetworkRelations = results.data;
            }, function (error) {
                //alert(error.data.message);
            });

    console.log($state);

    if($state.is("main")){
        $state.go("main.dashboard.list");
        console.log($state.is("main"));
    }
    
    $scope.calculateFixedSidebarViewportHeight = function () {
        var sidebarHeight = $(window).height() - $('.header').height() + 1;
        if ($('body').hasClass("page-footer-fixed")) {
            sidebarHeight = sidebarHeight - $('.footer').height();
        }

        return sidebarHeight; 
    }

    $scope.logOut = function () {
    
        authService.logOffUser();
        $state.go('login');
    }

}])



app.controller('forceCtrl', ['$scope', '$http',
    function ($scope, $http) {


        //get data from json and construct a chart
        /*$http.get('resources/tasks.json').success(function (input) {
            $http.get('resources/group.json').success(function (input2) {
                console.log("***New Run***");
                custom_chart(input, createGroups(input2));
            })
        }); */

        //initilazing variables
        var vis = d3.select("#svgForce");
        var width = svgForce.width.baseVal.value,
            height = svgForce.height.baseVal.value,
            layout_gravity = 0,
            damper = 0.1,
            nodes = [],
            force, groupForce, nodesSvg, nodesAll, background, taskCanvas, position, circles, groups, groupTexts, container;
        var currentTranslate = ["0", "0"];//Stores current transition caused by drag and zoom
        var currentScale = "1"; //Stores current zoom level
        d3.select("#svgForce").append("rect").attr("width", width).attr("height", height).attr("fill", "#009688");//background
        container = d3.select("#svgForce").append("g"); //container for every thing that is effected by zooming 
        background = container.append("g").attr("id", "background"); //A group to hold objects at the back relative to circles
        var center = { x: width / 2, y: height / 2 }; //Finds the center of the canvas
        var move; //Stores the move function of current view
        var group = []; //An array to hold information about Groups/Networks
        var defs = d3.select("#svgForce").append('svg:defs'); //A place to hold svg def like patterns.
        $scope.info = [];
        var addTaskDrag = d3.behavior.drag();
        var addGroupDrag = d3.behavior.drag();

        vis.append("rect").attr("width", 80).attr("height", 40).attr("x", width - 80).attr("y", 0);
        vis.append("rect").attr("width", 50).attr("height", 40).attr("x", width - 130).attr("y", 0).attr("fill", "red");

        vis.append("circle").data([{ x: width - 40, y: 20 }])
            .attr("r", 40)
            .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")"; })
            .attr("fill", "grey")
            .attr("opacity", 0)
            .call(addTaskDrag);

        vis.append("circle").data([{ x: width - 105, y: 20 }])
            .attr("r", 25)
            .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")"; })
            .attr("stroke", "black")
            .attr("stroke-width", 6)
            .attr("fill-opacity", 0)
            .attr("opacity", 0)
            .call(addGroupDrag);

        //Using angular to access group info from html
        $scope.getGroup = function () {
            return group;
        };

        var zoom = d3.behavior.zoom()
                .scaleExtent([0.5, 10]);

        //custom_chart([], createGroups([]));
        function custom_chart(data, igroup) {
            group = createGroups(igroup, group);
            //zoom behavior
            zoom = zoom
                .on("zoom", zoomed);
            //maxX stores the higest time value
            var maxX = d3.max(data, function (d) {
                return d.time;
            });
            //Scale to find x position of a circle
            var xRange = d3.scale.linear()
                    .domain([0, (maxX)])
                    .range([width / 6, width - width / 6]);
            //Scale to find y position of a circle
            var yRange = d3.scale.linear()
                    .domain([1, 5])
                    .range([height - height / 6, height / 6]);
            //Scale to find scaling value according to time for a circle
            var c = d3.scale.linear()
                    .domain([(maxX), 0])
                    .range([.4, 1]);
            //Scale to determine color of the priorty circle
            var colorScale = d3.scale.linear()
                       .domain([5, 3, 1])
                       .range(["red", "yellow", "green"]);
            nodes = createNodes(data, nodes); //Creates nodes from raw data and previous nodes
            group = resizeGroups(group, nodes); //Calculates size of the groups according to nodes they contain
            if (nodesAll) nodesAll.remove(); //removes all the nodes to redraw
            vis.call(zoom); //activates zoom behaviour

            //selection for all nodes
            nodesAll = container.selectAll("svg")
                    .data(nodes);

            //appends Svgs for nodes and adds needed listenerss such as click
            nodesSvg = nodesAll.enter()
                    .append("svg")
                    .attr("width", function (d) {
                        return d.radius * 2;
                    })
                    .on("mouseover", function (d, i) {
                        show_details(d, i, this);
                    })
                    .on("click", function (d, i) {
                        if (d3.event.defaultPrevented) return;
                        show_task_view(d, i, this);
                    })
                    .on("mouseout", function (d, i) {
                        hide_details(d, i, this);
                    })
                    .attr("height", function (d) {
                        return d.radius * 2;
                    });

            //appends task circles with a transition
            nodesSvg.append("circle")
                    .attr("r", function (d) {
                        return Math.max(0, d.iradius - 2);
                    })
                    .attr("cy", function (d) {
                        return d.radius;
                    })
                    .attr("cx", function (d) {
                        return d.radius;
                    })
                    .attr("fill", function (d) {
                        return group[d.group].color.fill;
                    })
                    .attr("stroke-width", 4)
                    .attr("stroke", function (d) {
                        return group[d.group].color.brush;
                    })
                    .transition().duration(2000).attr("r", function (d) {
                        return Math.max(0, d.radius - 2);
                    });

            //appends priorty circles with a transition
            nodesSvg.append("circle")
                    .attr("r", function (d) {
                        return d.radius * .20;
                    })
                    .attr("cy", function (d) {
                        if (d.radius != d.iradius)
                            return d.radius;
                        return d.radius * .3;
                    })
                    .attr("cx", function (d) {
                        if (d.radius != d.iradius)
                            return d.radius;
                        return d.radius * 1.7;
                    })
                    .attr("fill", function (d) {
                        return colorScale(d.priorty);
                    })
                    .transition().duration(2000)
                    .attr("cy", function (d) {
                        return d.radius * .3;
                    })
                    .attr("cx", function (d) {
                        return d.radius * 1.7;
                    });


            //appends html body and adds text to it.
            var nodeText = nodesSvg.append("foreignObject")
                    .attr("class", "circleLabel")
                    .attr("x", function (d) {
                        return 0;
                    })
                    .attr("y", function (d) {
                        return 0;
                    })
                    .attr("width", function (d) {
                        return d.radius * 2;
                    })
                    .attr("height", function (d) {
                        return d.radius * 2;
                    })
                    .style("line-height", function (d) {
                        return d.radius * 2;
                    })
                    .append("xhtml:body")
                    .attr("class", "circleLabel")
                    .append("div")
                    .attr("class", "circleLabel")
                    .style("line-height", function (d) {
                        return d.radius * 2 + "px";
                    })
                    .attr("class", "circleLabel")
                    .append("p")
                    .attr("class", "circleLabel")
                    .text(function (d) {
                        return d.name;
                    });

            //initilizes force layout for task circles using function stored on move variable
            function initilizeForce() {
                force = d3.layout.force()
                        .nodes(nodes)
                        .size([width, height])
                        .gravity(layout_gravity)
                        .charge(-20)
                        .friction(0.9)
                .on("tick", function (e) {
                    var q = d3.geom.quadtree(nodes),
                            i = 0,
                            n = nodes.length;
                    while (++i < n)
                        q.visit(collide(nodes[i]));
                    nodesAll.each(move(e.alpha))
                            .attr("x", function (d) {
                                return d.x - d.radius;
                            })
                            .attr("y", function (d) {
                                return d.y - d.radius;
                            })
                })
                nodesSvg.call(force.drag().on("dragstart", dragstart).on("dragend", dragend));
            }

            //initilizes force layout for groups pulling them to the center
            function initilizeGroupForce() {
                groupForce = d3.layout.force()
                        .nodes(group)
                        .size([width, height])
                        .gravity(layout_gravity)
                        .charge(-20)
                        .friction(0.9)
                .on("tick", function (e) {
                    var q = d3.geom.quadtree(group),
                            i = 0,
                            n = group.length;
                    while (++i < n) {
                        q.visit(collide(group[i]));
                    }
                    groups.each(move_free(e.alpha))
                            .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")" });
                })
                groups.call(groupForce.drag().on("dragstart", dragstart).on("drag", groupDrag).on("dragend", groupDragEnd));
                groupForce.start();
            }

            function groupDrag(d) {
                force.resume();
            }

            function groupDragEnd(d) {
                d.fx = d.x;
                d.fy = d.y;
                d.dragging = false;
            }

            //Activates during dragstart to prevent other listeneres from acting
            function dragstart(d) {
                d3.event.sourceEvent.stopPropagation();
                d.dragging = true;
            }

            //Checks if drag caused any changes in groups by if it did, redraws the circles and the groups.
            function dragend(d) {
                if (position == "group") {
                    var newGroup;
                    group.forEach(function (a) {
                        if (Math.sqrt(Math.pow(d.x - a.x, 2) + Math.pow(d.y - a.y, 2)) < a.radius)
                            newGroup = a.no;
                    });
                    if ((newGroup || newGroup == 0) && d.group != newGroup) {
                        d.group = newGroup;
                        custom_chart(data, group)
                    }
                }
                if (position == "free") {
                    d.fx = d.x;
                    d.fy = d.y;
                }
                d.dragging = false;
            }

            //Creates nodes from raw data and previous nodes
            function createNodes(data, nodes) {
                var temp = [];
                data.forEach(function (d, i) {
                    var node = {
                        iradius: (((height / 15 + (d.priorty * height / 60)) * c((d.time))) / 2) * .2,
                        radius: (((height / 15 + (d.priorty * height / 60)) * c((d.time))) / 2),
                        collisionradius: (((height / 15 + (d.priorty * height / 60)) * c((d.time))) / 2) * 1.10,
                        tx: xRange(d.time),
                        ty: yRange(d.priorty),
                        priorty: d.priorty,
                        name: d.name,
                        details: d.details,
                        time: d.time,
                        x: 500,
                        y: -100,
                        group: d.group,
                        people: d.people
                    }

                    nodes.forEach(function (n) {
                        if (n.name === d.name) {
                            node.iradius = n.radius;
                            node.x = n.x;
                            node.y = n.y;
                            node.group = n.group;
                            $scope.data[i].group = n.group;
                        }
                    })
                    temp.push(node);
                })/*
                console.log(data);
                console.log(temp); */
                return temp;
            }

            //move metod that positions nodes on y-axis according to their priorty and leaving them free on x-axis. 
            function move_towards_gradient(alpha) {
                return function (d) {
                    d.y = d.y + (d.ty - d.y) * (damper + 0.04) * alpha * 1.1;
                    d.x = Math.max(d.x, d.radius);
                    d.x = Math.min(d.x, width - d.radius);
                };
            }

            //move method that pulls nodes to the center of the screen
            function move_towards_center(alpha) {
                return function (d) {
                    d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha * 1.1;
                    d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha * 1.1;
                };
            }

            //move method that pulls nodes to their groups center.
            function move_towards_group(alpha) {
                return function (d) {
                    d.x = d.x + (group[d.group].x - d.x) * (damper + 0.02) * alpha * 1.1 * d.radius / 60;
                    d.y = d.y + (group[d.group].y - d.y) * (damper + 0.02) * alpha * 1.1 * d.radius / 60;
                };
            }

            //move method that positions nodes on y-axis according to their priorty and on x-axis according to time left 
            function move_towards_position(alpha) {
                return function (d) {
                    d.x = d.x + (d.tx - d.x) * (damper + 0.02) * alpha * 1.1;
                    d.y = d.y + (d.ty - d.y) * (damper + 0.02) * alpha * 1.1;
                };
            }

            //move method that holds the nodes on their positions until moved by drag.
            function move_free(alpha) {
                return function (d) {
                    if (!d.fx) d.fx = d.x;
                    if (!d.fy) d.fy = d.y;
                    if (!d.dragging) {
                        d.x = d.x + (d.fx - d.x) * (damper + 0.02) * alpha * 1.1;
                        d.y = d.y + (d.fy - d.y) * (damper + 0.02) * alpha * 1.1;
                    }
                };
            }

            //hides details that is displayed on the right. Changes circles stroke color back to normal
            function hide_details(data, i, element) {
                d3.select(element).select("circle").attr("stroke", function (d) {
                    return group[d.group].color.brush;
                });
                $scope.info = null;
                $scope.$apply();
            }

            //shows details on the right side of the screen. Changes circles stroke color to hover
            function show_details(data, i, element) {
                $scope.info = data;
                $scope.info.groupname = group[data.group].name;
                $scope.$apply();
                d3.select(element).select("circle").attr("stroke", function (d) {
                    return group[d.group].color.hover;
                });
            }

            //Creates a new view that displays more details about the text like assigined personel
            function show_task_view(data, i, element) {
                var foreground; // new layer that is infront of the circles

                vis.call(d3.behavior.zoom()); //Disable zoom

                d3.select(element).attr("opacity", 0); //Hide the clicked circle
                taskCanvas = container.append("g");
                taskCanvas.append("rect").attr("width", width).attr("height", height).attr("opacity", 0);
                taskCanvas.transition().duration(1000).attr("transform", "translate(" + -parseInt(currentTranslate[0]) / parseFloat(currentScale) + ", " + -parseInt(currentTranslate[1]) / parseFloat(currentScale) + ")scale(" + 1 / parseFloat(currentScale) + ")");
                //appen a circle in the same place then enlarge and translate it so its in the center and covers most of the screen. Display other relative info with animations
                taskCanvas.append("circle")
                    .attr("r", data.radius)
                    .attr("cx", data.x)
                    .attr("cy", data.y)
                    .attr("fill", group[data.group].color.fill)
                    .attr("stroke-width", 4)
                    .attr("stroke", group[data.group].color.brush)
                    .transition().duration(1000)
                    .attr("stroke-width", 10)
                    .attr("r", Math.min(width, height) * 0.45)
                    .attr("cx", width / 2)
                    .attr("cy", height / 2)
                    .each("end", function () {
                        var foreground = taskCanvas.append("g");
                        foreground.selectAll("circle").data(data.people).enter()
                            .append("circle")
                            .attr("r", 0)
                            .attr("cx", function (d, i) {
                                return width / 2 + Math.min(width, height) * 0.45 * Math.cos((i + 7) * Math.PI / 10);
                            })
                            .attr("cy", function (d, i) {
                                return height / 2 - Math.min(width, height) * 0.45 * Math.sin((i + 7) * Math.PI / 10);
                            })
                            .attr("stroke-width", 2)
                            .attr("stroke", "purple")
                            .attr("fill", function (d) {
                                if (!d3.select("#" + d.name.replace(" ", "-"))[0][0]) {
                                    defs.append('svg:pattern')
                                        .attr('id', d.name.replace(" ", "-"))
                                        .attr('patternUnits', 'objectBoundingBox')
                                        .attr('width', '1')
                                        .attr('height', '1')
                                        .append('svg:image')
                                        .attr('xlink:href', '/app/resources/' + d.image)
                                        .attr('x', 0)
                                        .attr('y', 0)
                                        .attr('width', Math.min(width, height) * 0.45 * .3)
                                        .attr('height', Math.min(width, height) * 0.45 * .3);
                                }
                                return "url(#" + d.name.replace(" ", "-") + ")";
                            })
                            .on("mouseover", function (d) {
                                foreground.append("text")
                                          .attr("x", this.cx.baseVal.value)
                                          .attr("y", this.cy.baseVal.value - this.r.baseVal.value * .8)
                                          .attr("text-anchor", "middle")
                                          .attr("font-family", "sans-serif")
                                          .attr("font-size", height / 32.5 + "px")
                                          .text(d.name)
                            })
                            .on("mouseout", function (d) {
                                foreground.select("text").remove();
                            })
                            .transition().duration(1000).attr("r", Math.min(width, height) * 0.45 * .15);
                        foreground.append("circle")
                            .attr("r", 0)
                            .attr("cx", width / 2 + Math.min(width, height) * 0.45 * Math.cos(Math.PI / 4))
                            .attr("cy", height / 2 - Math.min(width, height) * 0.45 * Math.sin(Math.PI / 4))
                            .attr("fill", colorScale(data.priorty))
                            .transition().duration(1000).attr("r", Math.min(width, height) * 0.45 * .20);
                        var body = foreground.append("foreignObject").attr("x", (width - Math.min(width, height) * 0.45 * (2 / Math.sqrt(2))) / 2)
                            .attr("y", (height - Math.min(width, height) * 0.45 * (2 / Math.sqrt(2))) / 2)
                            .attr("width", Math.min(width, height) * 0.45 * (2 / Math.sqrt(2)))
                            .attr("height", Math.min(width, height) * 0.45 * (2 / Math.sqrt(2)))
                            .append("xhtml:body")
                            .attr("class", "circleLabel");
                        body.append("h1")
                            .text(data.name);
                        body.append("p")
                            .text(data.details);
                    })


                taskCanvas.on("click", function () {
                    hide_task_view(data, element);
                });
            }

            //Hides task view by first showing an animation and then deleting foreground which task view exists
            function hide_task_view(data, element) {
                taskCanvas.transition().duration(1000).attr("transform", "translate(0)scale(1)");
                taskCanvas.on("click", function () { })
                taskCanvas.select("g").remove();
                taskCanvas.select("circle")
                    .transition().duration(1000)
                    .attr("r", data.radius)
                    .attr("cx", data.x)
                    .attr("cy", data.y)
                    .attr("stroke-width", 4)
                    .each("end", function () {
                        taskCanvas.remove();
                        d3.select(element).attr("opacity", 1);
                        vis.call(zoom);
                    })
            }

            //Changes translate and scale back to their initial valýes with an transition
            $scope.resetCamera = function () {
                vis.call(d3.behavior.zoom()); //Disable zoom
                container.transition().duration(10 * Math.min(100, Math.sqrt(currentTranslate[0] * currentTranslate[0] + currentTranslate[1] * currentTranslate[1])))
                .attr("transform", "scale(1)")
                    .attr("x", 0).attr("y", 0)
                    .each("end", function () { vis.call(zoom); });
                zoom.translate([0, 0]).scale(1);
                currentScale = "0";
                currentTranslate = ["0", "0"];
                force.resume();
                if (groupForce) groupForce.resume();
            }

            //Adds a new task to data, then redraws.
            $scope.addTask = function () {
                if (!$scope.task.name) $scope.task.name = "Empty";
                if (!$scope.task.details) $scope.task.details = "I dont have a description :(";
                if (!$scope.task.group && $scope.task.group !== 0) $scope.task.group = group.length - 1;
                group = group.slice(0, group.length - 1) //NEW GROUP
                data.push($scope.task);
                custom_chart(data, group);
                $scope.task = [];
            };

            //Adjust display according to users button clicks by changing method stored in move and restarting the force layout.
            $scope.clickListener = function (p) {
                if (!p) p = "group";
                position = p;
                hide_group_info();
                if (position === "center")
                    move = move_towards_center;
                else if (position === "positions")
                    move = move_towards_position;
                else if (position === "gradient")
                    move = move_towards_gradient;
                else if (position == "group") {
                    move = move_towards_group;
                    display_group_info();
                }
                else if (position === "free")
                    move = move_free;
                force.start();
            };

            //Checks for collision using collision radius. If there is a collision pushes colliding elements away from each other.
            function collide(node) {
                var r = node.collisionradius + 20,
                        nx1 = node.x - r,
                        nx2 = node.x + r,
                        ny1 = node.y - r,
                        ny2 = node.y + r;
                return function (quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== node)) {
                        var x = node.x - quad.point.x,
                                y = node.y - quad.point.y,
                                l = Math.sqrt(x * x + y * y),
                                r = node.collisionradius + quad.point.collisionradius;
                        if (l < r) {
                            l = (l - r) / l * .5;
                            node.x -= x *= l;
                            node.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                };
            }

            //Hides the group circles and texts 
            function hide_group_info() {
                if (groups) groups.transition().duration(1000).attr("opacity", "0").remove();
            }

            //Displays the group circles and texts
            function display_group_info() {
                groups = background.selectAll(".groupCircless")
                 .data(group).enter().append("g")
                             .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")" });

                groups.append("ellipse")
                             .attr("rx", function (d) { return d.radius - 10; })
                             .attr("ry", function (d) { return d.radius - 10; })
                             .attr("opacity", "0")

                var arc = d3.svg.arc()
                             .innerRadius(function (d) { return d.radius - 10 })
                             .outerRadius(function (d) { return d.radius - 4; })
                             .startAngle(0)
                             .endAngle(2 * Math.PI);

                groups.append("path")
                      .attr("id", function (d, i) { return "s" + i; })
                      .attr("d", arc);

                groups.append("text")
                             .attr("text-anchor", "middle")
                             .attr("font-family", "sans-serif")
                             .attr("font-size", height / 24 + "px")
                             .append("textPath")
                             .attr("xlink:href", function (d, i) { return "#s" + i; })
                             .attr("startOffset", function (d, i) { return "25%"; })
                             .text(function (d) { return d.name; })
                             .attr("opacity", "0")
                             .transition().duration(1000).attr("opacity", "1");

                initilizeGroupForce(); //GROUP MOVEMENT
            }

            //Resizing groups by adding nodes total area and multiplying it with a constant to adjust for empty space
            function resizeGroups(g, nodes) {
                g.forEach(function (d) {
                    d.radius = 0;
                })
                nodes.forEach(function (d) {
                    var r = g[d.group].radius;
                    g[d.group].radius = Math.sqrt(Math.pow(r, 2) + Math.pow(d.radius, 2));
                })
                g.forEach(function (d) {
                    d.radius *= 1.2;
                    d.radius += 50;
                    d.collisionradius = d.radius + 15;
                })
                return g;
            }

            //Function that if added to move bounds the circles within the view
            function bound(d) {
                d.y = Math.max(d.y, d.radius);
                d.y = Math.min(d.y, height - d.radius);
                d.x = Math.max(d.x, d.radius);
                d.x = Math.min(d.x, width - d.radius);
            }

            //Function that handles zoom events
            function zoomed() {
                currentTranslate = d3.event.translate;
                currentScale = d3.event.scale;
                container.attr("transform", "translate(" + currentTranslate + ")scale(" + currentScale + ")");
                nodeText.style("font-size", 6 + 6 / currentScale + "px");
                nodeText.style("line-height", 6 + 6 / currentScale + "px");
            }


            addTaskDrag.on("dragstart", function (d) {
                d.x += d3.mouse(this)[0];
                d.y += d3.mouse(this)[1];
                d3.select(this).attr("r", 30);
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).attr("opacity", 1)
            })
                .on("drag", function (d, i) {
                    d.x += d3.event.dx
                    d.y += d3.event.dy
                    d3.select(this).attr("transform", function (d, i) {
                        return "translate(" + [d.x, d.y] + ")"
                    })
                })
                .on("dragend", function (d, i) {
                    d.x -= currentTranslate[0];
                    d.y -= currentTranslate[1];
                    d.x /= currentScale;
                    d.y /= currentScale;
                    if (position === "group") {
                        group.forEach(function (a) {
                            if (Math.sqrt(Math.pow(d.x - a.x, 2) + Math.pow(d.y - a.y, 2)) < a.radius)
                                d.group = a.no;
                        });
                    }
                    if (position === "gradient" || position === "positions") d.priorty = Math.min(Math.max(5 - Math.round((d.y - height / 6) / (height * 5 / 6) * 5), 1), 5);
                    if (position === "positions") d.time = Math.round(maxX * (d.x - width / 6) / (width * 2 / 3));

                    if (!d.time && d.time !== 0) d.time = 10;
                    if (!d.priorty) d.priorty = 3;
                    if (!d.radius) d.radius = 30;
                    if (!d.people) d.people = [];
                    if (!d.name) d.name = "NEW" + Math.random();
                    if (!d.group && d.group !== 0) d.group = 5;

                    vis.append("circle").data([{ x: width - 40, y: 20 }])
                       .attr("opacity", 0)
                       .attr("r", 40)
                       .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")"; })
                       .attr("fill", "grey")
                       .call(addTaskDrag);
                    d3.select(this).remove();

                    data.push(d);
                    nodes.push(d);
                    custom_chart(data, group);
                });

            addGroupDrag.on("dragstart", function (d) {
                if (position === "group") {
                    d.x += d3.mouse(this)[0];
                    d.y += d3.mouse(this)[1];
                    d3.event.sourceEvent.stopPropagation();
                    d3.select(this).attr("opacity", 1)
                }
            })
                .on("drag", function (d, i) {
                    if (position === "group") {
                        d.x += d3.event.dx
                        d.y += d3.event.dy
                        d3.select(this).attr("transform", function (d, i) {
                            return "translate(" + [d.x, d.y] + ")"
                        })
                    }
                })
                .on("dragend", function (d, i) {
                    if (position === "group") {
                        d.x -= currentTranslate[0];
                        d.y -= currentTranslate[1];
                        d.x /= currentScale;
                        d.y /= currentScale;

                        if (!d.name) d.name = "NEW";
                        if (!d.color) d.color = { fill: "#bdbdbd", brush: "#757575", hover: "#323232", text: "black" };

                        vis.append("circle").data([{ x: width - 105, y: 20 }])
                           .attr("r", 25)
                           .attr("transform", function (d) { return "translate(" + [d.x, d.y] + ")"; })
                           .attr("stroke", "black")
                           .attr("stroke-width", 6)
                           .attr("fill-opacity", 0)
                           .attr("opacity", 0)
                           .call(addGroupDrag);
                        d3.select(this).remove();

                        group.push(d);
                        $scope.group.push(d);
                        custom_chart(data, group);
                    }
                });


            //initilize force layout and restart the layout by re-clicking last display option button pressed
            initilizeForce();
            $scope.clickListener(position)
        }

        //creates group from data 
        function createGroups(gi, pg) {
            console.log(gi);
            var s = gi.length;
            var hp = Math.round(Math.sqrt(s));
            var wp = Math.ceil(s / hp);
            var groups = [];
            var ws = (width / wp) * .5;
            var hs = (height / hp) * .5;
            for (var h = 0 ; h < hp; h++) {
                for (var w = 0; w < wp; w++) {
                    var current = h * wp + w;
                    if (current < s) {
                        var group = {
                            name: gi[current].name,
                            x: ws * (w * 2 + 1),
                            y: hs * (h * 2 + 1),
                            no: current,
                            color: gi[current].color
                        }
                        if (pg[current]) {
                            group.x = pg[current].x;
                            group.y = pg[current].y;
                        }
                        groups.push(group)
                    }
                }
            }
            return groups;
        }
        $scope.refresh = function () {
            position = $scope.position;
            custom_chart($scope.data, $scope.group);
        }
    }]);


app.directive('balloonDirective', function () {
    return {
        restrict: "E",
        templateUrl: 'partials/force.html',
        controller: 'forceCtrl',
        scope: {
            group: '=',
            data: '=',
            position: '@',
            notify: '&'
        },
        link: function (scope, element, attrs) {
            scope.$watch('position', function () {
                scope.clickListener(scope.position);
            });
            if (scope.data && scope.group)
                scope.refresh();

            scope.$watch('data', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    scope.refresh();
                    scope.notify();
                }
            }, true);

        }

    };
});
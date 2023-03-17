(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VF2 = {}));
}(this, (function (exports) { 'use strict';

    var Edge = /** @class */ (function () {
        function Edge(id, label, source, target, properties) {
            this.id = id;
            this.source = source;
            this.target = target;
            this.label = label;
            this.properties = properties ? properties : {};
            this.constraints = new Map();
            source.outGoingEdges.push(this);
            target.incomingEdges.push(this);
        }
        return Edge;
    }());

    var GNode = /** @class */ (function () {
        function GNode(id, label, properties) {
            this.id = id;
            this.label = label;
            this.outGoingEdges = [];
            this.properties = properties ? properties : {};
            this.constraints = new Map();
            this.incomingEdges = [];
        }
        return GNode;
    }());

    var Graph = /** @class */ (function () {
        function Graph() {
            this.nodes = new Map();
            this.edges = new Map();
            this.adjacencyMatrixUpdateNeeded = false;
            this.adjacencyMatrix = new Map();
        }
        Graph.prototype.addNode = function (id, label, properties) {
            this.nodes.set(id, new GNode(id, label, properties));
            this.adjacencyMatrixUpdateNeeded = true;
        };
        Graph.prototype.addNodePropertyContraint = function (nodeId, property, constraint) {
            var node = this.nodes.get(nodeId);
            node.constraints.set(property, constraint);
        };
        Graph.prototype.addEdge = function (id, label, source, target, properties) {
            this.edges.set(id, new Edge(id, label, source, target, properties));
            this.adjacencyMatrixUpdateNeeded = true;
        };
        Graph.prototype.hasEdge = function (sourceId, targetId) {
            var edge = null;
            this.edges.forEach(function (e) {
                if (e.source.id === sourceId && e.target.id === targetId) {
                    edge = e;
                }
            });
            return edge ? true : false;
        };
        Graph.prototype.getEdge = function (sourceId, targetId, type) {
            var edge = null;
            this.edges.forEach(function (e) {
                if (e.source.id === sourceId && e.target.id === targetId) {
                    edge = e;
                }
            });
            return edge;
        };
        Graph.prototype.addEdgePropertyConstraint = function (edgeId, property, constraint) {
            var edge = this.edges.get(edgeId);
            edge.constraints.set(property, constraint);
        };
        Graph.prototype.addEdgeById = function (id, label, sourceId, targetId, property) {
            var sourceNode = this.nodes.get(sourceId);
            var targetNode = this.nodes.get(targetId);
            this.addEdge(id, label, sourceNode, targetNode, property);
        };
        Graph.prototype.getInComingingVertices = function (targetId) {
            var node = this.nodes.get(targetId);
            var incomingEdges = node.incomingEdges;
            var inComingVertices = incomingEdges.map(function (e) {
                return e.source.id;
            });
            return inComingVertices;
        };
        Graph.prototype.getOutgoingVertices = function (nodeId) {
            var node = this.nodes.get(nodeId);
            var incomingEdges = node.outGoingEdges;
            var inComingVertices = incomingEdges.map(function (e) {
                return e.target.id;
            });
            return inComingVertices;
        };
        return Graph;
    }());

    var State = /** @class */ (function () {
        function State(modelGraph, patternGraph, nodeComparator, edgeComparator) {
            var _this = this;
            this.depth = 0; // current depth of the search tree
            this.mapping = [];
            this.modelGraph = modelGraph;
            this.patternGraph = patternGraph;
            var modelSize = modelGraph.nodes.size;
            var patternSize = patternGraph.nodes.size;
            this.T1in = new Map();
            this.T1out = new Map();
            this.T2in = new Map();
            this.T2out = new Map();
            this.unmapped1 = new Map();
            this.unmapped2 = new Map();
            this.core_1 = new Map();
            this.core_2 = new Map();
            this.in_1 = new Map();
            this.in_2 = new Map();
            this.out_1 = new Map();
            this.out_2 = new Map();
            this.nodeComparator = nodeComparator;
            this.edgeComparator = edgeComparator;
            // initialize values ("-1" means no mapping / not contained in the set)
            // initially, all sets are empty and no nodes are mapped
            var modelNodes = modelGraph.nodes;
            var patternNodes = patternGraph.nodes;
            modelNodes.forEach(function (node) {
                _this.core_1.set(node.id, undefined);
                _this.in_1.set(node.id, undefined);
                _this.out_1.set(node.id, undefined);
                _this.unmapped1.set(node.id, node.id);
            });
            patternNodes.forEach(function (node) {
                _this.core_2.set(node.id, undefined);
                _this.in_2.set(node.id, undefined);
                _this.out_2.set(node.id, undefined);
                _this.unmapped2.set(node.id, node.id);
            });
        }
        State.prototype.areCompatibleNodes = function (n, m) {
            var targetNode = this.modelGraph.nodes.get(n);
            var queryNode = this.patternGraph.nodes.get(m);
            return (this.nodeComparator == null)
                || (this.nodeComparator.compare(targetNode, queryNode) == true);
        };
        State.prototype.areCompatibleEdges = function (v1, v2, u1, u2) {
            var n = this.modelGraph.getEdge(v1, v2);
            var m = this.patternGraph.getEdge(u1, u2);
            return (this.edgeComparator == null) || (this.edgeComparator.compare(n, m) == true);
        };
        State.prototype.inM1 = function (nodeId) {
            return this.core_1.get(nodeId) !== undefined ? true : false;
        };
        State.prototype.inM2 = function (nodeId) {
            return this.core_2.get(nodeId) !== undefined ? true : false;
        };
        State.prototype.inT1in = function (nodeId) {
            return this.core_1.get(nodeId) === undefined && this.in_1.get(nodeId);
        };
        State.prototype.inT2in = function (nodeId) {
            return this.core_2.get(nodeId) === undefined && this.in_2.get(nodeId);
        };
        State.prototype.inT1out = function (nodeId) {
            return this.core_1.get(nodeId) === undefined && this.out_1.get(nodeId);
        };
        State.prototype.inT2out = function (nodeId) {
            return this.core_2.get(nodeId) === undefined && this.out_2.get(nodeId);
        };
        State.prototype.inN1Tilde = function (nodeId) {
            return this.core_1.get(nodeId) === undefined && this.in_1.get(nodeId) === undefined && this.out_1.get(nodeId) === undefined;
        };
        State.prototype.inN2Tilde = function (nodeId) {
            return this.core_2.get(nodeId) === undefined && this.in_2.get(nodeId) === undefined && this.out_2.get(nodeId) === undefined;
        };
        // extends the current matching by the pair (n,m) -> going down one level in the search tree
        // n is the id of a model graph node
        // m is the id of a pattern graph node
        State.prototype.match = function (n, m) {
            var _this = this;
            this.core_1.set(n, m);
            this.core_2.set(m, n);
            this.unmapped1.delete(n);
            this.unmapped2.delete(m);
            this.T1in.delete(n);
            this.T1out.delete(n);
            this.T2in.delete(m);
            this.T2out.delete(m);
            this.depth++;
            // update in/out arrays
            // updates needed for nodes entering Tin/Tout sets on this level
            // no updates needed for nodes which entered these sets before
            var targetNode = this.modelGraph.nodes.get(n);
            var queryNode = this.patternGraph.nodes.get(m);
            // cycle through nodes n points to
            targetNode.incomingEdges.forEach(function (e) {
                var node = _this.modelGraph.nodes.get(e.target.id);
                if (_this.in_1.get(node.id) === undefined) { // if the note is not in T1in or mapping
                    _this.in_1.set(node.id, _this.depth);
                    if (!_this.inM1(node.id)) // if not in M1, add into T1in
                        _this.T1in.set(node.id, node.id);
                }
            });
            targetNode.outGoingEdges.forEach(function (e) {
                var node = _this.modelGraph.nodes.get(e.target.id);
                if (_this.out_1.get(node.id) === undefined) { // if the note is not in T1out or mapping
                    _this.out_1.set(node.id, _this.depth);
                    if (!_this.inM1(node.id)) // if not in M1, add into T1out
                        _this.T1out.set(node.id, node.id);
                }
            });
            queryNode.incomingEdges.forEach(function (e) {
                var node = _this.patternGraph.nodes.get(e.target.id);
                if (_this.in_2.get(node.id) === undefined) {
                    _this.in_2.set(node.id, _this.depth);
                    if (!_this.inM2(node.id)) {
                        _this.T2in.set(node.id, node.id);
                    }
                }
            });
            queryNode.outGoingEdges.forEach(function (e) {
                var node = _this.patternGraph.nodes.get(e.target.id);
                if (_this.out_2.get(node.id) === undefined) {
                    _this.out_2.set(node.id, _this.depth);
                    if (!_this.inM2(node.id)) {
                        _this.T2out.set(node.id, node.id);
                    }
                }
            });
        };
        State.prototype.backtrack = function (n, m) {
            var _this = this;
            this.core_1.set(n, undefined);
            this.core_2.set(m, undefined);
            this.unmapped1.set(n, n);
            this.unmapped2.set(m, m);
            this.core_1.forEach(function (v, k) {
                if (_this.in_1.get(k) == _this.depth) {
                    _this.in_1.delete(k);
                    _this.T1in.delete(k);
                }
                if (_this.out_1.get(k) == _this.depth) {
                    _this.out_1.delete(k);
                    _this.T1out.delete(k);
                }
            });
            this.core_2.forEach(function (v, k) {
                if (_this.in_2.get(k) == _this.depth) {
                    _this.in_2.delete(k);
                    _this.T2in.delete(k);
                }
                if (_this.out_2.get(k) == _this.depth) {
                    _this.out_2.delete(k);
                    _this.T2out.delete(k);
                }
            });
            // put targetNodeId and queryNodeId back into Tin and Tout sets if necessary
            if (this.inT1in(n)) {
                this.T1in.set(n, n);
            }
            if (this.inT1out(n)) {
                this.T1out.set(n, n);
            }
            if (this.inT2in(m)) {
                this.T1in.set(m, m);
            }
            if (this.inT2out(m)) {
                this.T2out.set(m, m);
            }
            this.depth--;
        };
        State.prototype.addMapping = function () {
            var _this = this;
            console.log(this.core_2);
            var nodeMap = new Map(this.core_2);
            var edgeMap = new Map();
            this.patternGraph.edges.forEach(function (e) {
                var modelSourceNodeId = _this.core_2.get(e.source.id);
                var modelTargetNodeId = _this.core_2.get(e.target.id);
                var modelEdge = _this.modelGraph.getEdge(modelSourceNodeId, modelTargetNodeId);
                edgeMap.set(e.id, modelEdge.id);
            });
            var map = { nodeMap: nodeMap, edgeMap: edgeMap };
            this.mapping.push(map);
            // this.core_2.forEach((v,k)=>{
            //     console.log(`(${k}-${v})`)
            // })
            // return this.core_2
        };
        return State;
    }());

    var VF2Matcher = /** @class */ (function () {
        function VF2Matcher(nodeComparator, edgeComparator) {
            this.nodeComparator = nodeComparator;
            this.edgeComparator = edgeComparator;
        }
        VF2Matcher.prototype.match = function (modelGraph, patternGraph) {
            var state = new State(modelGraph, patternGraph, this.nodeComparator, this.edgeComparator);
            this.matchInternal(state, modelGraph, patternGraph);
            return state.mapping;
        };
        // internal method for finding subgraphs. called recursively
        VF2Matcher.prototype.matchInternal = function (s, modelGraph, patternGraph) {
            var _this = this;
            // abort search if we reached the final level of the search tree 
            var sum = 0;
            if (s.depth == patternGraph.nodes.size) {
                s.addMapping();
                return 1;
            }
            else {
                var candiatePairs_1 = this.getCandidatePairs(s, modelGraph, patternGraph);
                candiatePairs_1.forEach(function (v, n) {
                    var m = candiatePairs_1.get(n);
                    // check if candidate pair (n,m) is feasible 
                    if (_this.checkFeasibility(s, n, m)) {
                        s.match(n, m); // extend mapping
                        sum += _this.matchInternal(s, modelGraph, patternGraph); // recursive call
                        s.backtrack(n, m); // remove (n,m) from the mapping
                    }
                });
                return sum;
            }
        };
        VF2Matcher.prototype.getCandidatePairs = function (s, m, p) {
            var map = new Map(); // the map storing candidate pairs
            if (s.T1out.size > 0 && s.T2out.size > 0) {
                // Generate candidates from T1out and T2out if they are not empty
                // Faster Version
                // Since every node should be matched in query graph
                // Therefore we can only extend one node of query graph (with biggest id)
                // instead of generate the whole Cartesian product of the target and query
                var nextPatternNode_1 = "";
                s.T2out.forEach(function (v, k) {
                    if (k.localeCompare(nextPatternNode_1)) {
                        nextPatternNode_1 = k;
                    }
                });
                s.T1out.forEach(function (v, k) {
                    map.set(k, nextPatternNode_1);
                });
                return map;
            }
            else if (s.T1in.size > 0 && s.T2in.size > 0) {
                var nextPatternNode_2 = "";
                s.T2in.forEach(function (v, k) {
                    if (k.localeCompare(nextPatternNode_2)) {
                        nextPatternNode_2 = k;
                    }
                });
                s.T1in.forEach(function (v, k) {
                    map.set(k, nextPatternNode_2);
                });
                return map;
            }
            else {
                var nextPatternNode_3 = "";
                s.unmapped2.forEach(function (v, k) {
                    if (k.localeCompare(nextPatternNode_3)) {
                        nextPatternNode_3 = k;
                    }
                });
                s.unmapped1.forEach(function (v, k) {
                    map.set(k, nextPatternNode_3);
                });
                return map;
            }
        };
        VF2Matcher.prototype.checkFeasibility = function (s, n, m) {
            return this.checkSemanticFeasibility(s, n, m) && this.checkSyntacticFeasibility(s, n, m); // return result
        };
        //checks for semantic feasibility of the pair (n,m)
        VF2Matcher.prototype.checkSemanticFeasibility = function (s, n, m) {
            var passed = true;
            passed = passed && this.checkNodeLabel(s, n, m);
            passed = passed && this.areCompatibleNodes(s, n, m);
            passed = passed && this.areCompatibleEdges(s, n, m);
            return passed;
        };
        VF2Matcher.prototype.areCompatibleNodes = function (s, n, m) {
            return s.areCompatibleNodes(n, m);
        };
        VF2Matcher.prototype.areCompatibleEdges = function (s, n, m) {
            var passed = true;
            var modelNode = s.modelGraph.nodes.get(n);
            var patternNode = s.patternGraph.nodes.get(m);
            modelNode.incomingEdges.forEach(function (e) {
                if (s.core_1.get(e.source.id)) {
                    //m nodeId 
                    var nodeId = s.core_1.get(e.source.id);
                    var v1 = e.source.id;
                    var v2 = e.target.id;
                    if (!s.patternGraph.hasEdge(nodeId, m) || !s.areCompatibleEdges(v1, v2, nodeId, m)) {
                        passed = false;
                    }
                }
            });
            modelNode.outGoingEdges.forEach(function (e) {
                if (s.core_1.get(e.target.id)) {
                    var nodeId = s.core_1.get(e.target.id);
                    var v1 = e.source.id;
                    var v2 = e.target.id;
                    if (!s.patternGraph.hasEdge(m, nodeId) || !s.areCompatibleEdges(v1, v2, m, nodeId)) {
                        passed = false;
                    }
                }
            });
            //TODO check if modelGraph have edges when patern graph have page 
            return passed;
        };
        VF2Matcher.prototype.checkNodeLabel = function (s, n, m) {
            if (s.patternGraph.nodes.get(m).label == "*") {
                return true;
            }
            return s.modelGraph.nodes.get(n).label == (s.patternGraph.nodes.get(m).label);
        };
        VF2Matcher.prototype.checkNodeProperty = function (s, n, m) {
            var passed = true;
            var modelNode = s.modelGraph.nodes.get(n);
            var patternNode = s.patternGraph.nodes.get(m);
            var constaints = patternNode.constraints;
            if (constaints.size > 0) {
                constaints.forEach(function (constaint, property) {
                    var operator = constaint.operator, value = constaint.value;
                    var modelNodeValue = modelNode.properties[property];
                    if (modelNodeValue !== undefined) {
                        passed = passed && value == modelNodeValue;
                    }
                });
            }
            return passed;
        };
        VF2Matcher.prototype.checkEdgeType = function (s, n, m) {
            var modelNode = s.modelGraph.nodes.get(n);
            var patternNode = s.patternGraph.nodes.get(m);
            modelNode.incomingEdges.forEach(function (e) {
            });
        };
        //checks for syntactic feasibility of the pair (n,m)
        VF2Matcher.prototype.checkSyntacticFeasibility = function (s, n, m) {
            var passed = true;
            passed = passed && this.checkRpredAndRsucc(s, n, m); // check Rpred / Rsucc conditions (subgraph isomorphism definition)
            // passed = passed && this.checkRin(s, n, m);
            // passed = passed && this.checkRout(s, n, m);
            passed = passed && this.checkInAndOut(s, n, m);
            passed = passed && this.checkNew(s, n, m);
            return passed; // return result	
        };
        // checks if extending the mapping by the pair (n,m) would violate the subgraph isomorphism definition
        VF2Matcher.prototype.checkRpredAndRsucc = function (s, n, m) {
            var passed = true;
            // check if the structure of the (partial) model graph is also present in the (partial) pattern graph 
            // if a predecessor of n has been mapped to a node n' before, then n' must be mapped to a predecessor of m 
            var nTmp = s.modelGraph.nodes.get(n);
            nTmp.incomingEdges.forEach(function (e) {
                if (s.core_1.get(e.source.id)) {
                    //m nodeId 
                    var nodeId = s.core_1.get(e.source.id);
                    passed = passed && (s.patternGraph.getInComingingVertices(m).includes(nodeId));
                }
            });
            // if a successor of n has been mapped to a node n' before, then n' must be mapped to a successor of m
            nTmp.outGoingEdges.forEach(function (e) {
                if (s.core_1.get(e.target.id)) {
                    var nodeId = s.core_1.get(e.target.id);
                    passed = passed && (s.patternGraph.getOutgoingVertices(m).includes(nodeId));
                }
            });
            // check if the structure of the (partial) pattern graph is also present in the (partial) model graph
            // if a predecessor of m has been mapped to a node m' before, then m' must be mapped to a predecessor of n
            var mTmp = s.patternGraph.nodes.get(m);
            mTmp.incomingEdges.forEach(function (e) {
                var nodeId = s.core_2.get(e.source.id);
                if (s.core_2.get(e.source.id)) {
                    passed = passed && (s.modelGraph.getInComingingVertices(n).includes(nodeId));
                }
            });
            // if a successor of m has been mapped to a node m' before, then m' must be mapped to a successor of n
            mTmp.outGoingEdges.forEach(function (e) {
                var nodeId = s.core_2.get(e.target.id);
                if (s.core_2.get(e.target.id)) {
                    passed = passed && (s.modelGraph.getOutgoingVertices(n).includes(nodeId));
                }
            });
            return passed; // return the result
        };
        /**
         * Check the in rule and out rule
         * This prunes the search tree using 1-look-ahead
         * @param s VF2 state
         * @param n model graph node id
         * @param m  query graph node id
         */
        VF2Matcher.prototype.checkInAndOut = function (s, n, m) {
            var modelNode = s.modelGraph.nodes.get(n);
            var queryNode = s.patternGraph.nodes.get(m);
            var targetPredCnt = 0, targetSucCnt = 0;
            var queryPredCnt = 0, querySucCnt = 0;
            // In Rule
            // The number predecessors/successors of the target node that are in T1in
            // must be larger than or equal to those of the query node that are in T2in
            modelNode.incomingEdges.forEach(function (e) {
                var node = s.modelGraph.nodes.get(e.source.id);
                if (s.inT1in(node.id)) {
                    targetPredCnt++;
                }
            });
            modelNode.outGoingEdges.forEach(function (e) {
                var node = s.modelGraph.nodes.get(e.target.id);
                if (s.inT1in(node.id)) {
                    targetSucCnt++;
                }
            });
            queryNode.incomingEdges.forEach(function (e) {
                var node = s.patternGraph.nodes.get(e.source.id);
                if (s.inT2in(node.id)) {
                    queryPredCnt++;
                }
            });
            queryNode.outGoingEdges.forEach(function (e) {
                var node = s.patternGraph.nodes.get(e.target.id);
                if (s.inT2in(node.id)) {
                    queryPredCnt++;
                }
            });
            if (targetPredCnt < queryPredCnt || targetSucCnt < querySucCnt) {
                return false;
            }
            // Out Rule
            // The number predecessors/successors of the target node that are in T1out
            // must be larger than or equal to those of the query node that are in T2out
            targetPredCnt = 0;
            targetSucCnt = 0;
            queryPredCnt = 0;
            querySucCnt = 0;
            modelNode.incomingEdges.forEach(function (e) {
                var node = s.modelGraph.nodes.get(e.source.id);
                if (s.inT1out(node.id)) {
                    targetPredCnt++;
                }
            });
            modelNode.outGoingEdges.forEach(function (e) {
                var node = s.modelGraph.nodes.get(e.target.id);
                if (s.inT1out(node.id)) {
                    targetSucCnt++;
                }
            });
            queryNode.incomingEdges.forEach(function (e) {
                var node = s.patternGraph.nodes.get(e.source.id);
                if (s.inT2out(node.id)) {
                    queryPredCnt++;
                }
            });
            queryNode.outGoingEdges.forEach(function (e) {
                var node = s.patternGraph.nodes.get(e.target.id);
                if (s.inT2out(node.id)) {
                    queryPredCnt++;
                }
            });
            if (targetPredCnt < queryPredCnt || targetSucCnt < querySucCnt) {
                return false;
            }
            return true;
        };
        VF2Matcher.prototype.checkRin = function (s, n, m) {
            var T1in = new Map(s.T1in);
            s.modelGraph.getInComingingVertices(n).forEach(function (id) {
                T1in.delete(id);
            });
            var T2in = new Map(s.T2in);
            s.patternGraph.getInComingingVertices(m).forEach(function (id) {
                T2in.delete(id);
            });
            var firstExp = T1in.size >= T2in.size;
            var T1in2 = new Map(s.T1in);
            s.modelGraph.getOutgoingVertices(n).forEach(function (id) {
                T1in2.delete(id);
            });
            var T2in2 = new Map(s.T2in);
            s.patternGraph.getOutgoingVertices(m).forEach(function (id) {
                T2in2.delete(id);
            });
            var secoundExp = T1in2.size >= T2in2.size;
            return firstExp && secoundExp;
        };
        VF2Matcher.prototype.checkRout = function (s, n, m) {
            var T1out = new Map(s.T1out);
            //get Intersection values
            T1out.forEach(function (v, k) {
                if (!s.modelGraph.getInComingingVertices(n).includes(k)) {
                    T1out.delete(k);
                }
            });
            var T2out = new Map(s.T2out);
            T2out.forEach(function (v, k) {
                if (!s.patternGraph.getInComingingVertices(m).includes(k)) {
                    T2out.delete(k);
                }
            });
            var firstExp = T1out.size >= T2out.size;
            var T1out2 = new Map(s.T1out);
            T1out2.forEach(function (v, k) {
                if (!s.modelGraph.getOutgoingVertices(n).includes(k)) {
                    T2out.delete(k);
                }
            });
            var T2out2 = new Map(s.T2out);
            T2out2.forEach(function (v, k) {
                if (!s.patternGraph.getOutgoingVertices(m).includes(k)) {
                    T2out2.delete(k);
                }
            });
            var secoundExp = T1out2.size >= T2out2.size;
            return firstExp && secoundExp;
        };
        /**
         * Check the new rule
         * This prunes the search tree using 2-look-ahead
         * @param s VF2 State
         * @param n Model Graph Node ID
         * @param m Query Graph Node ID
         */
        VF2Matcher.prototype.checkNew = function (s, n, m) {
            var targetNode = s.modelGraph.nodes.get(n);
            var queryNode = s.patternGraph.nodes.get(m);
            var targetPredCnt = 0, targetSucCnt = 0;
            var queryPredCnt = 0, querySucCnt = 0;
            // In Rule
            // The number predecessors/successors of the target node that are in T1in
            // must be larger than or equal to those of the query node that are in T2in
            targetNode.incomingEdges.forEach(function (e) {
                var node = s.modelGraph.nodes.get(e.source.id);
                if (s.inN1Tilde(node.id)) {
                    targetPredCnt++;
                }
            });
            targetNode.outGoingEdges.forEach(function (e) {
                var node = s.modelGraph.nodes.get(e.target.id);
                if (s.inN1Tilde(node.id)) {
                    targetSucCnt++;
                }
            });
            queryNode.incomingEdges.forEach(function (e) {
                var node = s.patternGraph.nodes.get(e.source.id);
                if (s.inN2Tilde(node.id)) {
                    queryPredCnt++;
                }
            });
            queryNode.outGoingEdges.forEach(function (e) {
                var node = s.patternGraph.nodes.get(e.target.id);
                if (s.inN2Tilde(node.id)) {
                    queryPredCnt++;
                }
            });
            if (targetPredCnt < queryPredCnt || targetSucCnt < querySucCnt) {
                return false;
            }
            return true;
        };
        VF2Matcher.prototype.checkRnew = function (s, n, m) {
            var TNilt1 = this.calcNTilt1(s);
            TNilt1.forEach(function (v, k) {
                if (!s.modelGraph.getInComingingVertices(n).includes(k)) {
                    TNilt1.delete(k);
                }
            });
            var TNilt2 = this.calcNTilt2(s);
            TNilt2.forEach(function (v, k) {
                if (!s.patternGraph.getInComingingVertices(m).includes(k)) {
                    TNilt2.delete(k);
                }
            });
            var firstExp = TNilt1.size >= TNilt2.size;
            var NTilt12 = this.calcNTilt1(s);
            NTilt12.forEach(function (v, k) {
                if (!s.modelGraph.getOutgoingVertices(n).includes(k)) {
                    NTilt12.delete(k);
                }
            });
            var NTilt22 = this.calcNTilt2(s);
            NTilt22.forEach(function (v, k) {
                if (!s.patternGraph.getOutgoingVertices(m).includes(k)) {
                    NTilt22.delete(k);
                }
            });
            var secoundExp = NTilt12.size >= NTilt22.size;
            return firstExp && secoundExp;
        };
        VF2Matcher.prototype.calcNTilt1 = function (s) {
            var N1 = new Map(s.modelGraph.nodes);
            var M1 = new Map();
            s.core_1.forEach(function (v, k) {
                M1.set(k, v);
            });
            var T1 = new Map(s.T1in);
            T1.forEach(function (v, k) {
                if (!s.T1out.has(k)) {
                    T1.delete(k);
                }
            });
            var NTilt1 = N1;
            NTilt1.forEach(function (v, k) {
                if (M1.has(k) || T1.has(k)) {
                    NTilt1.delete(k);
                }
            });
            return NTilt1;
        };
        VF2Matcher.prototype.calcNTilt2 = function (s) {
            var N2 = new Map(s.modelGraph.nodes);
            var M2 = new Map();
            s.core_2.forEach(function (v, k) {
                M2.set(k, v);
            });
            var T2 = new Map(s.T2in);
            T2.forEach(function (v, k) {
                if (!s.T2out.has(k)) {
                    T2.delete(k);
                }
            });
            var NTilt2 = N2;
            NTilt2.forEach(function (v, k) {
                if (M2.has(k) || T2.has(k)) {
                    NTilt2.delete(k);
                }
            });
            return NTilt2;
        };
        return VF2Matcher;
    }());

    function equal(a, b) {
        debugger;
        if (!isNaN(a) && !isNaN(b)) {
            return parseFloat(a) == parseFloat(b);
        }
        else if (typeof a === "string" && typeof b === "string" && a.localeCompare(b) == 0) {
            return true;
        }
        return false;
    }

    function greatThan(a, b) {
        if (!isNaN(a) && !isNaN(b)) {
            return parseFloat(a) > parseFloat(b);
        }
        else if (typeof a === "string" && typeof b === "string") {
            var flag = a.localeCompare(b) == 1 ? true : false;
            return flag;
        }
        return false;
    }

    function lessThan(a, b) {
        if (!isNaN(a) && !isNaN(b)) {
            return parseFloat(a) < parseFloat(b);
        }
        else if (typeof a === "string" && typeof b === "string") {
            var flag = a.localeCompare(b) == -1 ? true : false;
            return flag;
        }
        return false;
    }

    function between(a, value, b) {
        if (!isNaN(a) && !isNaN(b) && !isNaN(value)) {
            return parseFloat(value) > parseFloat(a) && parseFloat(value) < parseFloat(b);
        }
        return false;
    }

    function like(a, b) {
        var re = new RegExp(b, 'g');
        if (a && a.match(re)) {
            return true;
        }
        return false;
    }

    function include(array, b) {
        if (array.includes(b)) {
            return true;
        }
        return false;
    }

    var NodeComparator = /** @class */ (function () {
        function NodeComparator() {
        }
        NodeComparator.prototype.compare = function (modelNode, patternNode) {
            var passed = true;
            var constaints = patternNode.constraints;
            if (constaints.size > 0) {
                constaints.forEach(function (constaint, property) {
                    if (Array.isArray(constaint)) {
                        constaint = constaint[0];
                    }
                    var operator = constaint.operator, value = constaint.value, min = constaint.min, max = constaint.max;
                    var modelNodeValue = modelNode.properties[property];
                    debugger;
                    switch (operator) {
                        case "equal": {
                            passed = equal(value, modelNodeValue);
                            break;
                        }
                        case "less_than": {
                            passed = lessThan(modelNodeValue, value);
                            break;
                        }
                        case "great_than": {
                            passed = greatThan(modelNodeValue, value);
                            break;
                        }
                        case "between": {
                            passed = between(min, modelNodeValue, max);
                            break;
                        }
                        case "like": {
                            passed = like(modelNodeValue, value);
                            break;
                        }
                        case 'in': {
                            var array = value.split(",");
                            passed = include(array, modelNodeValue);
                            break;
                        }
                    }
                });
            }
            return passed;
        };
        return NodeComparator;
    }());

    var EdgeComparator = /** @class */ (function () {
        function EdgeComparator() {
        }
        EdgeComparator.prototype.compare = function (modelEdge, patternEdge) {
            var passed = true;
            var constaints = patternEdge.constraints;
            if (modelEdge.label !== patternEdge.label && patternEdge.label !== "*") {
                passed = false;
            }
            else if (constaints.size > 0) {
                constaints.forEach(function (constaint, property) {
                    if (Array.isArray(constaint)) {
                        constaint = constaint[0];
                    }
                    var operator = constaint.operator, value = constaint.value, min = constaint.min, max = constaint.max;
                    var modelEdgeValue = modelEdge.properties[property];
                    switch (operator) {
                        case "equal": {
                            passed = equal(value, modelEdgeValue);
                            break;
                        }
                        case "less_than": {
                            passed = lessThan(modelEdgeValue, value);
                            break;
                        }
                        case "great_than": {
                            passed = greatThan(modelEdgeValue, value);
                            break;
                        }
                        case "between": {
                            passed = between(min, modelEdgeValue, max);
                            break;
                        }
                        case "like": {
                            passed = like(modelEdgeValue, value);
                            break;
                        }
                        case 'in': {
                            var array = value.split(",");
                            passed = include(array, modelEdgeValue);
                            break;
                        }
                    }
                });
            }
            return passed;
        };
        return EdgeComparator;
    }());

    exports.Edge = Edge;
    exports.EdgeComparator = EdgeComparator;
    exports.GNode = GNode;
    exports.Graph = Graph;
    exports.NodeComparator = NodeComparator;
    exports.VF2Matcher = VF2Matcher;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

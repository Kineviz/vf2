(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VF2 = {}));
}(this, (function (exports) { 'use strict';

    var Edge = /** @class */ (function () {
        function Edge(label, source, target, properties) {
            this.source = source;
            this.target = target;
            this.label = label;
            this.properties = properties ? properties : [];
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
            this.properties = properties ? properties : [];
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
            this.edges.set(id, new Edge(label, source, target, properties));
            this.adjacencyMatrixUpdateNeeded = true;
        };
        Graph.prototype.addEdgePropertyConstraint = function (edgeId, property, constraint) {
            var edge = this.edges.get(edgeId);
            edge.constraints.set(property, constraint);
        };
        Graph.prototype.addEdgeById = function (id, label, sourceId, targetId) {
            var sourceNode = this.nodes.get(sourceId);
            var targetNode = this.nodes.get(targetId);
            this.addEdge(id, label, sourceNode, targetNode);
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
        function State(modelGraph, patternGraph) {
            var _this = this;
            this.depth = 0; // current depth of the search tree
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
            var nTmp = this.modelGraph.nodes.get(n);
            var mTmp = this.patternGraph.nodes.get(m);
            // cycle through nodes pointing towards n
            nTmp.incomingEdges.forEach(function (e) {
                if (_this.in_1.get(e.source.id) === undefined) {
                    _this.in_1.set(e.source.id, _this.depth);
                    if (!_this.inM1(e.source.id))
                        _this.T1in.set(e.source.id, e.source.id); // update T1in
                }
            });
            // cycle through nodes n points to
            nTmp.outGoingEdges.forEach(function (e) {
                if (_this.out_1.get(e.target.id) === undefined) {
                    _this.out_1.set(e.target.id, _this.depth);
                    if (!_this.inM1(e.target.id)) {
                        _this.T1out.set(e.target.id, e.target.id);
                    }
                }
            });
            // cycle through nodes pointing towards m
            mTmp.incomingEdges.forEach(function (e) {
                if (_this.in_2.get(e.source.id) === undefined) {
                    _this.in_2.set(e.source.id, _this.depth);
                    if (!_this.inM2(e.source.id))
                        _this.T2in.set(e.source.id, e.source.id); // update T1in
                }
            });
            // cycle through nodes m points to
            mTmp.outGoingEdges.forEach(function (e) {
                if (_this.out_2.get(e.target.id) === undefined) {
                    _this.out_2.set(e.target.id, _this.depth);
                    if (!_this.inM2(e.target.id)) {
                        _this.T2out.set(e.target.id, e.target.id);
                    }
                }
            });
        };
        State.prototype.backtrack = function (n, m) {
            var _this = this;
            this.core_1.delete(n);
            this.core_2.delete(m);
            this.unmapped1.set(n, n);
            this.unmapped2.set(m, m);
            this.core_1.forEach(function (nodeId) {
                if (_this.in_1.get(nodeId) == _this.depth) {
                    _this.in_1.delete(nodeId);
                    _this.T1in.delete(nodeId);
                }
                if (_this.out_1.get(nodeId) == _this.depth) {
                    _this.out_1.delete(nodeId);
                    _this.T1out.delete(nodeId);
                }
            });
            this.core_2.forEach(function (nodeId) {
                if (_this.in_2.get(nodeId) == _this.depth) {
                    _this.in_2.delete(nodeId);
                    _this.T2in.delete(nodeId);
                }
                if (_this.out_2.get(nodeId) == _this.depth) {
                    _this.out_2.delete(nodeId);
                    _this.T2out.delete(nodeId);
                }
            });
        };
        State.prototype.printMapping = function () {
            this.core_2.forEach(function (v, k) {
                console.log("(" + k + "-" + v + ")");
            });
            return this.core_2;
        };
        return State;
    }());

    var VF2Matcher = /** @class */ (function () {
        function VF2Matcher() {
        }
        VF2Matcher.prototype.match = function (modelGraph, patternGraph, cb) {
            var state = new State(modelGraph, patternGraph);
            this.matchInternal(state, modelGraph, patternGraph, cb);
            return this.mapping;
        };
        // internal method for finding subgraphs. called recursively
        VF2Matcher.prototype.matchInternal = function (s, modelGraph, patternGraph, cb) {
            var _this = this;
            // abort search if we reached the final level of the search tree 
            if (s.depth == patternGraph.nodes.size) {
                var map = s.printMapping();
                cb(map);
            }
            else {
                var candiatePairs_1 = this.getCandidatePairs(s, modelGraph, patternGraph);
                candiatePairs_1.forEach(function (v, n) {
                    var m = candiatePairs_1.get(n);
                    // check if candidate pair (n,m) is feasible 
                    if (_this.checkFeasibility(s, n, m)) {
                        s.match(n, m); // extend mapping
                        _this.matchInternal(s, modelGraph, patternGraph, cb); // recursive call
                        s.backtrack(n, m); // remove (n,m) from the mapping
                    }
                });
            }
        };
        // determines all candidate pairs to be checked for feasibility
        VF2Matcher.prototype.getCandidatePairs = function (s, m, p) {
            if (s.depth == 0)
                //the first time the Tin and Tout sets are not yet initialized.
                return this.pairGenerator(s.unmapped1, s.unmapped2);
            var inmap = this.pairGenerator(s.T1in, s.T2in);
            if (inmap.size > 0)
                return inmap;
            var outmap = this.pairGenerator(s.T1out, s.T2out);
            return outmap;
        };
        // generates pairs of nodes
        // outputs a map from model nodes to pattern nodes
        VF2Matcher.prototype.pairGenerator = function (modelNodes, patternNodes) {
            var map = new Map(); // the map storing candidate pairs
            // find the largest among all pattern nodes (the one with the largest ID)!
            // Note: it does not matter how to choose a node here. The only important thing is to have a total order, i.e., to uniquely choose one node. If you do not do this, you might get multiple redundant states having the same pairs of nodes mapped. The only difference will be the order in which these pairs have been included (but the order does not change the result, so these states are all the same!).
            var keys = patternNodes.keys();
            var nextPatternNode = "";
            patternNodes.forEach(function (v, k) {
                if (k.localeCompare(nextPatternNode)) {
                    nextPatternNode = k;
                }
            });
            modelNodes.forEach(function (v, k) {
                map.set(k, nextPatternNode);
            });
            return map; // return node pairs
        };
        VF2Matcher.prototype.checkFeasibility = function (s, n, m) {
            return this.checkSemanticFeasibility(s, n, m) && this.checkSyntacticFeasibility(s, n, m); // return result
        };
        //checks for semantic feasibility of the pair (n,m)
        VF2Matcher.prototype.checkSemanticFeasibility = function (s, n, m) {
            return s.modelGraph.nodes.get(n).label == (s.patternGraph.nodes.get(m).label);
        };
        //checks for syntactic feasibility of the pair (n,m)
        VF2Matcher.prototype.checkSyntacticFeasibility = function (s, n, m) {
            var passed = true;
            passed = passed && this.checkRpredAndRsucc(s, n, m); // check Rpred / Rsucc conditions (subgraph isomorphism definition)
            passed = passed && this.checkRin(s, n, m);
            passed = passed && this.checkRout(s, n, m);
            passed = passed && this.checkRnew(s, n, m);
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

    exports.Edge = Edge;
    exports.GNode = GNode;
    exports.Graph = Graph;
    exports.VF2Matcher = VF2Matcher;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

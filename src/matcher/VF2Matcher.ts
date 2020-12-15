import { stat } from "fs";
import Graph from "../graph/Graph";
import State from "./State";

export default class VF2Matcher {
    mapping: any;
    match(modelGraph: Graph, patternGraph: Graph) {
        let state = new State(modelGraph, patternGraph);
        this.matchInternal(state, modelGraph, patternGraph);
        return state.mapping
    }

    // internal method for finding subgraphs. called recursively
    matchInternal(s: State, modelGraph: Graph, patternGraph: Graph) {
        // abort search if we reached the final level of the search tree 
        let sum = 0
        if (s.depth == patternGraph.nodes.size) {
            s.addMapping()
            return 1
        }
        else {
            let candiatePairs = this.getCandidatePairs(s, modelGraph, patternGraph);
            candiatePairs.forEach((v, n) => {
                let m = candiatePairs.get(n)

                // check if candidate pair (n,m) is feasible 
                if (this.checkFeasibility(s, n, m)) {

                    s.match(n, m); // extend mapping
                    sum += this.matchInternal(s, modelGraph, patternGraph); // recursive call
                    s.backtrack(n, m); // remove (n,m) from the mapping
                }
            })

            return sum
        }
    }

    getCandidatePairs(s: State, m: Graph, p: Graph) {
        let map: Map<string, string> = new Map(); // the map storing candidate pairs
        if (s.T1out.size > 0 && s.T2out.size > 0) {
            // Generate candidates from T1out and T2out if they are not empty

            // Faster Version
            // Since every node should be matched in query graph
            // Therefore we can only extend one node of query graph (with biggest id)
            // instead of generate the whole Cartesian product of the target and query
            let nextPatternNode = "";
            s.T2out.forEach((v, k) => {
                if (k.localeCompare(nextPatternNode)) {
                    nextPatternNode = k
                }
            })
            s.T1out.forEach((v, k) => {
                map.set(k, nextPatternNode)
            })
            return map
        }else if(s.T1in.size > 0 && s.T2in.size > 0){
            let nextPatternNode = "";
            s.T2in.forEach((v, k) => {
                if (k.localeCompare(nextPatternNode)) {
                    nextPatternNode = k
                }
            })
            s.T1in.forEach((v, k) => {
                map.set(k, nextPatternNode)
            }) 

            return map
        }
        else{
            let nextPatternNode = "";
            s.unmapped2.forEach((v, k) => {
                if (k.localeCompare(nextPatternNode)) {
                    nextPatternNode = k
                }
            }) 

            s.unmapped1.forEach((v,k)=>{
                map.set(k, nextPatternNode) 
            })
            return map
        }

    }

    checkFeasibility(s: State, n: string, m: string) {

        return this.checkSemanticFeasibility(s, n, m) && this.checkSyntacticFeasibility(s, n, m); // return result
    }

    //checks for semantic feasibility of the pair (n,m)
    checkSemanticFeasibility(s: State, n: string, m: string) {
        let passed = true
        passed = passed && this.checkNodeLabel(s,n,m)
        passed = passed && this.checkNodeProperty(s,n,m)
        return passed 
    }

    checkNodeLabel(s: State, n: string, m: string){
       return s.modelGraph.nodes.get(n).label == (s.patternGraph.nodes.get(m).label);
    }

    checkNodeProperty(s:State,n:string,m:string){
        let passed = true
        let modelNode = s.modelGraph.nodes.get(n)
        let patternNode = s.patternGraph.nodes.get(m)
        let constaints = patternNode.constraints
        if(constaints.size > 0){
            constaints.forEach((constaint:any,property)=>{
                let {operator,value} = constaint
                let modelNodeValue = modelNode.properties[property]
                if(modelNodeValue !== undefined){
                    passed = passed && value == modelNodeValue
                }
            })
        }

        return passed
    }

    //checks for syntactic feasibility of the pair (n,m)
    checkSyntacticFeasibility(s: State, n: string, m: string) {
        let passed = true;
        passed = passed && this.checkRpredAndRsucc(s, n, m); // check Rpred / Rsucc conditions (subgraph isomorphism definition)
        // passed = passed && this.checkRin(s, n, m);
        // passed = passed && this.checkRout(s, n, m);
        passed = passed && this.checkInAndOut(s,n,m)
        passed = passed && this.checkNew(s, n, m);
        return passed; // return result	
    }

    // checks if extending the mapping by the pair (n,m) would violate the subgraph isomorphism definition
    checkRpredAndRsucc(s: State, n: string, m: string) {

        let passed = true;

        // check if the structure of the (partial) model graph is also present in the (partial) pattern graph 
        // if a predecessor of n has been mapped to a node n' before, then n' must be mapped to a predecessor of m 
        let nTmp = s.modelGraph.nodes.get(n);
        nTmp.incomingEdges.forEach(e => {
            if (s.core_1.get(e.source.id)) {
                //m nodeId 
                let nodeId = s.core_1.get(e.source.id)
                passed = passed && (s.patternGraph.getInComingingVertices(m).includes(nodeId));
            }
        })

        // if a successor of n has been mapped to a node n' before, then n' must be mapped to a successor of m
        nTmp.outGoingEdges.forEach(e => {
            if (s.core_1.get(e.target.id)) {
                let nodeId = s.core_1.get(e.target.id)
                passed = passed && (s.patternGraph.getOutgoingVertices(m).includes(nodeId));
            }
        })

        // check if the structure of the (partial) pattern graph is also present in the (partial) model graph
        // if a predecessor of m has been mapped to a node m' before, then m' must be mapped to a predecessor of n
        let mTmp = s.patternGraph.nodes.get(m);

        mTmp.incomingEdges.forEach(e => {
            let nodeId = s.core_2.get(e.source.id)
            if (s.core_2.get(e.source.id)) {
                passed = passed && (s.modelGraph.getInComingingVertices(n).includes(nodeId));

            }
        })

        // if a successor of m has been mapped to a node m' before, then m' must be mapped to a successor of n
        mTmp.outGoingEdges.forEach(e => {
            let nodeId = s.core_2.get(e.target.id)
            if (s.core_2.get(e.target.id)) {
                passed = passed && (s.modelGraph.getOutgoingVertices(n).includes(nodeId));
            }
        })

        return passed; // return the result
    }

    /**
     * Check the in rule and out rule
     * This prunes the search tree using 1-look-ahead
     * @param s VF2 state
     * @param n model graph node id
     * @param m  query graph node id
     */
    checkInAndOut(s:State,n:string,m:string){
        let modelNode = s.modelGraph.nodes.get(n)
        let queryNode = s.patternGraph.nodes.get(m)
        let targetPredCnt = 0, targetSucCnt = 0
        let queryPredCnt = 0, querySucCnt = 0

        // In Rule
        // The number predecessors/successors of the target node that are in T1in
        // must be larger than or equal to those of the query node that are in T2in

        modelNode.incomingEdges.forEach(e=>{
            let node = s.modelGraph.nodes.get(e.source.id);
            if(s.inT1in(node.id)){
                targetPredCnt++
            }
        })

        modelNode.outGoingEdges.forEach(e=>{
            let node = s.modelGraph.nodes.get(e.target.id)
            if(s.inT1in(node.id)){
                targetSucCnt++
            }
        })

        queryNode.incomingEdges.forEach(e=>{
            let node = s.patternGraph.nodes.get(e.source.id)
            if(s.inT2in(node.id)){
                queryPredCnt++
            }
        })

        queryNode.outGoingEdges.forEach(e=>{
            let node = s.patternGraph.nodes.get(e.target.id)
            if(s.inT2in(node.id)){
                queryPredCnt++;
            }
        })

        if (targetPredCnt < queryPredCnt || targetSucCnt < querySucCnt){
            return false;
        }

        // Out Rule
        // The number predecessors/successors of the target node that are in T1out
        // must be larger than or equal to those of the query node that are in T2out
        targetPredCnt = 0; targetSucCnt = 0;
        queryPredCnt = 0; querySucCnt = 0;
        modelNode.incomingEdges.forEach(e=>{
            let node = s.modelGraph.nodes.get(e.source.id)
            if(s.inT1out(node.id)){
                targetPredCnt++
            }
        })

        modelNode.outGoingEdges.forEach(e=>{
            let node = s.modelGraph.nodes.get(e.target.id)
            if(s.inT1out(node.id)){
                targetSucCnt++
            }
        })

        queryNode.incomingEdges.forEach(e=>{
            let node = s.patternGraph.nodes.get(e.source.id)
            if(s.inT2out(node.id)){
                queryPredCnt++
            }
        })

        queryNode.outGoingEdges.forEach(e=>{
            let node = s.patternGraph.nodes.get(e.target.id)
            if(s.inT2out(node.id)){
                queryPredCnt++
            }
        })

        if (targetPredCnt < queryPredCnt || targetSucCnt < querySucCnt){
            return false;
        }

        return true
    }

    checkRin(s: State, n: string, m: string) {
        let T1in = new Map(s.T1in)
        s.modelGraph.getInComingingVertices(n).forEach(id => {
            T1in.delete(id)
        })

        let T2in = new Map(s.T2in)
        s.patternGraph.getInComingingVertices(m).forEach(id => {
            T2in.delete(id)
        })

        let firstExp = T1in.size >= T2in.size;

        let T1in2 = new Map(s.T1in)
        s.modelGraph.getOutgoingVertices(n).forEach(id => {
            T1in2.delete(id)
        })

        let T2in2 = new Map(s.T2in)
        s.patternGraph.getOutgoingVertices(m).forEach(id => {
            T2in2.delete(id)
        })

        let secoundExp = T1in2.size >= T2in2.size;

        return firstExp && secoundExp
    }

    checkRout(s: State, n: string, m: string) {
        let T1out = new Map(s.T1out)
        //get Intersection values
        T1out.forEach((v, k) => {
            if (!s.modelGraph.getInComingingVertices(n).includes(k)) {
                T1out.delete(k)
            }
        })

        let T2out = new Map(s.T2out)
        T2out.forEach((v, k) => {
            if (!s.patternGraph.getInComingingVertices(m).includes(k)) {
                T2out.delete(k)
            }
        })

        let firstExp = T1out.size >= T2out.size;

        let T1out2 = new Map(s.T1out)
        T1out2.forEach((v, k) => {
            if (!s.modelGraph.getOutgoingVertices(n).includes(k)) {
                T2out.delete(k)
            }
        })

        let T2out2 = new Map(s.T2out)
        T2out2.forEach((v, k) => {
            if (!s.patternGraph.getOutgoingVertices(m).includes(k)) {
                T2out2.delete(k)
            }
        })

        let secoundExp = T1out2.size >= T2out2.size;
        return firstExp && secoundExp;
    }

    /**
     * Check the new rule
     * This prunes the search tree using 2-look-ahead
     * @param s VF2 State
     * @param n Model Graph Node ID
     * @param m Query Graph Node ID
     */
    checkNew(s:State,n:string,m:string){
        let targetNode = s.modelGraph.nodes.get(n);
        let queryNode = s.patternGraph.nodes.get(m);

        let targetPredCnt = 0, targetSucCnt = 0;
        let queryPredCnt = 0, querySucCnt = 0;

        // In Rule
        // The number predecessors/successors of the target node that are in T1in
        // must be larger than or equal to those of the query node that are in T2in
        targetNode.incomingEdges.forEach(e=>{
            let node = s.modelGraph.nodes.get(e.source.id)
            if(s.inN1Tilde(node.id)){
                targetPredCnt++
            }
        })

        targetNode.outGoingEdges.forEach(e=>{
            let node = s.modelGraph.nodes.get(e.target.id)
            if(s.inN1Tilde(node.id)){
                targetSucCnt++;
            }
        })

        queryNode.incomingEdges.forEach(e=>{
            let node = s.patternGraph.nodes.get(e.source.id)
            if(s.inN2Tilde(node.id)){
                queryPredCnt++
            }
        })

        queryNode.outGoingEdges.forEach(e=>{
            let node = s.patternGraph.nodes.get(e.target.id)
            if(s.inN2Tilde(node.id)){
                queryPredCnt++
            }
        })

        if (targetPredCnt < queryPredCnt || targetSucCnt < querySucCnt){
            return false;
        }

        return true;

    }

    checkRnew(s: State, n: string, m: string) {
        let TNilt1 = this.calcNTilt1(s);
        TNilt1.forEach((v, k) => {
            if (!s.modelGraph.getInComingingVertices(n).includes(k)) {
                TNilt1.delete(k)
            }
        })

        let TNilt2 = this.calcNTilt2(s);
        TNilt2.forEach((v, k) => {
            if (!s.patternGraph.getInComingingVertices(m).includes(k)) {
                TNilt2.delete(k)
            }
        })
        let firstExp = TNilt1.size >= TNilt2.size;


        let NTilt12 = this.calcNTilt1(s);
        NTilt12.forEach((v, k) => {
            if (!s.modelGraph.getOutgoingVertices(n).includes(k)) {
                NTilt12.delete(k)
            }
        })

        let NTilt22 = this.calcNTilt2(s);
        NTilt22.forEach((v, k) => {
            if (!s.patternGraph.getOutgoingVertices(m).includes(k)) {
                NTilt22.delete(k)
            }
        })

        let secoundExp = NTilt12.size >= NTilt22.size;
        return firstExp && secoundExp;
    }

    calcNTilt1(s: State) {
        let N1 = new Map(s.modelGraph.nodes)
        let M1 = new Map()
        s.core_1.forEach((v, k) => {
            M1.set(k, v)
        })

        let T1 = new Map(s.T1in)
        T1.forEach((v, k) => {
            if (!s.T1out.has(k)) {
                T1.delete(k)
            }
        })

        let NTilt1 = N1;
        NTilt1.forEach((v, k) => {
            if (M1.has(k) || T1.has(k)) {
                NTilt1.delete(k)
            }
        })
        return NTilt1;
    }

    calcNTilt2(s: State) {
        let N2 = new Map(s.modelGraph.nodes);
        let M2 = new Map()
        s.core_2.forEach((v, k) => {
            M2.set(k, v)
        })

        let T2 = new Map(s.T2in);
        T2.forEach((v, k) => {
            if (!s.T2out.has(k)) {
                T2.delete(k)
            }
        })
        let NTilt2 = N2;
        NTilt2.forEach((v, k) => {
            if (M2.has(k) || T2.has(k)) {
                NTilt2.delete(k)
            }
        })
        return NTilt2;
    }

}
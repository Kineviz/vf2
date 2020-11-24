import Graph from "../graph/Graph";
import GNode from "../graph/Node";

export default class State {
    public core_1: Map<string, string>
    public core_2: Map<string, string>

    public in_1: Map<string, number>; // stores for each model graph node the depth in the search tree at which it entered "T_1 in" or the mapping ("-1" indicates that the node is not part of the set)
    public in_2: Map<string, number>; // stores for each pattern graph node the depth in the search tree at which it entered "T_2 in" or the mapping ("-1" indicates that the node is not part of the set)
    public out_1: Map<string, number>; // stores for each model graph node the depth in the search tree at which it entered "T_1 out" or the mapping ("-1" indicates that the node is not part of the set)
    public out_2: Map<string, number>; // stores for each pattern graph node the depth in the search tree at which it entered "T_2 out" or the mapping ("-1" indicates that the node is not part of the set)

    // sets mentioned in the paper
    public T1in: Map<string, string>;
    public T1out: Map<string, string>;
    public T2in: Map<string, string>;
    public T2out: Map<string, string>;

    // sets storing yet unmapped nodes
    public unmapped1: Map<string, string>;
    public unmapped2: Map<string, string>;

    public depth: number = 0; // current depth of the search tree

    public modelGraph: Graph;
    public patternGraph: Graph;

    constructor(modelGraph: Graph, patternGraph: Graph) {
        this.modelGraph = modelGraph;
        this.patternGraph = patternGraph;

        let modelSize = modelGraph.nodes.size;
        let patternSize = patternGraph.nodes.size;

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
        let modelNodes = modelGraph.nodes
        let patternNodes = patternGraph.nodes
        modelNodes.forEach((node: GNode) => {
            this.core_1.set(node.id, undefined)
            this.in_1.set(node.id, undefined)
            this.out_1.set(node.id, undefined)
            this.unmapped1.set(node.id, node.id)
        })

        patternNodes.forEach((node: GNode) => {
            this.core_2.set(node.id, undefined)
            this.in_2.set(node.id, undefined)
            this.out_2.set(node.id, undefined)
            this.unmapped2.set(node.id, node.id)
        })

    }

    inM1(nodeId: string) {
        return this.core_1.get(nodeId) !== undefined ? true : false;
    }

    inM2(nodeId: string) {
        return this.core_2.get(nodeId) !== undefined ? true : false
    }

    inT1in(nodeId: string) {
        return this.core_1.get(nodeId) === undefined && this.in_1.get(nodeId)
    }

    inT2in(nodeId: string) {
        return this.core_2.get(nodeId) === undefined && this.in_2.get(nodeId)
    }

    inT1out(nodeId: string) {
        return this.core_1.get(nodeId) === undefined && this.out_1.get(nodeId)
    }

    inT2out(nodeId: string) {
        return this.core_2.get(nodeId) === undefined && this.out_2.get(nodeId)
    }

    // extends the current matching by the pair (n,m) -> going down one level in the search tree
    // n is the id of a model graph node
    // m is the id of a pattern graph node
    match(n: string, m: string) {
        this.core_1.set(n, m)
        this.core_2.set(m, n)

        this.unmapped1.delete(n)
        this.unmapped2.delete(m)

        this.T1in.delete(n);
        this.T1out.delete(n);
        this.T2in.delete(m);
        this.T2out.delete(m);

        this.depth++;

        // update in/out arrays
        // updates needed for nodes entering Tin/Tout sets on this level
        // no updates needed for nodes which entered these sets before
        let nTmp = this.modelGraph.nodes.get(n);
        let mTmp = this.patternGraph.nodes.get(m);

        // cycle through nodes pointing towards n
        nTmp.incomingEdges.forEach(e => {
            if (this.in_1.get(e.source.id) === undefined) {
                this.in_1.set(e.source.id, this.depth)
                if (!this.inM1(e.source.id))
                    this.T1in.set(e.source.id, e.source.id); // update T1in
            }
        })

        // cycle through nodes n points to
        nTmp.outGoingEdges.forEach(e => {
            if (this.out_1.get(e.target.id) === undefined) {
                this.out_1.set(e.target.id, this.depth)
                if (!this.inM1(e.target.id)) {
                    this.T1out.set(e.target.id, e.target.id)
                }
            }

        })

        // cycle through nodes pointing towards m
        mTmp.incomingEdges.forEach(e => {
            if (this.in_2.get(e.source.id) === undefined) {
                this.in_2.set(e.source.id, this.depth)
                if (!this.inM2(e.source.id))
                    this.T2in.set(e.source.id, e.source.id); // update T1in
            }
        })

        // cycle through nodes m points to
        mTmp.outGoingEdges.forEach(e => {
            if (this.out_2.get(e.target.id) === undefined) {
                this.out_2.set(e.target.id, this.depth)
                if (!this.inM2(e.target.id)) {
                    this.T2out.set(e.target.id, e.target.id)
                }
            }

        })

    }

    backtrack(n:string,m:string){
        this.core_1.delete(n)
        this.core_2.delete(m)
        this.unmapped1.set(n,n)
        this.unmapped2.set(m,m)

        this.core_1.forEach(nodeId=>{
            if(this.in_1.get(nodeId) == this.depth){
                this.in_1.delete(nodeId)
                this.T1in.delete(nodeId)
            }
            if(this.out_1.get(nodeId) == this.depth){
                this.out_1.delete(nodeId)
                this.T1out.delete(nodeId)
            }
        })

        this.core_2.forEach(nodeId=>{
            if(this.in_2.get(nodeId) == this.depth){
                this.in_2.delete(nodeId)
                this.T2in.delete(nodeId)
            }
            if(this.out_2.get(nodeId) == this.depth){
                this.out_2.delete(nodeId)
                this.T2out.delete(nodeId)
            }
        })
    }

    printMapping(){
        this.core_2.forEach((v,k)=>{
            console.log(`(${k}-${v})`)
        })
    }
}
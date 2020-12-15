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
    public mapping = []

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

    inN1Tilde(nodeId:string){
        return this.core_1.get(nodeId) === undefined && this.in_1.get(nodeId) === undefined && this.out_1.get(nodeId) === undefined
    }

    inN2Tilde(nodeId:string){
        return this.core_2.get(nodeId) === undefined && this.in_2.get(nodeId) === undefined && this.out_2.get(nodeId) === undefined
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
        let targetNode = this.modelGraph.nodes.get(n);
        let queryNode = this.patternGraph.nodes.get(m);

        // cycle through nodes n points to
        targetNode.incomingEdges.forEach(e => {
            let node = this.modelGraph.nodes.get(e.target.id);
            if(this.in_1.get(node.id) === undefined){// if the note is not in T1in or mapping
                this.in_1.set(node.id,this.depth)
                if (!this.inM1(node.id))		// if not in M1, add into T1in
                this.T1in.set(node.id,node.id);
            }

        })

        targetNode.outGoingEdges.forEach(e=>{
            let node = this.modelGraph.nodes.get(e.target.id)
            if (this.out_1.get(node.id) === undefined){	// if the note is not in T1out or mapping
                this.out_1.set(node.id,this.depth)
                if (!this.inM1(node.id))		// if not in M1, add into T1out
                    this.T1out.set(node.id,node.id);
            }
        })

        queryNode.incomingEdges.forEach(e=>{
            let node = this.patternGraph.nodes.get(e.target.id)
            if(this.in_2.get(node.id) === undefined){
                this.in_2.set(node.id,this.depth)
                if(!this.inM2(node.id)){
                    this.T2in.set(node.id,node.id)
                }
            }
            
        })

        queryNode.outGoingEdges.forEach(e=>{
            let node = this.patternGraph.nodes.get(e.target.id)
            if(this.out_2.get(node.id) === undefined){
                this.out_2.set(node.id,this.depth)
                if(!this.inM2(node.id)){
                    this.T2out.set(node.id,node.id)
                }
            }
        })




    }

    backtrack(n:string,m:string){
        this.core_1.set(n,undefined)
        this.core_2.set(m,undefined)

        this.unmapped1.set(n,n)
        this.unmapped2.set(m,m)

        this.core_1.forEach((v,k)=>{
            if(this.in_1.get(k) == this.depth){
                this.in_1.delete(k)
                this.T1in.delete(k)
            }
            if(this.out_1.get(k) == this.depth){
                this.out_1.delete(k)
                this.T1out.delete(k)
            }
        })

        this.core_2.forEach((v,k)=>{
            if(this.in_2.get(k) == this.depth){
                this.in_2.delete(k)
                this.T2in.delete(k)
            }
            if(this.out_2.get(k) == this.depth){
                this.out_2.delete(k)
                this.T2out.delete(k)
            }
        })
        // put targetNodeId and queryNodeId back into Tin and Tout sets if necessary
        if (this.inT1in(n)) {
            this.T1in.set(n,n);
        }
        if(this.inT1out(n)){
            this.T1out.set(n,n)
        }
        if(this.inT2in(m)){
            this.T1in.set(m,m)
        }
        if(this.inT2out(m)){
            this.T2out.set(m,m)
        }
        this.depth--
    }

    addMapping(){
        let map = new Map(this.core_2)
        this.mapping.push(map)
        // this.core_2.forEach((v,k)=>{
        //     console.log(`(${k}-${v})`)
        // })
        // return this.core_2

    }
}
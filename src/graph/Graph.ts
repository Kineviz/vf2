import Edge from "./Edge"
import GNode from "./Node"

export default class Graph{
    public nodes:Map<string,GNode>
    public edges:Map<string,Edge>
    public adjacencyMatrixUpdateNeeded:boolean
    public adjacencyMatrix:Map<string,Array<string>>
    constructor(){
        this.nodes = new Map()
        this.edges = new Map()
        this.adjacencyMatrixUpdateNeeded = false
        this.adjacencyMatrix = new Map()
    }

    addNode(id:string,label:string,properties?:Array<string>){
        this.nodes.set(id,new GNode(id, label,properties));
        this.adjacencyMatrixUpdateNeeded = true
    }

    addNodePropertyContraint(nodeId:string,property:string,constraint:Object){
        let node = this.nodes.get(nodeId)
        node.constraints.set(property,constraint)
    }

    addEdge(id:string,label:string,source:GNode,target:GNode,properties?:Array<string>){
        this.edges.set(id,new Edge(label,source,target,properties))
        this.adjacencyMatrixUpdateNeeded = true
    }

    addEdgePropertyConstraint(edgeId:string,property:string,constraint:Object){
        let edge = this.edges.get(edgeId)
        edge.constraints.set(property,constraint)
    }

    addEdgeById(id:string,label:string,sourceId:string,targetId:string){
        let sourceNode:GNode = this.nodes.get(sourceId)
        let targetNode:GNode = this.nodes.get(targetId)
        this.addEdge(id,label,sourceNode,targetNode)
    }

    getInComingingVertices(targetId:string){
        let node = this.nodes.get(targetId)
        let incomingEdges = node.incomingEdges
        let inComingVertices = incomingEdges.map((e:Edge)=>{
            return e.source.id
        })

        return inComingVertices
    }

    getOutgoingVertices(nodeId:string){
        let node = this.nodes.get(nodeId)
        let incomingEdges = node.outGoingEdges
        let inComingVertices = incomingEdges.map((e:Edge)=>{
            return e.target.id
        })

        return inComingVertices
    }

    // getAdjacencyMatrix():Map<String,Array<String>>{

    //     return 
    // }
}
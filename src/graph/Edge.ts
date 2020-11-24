import GNode from "./Node";

export default class Edge{
    public source:GNode
    public target:GNode
    public label:string

    constructor(label:string,source:GNode,target:GNode){
        this.source = source
        this.target = target
        this.label = label

        source.outGoingEdges.push(this)
        target.incomingEdges.push(this)
    }
}
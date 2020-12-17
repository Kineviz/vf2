import GNode from "./Node";

export default class Edge{
    public id:string
    public source:GNode
    public target:GNode
    public label:string
    public properties:Object
    public constraints:Map<string,Object>

    constructor(id:string,label:string,source:GNode,target:GNode,properties?:Object){
        this.id = id
        this.source = source
        this.target = target
        this.label = label
        this.properties = properties?properties:{}
        this.constraints = new Map()
        source.outGoingEdges.push(this)
        target.incomingEdges.push(this)
    }
}
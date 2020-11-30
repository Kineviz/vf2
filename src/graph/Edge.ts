import GNode from "./Node";

export default class Edge{
    public source:GNode
    public target:GNode
    public label:string
    public properties:Array<String>
    public constraints:Map<string,Object>

    constructor(label:string,source:GNode,target:GNode,properties?:Array<string>){
        this.source = source
        this.target = target
        this.label = label
        this.properties = properties?properties:[]
        this.constraints = new Map()
        source.outGoingEdges.push(this)
        target.incomingEdges.push(this)
    }
}
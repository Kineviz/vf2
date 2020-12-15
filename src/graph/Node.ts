import Edge from "./Edge"

export default class GNode{
    public id:string
    public label:string
    public properties?:Object
    public constraints?:Map<string,Object>
    public outGoingEdges:Array<Edge>
    public incomingEdges:Array<Edge>

    constructor(id:string,label:string,properties?:Object){
        this.id = id
        this.label = label
        this.outGoingEdges = []
        this.properties = properties?properties:{}
        this.constraints = new Map()
        this.incomingEdges = []
    }
}
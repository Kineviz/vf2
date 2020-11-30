import Edge from "./Edge"

export default class GNode{
    public id:string
    public label:string
    public properties:Array<String>
    public constraints:Map<string,Object>
    public outGoingEdges:Array<Edge>
    public incomingEdges:Array<Edge>

    constructor(id:string,label:string,properties?:Array<string>){
        this.id = id
        this.label = label
        this.outGoingEdges = []
        this.properties = properties?properties:[]
        this.constraints = new Map()
        this.incomingEdges = []
    }
}
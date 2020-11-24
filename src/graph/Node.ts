import Edge from "./Edge"

export default class GNode{
    public id:string
    public label:string
    public outGoingEdges:Array<Edge>
    public incomingEdges:Array<Edge>

    constructor(id:string,label:string){
        this.id = id
        this.label = label
        this.outGoingEdges = []
        this.incomingEdges = []
    }
}
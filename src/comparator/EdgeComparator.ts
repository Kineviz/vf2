import Edge from "../graph/Edge";
import { Comparator } from "./Comparator";

export default class EdgeComparator implements Comparator<Edge>{
    constructor(){

    }

    compare(modelEdge:Edge,patternEdge:Edge){
        let passed = true
        let constaints = patternEdge.constraints
        if(modelEdge.label !== patternEdge.label){
            passed = false
        }
        else if(constaints.size > 0){
            
        }
        return passed
    }
}
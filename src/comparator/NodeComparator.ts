import GNode from "../graph/Node";
import { Comparator } from "./Comparator";

export default class NodeComparator implements Comparator<GNode>{
    constructor(){

    }

    compare(modelNode:GNode,patternNode:GNode){
        let passed = true
        let constaints = patternNode.constraints
        if(constaints.size > 0){
            constaints.forEach((constaint:any,property)=>{
                let {operator,value} = constaint
                let modelNodeValue = modelNode.properties[property]
                if(modelNodeValue !== undefined){
                    passed = passed && value == modelNodeValue
                }
            })
        }
        return passed
    }
}
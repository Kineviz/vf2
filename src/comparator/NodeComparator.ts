import GNode from "../graph/Node";
import { Comparator } from "./Comparator";
import {equal} from '../operator/equal'
import {greatThan} from '../operator/greatThan'
import {lessThan} from '../operator/lessThan'

export default class NodeComparator implements Comparator<GNode>{
    constructor(){

    }

    compare(modelNode:GNode,patternNode:GNode){
        let passed = true
        let constaints = patternNode.constraints
        if(constaints.size > 0){
            constaints.forEach((constaint:any,property)=>{
                if(Array.isArray(constaint)){
                    constaint=constaint[0]
                }
                let {operator,value} = constaint
                let modelNodeValue = modelNode.properties[property]
                switch(operator){
                    case "equal":{
                        passed =  equal(value,modelNodeValue)
                        break
                    }
                    case "lessThan":{
                        passed = lessThan(modelNodeValue,value)
                        break
                    }
                    case "greatThan":{
                        passed = greatThan(modelNodeValue,value)
                        break
                    }
                }
            })
        }
        return passed
    }
}
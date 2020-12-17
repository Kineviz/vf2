import Edge from "../graph/Edge";
import { Comparator } from "./Comparator";
import {equal} from '../operator/equal'
import {greatThan} from '../operator/greatThan'
import {lessThan} from '../operator/lessThan'
export default class EdgeComparator implements Comparator<Edge>{
    constructor(){

    }

    compare(modelEdge:Edge,patternEdge:Edge){
        let passed = true
        let constaints = patternEdge.constraints

        if(modelEdge.label !== patternEdge.label &&patternEdge.label !== "*"){
            passed = false
        }
        else if(constaints.size > 0){
            constaints.forEach((constaint:any,property)=>{
                let {operator,value} = constaint
                let modelEdgeValue = modelEdge.properties[property]
                switch(operator){
                    case "equal":{
                        passed =  equal(value,modelEdgeValue)
                        break
                    }
                    case "lessThan":{
                        passed = lessThan(modelEdgeValue,value)
                        break
                    }
                    case "greatThan":{
                        passed = greatThan(modelEdgeValue,value)
                        break
                    }
                }
            })
        }
        return passed
    }
}
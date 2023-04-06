import Edge from "../graph/Edge";
import { Comparator } from "./Comparator";
import {equal} from '../operator/equal'
import {greatThan} from '../operator/greatThan'
import {lessThan} from '../operator/lessThan'
import {between} from '../operator/between'
import {like} from '../operator/like'
import {include} from '../operator/in'

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
                if(Array.isArray(constaint)){
                    constaint=constaint[0]
                }
                let {operator,value,min,max} = constaint
                let modelEdgeValue = modelEdge.properties[property]
                switch(operator){
                    case "equal":{
                        passed =  equal(value,modelEdgeValue)
                        break
                    }
                    case "less_than":{
                        passed = lessThan(modelEdgeValue,value)
                        break
                    }
                    case "greater_than":{
                        passed = greatThan(modelEdgeValue,value)
                        break
                    }
                    case "between":{
                        passed = between(min,modelEdgeValue,max)
                            break
                    }
                    case "like":{
                        passed = like(modelEdgeValue,value)
                        break
                    }
                    case 'in':{
                        let array = value.split(",")
                        passed = include(array,modelEdgeValue)
                        break
                    }
                }
            })
        }
        return passed
    }
}
import GNode from "../graph/Node";
import { Comparator } from "./Comparator";
import {equal} from '../operator/equal'
import {greatThan} from '../operator/greatThan'
import {lessThan} from '../operator/lessThan'
import {between} from '../operator/between'
import {like} from '../operator/like'
import {include} from '../operator/in'

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
                let {operator,value,min,max} = constaint
                let modelNodeValue = modelNode.properties[property]
                debugger
                switch(operator){
                    case "equal":{
                        passed =  equal(value,modelNodeValue)
                        break
                    }
                    case "less_than":{
                        passed = lessThan(modelNodeValue,value)
                        break
                    }
                    case "great_than":{
                        passed = greatThan(modelNodeValue,value)
                        break
                    }
                    case "between":{
                        passed = between(min,modelNodeValue,max)
                            break
                    }
                    case "like":{
                        passed = like(modelNodeValue,value)
                        break
                    }
                    case 'in':{
                        let array = value.split(",")
                        passed = include(array,modelNodeValue)
                        break
                    }
                }
            })
        }
        return passed
    }
}
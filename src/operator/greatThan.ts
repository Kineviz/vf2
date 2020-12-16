
export function greatThan(a:any,b:any){
    if(typeof a === "string" && typeof b === "string"  ){
        let flag = a.localeCompare(b) == 1?true:false
        return flag
    }
    else if(typeof a === "number" && typeof b === "number" ){
        return a > b
    }
    return false
}
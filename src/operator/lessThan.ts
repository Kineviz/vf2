
export function lessThan(a:any,b:any){
    if(!isNaN(a) && !isNaN(b)){
        return parseFloat(a) < parseFloat(b)
    }
    else if(typeof a === "string" && typeof b === "string"  ){
        let flag = a.localeCompare(b) == -1?true:false
        return flag
    }
    return false
}
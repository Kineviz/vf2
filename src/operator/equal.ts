
export function equal(a:any,b:any){
    if(!isNaN(a) && !isNaN(b)){
        return a === b
    }
    else if(typeof a === "string" && typeof b === "string" && a.localeCompare(b) == 0 ){
        return true
    }

    return false
}
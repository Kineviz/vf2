
export function equal(a:any,b:any){
    if(typeof a === "string" && typeof b === "string" && a.localeCompare(b) == 0 ){
        return true
    }
    else if(typeof a === "number" && typeof b === "number" ){
        return a === b
    }

    return false
}
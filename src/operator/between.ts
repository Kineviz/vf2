
export function between(a:any,value:any,b:any){
    if(!isNaN(a) && !isNaN(b) && !isNaN(value)){
        return parseFloat(value) > parseFloat(a) &&  parseFloat(value) < parseFloat(b)
    }
    return false
}
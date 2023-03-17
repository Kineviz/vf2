
export function like(a:any,b:any){
    let re = new RegExp(b, 'g');
    if(a && a.match(re)){
        return true
    }
    return false
}
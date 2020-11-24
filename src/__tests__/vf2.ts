
import Graph from "../graph/Graph"
import VF2Matcher from "../matcher/VF2Matcher"

function getG1(){
   let g = new Graph()

   g.addNode("0","A")
   g.addNode("1","A"); // 1
   g.addNode("2","B"); // 2
   g.addNode("3","B"); // 3
   g.addNode("4","C"); // 4

   g.addEdgeById("0","label","0", "1");
   g.addEdgeById("1","label","0", "2");
   g.addEdgeById("2","label","1", "3");
   g.addEdgeById("3","label","2", "3");
   g.addEdgeById("4","label","3", "4");

   return g
}

function getG2(){
  let g = new Graph();
		
  g.addNode("0","A"); // 0
  g.addNode("1","B"); // 1
  g.addNode("2","B"); // 2
  g.addNode("3","C"); // 3
  
  g.addEdgeById("0","label","0", "2");
  g.addEdgeById("1","label","1", "2");
  g.addEdgeById("2","label","2", "3");
  return g
}

let g1 = getG1()
let g2 = getG2()
beforeAll(()=>{
    
},1000)

test('getInComingingVertices', () => {
    let incommingNodes =  g1.getInComingingVertices("3")
    let len = incommingNodes.length
    expect(len).toEqual(2)
  },1000);

  test('getOutgoingVertices', () => {
    let outGoingVertices =  g1.getOutgoingVertices("0")
    let len = outGoingVertices.length
    debugger
    expect(len).toEqual(2)
  },1000);
  
  test('match', () => {
    let matcher = new VF2Matcher();
    let cb = function(map){
        console.log(map)
    }
    let map= matcher.match(g1, g2,cb)
  },1000);
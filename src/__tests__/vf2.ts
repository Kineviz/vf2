
import Graph from "../graph/Graph"
import VF2Matcher from "../matcher/VF2Matcher"

function getG1(){
  let g = new Graph()

  g.addNode("0","A")
  g.addNode("1","B"); // 1
  g.addNode("2","A"); // 2
  g.addNode("4","B"); // 3
  g.addNode("7","C"); // 4

  g.addEdgeById("0","label","0", "1");
  g.addEdgeById("1","label","1", "2");
  g.addEdgeById("2","label","0", "2");
  g.addEdgeById("3","label","0", "4");
  g.addEdgeById("4","label","4", "2");
  g.addEdgeById("5","label","4", "7");
  g.addEdgeById("6","label","2", "7");


  return g
}

function getG2(){
 let g = new Graph();
   
 g.addNode("0","A"); // 0
 g.addNode("1","B"); // 1
 g.addNode("2","A"); // 2
 
 g.addEdgeById("0","label","0", "1");
 g.addEdgeById("1","label","1", "2");
 g.addEdgeById("2","label","0", "2");
 return g
}
let g1 = getG1()
let g2 = getG2()
beforeAll(()=>{
    
},1000)

// test('getInComingingVertices', () => {
//     let incommingNodes =  g1.getInComingingVertices("0")
//     let len = incommingNodes.length
//     expect(len).toEqual(2)
//   },1000);

//   test('getOutgoingVertices', () => {
//     let outGoingVertices =  g1.getOutgoingVertices("0")
//     let len = outGoingVertices.length
//     debugger
//     expect(len).toEqual(2)
//   },1000);
  
  test('match', () => {
    let matcher = new VF2Matcher();
    let map= matcher.match(g1, g2)
    // expect(map[0].get("1")).toEqual("1")
    // expect(map[1].get("1")).toEqual("4")
    console.log(map)
  },1000);
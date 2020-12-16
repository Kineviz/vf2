
import Graph from "../graph/Graph"
import VF2Matcher from "../matcher/VF2Matcher"
import NodeComparator from '../comparator/NodeComparator'

function getG1(){
  let g = new Graph()

  let node1Property = {name:"jacob",age:18}
  let node4Property = {name:"sean",age:20}
  g.addNode("0","A")
  g.addNode("1","B",node1Property); // 1
  g.addNode("2","A"); // 2
  g.addNode("4","B",node4Property); // 3
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
  
 let constraint = {operator:"greatThan",value:17}


 g.addNode("0","A"); // 0
 g.addNode("1","B"); // 1
 g.addNode("2","A"); // 2

 g.addNodePropertyContraint("1","age",constraint)
 
 g.addEdgeById("0","label","0", "1");
 g.addEdgeById("1","label","1", "2");
 g.addEdgeById("2","label","0", "2");
 return g
}
let g1 = getG1()
let g2 = getG2()
beforeAll(()=>{
    
},1000)

  
  test('match', () => {
    let nodeComparator = new NodeComparator()
    debugger
    let matcher = new VF2Matcher(nodeComparator);
    let map= matcher.match(g1, g2)
    // expect(map.length).toEqual(1)
    console.log(map)
  },1000);
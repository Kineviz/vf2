import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';


import Graph from "./graph/Graph"
import VF2Matcher from './matcher/VF2Matcher';

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

let  g1 = getG1();
let  g2 = getG2();

let matcher = new VF2Matcher();
matcher.match(g1, g2); // starts pattern search

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

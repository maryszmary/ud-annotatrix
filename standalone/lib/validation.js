"use strict"

var U_DEPRELS = ["acl", "advcl", "advmod", "amod", "appos", "aux", "case", "cc", "ccomp", "clf", "compound", "conj", "cop", "csubj", "dep", "det", "discourse", "dislocated", "expl", "fixed", "flat", "goeswith", "iobj", "list", "mark", "nmod", "nsubj", "nummod", "obj", "obl", "orphan", "parataxis", "punct", "reparandum", "root", "vocative", "xcomp"];
var U_POS = ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X"];

// TODO: Make this more clever, e.g. CCONJ can have a dependent in certain 
// circumstances, e.g. and / or 
var U_POS_LEAF = ["ADP", "AUX", "CCONJ", "PART", "PUNCT", "SCONJ"];

function is_upos(s) {
    // Checks if a relation is in the list of valid parts of speech
    // @s = the input relation
    // returns a tuple of [bool, message]
    for(var i = 0; i < U_POS.length; i++) {
      if(U_POS[i] == s) { 
        return [true, "", {}];
      }
    }
    return [false, "err_upos_invalid", {"tag": s}];    
}


function is_udeprel(s) {
    // Checks if a relation is in the list of valid relations
    // @s = the input relation
    // returns a tuple of [bool, message]
    var s_deprel = s;
    // Language specific relations are a universal relation + : + some string
    if(s.search(":") >= 0) {
      s_deprel = s.split(":")[0];
    }
    // Check if the deprel is in the list of valid relations
    for(var i = 0; i < U_DEPRELS.length; i++) {
      if(U_DEPRELS[i] == s_deprel) { 
        return [true, "", {}];
      }
    }
    return [false, "err_udeprel_invalid", {"label": s}];
}

function is_leaf(s) {
    // Checks if a node is in the list of part-of-speech tags which 
    // are usually leaf nodes
    // @s = part of speech tag

    // http://universaldependencies.org/u/dep/punct.html
    // Tokens with the relation punct always attach to content words (except in cases of ellipsis) and can never have dependents.

    for(var i = 0; i < U_POS_LEAF.length; i++) {
      if(U_POS_LEAF[i] == s) { 
        return [true, "", {}];
      }
    }
    return [false, "err_udep_leaf_node", {"tag": s}];  

}


function is_projective_nodes(tree, nodeSet) {
    // Checks to see if a particular dependent has a non-projective head
   console.log('is_projective_nodes()', tree) ;
   console.log('is_projective_nodes()', nodeSet) ;
    var nodes = [];
    var heads = {};
    for(let node in tree) {
        if(!tree[node] || tree[node] == undefined) { 
            continue;
        }
        var head = tree[node].head;
        var id = tree[node].id;
        if(!head || !id) { 
            continue;
        }
        heads[id] = head;
        nodes.push(id);
    }

    console.log('is_projective()','heads', heads);
    console.log('is_projective()','nodes', nodes);

    var res = true;
    
    for(let i in nodeSet) {          // i here is the index of the node in nodeSet e.g. i = 0, nodeSet = [9]
        var n_i =  nodeSet[i];
        for(let j in nodes) {
            var n_j =  nodes[j];
            console.log('i:',nodes[n_i],'j:',nodes[j],'h(i):',heads[n_i],'h(j):',heads[n_j]);
            if((nodes[j] > nodes[n_i]) && (nodes[j] < heads[n_i])) { 
                if((heads[n_j] > heads[n_i]) || (heads[n_j] < nodes[n_i])) {
                    res = false;
                    console.log('[0] is_projective()',res);
                    return res;
                }
            }
            if((nodes[j] > heads[n_i]) && (nodes[j] < nodes[n_i])) {
                if((heads[n_j] > nodes[n_i]) || (heads[n_j] < heads[n_i])) {
                    res = false;
                    console.log('[1] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > nodes[n_i] && heads[n_j] < heads[n_i]) {
                if(nodes[j] < nodes[n_i] || nodes[j] > heads[n_i]) {
                    res = false;
                    console.log('[2] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > heads[n_i] && heads[n_j] < nodes[n_i]) {
                if(nodes[j] > nodes[n_i] || nodes[j] < heads[n_i]) {
                    res = false;
                    console.log('[3] is_projective()',res);
                    return res;
                }
            }
        }
    }
//    console.log('is_projective()', res);
    
    return res;
}



function is_projective(tree) {
    // Checks to see if a graph is projective 
    var nodes = [];
    var heads = {};
    for(let node in tree) {
        if(!tree[node] || tree[node] == undefined) { 
            continue;
        }
        var head = tree[node].head;
        var id = tree[node].id;
        if(!head || !id) { 
            continue;
        }
        head = parseInt(head);
        id = parseInt(id.slice(2));
        heads[id] = head;
        nodes.push(id);
    }

//    console.log('is_projective()','heads', heads);
//    console.log('is_projective()','nodes', nodes);

    var res = true;
    
    for(let i in nodes) {
        var n_i =  nodes[i];
        for(let j in nodes) {
            var n_j =  nodes[j];
            //console.log('i:',nodes[i],'j:',nodes[j],'h(i):',heads[n_i],'h(j):',heads[n_j]);
            if((nodes[j] > nodes[i]) && (nodes[j] < heads[n_i])) { 
                if((heads[n_j] > heads[n_i]) || (heads[n_j] < nodes[i])) {
                    res = false;
                    console.log('[0] is_projective()',res);
                    return res;
                }
            }
            if((nodes[j] > heads[n_i]) && (nodes[j] < nodes[i])) {
                if((heads[n_j] > nodes[i]) || (heads[n_j] < heads[n_i])) {
                    res = false;
                    console.log('[1] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > nodes[i] && heads[n_j] < heads[n_i]) {
                if(nodes[j] < nodes[i] || nodes[j] > heads[n_i]) {
                    res = false;
                    console.log('[2] is_projective()',res);
                    return res;
                }
            }
            if(heads[n_j] > heads[n_i] && heads[n_j] < nodes[i]) {
                if(nodes[j] > nodes[i] || nodes[j] < heads[n_i]) {
                    res = false;
                    console.log('[3] is_projective()',res);
                    return res;
                }
            }
        }
    }
//    console.log('is_projective()', res);
    
    return res;
}

function is_depend_cycles(tree) {
    //Finds the cycles in the tree
    var g = new Map();
    var vertices;
    var data = tree;
    vertices = Object.keys(data).length + 1;
    var id_to_word = new Map();
    
    for (var k in data) {
        if (data.hasOwnProperty(k)) {
            var word = data[k];
            if(isNaN(parseInt(word["head"])) === false && isNaN(parseId(word["id"])) === false) {
		console.log(parseId(word["id"]));
                g.set(parseId(word["id"]), parseInt(word["head"]));
                id_to_word.set(parseId(word["id"]), word["form"]);
            }
        }
    }
    console.log("Has Cycles:");
    console.log(_is_cyclic());
    if (_is_cyclic()) {
        console.log("Cycle List:");
        var c_list = cycle_list();
        for (var i = 0; i < c_list.length; i++) {
            var cycle = c_list[i];
            console.log(cycle);
            var word_form = [];
            for (var j = 0; j < cycle.length; j++) {
                word_form.push(id_to_word.get(cycle[j]));
            }
            var output = "";
            for (var j = 0; j < word_form.length; j++) {
                output += String(word_form[j]) + "-->"
            }
            console.log(output);
        }
    }
    return _is_cyclic();

    function _is_cyclic_util(start_vertex) {
	//Finds cycles starting at a vertex
        var current_vertex = start_vertex;
        var visited = [current_vertex];
        while (g.get(current_vertex) !== undefined  && g.get(current_vertex) !== start_vertex && visited.indexOf(g.get(current_vertex)) === -1) {
            current_vertex = g.get(current_vertex);
            visited.push(current_vertex);
        }    
	if (g.get(current_vertex) !== undefined && g.get(current_vertex)==start_vertex) {
            return visited;
        }
	return [];

    };

    function normalize_cycle(a) {
	//Normalizes cycles for easy comparisons	
        var b = a.slice().sort();
        b.sort();
        var loc = a.indexOf(b[0]);
        var c = [];
        for (var i = 0; i < a.length; i++) {
            c.push(0);
        }
        for (var i = 0; i < a.length; i++) {
            var index = i - loc;
            if (index < 0) {
                index = a.length + i - loc;
            }
            c[index] = a[i];
        }
        return c;
    };

    function cycle_list() {
	//Finds all cycles
        var cycles = [];
        for (var node = 0; node < vertices; node++) {
            var c_data = _is_cyclic_util(node);
            if (c_data.length > 0) {
                c_data = normalize_cycle(c_data);
                var checkEqual = 0;
                for (var j = 0; j < cycles.length; j++) {
                    if (checkIfEqual(cycles[j],c_data) === true) {
                        checkEqual = 1;
                        break;
                    }
                }
                if (checkEqual === 0) {
                    cycles.push(c_data);
                }
               
            }
        }
        return cycles;
    };

    function checkIfEqual(a,b) {
	//Checks if two cycles are equal
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    function parseId(id) {
        var nfid = id.substr(2);
        return parseInt(nfid);
    }

    function _is_cyclic() {
        if (cycle_list().length > 0) {
            return cycle_list();
        }
        else {
            return null;
        }
    };
};

function is_relation_conflict(tree) {
    var data = tree;
    console.log(tree);
    var count = new Map();
    for(var k in data) {
        if(data.hasOwnProperty(k)) {
            var word = data[k];
            if(word.deprel !== undefined) {
                if(count.has(word.deprel)) {
                   count.set(word.deprel, count.get(word.deprel)+1);
                }
                else {
                   count.set(word.deprel, 1);
                }
            }
        }
    }
    console.log("Count: ", count);
    var conflicts = [];
    var totalsubjects = 0;
    if(count.has("nsubj")) {
        totalsubjects += count.get("nsubj");
    }
    if(count.has("csubj")) {
        totalsubjects += count.get("csubj");
    }
    if(totalsubjects > 1) {
        conflicts.push("subj");
    }
    var totalobjects = 0;
    if(count.has("obj")) {
        totalobjects += count.get("obj");
    }
    if(totalobjects > 1) {
        conflicts.push("obj");
    }
    var ccomp = 0;
    if(count.has("ccomp")) {
        ccomp += count.get("ccomp");
    }
    if(totalobjects >= 1 && ccomp >= 1) {
        conflicts.push("objccomp");
    }
    console.log("Conflicts: ", conflicts);
    return conflicts;
}

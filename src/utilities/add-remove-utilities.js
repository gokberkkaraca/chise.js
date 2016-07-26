var addRemoveUtilities = {
  defaultsMap: {
    "process": {
      width: 30,
      height: 30
    },
    "omitted process": {
      width: 30,
      height: 30
    },
    "uncertain process": {
      width: 30,
      height: 30
    },
    "associationprocess": {
      width: 30,
      height: 30
    },
    "association": {
      width: 30,
      height: 30
    },
    "dissociation": {
      width: 30,
      height: 30
    },
    "macromolecule": {
      width: 100,
      height: 50
    },
    "nucleic acid feature": {
      width: 100,
      height: 50
    },
    "phenotype": {
      width: 100,
      height: 50
    },
    "unspecified entity": {
      width: 100,
      height: 50
    },
    "perturbing agent": {
      width: 100,
      height: 50
    },
    "complex": {
      width: 100,
      height: 100
    },
    "compartment": {
      width: 100,
      height: 100
    }
  },
  addNode: function (x, y, sbgnclass, parent, visibility) {
    var defaultsMap = this.defaultsMap;
    var defaults = defaultsMap[sbgnclass];

    var width = defaults ? defaults.width : 50;
    var height = defaults ? defaults.height : 50;



    var css = defaults ? {
      'border-width': defaults['border-width'],
//      'border-color': defaults['border-color'],
      'background-color': defaults['background-color'],
      'font-size': defaults['font-size'],
      'background-opacity': defaults['background-opacity']
    } : {};
    
    if(visibility){
      css.visibility = visibility;
    }
    
    if(defaults && defaults.multimer){
      sbgnclass += " multimer";
    }
    var data = {
      width: width,
      height: height,
      sbgnclass: sbgnclass,
      sbgnbbox: {
        h: height,
        w: width,
        x: x,
        y: y
      },
      sbgnstatesandinfos: [],
      ports: []
    };
    
    if(parent){
      data.parent = parent;
    }
    
    var eles = cy.add({
      group: "nodes",
      data: data,
      css: css,
      position: {
        x: x,
        y: y
      }
    });
    
    var newNode = eles[eles.length - 1];
    if (defaults && defaults['border-color']) {
      newNode.data('borderColor', defaults['border-color']);
    }
    else {
      newNode.data('borderColor', newNode.css('border-color'));
    }
    if (defaults && defaults['sbgnclonemarker']) {
      newNode._private.data.sbgnclonemarker = defaults.sbgnclonemarker;
    }
    newNode.addClass('changeBorderColor');
    refreshPaddings();
    return newNode;
  },
  removeNodes: function (nodes) {
    var removedEles = nodes.connectedEdges().remove();
    var children = nodes.children();
    if (children != null && children.length > 0) {
      removedEles = removedEles.union(this.removeNodes(children));
    }
    var parents = nodes.parents();
    removedEles = removedEles.union(nodes.remove());
    cy.nodes().updateCompoundBounds();
    refreshPaddings();
    return removedEles;
  },
  addEdge: function (source, target, sbgnclass, visibility) {
    var defaultsMap = this.defaultsMap;
    var defaults = defaultsMap[sbgnclass];
    var css = defaults ? {
      'width': defaults['width']
    } : {};
    
    if(visibility){
      css.visibility = visibility;
    }
    
    var eles = cy.add({
      group: "edges",
      data: {
        source: source,
        target: target,
        sbgnclass: sbgnclass
      },
      css: css
    });

    var newEdge = eles[eles.length - 1];
    if (defaults && defaults['line-color']) {
      newEdge.data('lineColor', defaults['line-color']);
    }
    else {
      newEdge.data('lineColor', newEdge.css('line-color'));
    }
    newEdge.addClass('changeLineColor');
    return newEdge;
  },
  removeEdges: function (edges) {
    return edges.remove();
  },
  restoreEles: function (eles) {
    eles.restore();
    return eles;
  },
  removeElesSimply: function (eles) {
    cy.elements().unselect();
    return eles.remove();
  },
  removeEles: function (eles) {
    cy.elements().unselect();
    var edges = eles.edges();
    var nodes = eles.nodes();
    var removedEles = this.removeEdges(edges);
    removedEles = removedEles.union(this.removeNodes(nodes));
    return removedEles;
  },
  changeParent: function (nodes, oldParentId, newParentId) {
    var removedNodes = this.removeNodes(nodes);
    
    for (var i = 0; i < removedNodes.length; i++) {
      var removedNode = removedNodes[i];
      var parentId = removedNode._private.data.parent;

      //Just alter the parent id of the nodesToMakeCompound
      if (parentId != oldParentId || removedNode._private.data.source) {
        continue;
      }

      removedNode._private.data.parent = newParentId;
      if(removedNode._private.parent){
        delete removedNode._private.parent;
      }
    }

    cy.add(removedNodes);
    cy.nodes().updateCompoundBounds();
    refreshPaddings();
//    removedNodes.restore();
  }
};
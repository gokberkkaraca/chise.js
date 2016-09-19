var generalActionFunctions = {
  getNodePositionsAndSizes: function () {
    var positionsAndSizes = {};
    var nodes = cy.nodes();

    for (var i = 0; i < nodes.length; i++) {
      var ele = nodes[i];
      positionsAndSizes[ele.id()] = {
        width: ele.width(),
        height: ele.height(),
        x: ele.position("x"),
        y: ele.position("y")
      };
    }

    return positionsAndSizes;
  },
  returnToPositionsAndSizesConditionally: function (nodesData) {
    if (nodesData.firstTime) {
      delete nodesData.firstTime;
      return nodesData;
    }
    return this.returnToPositionsAndSizes(nodesData);
  },
  returnToPositionsAndSizes: function (nodesData) {
    var currentPositionsAndSizes = {};
    cy.nodes().positions(function (i, ele) {
      currentPositionsAndSizes[ele.id()] = {
        width: ele.width(),
        height: ele.height(),
        x: ele.position("x"),
        y: ele.position("y")
      };
      var data = nodesData[ele.id()];
      ele._private.data.width = data.width;
      ele._private.data.height = data.height;
      return {
        x: data.x,
        y: data.y
      };
    });

    return currentPositionsAndSizes;
  },
  resizeNode: function (param) {
    var result = {
      performOperation: true
    };

    var nodes = param.nodes;

    result.sizeMap = {};
    result.useAspectRatio = false;

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      result.sizeMap[node.id()] = {
        w: node.width(),
        h: node.height()
      };
    }

    result.nodes = nodes;

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (param.performOperation) {
        if (param.sizeMap) {
          node.data("width", param.sizeMap[node.id()].w);
          node.data("height", param.sizeMap[node.id()].h);
        }
        else {
          var ratio = undefined;
          var eleMustBeSquare = mustBeSquare(node.data('sbgnclass'));

          // Note that both param.width and param.height cannot be truthy
          if (param.width) {
            if (param.useAspectRatio || eleMustBeSquare) {
              ratio = param.width / node.width();
            }

            node.data("width", param.width);
          }
          else if (param.height) {
            if (param.useAspectRatio || eleMustBeSquare) {
              ratio = param.height / node.height();
            }

            node.data("height", param.height);
          }

          if (ratio && !param.height) {
            node.data("height", node.height() * ratio);
          }
          else if (ratio && !param.width) {
            node.data("width", node.width() * ratio);
          }
        }
      }

      node._private.data.sbgnbbox.w = node.data('width') || node.width();
      node._private.data.sbgnbbox.h = node.data('height') || node.height();

      node.removeClass('noderesized');
      node.addClass('noderesized');
    }

    nodes.removeClass('noderesized');
    nodes.addClass('noderesized');

    if (_.isEqual(nodes, cy.nodes(':selected'))) {
      inspectorUtilities.handleSBGNInspector();
    }

    return result;
  },
  changeNodeLabel: function (param) {
    var result = {
    };
    var nodes = param.nodes;
    result.nodes = nodes;
    result.sbgnlabel = {};

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      result.sbgnlabel[node.id()] = node._private.data.sbgnlabel;
    }

    if (param.firstTime) {
      nodes.data('sbgnlabel', param.sbgnlabel);
    }
    else {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node._private.data.sbgnlabel = param.sbgnlabel[node.id()];
      }
    }

    nodes.removeClass('changeContent');
    nodes.addClass('changeContent');

    if (_.isEqual(nodes, cy.nodes(':selected'))) {
      inspectorUtilities.handleSBGNInspector();
    }

    return result;
  },
  changeStyleData: function (param) {
    var result = {
    };
    var eles = param.eles;

    result.dataType = param.dataType;
    result.data = {};
    result.eles = eles;

    for (var i = 0; i < eles.length; i++) {
      var ele = eles[i];
      result.data[ele.id()] = ele.data(param.dataType);
    }

    if (param.firstTime) {
      eles.data(param.dataType, param.data);
    }
    else {
      for (var i = 0; i < eles.length; i++) {
        var ele = eles[i];
        ele.data(param.dataType, param.data[ele.id()]);
      }
    }

    cy.forceRender();

    if (_.isEqual(eles, cy.nodes(':selected'))) {
      inspectorUtilities.handleSBGNInspector();
    }

    return result;
  },
  changeStyleCss: function (param) {
    var result = {
    };
    var eles = param.eles;
    result.dataType = param.dataType;
    result.data = {};
    result.eles = eles;

    for (var i = 0; i < eles.length; i++) {
      var ele = eles[i];
      result.data[ele.id()] = ele.css(param.dataType);
    }

    if (param.firstTime) {
      eles.css(param.dataType, param.data);
    }
    else {
      for (var i = 0; i < eles.length; i++) {
        var ele = eles[i];
        ele.css(param.dataType, param.data[ele.id()]);
      }
    }
    cy.forceRender();

    if (_.isEqual(eles, cy.nodes(':selected'))) {
      inspectorUtilities.handleSBGNInspector();
    }

    return result;
  },
  changeFontProperties: function(param) {
    var result = {
    };
    
    var eles = param.eles;
    result.data = {};
    result.eles = eles;
    
    for (var i = 0; i < eles.length; i++) {
      var ele = eles[i];
      result.data[ele.id()] = {
        labelsize: ele.data('labelsize'),
        fontfamily: ele.data('fontfamily'),
        fontweight: ele.data('fontweight'),
        fontstyle: ele.data('fontstyle')
      };
    }

    if (param.firstTime) {
      eles.data('labelsize', param.data['labelsize']);
      eles.data('fontfamily', param.data['fontfamily']);
      eles.data('fontweight', param.data['fontweight']);
      eles.data('fontstyle', param.data['fontstyle']);
    }
    else {
      for (var i = 0; i < eles.length; i++) {
        var ele = eles[i];
        ele.data('labelsize', param.data[ele.id()]['labelsize']);
        ele.data('fontfamily', param.data[ele.id()]['fontfamily']);
        ele.data('fontweight', param.data[ele.id()]['fontweight']);
        ele.data('fontstyle', param.data[ele.id()]['fontstyle']);
      }
    }
    
    return result;
  }
};
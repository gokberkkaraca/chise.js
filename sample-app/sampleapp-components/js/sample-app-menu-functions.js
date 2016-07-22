var setFileContent = function (fileName) {
  var span = document.getElementById('file-name');
  while (span.firstChild) {
    span.removeChild(span.firstChild);
  }
  span.appendChild(document.createTextNode(fileName));
};

var startSpinner = function(id) {
    
      if($('.' + id).length === 0){
        var containerWidth = $('#sbgn-network-container').width();
        var containerHeight = $('#sbgn-network-container').height();
        $('#sbgn-network-container:parent').prepend('<i style="position: absolute; z-index: 9999999; left: ' + containerWidth / 2 + 'px; top: ' + containerHeight / 2 + 'px;" class="fa fa-spinner fa-spin fa-3x fa-fw layout-spinner"></i>');
      }
};
var endSpinner = function(id) {
    if ($('.' + id).length > 0) {
        $('.' + id).remove();
    }
};

var loadSample = function(filename, callback){
  startSpinner("load-spinner");
  loadXMLDoc('samples/' + filename, function(res){

    setFileContent(filename.replace('xml', 'sbgnml'));

    (new SBGNContainer({
      el: '#sbgn-network-container',
      model: {cytoscapeJsGraph: sbgnmlToJson.convert(res)}
    })).render();
    
    inspectorUtilities.handleSBGNInspector();

    if(callback)
        callback();
    
    endSpinner("load-spinner");
    
    resetUndoRedoButtons();
    modeHandler.setSelectionMode();
    inspectorUtilities.handleSBGNInspector();
  });
};

var loadSBGNMLText = function(text){

  (new SBGNContainer({
    el: '#sbgn-network-container',
    model: {cytoscapeJsGraph:
              sbgnmlToJson.convert(textToXmlObject(text))}
  })).render();

  resetUndoRedoButtons();
  modeHandler.setSelectionMode();
  inspectorUtilities.handleSBGNInspector();
};

var loadSBGNMLFile = function(file) {
  startSpinner("load-file-spinner");

  $("#load-file-spinner").ready(function() {
    var textType = /text.*/;

    var reader = new FileReader();

    reader.onload = function (e) {
      loadSBGNMLText(this.result);
    };
    reader.readAsText(file);
    setFileContent(file.name);
  });
};

var beforePerformLayout = function(){
  var nodes = cy.nodes();
  var edges = cy.edges();
  
  nodes.removeData("ports");
  edges.removeData("portsource");
  edges.removeData("porttarget");

  nodes.data("ports", []);
  edges.data("portsource", []);
  edges.data("porttarget", []);

  // TODO do this by using extension API
  cy.$('.edgebendediting-hasbendpoints').removeClass('edgebendediting-hasbendpoints');
  edges.scratch('cyedgebendeditingWeights', []);
  edges.scratch('cyedgebendeditingDistances', []);
};

//A function to trigger incremental layout. Its definition is inside document.ready()
var triggerIncrementalLayout;

var getExpandCollapseOptions = function() {
  return {
    fisheye: function(){
      return sbgnStyleRules['rearrange-after-expand-collapse'];
    },
    animate: function(){
      return sbgnStyleRules['animate-on-drawing-changes'];
    }
  };
};


$(document).ready(function () {
  loadSample('neuronal_muscle_signalling.xml', function() {
      
    //Handle keyboard events
    $(document).keydown(function (e) {
      if (e.ctrlKey && e.target.nodeName === 'BODY') {
        window.ctrlKeyDown = true;
        if (e.which === 90) { // ctrl + z
          cy.undoRedo().undo();
        }
        else if (e.which === 89) { // ctrl + y
          cy.undoRedo().redo();
        }
      }
    });

    $(document).keyup(function (e) {
      window.ctrlKeyDown = null;
    //  $("#sbgn-network-container").removeClass("target-cursor");
      disableDragAndDropMode();
    });

    $("#node-label-textbox").keydown(function (e) {
      if (e.which === 13) {
        $("#node-label-textbox").blur();
      }
    });
    
    $('#new-file-icon').click(function (e) {
      $('#new-file').trigger("click");
    });

    $('#new-file').click(function (e) {
      setFileContent("new_file.sbgnml");

      (new SBGNContainer({
        el: '#sbgn-network-container',
        model: {
          cytoscapeJsGraph: {
            nodes: [],
            edges: []
          }
        }
      })).render();

      resetUndoRedoButtons();
      modeHandler.setSelectionMode();
      inspectorUtilities.handleSBGNInspector();
    });

    $('.add-node-menu-item').click(function (e) {
      if (!modeHandler.mode != "add-node-mode") {
        modeHandler.setAddNodeMode();
      }
      var value = $(this).attr('name');
      modeHandler.selectedNodeType = value;
      modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
      modeHandler.setSelectedMenuItem("add-node-mode", value);
    });

    $('.add-edge-menu-item').click(function (e) {
      if (!modeHandler.mode != "add-edge-mode") {
        modeHandler.setAddEdgeMode();
      }
      var value = $(this).attr('name');
      modeHandler.selectedEdgeType = value;
      modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
      modeHandler.setSelectedMenuItem("add-edge-mode", value);
    });

    modeHandler.initilize();

    $('.sbgn-select-node-item').click(function (e) {
      if (!modeHandler.mode != "add-node-mode") {
        modeHandler.setAddNodeMode();
      }
      var value = $('img', this).attr('value');
      modeHandler.selectedNodeType = value;
      modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
      modeHandler.setSelectedMenuItem("add-node-mode", value);
    });

    $('.sbgn-select-edge-item').click(function (e) {
      if (!modeHandler.mode != "add-edge-mode") {
        modeHandler.setAddEdgeMode();
      }
      var value = $('img', this).attr('value');
      modeHandler.selectedEdgeType = value;
      modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
      modeHandler.setSelectedMenuItem("add-edge-mode", value);
    });

    $('#node-list-set-mode-btn').click(function (e) {
      if (modeHandler.mode != "add-node-mode") {
        modeHandler.setAddNodeMode();
      }
      else {
        modeHandler.sustainMode = !modeHandler.sustainMode;
        $('#node-list').toggleClass('selectedTypeSustainable');
      }
    });

    $('#edge-list-set-mode-btn').click(function (e) {
      if (modeHandler.mode != "add-edge-mode") {
        modeHandler.setAddEdgeMode();
      }
      else {
        modeHandler.sustainMode = !modeHandler.sustainMode;
        $('#edge-list').toggleClass('selectedTypeSustainable');
      }
    });

    $('#select-icon').click(function (e) {
      modeHandler.setSelectionMode();
    });

    $('#select-edit').click(function (e) {
      modeHandler.setSelectionMode();
    });

    $('#clone-selected').click(function (e) {
      var selectedNodes = cy.nodes(':selected');
      var cb = cy.clipboard();
      var _id = cb.copy(selectedNodes, "cloneOperation");
      cy.undoRedo().do("paste", { id: _id });
    });

    function getFirstSelectedNode() {
      return window.firstSelectedNode ? window.firstSelectedNode : cy.nodes(":selected")[0];
    }

    $('#align-horizontal-top').click(function (e) {
      cy.undoRedo().do("align", {
        nodes: cy.nodes(":selected"),
        horizontal: "top",
        alignTo: getFirstSelectedNode()
      });
    });

    $("#align-horizontal-top-icon").click(function (e) {
      $("#align-horizontal-top").trigger('click');
    });

    $('#align-horizontal-middle').click(function (e) {
      cy.undoRedo().do("align", {
        nodes: cy.nodes(":selected"),
        horizontal: "center",
        alignTo: getFirstSelectedNode()
      });
    });

    $("#align-horizontal-middle-icon").click(function (e) {
      $("#align-horizontal-middle").trigger('click');
    });

    $('#align-horizontal-bottom').click(function (e) {
      cy.undoRedo().do("align", {
        nodes: cy.nodes(":selected"),
        horizontal: "bottom",
        alignTo: getFirstSelectedNode()
      });
    });

    $("#align-horizontal-bottom-icon").click(function (e) {
      $("#align-horizontal-bottom").trigger('click');
    });

    $('#align-vertical-left').click(function (e) {
      cy.undoRedo().do("align", {
        nodes: cy.nodes(":selected"),
        vertical: "left",
        alignTo: getFirstSelectedNode()
      });
    });

    $("#align-vertical-left-icon").click(function (e) {
      $("#align-vertical-left").trigger('click');
    });

    $('#align-vertical-center').click(function (e) {
      cy.undoRedo().do("align", {
        nodes: cy.nodes(":selected"),
        vertical: "center",
        alignTo: getFirstSelectedNode()
      });
    });

    $("#align-vertical-center-icon").click(function (e) {
      $("#align-vertical-center").trigger('click');
    });

    $('#align-vertical-right').click(function (e) {
      cy.undoRedo().do("align", {
        nodes: cy.nodes(":selected"),
        vertical: "right",
        alignTo: getFirstSelectedNode()
      });
    });

    $("#align-vertical-right-icon").click(function (e) {
      $("#align-vertical-right").trigger('click');
    });

    var sbgnLayoutProp = new SBGNLayout({
      el: '#sbgn-layout-table'
    });

    var sbgnProperties = new SBGNProperties({
      el: '#sbgn-properties-table'
    });

    var gridProperties = new GridProperties({
      el: '#grid-properties-table'
    });

    var pathsBetweenQuery = new PathsBetweenQuery({
      el: '#query-pathsbetween-table'
    });

    var reactionTemplate = new ReactionTemplate({
      el: '#reaction-template-table'
    });

    triggerIncrementalLayout = function(){
      if(!sbgnStyleRules['rearrange-after-expand-collapse']) {
        return;
      }
      beforePerformLayout();

      var preferences = {
        randomize: false,
        animate: sbgnStyleRules['animate-on-drawing-changes']?'end':false,
        fit: false
      };

      if(sbgnLayoutProp.currentLayoutProperties.animate === 'during'){
        delete preferences.animate;
      }

      sbgnLayoutProp.applyLayout(preferences, false); // layout must not be undoable
    };

    // set layoutBy option of expand collapse extension
    cy.setExpandCollapseOption('layoutBy', triggerIncrementalLayout);

    $("body").on("change", "#file-input", function (e) {
      if ($("#file-input").val() == "") {
        return;
      }

      var fileInput = document.getElementById('file-input');
      var file = fileInput.files[0];

      loadSBGNMLFile(file);

      $("#file-input").val("");
    });

    $("#node-legend").click(function (e) {
      e.preventDefault();
      $.fancybox(
              _.template($("#node-legend-template").html(), {}),
              {
                'autoDimensions': false,
                'width': 504,
                'height': 325,
                'transitionIn': 'none',
                'transitionOut': 'none',
              });
    });

    $("#node-label-textbox").blur(function () {
      $("#node-label-textbox").hide();
      $("#node-label-textbox").data('node', undefined);
    });

    $("#node-label-textbox").on('change', function () {
      var node = $(this).data('node');
      var param = {
        nodes: cy.collection(node),
        sbgnlabel: $(this).attr('value'),
        firstTime: true
      };

      cy.undoRedo().do("changeNodeLabel", param);
    });

    $("#edge-legend").click(function (e) {
      e.preventDefault();
      $.fancybox(
              _.template($("#edge-legend-template").html(), {}),
              {
                'autoDimensions': false,
                'width': 325,
                'height': 285,
                'transitionIn': 'none',
                'transitionOut': 'none',
              });
    });

    $("#quick-help").click(function (e) {
      e.preventDefault();
      $.fancybox(
              _.template($("#quick-help-template").html(), {}),
              {
                'autoDimensions': false,
                'width': 420,
                'height': "auto",
                'transitionIn': 'none',
                'transitionOut': 'none'
              });
    });

    $("#how-to-use").click(function (e) {
      var url = "http://www.cs.bilkent.edu.tr/~ivis/sbgnviz-js/SBGNViz.js-1.x.UG.pdf";
      var win = window.open(url, '_blank');
      win.focus();
    });

    $("#about").click(function (e) {
      e.preventDefault();
      $.fancybox(
              _.template($("#about-template").html(), {}),
              {
                'autoDimensions': false,
                'width': 300,
                'height': 250,
                'transitionIn': 'none',
                'transitionOut': 'none',
              });
    });

    $("#load-sample1").click(function (e) {
      loadSample('neuronal_muscle_signalling.xml');
    });

    $("#load-sample2").click(function (e) {
      loadSample('CaM-CaMK_dependent_signaling_to_the_nucleus.xml');
    });

    $("#load-sample3").click(function (e) {
      loadSample('activated_stat1alpha_induction_of_the_irf1_gene.xml');
    });

    $("#load-sample4").click(function (e) {
      loadSample('glycolysis.xml');
    });

    $("#load-sample5").click(function (e) {
      loadSample('mapk_cascade.xml');
    });

    $("#load-sample6").click(function (e) {
      loadSample('polyq_proteins_interference.xml');
    });

    $("#load-sample7").click(function (e) {
      loadSample('insulin-like_growth_factor_signaling.xml');
    });

    $("#load-sample8").click(function (e) {
      loadSample('atm_mediated_phosphorylation_of_repair_proteins.xml');
    });

    $("#load-sample9").click(function (e) {
      loadSample('vitamins_b6_activation_to_pyridoxal_phosphate.xml');
    });

    $("#hide-selected").click(function (e) {
      var selectedEles = cy.$(":selected");

      if(selectedEles.length === 0){
        return;
      }

      cy.undoRedo().do("hide", selectedEles);

  //    var param = {};
  //    
  //    cy.undoRedo().do("hideSelected", param);
    });

    $("#hide-selected-icon").click(function (e) {
      $("#hide-selected").trigger('click');
    });

    $("#show-selected").click(function (e) {
      if(cy.elements(":selected").length === cy.elements(':visible').length) {
        return;
      }

      cy.undoRedo().do("show", cy.elements(":selected"));

  //    var param = {};
  //    
  //    cy.undoRedo().do("showSelected", param);
    });

    $("#show-selected-icon").click(function (e) {
      $("#show-selected").trigger('click');
    });

    $("#show-all").click(function (e) {
      if(cy.elements().length === cy.elements(':visible').length) {
        return;
      }

      cy.undoRedo().do("show", cy.elements());

  //    cy.undoRedo().do("showAll", {});
    });

    $("#delete-selected-smart").click(function (e) {
      if(cy.$(":selected").length == 0){
        return;
      }

      var param = {
        firstTime: true
      };

      cy.undoRedo().do("deleteSelected", param);
    });

    $("#delete-selected-smart-icon").click(function (e) {
      $("#delete-selected-smart").trigger('click');
    });

    $("#neighbors-of-selected").click(function (e) {
      var elesToHighlight = sbgnFiltering.getNeighboursOfSelected();

      if(elesToHighlight.length === 0) {
        return;
      }

      var notHighlightedEles = cy.elements(".nothighlighted").filter(":visible");
      var highlightedEles = cy.elements(':visible').difference(notHighlightedEles);

      if(elesToHighlight.same(highlightedEles)) {
        return;
      }

      cy.undoRedo().do("highlight", elesToHighlight);
    });

    $("#highlight-neighbors-of-selected-icon").click(function (e) {
      $("#neighbors-of-selected").trigger('click');
    });

    $("#search-by-label-icon").click(function (e) {
      var text = $("#search-by-label-text-box").val().toLowerCase();
      if (text.length == 0) {
        return;
      }
      cy.nodes().unselect();

      var nodesToSelect = cy.nodes(":visible").filter(function (i, ele) {
        if (ele.data("sbgnlabel") && ele.data("sbgnlabel").toLowerCase().indexOf(text) >= 0) {
          return true;
        }
        return false;
      });

      if (nodesToSelect.length == 0) {
        return;
      }

      nodesToSelect.select();

      var nodesToHighlight = sbgnFiltering.getProcessesOfSelected();
      cy.undoRedo().do("highlight", nodesToHighlight);
    });

    $("#search-by-label-text-box").keydown(function (e) {
      if (e.which === 13) {
        $("#search-by-label-icon").trigger('click');
      }
    });

    $("#highlight-search-menu-item").click(function (e) {
      $("#search-by-label-text-box").focus();
    });

    $("#processes-of-selected").click(function (e) {
      var elesToHighlight = sbgnFiltering.getProcessesOfSelected();

      if(elesToHighlight.length === 0) {
        return;
      }

      var notHighlightedEles = cy.elements(".nothighlighted").filter(":visible");
      var highlightedEles = cy.elements(':visible').difference(notHighlightedEles);

      if(elesToHighlight.same(highlightedEles)) {
        return;
      }

      cy.undoRedo().do("highlight", elesToHighlight);
    });

    $("#remove-highlights").click(function (e) {

      if (sbgnFiltering.noneIsNotHighlighted()){
        return;
      }

      cy.undoRedo().do("removeHighlights");
    });

    $('#remove-highlights-icon').click(function (e) {
      $('#remove-highlights').trigger("click");
    });

    $("#make-compound-complex").click(function (e) {
      var selected = cy.nodes(":selected").filter(function (i, element) {
        var sbgnclass = element.data("sbgnclass")
        return isEPNClass(sbgnclass);
      });
      selected = sbgnElementUtilities.getTopMostNodes(selected);
      if (selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)) {
        return;
      }
      var param = {
        compundType: "complex",
        nodesToMakeCompound: selected
      };

      cy.undoRedo().do("createCompoundForSelectedNodes", param);
    });

    $("#make-compound-compartment").click(function (e) {
      var selected = cy.nodes(":selected");
      selected = sbgnElementUtilities.getTopMostNodes(selected);
      if (selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)) {
        return;
      }

      var param = {
        compundType: "compartment",
        nodesToMakeCompound: selected
      };

      cy.undoRedo().do("createCompoundForSelectedNodes", param);
    });

    $("#layout-properties").click(function (e) {
      sbgnLayoutProp.render();
    });

    $("#layout-properties-icon").click(function (e) {
      $("#layout-properties").trigger('click');
    });

    $("#delete-selected-simple").click(function (e) {
      var selectedEles = cy.$(":selected");

      if(selectedEles.length == 0){
        return;
      }
      cy.undoRedo().do("removeEles", selectedEles);
    });

    $("#delete-selected-simple-icon").click(function (e) {
      $("#delete-selected-simple").trigger('click');
    });

    $("#sbgn-properties").click(function (e) {
      sbgnProperties.render();
    });
    $("#grid-properties").click(function (e) {
      gridProperties.render();
    });

    $("#query-pathsbetween").click(function (e) {
      pathsBetweenQuery.render();
    });

    $("#create-reaction-template").click(function (e) {
      reactionTemplate.render();
    });

    $("#properties-icon").click(function (e) {
      $("#sbgn-properties").trigger('click');
    });

    $("#collapse-selected").click(function (e) {
      var nodes = cy.nodes(":selected").filter("[expanded-collapsed='expanded']");
      var thereIs = nodes.collapsibleNodes().length > 0;

      if (!thereIs) {
        return;
      }

      cy.undoRedo().do("collapse", {
        nodes: nodes,
  //      options: getExpandCollapseOptions()
      });
    });

    $("#collapse-complexes").click(function (e) {
      var complexes = cy.nodes("[sbgnclass='complex'][expanded-collapsed='expanded']");
      var thereIs = complexes.collapsibleNodes().length > 0;

      if (!thereIs) {
        return;
      }

      cy.undoRedo().do("collapseRecursively", {
        nodes: complexes,
  //      options: getExpandCollapseOptions()
      });
    });

    $("#collapse-selected-icon").click(function (e) {
      if (modeHandler.mode == "selection-mode") {
        $("#collapse-selected").trigger('click');
      }
    });

    $("#expand-selected").click(function (e) {
      var nodes = cy.nodes(":selected").filter("[expanded-collapsed='collapsed']");
      var thereIs = nodes.expandableNodes().length > 0;

      if (!thereIs) {
        return;
      }

      cy.undoRedo().do("expand", {
        nodes: nodes,
  //      options: getExpandCollapseOptions()
      });
    });

    $("#expand-complexes").click(function (e) {
      var nodes = cy.nodes(":selected").filter("[sbgnclass='complex'][expanded-collapsed='collapsed']");
      var thereIs = nodes.expandableNodes().length > 0;

      if (!thereIs) {
        return;
      }

      cy.undoRedo().do("expandRecursively", {
        nodes: nodes,
  //      options: getExpandCollapseOptions()
      });
    });

    $("#expand-selected-icon").click(function (e) {
      if (modeHandler.mode == "selection-mode") {
        $("#expand-selected").trigger('click');
      }
    });

    $("#collapse-all").click(function (e) {
      var nodes = cy.nodes(':visible').filter("[expanded-collapsed='expanded']");
      var thereIs = nodes.collapsibleNodes().length > 0;

      if (!thereIs) {
        return;
      }

      cy.undoRedo().do("collapseRecursively", {
        nodes: nodes,
  //      options: getExpandCollapseOptions()
      });
    });

    $("#expand-all").click(function (e) {
      var nodes = cy.nodes(':visible').filter("[expanded-collapsed='collapsed']");
      var thereIs = nodes.expandableNodes().length > 0;

      if (!thereIs) {
        return;
      }

      cy.undoRedo().do("expandRecursively", {
        nodes: nodes,
  //      options: getExpandCollapseOptions()
      });
    });

    $("#perform-layout-icon").click(function (e) {
      if (modeHandler.mode == "selection-mode") {
        $("#perform-layout").trigger('click');
      }
    });

    $("#perform-layout").click(function (e) {
      var nodesData = getNodesData();
      startSpinner("layout-spinner");

      beforePerformLayout();
      var preferences = {
        animate: sbgnStyleRules['animate-on-drawing-changes']?'end':false
      };

      if(sbgnLayoutProp.currentLayoutProperties.animate == 'during'){
        delete preferences.animate;
      }

      sbgnLayoutProp.applyLayout(preferences);

      nodesData.firstTime = true;
    });

    $("#undo-last-action").click(function (e) {
      cy.undoRedo().undo();
    });

    $("#redo-last-action").click(function (e) {
      cy.undoRedo().redo();
    });

    $("#undo-icon").click(function (e) {
      $("#undo-last-action").trigger('click');
    });

    $("#redo-icon").click(function (e) {
      $("#redo-last-action").trigger('click');
    });

    $("#save-as-png").click(function (evt) {
      var pngContent = cy.png({scale: 3, full: true});

      // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
      function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);

          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          var byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
      }

      // this is to remove the beginning of the pngContent: data:img/png;base64,
      var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

      saveAs(b64toBlob(b64data, "image/png"), "network.png");

      //window.open(pngContent, "_blank");
    });

    $("#save-as-jpg").click(function (evt) {
      var pngContent = cy.jpg({scale: 3, full: true});

      // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
      function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);

          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          var byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
      }

      // this is to remove the beginning of the pngContent: data:img/png;base64,
      var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

      saveAs(b64toBlob(b64data, "image/jpg"), "network.jpg");
    });

    $("#load-file").click(function (evt) {
      $("#file-input").trigger('click');
    });

    $("#load-file-icon").click(function (evt) {
      $("#load-file").trigger('click');
    });

    $("#save-as-sbgnml").click(function (evt) {
      var sbgnmlText = jsonToSbgnml.createSbgnml();

      var blob = new Blob([sbgnmlText], {
        type: "text/plain;charset=utf-8;",
      });
      var filename = document.getElementById('file-name').innerHTML;
      saveAs(blob, filename);
    });

    $("#save-icon").click(function (evt) {
      $("#save-as-sbgnml").trigger('click');
    });

    $("body").on("click", ".biogene-info .expandable", function (evt) {
      var expanderOpts = {slicePoint: 150,
        expandPrefix: ' ',
        expandText: ' (...)',
        userCollapseText: ' (show less)',
        moreClass: 'expander-read-more',
        lessClass: 'expander-read-less',
        detailClass: 'expander-details',
        expandEffect: 'fadeIn',
        collapseEffect: 'fadeOut'
      };

      $(".biogene-info .expandable").expander(expanderOpts);
      expanderOpts.slicePoint = 2;
      expanderOpts.widow = 0;
    });
  });
});
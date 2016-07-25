(function () {
    var container = document.querySelector("#sbgn-network-container");
    var mt = new Mousetrap();

    mt.bind(["ctrl+z", "command+z"], function () {
        cy.undoRedo().undo();
    });
    mt.bind(["ctrl+y", "command+y"], function () {
        cy.undoRedo().redo();
    });
    mt.bind(["ctrl+c", "command+c"], function () {
        cy.clipboard().copy(cy.$(":selected"));
    });
    mt.bind(["ctrl+v", "command+v"], function () {
        cy.undoRedo().do("paste");
    });
    mt.bind(["ctrl+a", "command+a"], function () {
        cy.elements().select();
        return false;
    });
})();
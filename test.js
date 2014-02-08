function assert(condition, description) {
    if(condition) console.log("%cTest passed: %s", "color: green;", description);
    else          console.error("%cTest failed: %s", "color: red;", description);
}

// The 8 tetracubes.
// The term "tetracube" is similar to the tetraminos of tetris --
// those are tetrasquares, and there are 7 of them (IJLOSTZ)
var tetracubes = {
    I:      [{x:-1,y: 0,z: 0},{x: 0,y: 0,z: 0},{x: 1,y: 0,z: 0},{x: 2,y: 0,z: 0}],
    O:      [{x: 0,y: 0,z: 0},{x: 1,y: 0,z: 0},{x: 0,y: 1,z: 0},{x: 1,y: 1,z: 0}],
    L:      [{x:-1,y: 0,z: 0},{x: 0,y: 0,z: 0},{x: 1,y: 0,z: 0},{x: 1,y: 1,z: 0}],
    T:      [{x:-1,y: 0,z: 0},{x: 0,y: 0,z: 0},{x: 1,y: 0,z: 0},{x: 0,y: 1,z: 0}],
    N:      [{x:-1,y: 0,z: 0},{x: 0,y: 0,z: 0},{x: 0,y: 1,z: 0},{x: 1,y: 1,z: 0}],
    TowerL: [{x: 0,y: 0,z: 0},{x:-1,y: 0,z: 0},{x: 0,y: 1,z: 0},{x:-1,y: 0,z: 1}],
    TowerR: [{x: 0,y: 0,z: 0},{x: 1,y: 0,z: 0},{x: 0,y: 1,z: 0},{x: 1,y: 0,z: 1}],
    Tripod: [{x: 0,y: 0,z: 0},{x: 1,y: 0,z: 0},{x: 0,y: 1,z: 0},{x: 0,y: 0,z: 1}],
};
var cube2 = new Block([
        {x:0,y:0,z:0},{x:0,y:0,z:1},{x:0,y:1,z:0},{x:0,y:1,z:1},
        {x:1,y:0,z:0},{x:1,y:0,z:1},{x:1,y:1,z:0},{x:1,y:1,z:1}
]);

var O = new Block(tetracubes.O);
var cube1 = new Block([{x: 0, y: 0, z: 0}]);
var O2 = new Block(tetracubes.O);
var TP = new Block(tetracubes.Tripod);
var TP2 = cube2.minus(TP); // A 2 x 2 x 2 cube can be mode from 2 tripods
console.group("Tests");
assert(O.sameAs(O2), "One O block is the same as another O block");
assert(!O.sameAs(TP), "An O block and a tripod are not the same");
O2.translate(0, 0, 1);
assert(!O.sameAs(O2), "A block is not the same as itself, shifted.");
assert(O.plus(O2).sameAs(O2.plus(O)), "Addition of blocks is commutative");
assert(O.plus(O2).sameAs(cube2), "Two O tetracubes offset make a cube");
assert(cube2.minus(TP).plus(TP).sameAs(cube2), "A - B + B = A");
assert(O.plus(O2).minus(O2).sameAs(O), "A + B - B = A");
assert(O.allPositionsInside(O).length == 1, "O block can only fit inside O block one way.");
assert(O.allPositionsInside(O2).length == 1, "O block can fit inside offset O block one way.");
assert(O.allPositionsInside(TP).length == 0, "O block can't fit in tripod");
assert(TP2.allPositionsInside(TP).length == 1, 
        "allPositionsInside handles rotation and translation");
assert(TP2.congruentTo(TP), "Rotated translated tripod congruent to regular tripod");
assert(cube2.waysToMakeFrom([]).length == 0, "You can't make something from nothing");
assert(cube2.waysToMakeFrom([cube2]).length == 1, "You can make a block from itself");
assert(cube2.waysToMakeFrom([O2]).length == 0, "You can't make a block from a smaller block.");
assert(cube2.waysToMakeFrom([O, O2]).length == 3, 
        "You can make a 2x2x2 cube from 2 2x2 squares in 3 ways.");
assert(cube2.waysToMakeFrom([O, O]).length > 0, "It doesn't matter if the squares are the same.");
assert(cube2.waysToMakeFrom([TP, TP]).length > 0, "Tripods also work");
assert(cube2.waysToMakeFrom([TP, O]).length == 0, "Tripod and square doesn't");
assert(cube2.waysToMakeFrom([TP, TP, O]).length > 0, "Add another tripod and it does");
assert(cube2.waysToMakeFromAllOf([TP, TP, O]).length == 0, 
        "There is no way to make a 2x2x2 cube using *all of* 2 tripods and a square");
assert(cube2.waysToMakeFromAllOf([TP, TP]).length > 0, "But take out the square and you can.");
window.onload = function() {
    new Block(tetracubes.I).render(500);
    new Block(tetracubes.O).render(300);
    new Block(tetracubes.L).render(400);
    new Block(tetracubes.T).render(400);
    new Block(tetracubes.N).render(400);
    new Block(tetracubes.TowerL).render(300);
    new Block(tetracubes.TowerR).render(300);
    new Block(tetracubes.Tripod).render(300);
    assert(confirm("Do you see 8 unique shapes?"), "Rendering works properly");
}
console.groupEnd();

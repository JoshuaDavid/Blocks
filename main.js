function Block(cubes) {
    this.cubes = [];
    if(cubes) {
        for(var i = 0; i < cubes.length; i++) {
            var cube = cubes[i];
            if(isFinite(cube.x) &&isFinite(cube.y) &&isFinite(cube.z)) {
                this.cubes.push({x: cube.x, y: cube.y, z: cube.z});
            }
        }
    }
};
Block.prototype.copy = function() {
    return new Block(this.cubes);
}
/**
 * A utility method for future rendering. Sorts the
 * cubes back (-Z) to front (+Z), then bottom (+Y (??)) to top,
 * then left (-X) to right
 */
Block.prototype.sort = function() {
    this.cubes.sort(function(cube1, cube2) {
        if(cube1.x > cube2.x) return  1;
        if(cube1.x < cube2.x) return -1;
        if(cube1.y < cube2.y) return  1;
        if(cube1.y > cube2.y) return -1;
        if(cube1.z > cube2.z) return  1;
        if(cube1.z < cube2.z) return -1;
        return 0;
    });
}
/**
 * A hash of the positions of cubes. Makes it easy to compare
 * two shapes and see which blocks they share.
 */
Block.prototype.hashOfCubes = function() {
    var hash = {};
    for(var i = 0; i < this.cubes.length; i++) {
        var cube = this.cubes[i];
        var key = JSON.stringify(cube);
        hash[key] = 1;
    }
    return hash;
}
Block.prototype.hash = function() {
    this.sort();
    return JSON.stringify(this.hashOfCubes());
}
Block.prototype.toString = function() {
    var bounds = this.getBoundingbox();
    var slices = ""
        for(var z = bounds.z_min; z <= bounds.z_max; z++) {
            var slice = "Z: " + z + "\n";
            for(var y = bounds.y_min; y <= bounds.y_max; y++) {
                var row = "";
                for(var x = bounds.x_min; x <= bounds.x_max; x++) {
                    var cubeHere = false;
                    for(var i = 0; i < this.cubes.length; i++) {
                        var cube = this.cubes[i];
                        if(x == cube.x && y == cube.y && z == cube.z) {
                            cubeHere = true;
                        }
                    }
                    if(cubeHere) row += "[]";
                    else         row += "  ";
                }
                slice += row + "\n";
            }
            slices += slice + "\n\n";
        }
    return slices;
}
/**
 * Translate the box -- add x to the x coordinate, y to the y coordinate, and 
 * z to the z coordinate of all cubes in this shape.
 */
Block.prototype.translate = function(x, y, z) {
    for(var i = 0; i < this.cubes.length; i++) {
        var cube = this.cubes[i];
        cube.x += x;
        cube.y += y;
        cube.z += z;
    }
    return this;
}
/**
/* Rotate the cubes on the XY plane about the Z axis
 * Each tick is a 90 degree rotation
 * If x is right, y is up, and z is away from us, the ticks
 * are clockwise. (I.E. the clicks are clockwise viewed from +Z)
 */
Block.prototype.rotateXY = function(ticks) {
    for(var tick = 0; tick < (ticks + 4) % 4; tick++) {
        for(var i = 0; i < this.cubes.length; i++) {
            var cube = this.cubes[i];
            this.cubes[i] = {x: cube.y, y: -cube.x, z: cube.z};
        }
    }
    return this;
}
/**
/* Rotate the cubes on the XZ plane about the Y axis
 * Each tick is a 90 degree rotation
 * Ticks are clockwise when viewed from +Y
 */
Block.prototype.rotateXZ = function(ticks) {
    for(var tick = 0; tick < (ticks + 4) % 4; tick++) {
        for(var i = 0; i < this.cubes.length; i++) {
            var cube = this.cubes[i];
            this.cubes[i] = {x: cube.z, y: cube.y, z: -cube.x};
        }
    }
    return this;
}
/**
/* Rotate the cubes on the YZ plane about the X axis
 * Each tick is a 90 degree rotation
 * Ticks are clockwise when viewed from +X
 */
Block.prototype.rotateYZ = function(ticks) {
    for(var tick = 0; tick < (ticks + 4) % 4; tick++) {
        for(var i = 0; i < this.cubes.length; i++) {
            var cube = this.cubes[i];
            this.cubes[i] = {x: cube.x, y: -cube.z, z: cube.y};
        }
    }
    return this;
}
/**
 * The bounding box of the cube, i.e a box with x_min = the minimum
 * x coordinate of the box, y_max being the maximum y coordinate, etc.
 */
Block.prototype.getBoundingbox = function() {
    var x_min =  Infinity, x_max = -Infinity;
    var y_min =  Infinity, y_max = -Infinity;
    var z_min =  Infinity, z_max = -Infinity;
    for(var i = 0; i < this.cubes.length; i++) {
        var cube = this.cubes[i];
        if(cube.x < x_min) x_min = cube.x;
        if(cube.x > x_max) x_max = cube.x;
        if(cube.y < y_min) y_min = cube.y;
        if(cube.y > y_max) y_max = cube.y;
        if(cube.z < z_min) z_min = cube.z;
        if(cube.z > z_max) z_max = cube.z;
    }
    return {
        x_min: x_min,
            x_max: x_max,
            y_min: y_min,
            y_max: y_max,
            z_min: z_min,
            z_max: z_max
    };
}
/**
 * Return the cubes that are in this block, but not the block
 * that was passed in.
 * Throw an error if the innerBlock is not inside this block.
 */
Block.prototype.minus = function(innerBlock) {
    if(!innerBlock.isInside(this)) {
        throw new Error("Attempted to call minus on a block that does not fully overlap");
    }
    var innerHash = innerBlock.hashOfCubes();
    var myHash    = this.hashOfCubes();
    var diff = [];
    for(var key in myHash) {
        if(!(key in innerHash)) {
            diff.push(JSON.parse(key));
        }
    }
    return new Block(diff);
}
/**
 * Return the cubes that are in this block and the cubes
 * that were in the other block.
 * Throw an error if there is an overlap between otherBlock
 * and this block.
 */
Block.prototype.plus = function(otherBlock) {
    if(!otherBlock.isOutside(this)) {
        throw new Error("Attempted to call plus on a block that overlaps");
    }
    var otherHash = otherBlock.hashOfCubes();
    var myHash    = this.hashOfCubes();
    var sum = [];
    for(var key in myHash) {
        sum.push(JSON.parse(key));
    }
    for(var key in otherHash) {
        sum.push(JSON.parse(key));
    }
    return new Block(sum);
}
/**
 * Are these blocks the same? No rotation or translation.
 */
Block.prototype.sameAs = function(other) {
    if(!other.isInside(this)) {
        return false;
    }
    return this.minus(other).cubes.length == 0;
}
/**
 * Are these blocks congruent? Allows translation and rotation.
 */
Block.prototype.congruentTo = function(other) {
    if(this.cubes.length !== other.cubes.length) return false;
    else return this.allPositionsInside(other).length == 1;
}
/**
 * Test whether blocks are entirely inside or entirely outside of one another.
 */
Block.prototype.isInside = function(outerBlock) {
    var outerHash = outerBlock.hashOfCubes();
    var isIn = true;
    for(var i = 0; i < this.cubes.length; i++) {
        var cube = this.cubes[i];
        var cubeHash = JSON.stringify(cube);
        if(!(cubeHash in outerHash)) {
            isIn = false;
        }
    }
    return isIn;
}
Block.prototype.isOutside = function(otherBlock) {
    var otherHash = otherBlock.hashOfCubes();
    var overlap = false;
    for(var i = 0; i < this.cubes.length; i++) {
        var cube = this.cubes[i];
        var cubeHash = JSON.stringify(cube);
        if((cubeHash in otherHash)) {
            overlap = true;
        }
    }
    return !overlap;
}
/**
 * Returns a list of blocks that are translations or rotations of
 * this block in the outer block. List does not contain duplicates.
 */
Block.prototype.allPositionsInside = function(outerBlock, rotate) {
    if(rotate === undefined) rotate = true;
    var positions = [];
    var copy = this.copy();
    if(rotate) {
        for(var xy = 0; xy <4; xy++) {
            for(var xz = 0; xz <4; xz++) {
                for(var yz = 0; yz <4; yz++) {
                    var newpos = copy.allPositionsInside(outerBlock, false);
                    positions = positions.concat(newpos);
                    copy.rotateYZ(1);
                }
                copy.rotateXZ(1);
            }
            copy.rotateXY(1);
        }
        positions.sort(function(posA, posB) {
            return posA.hash() > posB.hash();
        });
        for(var i = 0; i < positions.length - 1; i++) {
            if(positions[i].hash() == positions[i + 1].hash()) {
                positions[i] = null;
            }
        }
        return positions.filter(function(pos) {return !!pos;});
    }
    var outerBounds = outerBlock.getBoundingbox();
    var myBounds = this.getBoundingbox();
    var off = {};
    off.min_z = outerBounds.z_min - myBounds.z_min;
    off.min_y = outerBounds.y_min - myBounds.y_min;
    off.min_x = outerBounds.x_min - myBounds.x_min;
    off.max_z = outerBounds.z_max - myBounds.z_max;
    off.max_y = outerBounds.y_max - myBounds.y_max;
    off.max_x = outerBounds.x_max - myBounds.x_max;
    for(var z = off.min_z; z <= off.max_z; z++) {
        for(var y = off.min_y; y <= off.max_y; y++) {
            for(var x = off.min_x; x <= off.max_x; x++) {
                copy = this.copy();
                copy.translate(x, y, z);
                if(copy.isInside(outerBlock)) {
                    positions.push(copy);
                }
            }
        }
    }
    return positions;
}
/**
 * List the ways you can make this block from the supplied components.
 */
Block.prototype.waysToMakeFrom = function(components) {
    if(components.length == 0) return [];
    var head = components[0].copy();
    var tail = components.slice(1);
    var solutions = [];
    var headPositions = head.allPositionsInside(this);
    var reprs = {};
    for(var i = 0; i < headPositions.length; i++) {
        var block = headPositions[i];
        if(block.sameAs(this)) solutions.push(block);
        else {
            var rest = this.minus(block);
            var restSolutions = rest.waysToMakeFrom(tail);
            for(var j = 0; j < restSolutions.length; j++) {
                var solution = [block].concat(restSolutions[j]);
                var repr = solution.map(function(block){return block.hash();}).sort().join('');
                if(!reprs[repr]) solutions.push(solution);
                reprs[repr] = 1;
            }
        }
    }
    var unique = [];
    return solutions;
}
/**
 * Same as waysTomakeFrom, but must use *all* components.
 */
Block.prototype.waysToMakeFromAllOf = function(components) {
    var num_cubes = this.cubes.length;
    var num_cubes_in_components = 0;
    for(var i = 0; i < components.length; i++) {
        num_cubes_in_components += components[i].cubes.length;
    }
    if(num_cubes !== num_cubes_in_components) return [];
    else return this.waysToMakeFrom(components);
}
/**
 * Rendering methods -- toImage creates an image of this block, which you can
 * then throw up on a webpage. Not compatible with IE8 or lower. This method is 
 * kind of a beast.
 */
Block.prototype.toImage = function(size) {
    function renderLine(a, b) {
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
        context.closePath();
    }
    function renderPlane(a, b, c, d, color) {
        if(color) context.fillStyle = color;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.lineTo(c.x, c.y);
        context.lineTo(d.x, d.y);
        context.lineTo(a.x, a.y);
        context.closePath();
        context.fill();
    }

    function xyzToPixel(xyz) {
        var pixel = {};
        var size = Math.max(height, width);
        var x = (xyz.x - bounds.x_min) / size * canvas.width;
        var y = (xyz.y - bounds.y_min) / size * canvas.height;
        var z = (2 * xyz.z - bounds.z_min - bounds.z_max);
        x -= canvas.width * z * 0.02;
        y += canvas.height * z * 0.01;
        return {x: x, y: y};
    }
    this.sort();
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.height = canvas.width = size;
    var bounds = this.getBoundingbox();
    bounds.x_min -= 1;
    bounds.y_min -= 1;
    bounds.z_min -= 1;
    var width  = bounds.x_max - bounds.x_min + 1;
    var height = bounds.y_max - bounds.y_min + 1;
    var depth  = bounds.z_max - bounds.z_min + 1;
    var fillAmount = 0.9;
    var cubeSize = size / Math.max(width, height) * fillAmount;
    var pointLists = [];
    for(var i = 0; i < this.cubes.length; i++) {
        var cube = this.cubes[i];
        var pixel = xyzToPixel({x: cube.x, y: cube.y, z: cube.z - (2 + fillAmount) / 3});
        var p = [];
        p[0] = {x: pixel.x - cubeSize / 2, y: pixel.y - cubeSize / 2}; // xyz ---
        p[1] = {x: p[0].x + cubeSize, y: p[0].y}                       // xyz +--
        p[2] = {x: p[0].x, y: p[0].y + cubeSize}                       // xyz -+-
        p[3] = {x: p[0].x + cubeSize, y: p[0].y + cubeSize}            // xyz ++-
        pixel = xyzToPixel(cube);
        p[4] = {x: pixel.x - cubeSize / 2, y: pixel.y - cubeSize / 2}; // xyz --+
        p[5] = {x: p[4].x + cubeSize, y: p[4].y}                       // xyz +-+
        p[6] = {x: p[4].x, y: p[4].y + cubeSize}                       // xyz -++
        p[7] = {x: p[4].x + cubeSize, y: p[4].y + cubeSize}            // xyz +++
        pointLists.push(p);
    }
    context.fillStyle = "rgba(0, 0, 0, 0.15)";
    // Draw back, bottom, left, right, top, and front in that order.
    for(var i = 0, p; p = pointLists[i++];) {
        renderPlane(p[0], p[1], p[3], p[2], "#000000");
        renderPlane(p[2], p[3], p[7], p[6], "#0000FF");
        renderPlane(p[0], p[2], p[6], p[4], "#00FF00");
        renderPlane(p[1], p[3], p[7], p[5], "#778877");
        renderPlane(p[0], p[1], p[5], p[4], "#AABBAA");
        renderPlane(p[4], p[5], p[7], p[6], "#CCDDCC");
    }
    var img = document.createElement('img');
    img.src = canvas.toDataURL();
    return img;
}
/**
 * Render the shape if there is a spot to render it, else wait 100ms and try again.
 */
Block.prototype.render = function(size) {
    if(!size) var size = 250;
    if(document && document.body && document.body.appendChild) {
        document.body.appendChild(this.toImage(size));
    } else setTimeout(this.render.bind(this, size), 100);
}

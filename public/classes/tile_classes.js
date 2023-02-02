function find_in_array(input, arr){
    for(let i = 0; i < arr.length; i++){
        if(input === arr[i]){
            return i;
        }
    }
}

var tile_type_map = [0, 'solid', 'liquid', 'entity', 'facing'];
var tile_name_map = [0, 'stone', 'dirt', 'grass', 'player', 'water', 'wood', 'minion', 'crystal base', 'minion log'];
var tile_img_map = [0, [0,0,0,0,0,0],[1,1,1,1,1,1],[3,3,3,3,2,1], [4,5]];
var tile_size = 64; //tile_size should be an int

class ClientTile{ //a solid tile
    constructor(type, name, hp, x, y, z){
        this.type = type;
        this.name = name; //hi
        this.hp = hp;
        this.pos = {x: x, y: y, z: z};

        //west, east, north, south, up, down
        this.neighbors = [0, 0, 0, 0, 0, 0];
        this.imgs = tile_img_map[tile_name_map.indexOf(this.name)];
    }

    assign_neighbors(tile_map){
        if(this.pos.x != 0){ //west
            if(tile_map[this.pos.y][this.pos.x-1][this.pos.z] !== 0){
                this.neighbors[0] = tile_map[this.pos.y][this.pos.x-1][this.pos.z].name;
            }
        }
        if(this.pos.x != tile_map[0].length-1){ //east
            if(tile_map[this.pos.y][this.pos.x+1][this.pos.z] !== 0){
                this.neighbors[1] = tile_map[this.pos.y][this.pos.x+1][this.pos.z].name;
            }
        }
        if(this.pos.y != 0){ //north
            if(tile_map[this.pos.y-1][this.pos.x][this.pos.z] !== 0){
                this.neighbors[2] = tile_map[this.pos.y-1][this.pos.x][this.pos.z].name;
            }
        }
        if(this.pos.y != tile_map.length-1){ //south
            if(tile_map[this.pos.y+1][this.pos.x][this.pos.z] !== 0){
                this.neighbors[3] = tile_map[this.pos.y+1][this.pos.x][this.pos.z].name;
            }
        }
        if(this.pos.z != 0){ //up
            if(tile_map[this.pos.y][this.pos.x][this.pos.z-1] !== 0){
                this.neighbors[4] = tile_map[this.pos.y][this.pos.x][this.pos.z-1].name;
            }
        }
        if(this.pos.z != tile_map[0][0].length-1){ //down
            if(tile_map[this.pos.y][this.pos.x][this.pos.z+1] !== 0){
                this.neighbors[5] = tile_map[this.pos.y][this.pos.x][this.pos.z+1].name;
            }
        }
    }

    toStr(){
        return find_in_array(this.type, tile_type_map) + '.' + find_in_array(this.name, tile_name_map) + '.' + this.hp;
    }
}

class ClientTileEntity extends ClientTile{
    constructor(name, hp, x, y, z){
        super("Entity", name, hp, x, y, z);
        this.facing = 0;
        this.offset = {x: 0, y: 0, z: 0};
        this.m = this.makeModel();
        this.rm = "2D";
    }

    render(){
        layer0.push();
        layer0.translate((this.pos.x + this.offset.x + 0.5)*64, (this.pos.z + this.offset.z - 0.5)*64, (this.pos.y + this.offset.y + 0.5)*64);
        layer0.noStroke();
        layer0.texture(tile_imgs[this.imgs[0]]);
        if(this.rm == "2D"){
            //console.log(cam.eyeX + " " + cam.eyeY + " " + cam.eyeZ);
            let v1 = createVector(cam.eyeX, cam.eyeZ);
            let v2 = createVector(0, 1);
            layer0.rotateY(v1.angleBetween(v2)+0.0);
            if(cam.eyeY-32 < -450-32){
                layer0.texture(tile_imgs[this.imgs[1]]);
                layer0.rotateX(PI/2);
            }
        }
        else{
        
        }
        layer0.model(this.m);
        layer0.pop();

        if(Math.abs(this.offset.x) > 0.01){
            this.offset.x *= 0.9;
        }
        else{
            this.offset.x = 0;
        }

        if(Math.abs(this.offset.y) > 0.01){
            this.offset.y *= 0.9;
        }
        else{
            this.offset.y = 0;
        }
    }

    makeModel(){
        return new p5.Geometry(1,1,
            function(){
                this.vertices = [];
                this.vertices.push(new p5.Vector(-0.5*64, -0.5*64, 0*64));
                this.vertices.push(new p5.Vector(0.5*64, -0.5*64, 0*64));
                this.vertices.push(new p5.Vector(0.5*64, 0.5*64, 0*64));
                this.vertices.push(new p5.Vector(-0.5*64, 0.5*64, 0*64));
                
                this.uvs.push([0.0, 0.0]);
                this.uvs.push([1.0, 0.0]);
                this.uvs.push([1.0, 1.0]);
                this.uvs.push([0.0, 1.0]);
            
                this.faces.push([0,1,2]);
                this.faces.push([2,3,0]);
            }
        )
    }

    move(key){
        if(key == "w"){
            this.pos.y -= 1;
            this.offset.y = 1;
        }
        if(key == "a"){
            this.pos.x -= 1;
            this.offset.x = 1;
        }
        if(key == "s"){
            this.pos.y += 1;
            this.offset.y = -1;
        }
        if(key == "d"){
            this.pos.x += 1;
            this.offset.x = -1;
        }
    }
}
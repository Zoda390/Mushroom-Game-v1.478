function find_in_array(input, arr){
    for(let i = 0; i < arr.length; i++){
        if(input === arr[i]){
            return i;
        }
    }
}

var tile_type_map = [0, 'solid', 'liquid', 'entity', 'facing'];
var tile_name_map = [0, 'stone', 'dirt', 'grass', 'water', 'player', 'wood', 'minion', 'crystal base', 'minion log'];
var tile_img_map = [0, [0,0,0,0,0,0],[1,1,1,1,1,1],[3,3,3,3,2,1]];
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
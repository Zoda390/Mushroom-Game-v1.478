import {ServerItem} from "./item_classes.js"

//a solid tile for server end
export class ServerTile{
    constructor(type, name, hp, x, y, z){
        this.type = type; //int
        this.name = name; //int
        this.hp = hp; //int
        this.pos = {x: x, y: y, z: z};

        //west, east, north, south, up, down
        this.neighbors = [0, 0, 0, 0, 0, 0];
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
        return this.type + '.' + this.name + '.' + this.hp;
    }
}

export class ServerTileEntity extends ServerTile{
    constructor(type, name, hp, team, facing){
        super(type, name, hp);
        this.team = team;
        this.facing = facing; //an int for which direction the entity is facing
        this.move_counter = 0;
        this.walk_wait = 10; //frames before you can walk again
        this.run_wait = 5; //frames before you can run again
        this.id = 0;
        this.inv = [];
    }

    toStr(){
        let invStr = "";
        for(let i = 0; i < this.inv.length; i++){
            invStr += this.inv[i].toStr();
        }
        return this.type + '.' + this.name + '.' + this.hp + '.' + this.id + '.' + this.team + '.' + this.facing + '.' + this.move_counter + '.[' + invStr + ']';
    }
}
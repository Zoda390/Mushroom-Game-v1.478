var TestInt = 0;
class ClientChunk{
    constructor(x, y, load){
        this.pos = createVector(x, y);
        this.tile_map = [];
        for(let y = 0; y < 30; y++){
            this.tile_map[y] = [];
            for(let x = 0; x < 30; x++){
                this.tile_map[y][x] = [];
                this.tile_map[y][x][0] = 0;
                this.tile_map[y][x][1] = 0;
                this.tile_map[y][x][2] = 0;
                this.tile_map[y][x][3] = 0;
                this.tile_map[y][x][4] = new ClientTile("solid", "grass", 10, x, y, 4);
                this.tile_map[y][x][5] = new ClientTile("solid", "dirt", 10, x, y, 5);
                this.tile_map[y][x][6] = new ClientTile("solid", "dirt", 10, x, y, 6);
                this.tile_map[y][x][7] = new ClientTile("solid", "stone", 10, x, y, 7);
                this.tile_map[y][x][8] = new ClientTile("solid", "stone", 10, x, y, 8);
                this.tile_map[y][x][9] = new ClientTile("solid", "stone", 10, x, y, 9);
            }
        }
        
        for(let y = 0; y < this.tile_map.length; y++){
            for(let x = 0; x < this.tile_map[0].length; x++){
                for(let z = 0; z < this.tile_map[0][0].length; z++){
                    if(this.tile_map[y][x][z] !== 0){
                        this.tile_map[y][x][z].assign_neighbors(this.tile_map);
                    }
                }
            }
        }
        this.model_iteratoin = 0;
        this.make_model(load);
    }
    
    make_model(load){
        let chunk_x = this.pos.x;
        let chunk_y = this.pos.y;
        let chunk_it = this.model_iteratoin;
        this.model_iteratoin++;
        let verts = [];
        let facs = [];

        for(let y = 0; y < this.tile_map.length; y++){
            for(let x = 0; x < this.tile_map[0].length; x++){
                for(let z = 0; z < this.tile_map[0][0].length; z++){
                    if(this.tile_map[y][x][z] !== 0){
                        this.tile_map[y][x][z].assign_neighbors(this.tile_map);
                        if(this.tile_map[y][x][z].neighbors[0] === 0){
                            verts.push(new p5.Vector(x*64, z*64, y*64));
                            verts.push(new p5.Vector(x*64, z*64, (y+1)*64));
                            verts.push(new p5.Vector(x*64, (z+1)*64, (y+1)*64));
                            verts.push(new p5.Vector(x*64, (z+1)*64, y*64));
                            facs.push(this.tile_map[y][x][z].imgs[0]);
                        }
                        if(this.tile_map[y][x][z].neighbors[1] === 0){
                            verts.push(new p5.Vector((x+1)*64, z*64, y*64));
                            verts.push(new p5.Vector((x+1)*64, z*64, (y+1)*64));
                            verts.push(new p5.Vector((x+1)*64, (z+1)*64, (y+1)*64));
                            verts.push(new p5.Vector((x+1)*64, (z+1)*64, y*64));
                            facs.push(this.tile_map[y][x][z].imgs[1]);
                        }
                        if(this.tile_map[y][x][z].neighbors[2] === 0){
                            verts.push(new p5.Vector((x+1)*64, z*64, y*64));
                            verts.push(new p5.Vector(x*64, z*64, y*64));
                            verts.push(new p5.Vector(x*64, (z+1)*64, y*64));
                            verts.push(new p5.Vector((x+1)*64, (z+1)*64, y*64));
                            facs.push(this.tile_map[y][x][z].imgs[2]);
                        }
                        if(this.tile_map[y][x][z].neighbors[3] === 0){
                            verts.push(new p5.Vector((x+1)*64, z*64, (y+1)*64));
                            verts.push(new p5.Vector(x*64, z*64, (y+1)*64));
                            verts.push(new p5.Vector(x*64, (z+1)*64, (y+1)*64));
                            verts.push(new p5.Vector((x+1)*64, (z+1)*64, (y+1)*64));
                            facs.push(this.tile_map[y][x][z].imgs[3]);
                        }
                        if(this.tile_map[y][x][z].neighbors[4] === 0){
                            verts.push(new p5.Vector(x*64, z*64, y*64));
                            verts.push(new p5.Vector((x+1)*64, z*64, y*64));
                            verts.push(new p5.Vector((x+1)*64, z*64, (y+1)*64));
                            verts.push(new p5.Vector(x*64, z*64, (y+1)*64));
                            facs.push(this.tile_map[y][x][z].imgs[4]);
                        }
                        if(this.tile_map[y][x][z].neighbors[5] === 0){
                            verts.push(new p5.Vector(x*64, (z+1)*64, y*64));
                            verts.push(new p5.Vector((x+1)*64, (z+1)*64, y*64));
                            verts.push(new p5.Vector((x+1)*64, (z+1)*64, (y+1)*64));
                            verts.push(new p5.Vector(x*64, (z+1)*64, (y+1)*64));
                            facs.push(this.tile_map[y][x][z].imgs[5]);
                        }
                    }
                }
            }
        }
        
        if(load){
            loading_map.push({x: this.pos.x, y: this.pos.y});
        }

        this.m = new p5.Geometry(1,1,
            function(){
                this.vertices = verts;
                //Texture Stuff
                
                for(let i = 0; i < this.vertices.length/4; i++){
                    this.uvs.push([facs[i]*0.25, 0.0]);
                    this.uvs.push([(facs[i]*0.25)+0.25, 0.0]);
                    this.uvs.push([(facs[i]*0.25)+0.25, 1.0]);
                    this.uvs.push([facs[i]*0.25, 1.0]);
                    
                    this.faces.push([i*4,(i*4)+1,(i*4)+2]);
                    this.faces.push([(i*4)+2,(i*4)+3,i*4]);
                }
                this.computeNormals();
                
                
                //Cache Stuff
                this.gid = 'chunk_' + chunk_x + '_' + chunk_y + '_' + chunk_it;
            }
        );
    }
    
    render(){
        layer0.translate(this.pos.x*this.tile_map[0].length*64, 0, this.pos.y*this.tile_map.length*64);
        layer0.texture(atlas);
        if(this.m != 0){
            layer0.model(this.m);
        }
        layer0.translate(-this.pos.x*this.tile_map[0].length*64, 0, -this.pos.y*this.tile_map.length*64);
    }

    totxt(){ //convert the map to txt format
        //~ for the end of a tile
        //~~ for the end of a y section
        //~~~ for the end of a z section
        //≈ for the end of an item
        //. to seperate properties
        let temp = "";
        for(let z = 0; z < this.tile_map[0][0].length; z++){
            for(let y = 0; y < this.tile_map.length; y++){
                for(let x = 0; x < this.tile_map[y].length; x++){
                    if(this.tile_map[y][x][z] !== 0){
                        temp += this.tile_map[y][x][z].toStr() + "~";
                    }
                    else{
                        temp += "0~";
                    }
                }
                temp += " ~~\n";
            }
            temp += "~~~\n";
        }
        return temp;
    }

    fromStr(data){ //convert a str to a working map
        let temp_tile_map = [];
        let lastz = 0; //hold the index of the last ~~~ you found
        for(let z = 0; z < data.length; z++){
            if((data[z]+data[z+1]+data[z+2]) === "~~~"){
                let temp = ""
                for(let j = lastz; j < z-1; j++){
                    temp += data[j];
                }
                temp_tile_map.push(temp);
                lastz = z + 4;
            }
        }

        //flip the map cause str is from top to bottom, but tile_map is bottom to top
        //temp_tile_map.reverse();

        let ycount = 0; //hold the index of the last ~~ you found
        for(let z = 0; z < temp_tile_map.length; z++){
            let data = temp_tile_map[z];
            temp_tile_map[z] = [];
            ycount = 0;
            let lasty = 0;
            for(let y = 0; y < data.length; y++){
                if((data[y]+data[y+1]) === "~~"){
                    let temp = ""
                    for(let j = lasty; j < y-1; j++){
                        temp += data[j];
                    }
                    temp_tile_map[z].push(temp);
                    lasty = y + 3;
                    ycount ++;
                }
            }
        }

        let xcount = 0; //hold the index of the last ~ you found
        for(let z = 0; z < temp_tile_map.length; z++){
            for(let y = 0; y < temp_tile_map[z].length; y++){
                let data = temp_tile_map[z][y];
                temp_tile_map[z][y] = [];
                xcount = 0;
                let lastx = 0;
                for(let x = 0; x < data.length; x++){
                    if(data[x] === "~"){
                        let temp = ""
                        for(let j = lastx; j < x; j++){
                            temp += data[j];
                        }
                        temp_tile_map[z][y].push(temp);
                        lastx = x + 1;
                        xcount ++;
                    }
                }
            }
        }

        //fill the current tile_map with the temp_tile_map
        this.tile_map = []; //empty the current tile_map
        for(let y = 0; y < ycount; y++){
            this.tile_map[y] = [];
            for(let x = 0; x < xcount; x++){
                this.tile_map[y][x] = [];
                for(let z = 0; z < temp_tile_map.length; z++){
                    if(temp_tile_map[z][y][x] !== "0" && temp_tile_map[z][y][x] !== "\n0"){
                        
                        let tempArr = temp_tile_map[z][y][x].split('.');
                        for(let i = 0; i < tempArr.length; i++){
                            if(parseInt(tempArr[i])+"" == tempArr[i]){
                                tempArr[i] = parseInt(tempArr[i]);
                            }
                        }

                        //use the type to create the right tile class
                        if(tempArr[0] == 1){ //solid
                            this.tile_map[y][x][z] = new ClientTile("solid", tile_name_map[tempArr[1]], tempArr[2], x, y, z);
                        }
                        else if(tempArr[0] == 2){ //liquid
                            this.tile_map[y][x][z] = new ClientTile("liquid", tile_name_map[tempArr[1]], x, y, z);
                        }
                        else if(tempArr[0] == 3){ //entity
                            this.tile_map[y][x][z] = new ClientTileEntity("entity", "player", tempArr[2], x, y, z, tempArr[4], tempArr[5]);
                            this.tile_map[y][x][z].move_counter = tempArr[6];
                            this.tile_map[y][x][z].id = tempArr[3];
                            if(tempArr[tempArr.length-1] != '[]'){
                                let tempArr2 = [];
                                let tempArr3 = [];
                                var pastBracket = false;
                                for(let i = 0; i < tempArr.length; i++){
                                    if(tempArr[i] !== parseInt(tempArr[i])){
                                        if(tempArr[i][0] == '['){
                                            pastBracket = true;
                                        }
                                    }
                                    if(pastBracket){
                                        if(tempArr[i][tempArr[i].length-2] == '≈'){
                                            tempArr3.push(tempArr[i].split('≈')[0]);
                                            tempArr2.push(tempArr3);
                                            tempArr3 = [tempArr[i].split('≈')[1]];
                                        }
                                        else{
                                            tempArr3.push(tempArr[i]);
                                        }
                                        if(tempArr[i][tempArr[i].length-1] == ']'){
                                            break;
                                        }
                                    }
                                }
                                tempArr2[0][0] = tempArr2[0][0].replace('[', '');
                                for(let i = 0; i < tempArr2.length; i++){
                                    this.tile_map[y][x][z].inv[i] = new ClientItem(item_type_map[tempArr2[i][0]], item_name_map[tempArr2[i][1]], tempArr2[i][2], '');
                                }
                            }
                        }
                        else if(tempArr[0] == 4){ //facing
                            this.tile_map[y][x][z] = new ClientTile("facing", tile_name_map[tempArr[1]], tempArr[2], x, y, z);
                        }
                        else{
                            console.log("tile type not found client side " + tile_type_map[tempArr[0]]);
                        }
                    }
                    else{
                        this.tile_map[y][x][z] = 0;
                    }
                }
            }
        }
        this.make_model(true);
    }
}

class ClientMap{
    constructor(name, seed, ver){
        this.name = name; //name of map
        this.seed = seed; //seed used for map gen & random stuffs
        this.ver = ver; //version of game that map was made in
        this.mode = 's';
        this.chunk_map = [];
        let x = -1;
        let y = -1;
        for(let i = 0; i < 9; i++){
            this.chunk_map.push(new ClientChunk(x, y, true));
            x++;
            if(x == 2){
                y++;
                x=-1;
            }
        }
    }
    
    open(file){ //open a map
        socket.emit("open_map", file);
    }

    save(path){ //save the map to a file
        for(let i = 0; i < this.chunk_map.length; i++){
            socket.emit("save_chunk", {path: path, file: this.chunk_map[i].totxt(), x: this.chunk_map[i].pos.x, y: this.chunk_map[i].pos.y});
        }
    }

    render(){
        for(let i = 0; i < this.chunk_map.length; i++){
            this.chunk_map[i].render();
        }
    }
}
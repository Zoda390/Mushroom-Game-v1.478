import fs from 'fs'
import {ServerTile} from "./tile_classes.js"

export class ServerChunk{
    constructor(x, y){
        this.pos = {x: x, y: y};
        this.tile_map = [];
        for(let y = 0; y < 30; y++){
            this.tile_map[y] = [];
            for(let x = 0; x < 30; x++){
                this.tile_map[y][x] = [];
                this.tile_map[y][x][0] = 0;
                this.tile_map[y][x][1] = 0;
                this.tile_map[y][x][2] = 0;
                this.tile_map[y][x][3] = 0;
                this.tile_map[y][x][4] = new ServerTile(1, 3, 10, x, y, 0);
                this.tile_map[y][x][5] = new ServerTile(1, 2, 10, x, y, 1);
                this.tile_map[y][x][6] = new ServerTile(1, 2, 10, x, y, 2);
                this.tile_map[y][x][7] = new ServerTile(1, 1, 10, x, y, 3);
                this.tile_map[y][x][8] = new ServerTile(1, 1, 10, x, y, 4);
                this.tile_map[y][x][9] = new ServerTile(1, 1, 10, x, y, 5);
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
                            this.tile_map[y][x][z] = new ServerTile(1, tempArr[1], tempArr[2], x, y, z);
                        }
                        /*
                        else if(tempArr[0] == 2){ //liquid
                            this.tile_map[y][x][z] = new ServerTile("liquid", tile_name_map[tempArr[1]], x, y, z);
                        }
                        else if(tempArr[0] == 3){ //entity
                            this.tile_map[y][x][z] = new ServerTileEntity("entity", "player", tempArr[2], x, y, z, tempArr[4], tempArr[5]);
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
                                    this.tile_map[y][x][z].inv[i] = new ServerItem(item_type_map[tempArr2[i][0]], item_name_map[tempArr2[i][1]], tempArr2[i][2], '');
                                }
                            }
                        }
                        else if(tempArr[0] == 4){ //facing
                            this.tile_map[y][x][z] = new ServerTile("facing", tile_name_map[tempArr[1]], tempArr[2], x, y, z);
                        }
                        */
                        else{
                            console.log("tile type not found server side " + tile_type_map[tempArr[0]]);
                        }
                    }
                    else{
                        this.tile_map[y][x][z] = 0;
                    }
                }
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
    }
}

export class ServerMap{
    constructor(name, seed, ver){
        this.name = name; //name of map
        this.seed = seed; //seed used for map gen & random stuffs
        this.ver = ver; //version of game that map was made in
        this.mode = 's';
        this.chunk_map = [];
        let x = -1;
        let y = -1;
        for(let i = 0; i < 9; i++){
            this.chunk_map.push(new ServerChunk(x, y));
            x++;
            if(x == 2){
                y++;
                x=-1;
            }
        }
    }

    open(file){ //open a map
        //see what files are in the folder
        var files;
        try{
            fs.readdirSync(file);
        }
        catch(error){
            socket.emit('console', ("path \"" + file + "\" not found"));
            return;
        }
        //cur_file = file;
        files = fs.readdirSync(file);

        //open textures if they are found in the map folder
        if(files.includes("textures")){
            var textures;
            try{
                fs.readdirSync(file + "/textures");
            }
            catch(error){
                socket.emit('console', ("textures file not found"));
                return;
            }
            textures = fs.readdirSync(file + "/textures");
        }

        //open the rules file if it is found in the map folder
        if(files.includes("rules.json")){
            var rules = JSON.parse(fs.readFileSync(file + "/rules.json").toString());
            //check the textures against acceptable textures, replace with missing.png if needed
        }

        //open the chunks folder if it is found in the map folder
        if(files.includes("chunks")){
            var chunks;
            try{
                fs.readdirSync(file + "/chunks");
            }
            catch(error){
                socket.emit('console', ("path \"" + file + "\" not found"));
                return;
            }
            chunks = fs.readdirSync(file + "/chunks");
            this.chunk_map = [];
            for(let i = 0; i < chunks.length; i++){
                let temp = chunks[i].split('~');
                temp[0] = parseInt(temp[0]);
                temp[1] = parseInt(temp[1]);
                let temp2 = new ServerChunk(temp[0], temp[1]);
                temp2.fromStr(fs.readFileSync(file + "/chunks/" + temp[0] + "~" + temp[1] + ".mush").toString());
                this.chunk_map.push(temp2);
            }
        }
    }

    save(path){ //save the map to a file
        for(let i = 0; i < this.chunk_map.length; i++){
            try {
                fs.writeFileSync(path + "/chunks/" + this.chunk_map[i].pos.x + "~" + this.chunk_map[i].pos.y + ".mush", this.chunk_map[i].totxt());
                // file written successfully
            } catch (err) {
                console.error(err);
            }
        }
    }

    totxt(){
        var chunks=[];
        for(let i = 0; i < this.chunk_map.length; i++){
            chunks.push({x: this.chunk_map[i].pos.x, y: this.chunk_map[i].pos.y, txt: this.chunk_map[i].totxt()});
        }
        return chunks;
    }
}

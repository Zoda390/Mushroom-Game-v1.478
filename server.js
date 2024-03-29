//import geckos from "@geckos.io/server"
import {Server} from "socket.io"
import express from "express"
import fs from "fs"
import {ServerItem} from "./server-classes/item_classes.js"
import {ServerTile, ServerTileEntity} from "./server-classes/tile_classes.js"
import {ServerChunk, ServerMap, strToServerTile} from "./server-classes/map_classes.js"

const port = 3000;
const app = express();
const server = app.listen(port);
var io = new Server(server, {cors: {origin: '*'}});
app.use(express.static("public"));
console.log("My server is running on port " + port);


var player_count = 0;
var cur_file;
var player_count = 0;

//open a json file and make map for names and types
var rules_obj = fs.readFileSync("public/map1/rules.json");
rules_obj = JSON.parse(rules_obj);

var cs_map = new ServerMap("test", 123, 1.478);
cs_map.open('./public/map1');
//cs_map.chunk_map[0].tile_map[0][0][0] = new ServerTile(1, 1, 10, 0, 0, 0);
//cs_map.save('./public/map1');

io.sockets.on("connection", (socket) =>{
    console.log('New connection: ' + socket.id);
    socket.emit('console', ("hi new person"));

    //a request to open the shader files found in the game files
    socket.on('open_shader', (data) => { //no data needed
        var obj = {vert: "", frag: ""};
        try{
            fs.readFileSync("public/pixel.vert");
            fs.readFileSync("public/pixel.frag");
        }
        catch(error){
            console.log(error);
            socket.emit('console', ("shaders not found"));
            return;
        }
        obj.vert = fs.readFileSync("public/pixel.vert").toString();
        obj.frag = fs.readFileSync("public/pixel.frag").toString();
        socket.emit("open_shader", obj);
    });

    //a request to open a file on the server's pc, it will find any files within said folder and return the names
    socket.on('open_map', (data) => { //data should be the filepath that the client wants to open
        var files;
        try{
            fs.readdirSync(data);
        }
        catch(error){
            socket.emit('console', ("path \"" + data + "\" not found"));
            return;
        }
        cur_file = data;
        files = fs.readdirSync(data);
        socket.emit('files_found', files);
    });

    //a request to open the chunks file in the map file, it will find any files within said folder and return the names
    socket.on('open_chunks', (data) => { //no data needed
        var chunks;
        try{
            fs.readdirSync(cur_file + "/chunks");
        }
        catch(error){
            socket.emit('console', ("path \"" + cur_file + "\" not found"));
            return;
        }
        chunks = fs.readdirSync(cur_file + "/chunks");
        socket.emit('chunks_found', chunks);
    });

    //a request to open the textures folder found within the current map folder, will return the names of files it finds
    socket.on('open_textures', (data) => { //no data needed
        var textures;
        try{
            fs.readdirSync(cur_file + "/textures");
        }
        catch(error){
            socket.emit('console', ("textures file not found"));
            return;
        }
        textures = fs.readdirSync(cur_file + "/textures");
        socket.emit('textures_found', textures);
    });

    //a request to open the rules.json file found within the current map folder, will return a string version of the file
    socket.on('open_rules', (data) => { //no data needed
        var file = fs.readFileSync(cur_file + "/rules.json").toString();
        socket.emit('open_rules', file);
    });

    //a request to open a specific chunk within the current map folder, will return a string version of the chunk
    socket.on('open_chunk', (data) => { //data should be an obj with 2 ints x and y, denoting the position of the chunk
        var file = fs.readFileSync(cur_file + "/chunks/" + data.x + "~" + data.y + ".mush").toString();
        socket.emit('open_chunk', {x: data.x, y: data.y, file: file});
    });

    //a request to save a chunk from a client to the correct file in the current map folder, no return
    socket.on('save_chunk', (data) => { //data should be an obj with 2 ints x and y, denoting the position of the chunk, .file is temporary, it is a string to be saved coming from the client
        if(cur_file === undefined){
            cur_file = data.path;
        }
        try {
            fs.writeFileSync(cur_file + "/chunks/" + data.x + "~" + data.y + ".mush", data.file);
            // file written successfully
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('join', (data) => {
        //convert the map to a string and send it to the player
        socket.emit('give_world', {name: cs_map.name, seed: cs_map.seed, ver: cs_map.ver, chunks: cs_map.totxt()});
        
        //add a player to the map
        cs_map.chunk_map[0].entities.push(new ServerTileEntity(3, 1, 100, (player_count%2), 0, 0, 0, 3));
        cs_map.chunk_map[0].entities[cs_map.chunk_map[0].entities.length-1].id = data.id;
        //cs_map.tile_map[data.y][data.x][data.z].inv[0] = new ServerItem(2, 5, 1, '');
        //cs_map.tile_map[data.y][data.x][data.z].inv[1] = new ServerItem(1, 4, 10, '');
        socket.emit('change_tile', {cPos: {x: -1, y: -1}, tPos: {x: 0, y: 0, z: 3}, to: cs_map.chunk_map[0].entities[cs_map.chunk_map[0].entities.length-1].toStr()});
        player_count++;
    });

    socket.on('change_tile', (data) => { //{cPos: {x: int, y: int}, tPos: {x: int, y: int, z: int}, to: str}
        for(let i = 0; i < cs_map.chunk_map.length; i++){
            if(data.cPos.x == cs_map.chunk_map[i].pos.x && data.cPos.y == cs_map.chunk_map[i].pos.y){
                strToServerTile(cs_map.chunk_map[i], data.to, data.tPos.x, data.tPos.y, data.tPos.z);
                io.emit('change_tile', data);
            }
        }
    });

    socket.on('kill_entity', (data) => { //{cPos: {x: int, y: int}, id: str}
        for(let i = 0; i < cs_map.chunk_map.length; i++){
            if(data.cPos.x == cs_map.chunk_map[i].pos.x && data.cPos.y == cs_map.chunk_map[i].pos.y){
                for(let j = 0; j < cs_map.chunk_map[i].entities.length; j++){
                    if(cs_map.chunk_map[i].entities[j].id == data.id){
                        cs_map.chunk_map[i].entities.splice(j, 1);
                        io.emit('kill_entity', data);
                    }
                }
            }
        }
    });
});
//import geckos from "@geckos.io/server"
import {Server} from "socket.io"
import express from "express"
import fs from "fs"
import {ServerItem} from "./server-classes/item_classes.js"
import {ServerTile, ServerTileEntity} from "./server-classes/tile_classes.js"
import {ServerChunk, ServerMap} from "./server-classes/map_classes.js"

const port = 3000;
const app = express();
const server = app.listen(port);
var io = new Server(server, {cors: {origin: '*'}});
app.use(express.static("public"));
console.log("My server is running on port " + port);


var cur_file;

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
        /*
        cs_map.tile_map[data.y][data.x][data.z] = new ServerTileEntity(find_in_array("entity", tile_type_map), find_in_array("player", tile_name_map), 100, (player_count%2), 0);
        cs_map.tile_map[data.y][data.x][data.z].id = data.id;
        cs_map.tile_map[data.y][data.x][data.z].inv[0] = new ServerItem(2, 5, 1, '');
        cs_map.tile_map[data.y][data.x][data.z].inv[1] = new ServerItem(1, 4, 10, '');
        socket.emit('change', {x: data.x, y: data.y, z: data.z, to: cs_map.tile_map[data.y][data.x][data.z].toStr()});
        player_count++;
        */
    })
});
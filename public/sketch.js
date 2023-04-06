var layer0;
var layer1;
var pixelShader;
var slider;
var tile_imgs = [];
var tile_models = [];
var deltaTheta = 0;
var deltaPhi = 0;
var cc_map; //current client map
var atlas;
var cam;
var socket;
var loading_map = [];
var chunk_load_wait = 0;

function preload(){
    socket = io.connect('http://localhost:3000');

    socket.on('console', (data) => {console.log(data);});

    socket.on('open_shader', (data) => {
        pixelShader = layer1.createShader(data.vert, data.frag);
    });

    //list of file names found in map file
    socket.on('files_found', (data) =>{
        if(!data.includes("chunks")){
            console.log("map has no chunks folder, the file might be corrupt");
            return;
        }
        else{
            socket.emit("open_chunks");
        }
        if(!data.includes("textures")){
            //set textures to base game textures
        }
        if(!data.includes("rules.json")){
            //set rules to base game rules
        }
    });

    //acceptable texture names
    socket.on("textures_found", (data) =>{
        console.log(data);
    });

    //rules obj
    socket.on('open_rules', (data) =>{
        console.log(JSON.parse(data));
        //check the textures against acceptable textures, replace with missing.png if needed
    });

    //list of chunks found in the map file
    socket.on('chunks_found', (data) =>{
        for(let i = 0; i < data.length; i++){
            let temp = data[i].split('~');
            socket.emit("open_chunk", {x: parseInt(temp[0]), y: parseInt(temp[1])});
        }
        cc_map.chunk_map = [];
        loading_map = [];
    });

    //a string version of a chunk (no used)
    socket.on('open_chunk', (data) => {
        let temp = new ClientChunk(data.x, data.y, false);
        temp.fromStr(data.file);
        cc_map.chunk_map.push(temp);
    });

    //when the server gives you the world data
    socket.on('give_world', data => {
        if(cc_map == undefined){ //only take the world if you don't already have it
            cc_map = new ClientMap("unUpdated", 0, 0);
            cc_map.name = data.name;
            cc_map.seed = data.seed;
            cc_map.ver = data.ver;
            cc_map.chunk_map = [];
            loading_map = [];
            for(let i = 0; i < data.chunks.length; i++){
                let temp = new ClientChunk(data.chunks[i].x, data.chunks[i].y, false);
                temp.fromStr(data.chunks[i].txt);
                cc_map.chunk_map.push(temp);
            }
            
        }
        /*
        else{
            console.log(cc_map);
        }
        */
    });

    socket.on('changeTile', (data) => { //{cPos: {x: int, y: int}, tPos: {x: int, y: int, z: int}, to: str}
        for(let i = 0; i < cc_map.chunk_map.length; i++){
            if(data.cPos.x == cc_map.chunk_map[i].pos.x && data.cPos.y == cc_map.chunk_map[i].pos.y){
                cc_map.chunk_map[i].tile_map[data.tPos.y][data.tPos.x][data.tPos.z] = strToClientTile(data.to, data.tPos.x, data.tPos.y, data.tPos.z);
                cc_map.chunk_map[i].make_model(false);
            }
        }
    });

    tile_imgs.push(loadImage("map1/textures/stone_all.png"));
    tile_imgs.push(loadImage("map1/textures/dirt_all.png"));
    tile_imgs.push(loadImage("map1/textures/grass_top.png"));
    tile_imgs.push(loadImage("map1/textures/grass_sides.png"));
    tile_imgs.push(loadImage("map1/textures/player.png"));
    tile_imgs.push(loadImage("map1/textures/player-top.png"));
    tile_imgs.push(loadImage("map1/textures/player-front.png"));
    tile_models.push(loadModel("map1/models/player.obj"));
    tile_models.push(loadModel("map1/models/player.stl", true));
}

function setup() {
    //this is the 2D layer that draws an image from layer1
    createCanvas(800, 700);

    rotate_cam_right_button = RIGHT_ARROW;
    rotate_cam_left_button = LEFT_ARROW;
    rotate_cam_up_button = UP_ARROW;
    rotate_cam_down_button = DOWN_ARROW;

    socket.emit("open_shader");
    //the 3D layer used for sampling
    layer0 = createGraphics(width, height, WEBGL);
    layer0.background(100);
    layer0.noStroke();

    //the 3D layer used to apply the shader
    layer1 = createGraphics(width, height, WEBGL);
    layer1.background(100);
    layer1.noStroke();

    atlas = createGraphics(64*5, 64);
    atlas.background(0, 255, 0);
    atlas.image(tile_imgs[0], 0, 0);
    atlas.image(tile_imgs[1], 64, 0);
    atlas.image(tile_imgs[2], 64*2, 0);
    atlas.image(tile_imgs[3], 64*3, 0);
    atlas.image(tile_imgs[6], 64*4, 0);
    

    noStroke();
    slider = createSlider(1, width, width, 1);
    slider.position(1, height+40);
    slider.style('width', width+"px");
    socket.emit("join");

    cam = layer0.createCamera();
    e1 = new ClientTileEntity("player", 50, 0, 0, 4);
}

function draw() {
    if(pixelShader !== undefined){
        // send resolution of sketch into shader
        pixelShader.setUniform('u_resolution', [width, height]);
        pixelShader.setUniform('tex0', layer0);
        pixelShader.setUniform('res', slider.value());

        layer1.shader(pixelShader);
    }
    

    layer0.clear();
    layer0.background(100);
    layer0.push();
    layer0.setCamera(cam);
    //layer0.rotateX(frameCount * 0.01);
    //layer0.rotateY(frameCount * 0.01);
    oc();
    takeInput();
    if(loading_map.length >= 9){
        cc_map.render();
        e1.render();
    }
    layer0.pop();
    layer1.rect(0, 0, width, height);

    image(layer1, 0, 0);
    
    var max_x = 0;
    var min_x = 0;
    var max_y = 0;
    var min_y = 0;
    for(let i = 0; i < loading_map.length; i++){
        if(loading_map[i].x < min_x){min_x = loading_map[i].x;}
        if(loading_map[i].x > max_x){max_x = loading_map[i].x;}
        if(loading_map[i].y < min_y){min_y = loading_map[i].y;}
        if(loading_map[i].y > max_y){max_y = loading_map[i].y;}
    }
    fill(255);
    rect(0,0,(64/8)*(3)+2,(64/8)*(3)+2);
    fill(0, 255, 0);
    for(let i = 0; i < loading_map.length; i++){
        rect((loading_map[i].x-min_x)*((64/8)+1), (loading_map[i].y-min_y)*((64/8)+1), (64/8), (64/8));
    }
    image(atlas, 0, 0);
}

var move_right_button = 68; //d
var move_left_button = 65; //a
var move_up_button = 87; //w
var move_down_button = 83; //s
var move_fly_up_button = 81; //q
var move_fly_down_button = 69; //e
var rotate_cam_right_button;
var rotate_cam_left_button;
var rotate_cam_up_button;
var rotate_cam_down_button;

function takeInput(){
    if (keyIsDown(move_right_button)){
        cam.move(0.25*64*Math.cos(deltaTheta), 0, -0.25*64*Math.sin(deltaTheta));
        //e1.move("d");
    }
    if (keyIsDown(move_left_button)){
        cam.move(-0.25*64*Math.cos(deltaTheta), 0, 0.25*64*Math.sin(deltaTheta));
        //e1.move("a");
    }
    if (keyIsDown(move_up_button)){
        cam.move(-0.25*64*Math.sin(deltaTheta), 0, -0.25*64*Math.cos(deltaTheta));
        //e1.move("w");
    }
    if (keyIsDown(move_down_button)){
        cam.move(0.25*64*Math.sin(deltaTheta), 0, 0.25*64*Math.cos(deltaTheta));
        //e1.move("s");
    }
    if (keyIsDown(move_fly_up_button)){
        cam.move(0, 0.25*64, 0);
    }
    if (keyIsDown(move_fly_down_button)){
        cam.move(0, -0.25*64, 0);
    }

    if (keyIsDown(rotate_cam_right_button)){
        deltaTheta = 0.2;
    }
    if (keyIsDown(rotate_cam_left_button)){
        deltaTheta = -0.2;
    }
    if (keyIsDown(rotate_cam_up_button)){
        deltaPhi = 0.05;
    }
    if (keyIsDown(rotate_cam_down_button)){
        deltaPhi = -0.05;
    }
}

function oc(sensitivityX = 1, sensitivityY = 1, sensitivityZ = 0.5){
    cam._orbit(deltaTheta, deltaPhi, 0);

    const mouseInCanvas = mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0;
    if (!mouseInCanvas) return;

    const scaleFactor = height < width ? height : width;

    if (mouseIsPressed && mouseButton === LEFT) {
        deltaTheta = -sensitivityX * (mouseX - pmouseX) / scaleFactor;
        deltaPhi = sensitivityY * (mouseY - pmouseY) / scaleFactor;
    }
    else{
        if(Math.abs(deltaTheta) > 0.001){
            deltaTheta *= 0.99;
        }
        else{
            deltaTheta = 0;
        }
        if(Math.abs(deltaPhi) > 0.001){
            deltaPhi *= 0.99;
        }
        else{
            deltaPhi = 0;
        }
    }

    return;
}
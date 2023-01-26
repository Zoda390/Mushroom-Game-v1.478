var layer0;
var layer1;
var pixelShader;
var slider;
var tile_imgs = [];
var deltaTheta = 0;
var deltaPhi = 0;
var ccmap; //current client map
var atlas;
var cam = {x: 0, y: 0, z: -2};
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
        ccmap.chunk_map = [];
        loading_map = [];
    });

    //a string version of a chunk
    socket.on('open_chunk', (data) => {
        let temp = new ClientChunk(data.x, data.y, false);
        temp.fromStr(data.file);
        ccmap.chunk_map.push(temp);
    });

    tile_imgs.push(loadImage("map1/textures/stone_all.png"));
    tile_imgs.push(loadImage("map1/textures/dirt_all.png"));
    tile_imgs.push(loadImage("map1/textures/grass_top.png"));
    tile_imgs.push(loadImage("map1/textures/grass_sides.png"));
}

function setup() {
    //this is the 2D layer that draws an image from layer1
    createCanvas(800, 700);

    socket.emit("open_shader");
    //the 3D layer used for sampling
    layer0 = createGraphics(width, height, WEBGL);
    layer0.background(100);
    layer0.noStroke();
    //the 3D layer used to apply the shader
    layer1 = createGraphics(width, height, WEBGL);
    layer1.background(100);
    layer1.noStroke();

    atlas = createGraphics(64*4, 64);
    atlas.background(255, 255, 0);
    atlas.image(tile_imgs[0], 0, 0);
    atlas.image(tile_imgs[1], 64, 0);
    atlas.image(tile_imgs[2], 64*2, 0);
    atlas.image(tile_imgs[3], 64*3, 0);

    noStroke();
    slider = createSlider(1, width, width, 1);
    slider.position(1, height+40);
    slider.style('width', width+"px");
    ccmap = new ClientMap("Map1", 1, 0.5);
    //ccmap.save("public/map1");
    ccmap.open("public/map1");
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
    //layer0.rotateX(frameCount * 0.01);
    //layer0.rotateY(frameCount * 0.01);
    oc();
    takeInput();
    if(loading_map.length == 9){
        ccmap.render();
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
}

var move_right_button = 68; //d
var move_left_button = 65; //a
var move_up_button = 87; //w
var move_down_button = 83; //s
var move_fly_up_button = 81; //q
var move_fly_down_button = 69; //e

function takeInput(){
    if (keyIsDown(move_right_button)){
        cam.x -= 0.25 * Math.cos(deltaTheta); //(deltaTheta>PI*(2/3) && deltaTheta<PI*(4/3)? -1:1)
        cam.y += 0.25 * Math.sin(deltaTheta);
    }
    if (keyIsDown(move_left_button)){
        cam.x += 0.25 * Math.cos(deltaTheta);
        cam.y -= 0.25 * Math.sin(deltaTheta);
    }
    if (keyIsDown(move_up_button)){
        cam.y += 0.25 * Math.cos(deltaTheta);
        cam.x += 0.25 * Math.sin(deltaTheta);
    }
    if (keyIsDown(move_down_button)){
        cam.y -= 0.25 * Math.cos(deltaTheta);
        cam.x -= 0.25 * Math.sin(deltaTheta);
    }
    if (keyIsDown(move_fly_up_button)){
        cam.z -= 0.25;
    }
    if (keyIsDown(move_fly_down_button)){
        cam.z += 0.25;
    }
}

function oc(sensitivityX, sensitivityY, sensitivityZ){
    deltaPhi = min(deltaPhi, PI/2);
    deltaPhi = max(deltaPhi, -PI/2);
    layer0._renderer._curCamera._orbit(deltaTheta, deltaPhi, 0);

    const mouseInCanvas = mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0;
    if (!mouseInCanvas) return;

    if (typeof sensitivityX === 'undefined') {
        sensitivityX = 1;
    }
    if (typeof sensitivityY === 'undefined') {
        sensitivityY = sensitivityX;
    }
    if (typeof sensitivityZ === 'undefined') {
        sensitivityZ = 0.5;
    }

    const scaleFactor = height < width ? height : width;

    if (mouseIsPressed && mouseButton === LEFT && mouseInCanvas) {
        deltaTheta += -sensitivityX * (mouseX - pmouseX) / scaleFactor;
        deltaPhi += sensitivityY * (mouseY - pmouseY) / scaleFactor;
    }

    return;
}
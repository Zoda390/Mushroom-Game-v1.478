

var tile_name_map = [0, 'stone', 'grass', 'water', 'player','wood', 'log', 'crystal base', 'minion log'];
var tile_type_map = [ 0, 'solid', 'liquid', 'entity', 'facing'];

//Mostly for searching the name and type maps
export function find_in_array(input, arr){
    for(let i = 0; i < arr.length; i++){
        if(input === arr[i]){
            return i;
        }
    }
}





var item_type_map = [0, 'block', 'tool', 'consumable'];
var item_name_map = [0, 'stone', 'grass', 'water', 'wood', 'pickaxe'];


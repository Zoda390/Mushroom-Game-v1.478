
export class ServerItem {
    constructor(type, name, amount, click){
        this.type = type;
        this.name = name;
        this.amount = amount;
        this.click = 'Place ' + find_in_array(this.name, item_name_map) + ';';
        if(this.name == 'Pickaxe'){
            this.click = 'Mine;';
        }
        if(click !== ''){
            this.click = click;
        }
    }

    toStr(){
        return this.type + '.' + this.name + '.' + this.amount + '≈';
    }
}
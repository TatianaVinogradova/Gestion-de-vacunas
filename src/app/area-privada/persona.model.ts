export class Persona {

id?: string; //ID único para cada persona
nombre:string="";
edad:string="";
altura:string="";
peso:string="";

constructor(data?: Partial<Persona>) {
if (data) {
    Object.assign(this, data);
}
}
}
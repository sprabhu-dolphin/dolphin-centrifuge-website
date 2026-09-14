export const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const string={type:'string'},strings={type:'array',items:string};

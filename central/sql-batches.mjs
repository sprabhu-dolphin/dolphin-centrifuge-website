// Group replay-safe inserts to avoid one database transaction per passage.
export function compactInserts(statements){
 const groups=[];let prefix='',sql='';
 for(const statement of statements){const at=statement.indexOf(' VALUES ');if(at<0)throw new Error('Expected an insert statement');const current=statement.slice(0,at+8),value=statement.slice(at+8);
  if(current===prefix&&Buffer.byteLength(sql)+Buffer.byteLength(value)+1<85000)sql+=','+value;
  else{if(sql)groups.push(sql);prefix=current;sql=statement;}
 }if(sql)groups.push(sql);return groups.join(';');
}

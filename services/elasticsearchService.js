'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
require('array.prototype.flatmap').shim()

const index = "mappa";

module.exports = {

    clearAll: async function(){
      if( (await client.indices.exists({index:index})).body == true){
        console.log("Clearing indices..")
        await clearIndices();
      }
    },
    insertData: async function(data){
      console.log("Inserting into elastic search "+data.length+" data..")
      let bulkBody = [];
      data.forEach(element => {
        bulkBody.push({
          index:{
            _index: index
          }
        })
        bulkBody.push(element);
      });
      await client.bulk({body:bulkBody}).catch(console.log);
      console.log("Insertion completed.")
    },
    search: async function(query){
      let q = await client.search({
         index : index,
         from:0,
         size: 10000,
         body: {
           query: JSON.parse(query)
         }
       })
       console.log("retrieved data")
       return q.body.hits.hits;
    }


}
async function clearIndices(){
    await client.indices.delete({
        index:index
    })
}
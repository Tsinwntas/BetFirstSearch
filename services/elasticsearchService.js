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
    }


}

async function run () {
  // Let's start by indexing some data
  await client.index({
    index: 'game-of-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      character: 'Ned Stark',
      quote: 'Winter is coming.'
    }
  })

  await client.index({
    index: 'game-of-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      character: 'Daenerys Targaryen',
      quote: 'I am the blood of the dragon.'
    }
  })

  await client.index({
    index: 'game-of-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      character: 'Tyrion Lannister',
      quote: 'A mind needs winter books like a sword needs a whetstone.'
      
    }
  })

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: 'game-of-thrones' })

  // Let's search!
  const { body } = await client.search({
    index: 'game-of-thrones',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      query: {
        match_all: {}
      }
    }
  })

  console.log(body.hits.hits)
}
async function clearIndices(){
    await client.indices.delete({
        index:index
    })
}

async function check(){
let q = await client.search({
  index : index,
  body: {
    query: {
      match_all: {}
    }
  }
})
console.log(q.body.hits);
}

// check();
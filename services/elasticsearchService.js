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
       console.log("******************************************")
       console.log(query);
       console.log("******************************************")
      let q = await client.search({
         index : index,
         body: {
           query: JSON.parse(query)
         }
       })
       console.log(q.body.hits.hits);
       return q.body.hits.hits;
    }


}

async function run () {

  // Let's search!
  const { body } = await client.search({
    "index": 'mappa',
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    "body": {
      "query": { 
        "bool":{ 
           "must":[ 
              { 
                 "bool":{ 
                    "should":[ 
                       { 
                          "match":{ 
                             "home":"*"
                          }
                       },
                       { 
                          "match":{ 
                             "away":"*"
                          }
                       }
                    ]
                 }
              },
              { 
                 "bool":{ 
                    "should":[ 
                       { 
                          "match":{ 
                             "label":"bet365"
                          }
                       },
                       { 
                          "match":{ 
                             "label":"stoiximan"
                          }
                       },
                       { 
                          "match":{ 
                             "label":"winmasters"
                          }
                       }
                    ]
                 }
              },
              { 
                 "bool":{ 
                    "should":[ 
                       { 
                          "range":{ 
                             "FT":{ 
                                "0":{ 
                                   "lte":3,
                                   "gte":1.5
                                },
                                "1":{ 
                                   "lte":1000,
                                   "gte":0
                                },
                                "2":{ 
                                   "lte":1000,
                                   "gte":0
                                }
                             }
                          }
                       },
                       { 
                          "range":{ 
                             "FT":{ 
                                "0":{ 
                                   "lte":1000,
                                   "gte":0
                                },
                                "1":{ 
                                   "lte":3,
                                   "gte":1.5
                                },
                                "2":{ 
                                   "lte":1000,
                                   "gte":0
                                }
                             }
                          }
                       },
                       { 
                          "range":{ 
                             "FT":{ 
                                "0":{ 
                                   "lte":1000,
                                   "gte":0
                                },
                                "1":{ 
                                   "lte":1000,
                                   "gte":0
                                },
                                "2":{ 
                                   "lte":3,
                                   "gte":1.5
                                }
                             }
                          }
                       }
                    ]
                 }
              }
           ]
        }
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
    query: 
    { 
      "bool":{ 
         "must":[ 
            { 
               "bool":{ 
                  "should":[ 
                     { 
                        "wildcard":{ 
                           "home":"*"
                        }
                     },
                     { 
                        "wildcard":{ 
                           "away":"*"
                        }
                     }
                  ]
               }
            },
            { 
               "bool":{ 
                  "should":[ 
                     { 
                        "match":{ 
                           "label":"bet365"
                        }
                     },
                     { 
                        "match":{ 
                           "label":"stoiximan"
                        }
                     },
                     { 
                        "match":{ 
                           "label":"winmasters"
                        }
                     }
                  ]
               }
            },
            { 
               "bool":{ 
                  "should":[ 
                     { 
                        "range":{ 
                           "markets.FT1":{ 
                              "lte":1000,
                              "gte":0
                           }
                        }
                     },
                     { 
                        "range":{ 
                           "markets.FTX":{ 
                              "lte":1000,
                              "gte":0
                           }
                        }
                     },
                     { 
                        "range":{ 
                           "markets.FT2":{ 
                              "lte":1000,
                              "gte":0
                           }
                        }
                     }
                  ]
               }
            }
         ]
      }
   }
    
  }
})
console.log(q.body.hits.hits);
// console.log(q.body.hits.hits._source.markets);
}

// run();
check();
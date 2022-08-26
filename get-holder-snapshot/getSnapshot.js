const anchor = require("@project-serum/anchor");
const fs = require("fs");
const web3 = require("@solana/web3.js");
const connection = new anchor.web3.Connection(
  "https://solana-api.projectserum.com"
);

if (process.argv.length < 4) {
  console.log("Usage: node " + process.argv[1] + " inputFile outputFile");
  process.exit(1);
}

var inputFile = process.argv[2];
var outputFile = process.argv[3];

console.log(inputFile);

// @ts-ignore
var list = [];

const TOKEN_PUBKEY = new web3.PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

const getNftOwner = async (address) => {
  try {
    let filter = {
      memcmp: {
        offset: 0,
        bytes: address,
      },
    };
    let filter2 = {
      dataSize: 165,
    };
    let getFilter = [filter, filter2];
    let programAccountsConfig = { filters: getFilter, encoding: "jsonParsed" };
    let _listOfTokens = await connection.getParsedProgramAccounts(
      TOKEN_PUBKEY,
      programAccountsConfig
    );

    let res;
    for (let i = 0; i < _listOfTokens.length; i++) {
      if (
        _listOfTokens[i]["account"]["data"]["parsed"]["info"]["tokenAmount"][
          "amount"
        ] == 1
      ) {
        res = _listOfTokens[i]["account"]["data"]["parsed"]["info"]["owner"];
        // console.log(
        //   `${i + 1}/${_listOfTokens.length + 1}`,
        //   _listOfTokens[i]["account"]["data"]["parsed"]["info"]["owner"]
        // );
        // console.log(
        //   _listOfTokens[i]["account"]["data"]["parsed"]["info"]["tokenAmount"][
        //     "amount"
        //   ]
        // );
      }
    }

    return res;
  } catch (e) {
    console.log(e);
  }
};

const findDuplicates = (arr) => {
  let sorted_arr = arr
    .map((nft) => nft.holder)
    .slice()
    .sort();
  let results = [];
  for (let i = 0; i < sorted_arr.length - 1; i++) {
    if (sorted_arr[i + 1] == sorted_arr[i]) {
      results.push(sorted_arr[i]);
    }
  }
  return results;
};

const owners = async () => {
  let newList = [];

  var data = fs.readFileSync(inputFile, "utf8", function (err, data) {
    if (err) throw err;
    console.log("OK: " + inputFile);
  });
  data = data
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .replace(/[\s,]+/g, ",")
    .split(",");
  console.log(data);
  for (let i = 0; i <= data.length - 1; i++) {
    newList.push({ mint: data[i], holder: await getNftOwner(data[i]) });
    console.log(`${i + 1}/${data.length}`);
  }

  const uniq = newList
    .map((name) => {
      return {
        count: 1,
        holder: name.holder,
      };
    })
    .reduce((result, b) => {
      result[b.holder] = (result[b.holder] || 0) + b.count;

      return result;
    }, {});

  fs.writeFileSync(outputFile, JSON.stringify(uniq));
};

owners();

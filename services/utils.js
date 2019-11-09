const fs = require('fs');
module.exports = {
    writeJsonToFile: function(file,data){  
        fs.writeFile('./data-mined/'+file+'.json', JSON.stringify(data), (err) => {
            if (err) {
            console.log(err);
            }
        });
    },    
    jaroWinkler: function(a,b){
        a = a.toLowerCase();
        b = b.toLowerCase();
        var p = 0.1;
        var l = getPrefixStrength(a,b);
        var dj = jaro(a,b);
        return 100* (dj + (l*p*(1-dj)));
	},
	getMarketsOfInterest: function(){
		return marketsOfInterest;
	},
    sleep: async function (ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
}

var marketsOfInterest = {
	FT : "FT",
	DoubleChance:"DoubleChance",
	To_Qualify:"To_Qualify",
	HT:"HT",
	OverUnder : "OverUnder", //ka8e diada na mpenei ne 3exoristo map. dld put(OverUnder1.5[1.62.3]) put(OverUnder2.5[1.81.8]):"
	HTOverUnder: "HTOverUnder", //[overunder]:"
	BTTS : "BTTS", //[yesno]:" 
	HTBTTS:"HTBTTS",
	//DrawNoBet //epidi epistrefei 0 sto draw nmz enen kalo g sure bets:"
	TotalCards:"TotalCards",
	FirstTeamCard:"FirstTeamCard",
	HomeTotalCards:"HomeTotalCards",
	AwayTotalCards:"AwayTotalCards",
	CornersThreeWay:"CornersThreeWay",
	CornersTwoWay:"CornersTwoWay",
	HTCornersThreeWay:"HTCornersThreeWay",
	HTCornersTwoWay:"HTCornersTwoWay",
	HomeCorners:"HomeCorners",
	AwayCorners:"AwayCorners",
	FirstTeamToScore:"FirstTeamToScore",
	//WayOfScore() en 8imoume posa ishe:" 
	HomeToKeepClean:"HomeToKeepClean",
	AwayToKeepClean:"AwayToKeepClean",
	HomeOverUnder:"HomeOverUnder",
	AwayOverUnder:"AwayOverUnder",
	PenaltyInMatch:"PenaltyInMatch",
	RedCardInMatch:"RedCardInMatch",
	MatchShotsOnTarget : "MatchShotsOnTarget", //ena prepei nan opws to overunder:"
	MatchShots:"MatchShots",
	MatchTackles:"MatchTackles",
	HomeShotsOnTarget:"HomeShotsOnTarget",
	AwayShotsOnTarget:"AwayShotsOnTarget",
	HomeShots:"HomeShots",
	AwayShots:"AwayShots",
	HomeTackles:"HomeTackles",
	AwayTackles:"AwayTackles",
	HomeOffsides:"HomeOffsides",
	AwayOffsides:"AwayOffsides"
	//mporoume j ta combinations an 8eloume p.x FT1 & Over 2.5
  }

//string comparison
function getPrefixStrength(a,b){
	var i = 0;
	for(; i < Math.min(4,Math.min(a.length,b.length)); i++){
		if(a[i]!=b[i]) break;
	}
	return i;
}
function jaro(a,b){
	var m = getMatchingCharacters(a,b);
	var t = getTransposition(a,b);
	var s1 = a.length;
	var s2 = b.length;
	return (1.0/3.0) * ((m/s1)+(m/s2)+((m-t)/m));
}
function getMatchingCharacters(a,b){
	var count = 0;
	while(a.length > 0){
    	var toRemove = a[0];
		if(b.includes(toRemove)){
			count++;
			b = b.replace(toRemove,"");
        }
		a = a.replace(toRemove,"");
	}
	return count;
}
function getTransposition(a,b){
	var count = 0;
	var minLength = Math.min(a.length,b.length);
	var maxLength = Math.max(a.length,b.length);
	for(var i = 0 ; i < minLength ; i++){
		if(a[i] != b[i])count++;
	}
	return count + (maxLength - minLength);
}
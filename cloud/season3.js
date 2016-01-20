// var tagsString = startup.get("tags");
// var tags = Array();
// if(tagsString != null) {
//   var tags = utilities.separateTags(tagsString);
// }
// s3Startup.set("tags", tags);
var utilities = require('cloud/utilityFunctions.js');

Parse.Cloud.job("importSeason3", function(request, status) {

  console.log("started importSeason3");
  var RawData = Parse.Object.extend("RawData");
  var query = new Parse.Query(RawData);
  query.limit(1000);

  query.find().then(function(results) {

    var allStartups = Array();

    //iterate through all startups
    for(var i=0, len=results.length; i < len; i++){

      var startup = results[i];
      var Season3 = Parse.Object.extend("Season3");
      var s3Startup = new Season3();

//BASIC INFO
      var name = startup.get("Name");
      var status = startup.get("Status");
      var dateCreated = startup.get("DateCreated");
      var dateFinalized = startup.get("DateFinalized");
      var city = startup.get("City");
      var country = startup.get("Country");
      var tagline = startup.get("BriefDescription");

      s3Startup.set("name", name);
      s3Startup.set("status", status);
      s3Startup.set("dateCreatedApplication", utilities.parseDate(dateCreated));
      s3Startup.set("dateFinalizedApplication", utilities.parseDate(dateFinalized));
      s3Startup.set("city", city);
      s3Startup.set("country", country);
      s3Startup.set("tagline", tagline);


      // if (dateFinalized && dateFinalized != " "){
      //   var dateFinalizedApplication = new Date(startup.get("DateFinalized"));
      //   s3Startup.set("dateFinalizedApplication", dateFinalizedApplication);
      // }


//SKILLS AND MARKETS
      var skillsMarketsString = startup.get("SkillsMarkets");
      s3Startup.set("skillsAndMarkets", utilities.separateTags(skillsMarketsString));

//LINKS
      var linksString = startup.get("Links");
      s3Startup.set("links", utilities.separateTags(linksString));

//VIDEOS

      var videosString = startup.get("Videos");
      s3Startup.set("videos", utilities.separateTags(videosString));


//
      var isIncorporated = startup.get("isIncorporated");
      var dateCompanyStarted = startup.get("DateCompanyStarted");
    //  var  = startup.get("");

      s3Startup.set("isIncorporated", isIncorporated);
      s3Startup.set("dateCompanyStarted", utilities.parseDate(dateCompanyStarted));
  //    s3Startup.set("", );
    //  s3Startup.set("", );


//EVALUTOR NOTES AND SCORES
      var allEvaluators = Array();
      var allRatings = Array();
      var allComments = Array();
      for(var j=0, len=results.length; j < len; j++){
        var evaluator = startup.get("Evaluator" + j + "Name");
        var comments = startup.get("Evaluator" + j + "Comments");
        var rating = parseInt(startup.get("Evaluator" + j + "Rating"));
        if (rating) {
          allRatings.push(parseInt(rating));
          allEvaluators.push(evaluator);
        }
        if (comments != " " && comments != null) {
          allComments.push(comments);
          //console.log("comment: " + comments);
        }
      }


      s3Startup.set("allEvaluators", allEvaluators);
      s3Startup.set("allRatings", allRatings);
      s3Startup.set("allComments", allComments);
      allStartups.push(s3Startup);

    }
    console.log(allStartups);
    return Parse.Object.saveAll(allStartups);
  }).then(function() {
      console.log("calling success");
      status.success("importSeason3 success");
  }, function(error) {
      status.error("importSeason3 error : " + error);
  });
});

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

      var stringColumns = ["name", "city", "country", "tagline", "isIncorporated",
      "longDescription", "amountRaisingCurrency", "valuationCurrency", "status",
      "website", "teamVideo", "tweetStyleDescription", "productDescription",
      "monetisation", "competitors", "productStage", "possiblePivot",
      "problemDescription", "timeOnProject", "clientsOrCustomersNumber",
      "oneMonthGoal", "businessType", "howFoundersMet", "howChangeWorld",
      "howChangeWorldSecond", "lackingCompetencies", "interestingProjectOrHack",
      "howDiscoveredNUMA", "runway", ];
      for (var x = 0; x < stringColumns.length; x++) {
        var columnName = stringColumns[x];
        var columnValue = startup.get(columnName);
        if(columnValue && columnValue != " "){
          s3Startup.set(columnName, columnValue);
        }
      }


      var dateColumns = ["dateCreated", "dateFinalized", "dateCompanyStarted"];
      for (var x = 0; x <dateColumns.length; x++){
        var columnName = dateColumns[x];
        var columnValue = startup.get(columnName);
        s3Startup.set(columnName, utilities.parseDate(columnValue));
      }

      var arrayColumns = ["skillsOrMarkets", "links", "videos", "foundersNames",
      "foundersEmails", "foundersPhones", "foundersSkills", "foundersLanguages",
      "foundersNationalities", "foundersCountriesLived", "foundersFullTime",
      "foundersStartupExperience", "foundersTechExperience",
      "foundersEquityDistribution", "foundersRoleOnTeam",
      "foundersFiveWordsDescription", "foundersAge", "foundersWhyYou",
      "markets", "tech"];

      for (var x = 0; x < arrayColumns.length; x++) {
        var columnName = arrayColumns[x];
        var columnValue = startup.get(columnName);
        s3Startup.set(columnName, utilities.separateTags(columnValue));
      }

      var booleanColumns = ["isRaising", "hasBusinessPlan", "didWorkTogether",
      "foundersNotMetInPerson"];
      for (var x = 0; x < booleanColumns.length; x++){
        var columnName = booleanColumns[x];
        var columnValue = startup.get(columnName);
        if(columnValue && columnValue != " "){
          if(columnValue.indexOf("Yes") > -1) { //string contains 'YES'
            s3Startup.set(columnName, true);
          } else {
            s3Startup.set(columnName, false);
          }
        }
      }

      var integerColumns = ["amountRaising", "valuation", "numberOfFounders"];
      for (var x; x < integerColumns.length; x++) {
        var columnName = integerColumns[x];
        var columnValue = startup.get(columnName);
        s3Startup.set(columnName, parseInt(columnValue));
      }

//TEAM MEMBERS

      var allMembers = Array();

      var memberArrays = {
        //TEXT
        "allMemberCities" : Array(),
        "allMemberCountries" : Array(),
        "allMemberBriefDesc" : Array(),
        "allMemberEmail" : Array(),
        "allMemberRole" : Array(),
        "allMemberSkypeID" : Array(),
        "allMemberMobile" : Array(),
        "allMemberAmazingThing" : Array(),
        //ARRAY
        "allMemberSkillsOrMarkets" : Array(),
        "allMemberLinks" : Array()
      }

      var memberTextFields = {
        "allMemberCities" : "City",
        "allMemberCountries" : "Country",
        "allMemberBriefDesc" : "BriefDescription",
        "allMemberEmail" : "Email",
        "allMemberRole" : "Role",
        "allMemberSkypeID" : "SkypeID",
        "allMemberMobile" : "Mobilenumber",
        "allMemberAmazingThing" : "Tellussomethingamazingthatyouhavebuilt"
      }

      var memberArrayFields = {
        "allMemberSkillsOrMarkets" : "SkillsorMarkets",
        "allMemberLinks" : "Links"
      }

      var maxPeople = 6;
      for(var j=0; j < maxPeople; j++){
        var member = startup.get("Person" + j);
        if (member && member != " ") {
          allMembers.push(member);
          //Text fields
          for (var key in memberTextFields) {
            if (memberTextFields.hasOwnProperty(key)) {
              var columnValue = startup.get("Person" + j + memberTextFields[key]);
              memberArrays[key].push(columnValue);
            }
          }
          //Arrays
          for (var key in memberArrayFields) {
            if (memberArrayFields.hasOwnProperty(key)) {
              var columnValue = startup.get("Person" + j + memberArrayFields[key]);
              memberArrays[key].push(utilities.separateTags(columnValue));
            }
          }
        }
      }

      s3Startup.set("allMembers", allMembers);
      for (var key in memberArrays) {
        if (memberArrays.hasOwnProperty(key)) {
          s3Startup.set(key, memberArrays[key]);
        }
      }

//EVALUATORS

      var allEvaluatorRatings = Array();

      var evaluatorArrays = {
        //TEXT
        "allEvaluatorNames" : Array(),
        "allEvaluatorNotes" : Array(),
      }

      var evaluatorTextFields = {
        "allEvaluatorNames" : "Name",
        "allEvaluatorNotes" : "Comments"
      }


      var maxEvaluators = 38;
      for(var j=0; j < maxEvaluators; j++){
        var rating = parseInt(startup.get("Evaluator" + j + "Rating"));
        if (rating) {
          allEvaluatorRatings.push(rating);
          //Text fields
          for (var key in evaluatorTextFields) {
            if (evaluatorTextFields.hasOwnProperty(key)) {
              var columnValue = startup.get("Evaluator" + j + evaluatorTextFields[key]);
              evaluatorArrays[key].push(columnValue);
            }
          }
        }
      }

      s3Startup.set("allEvaluatorRatings", allEvaluatorRatings);
      for (var key in evaluatorArrays) {
        if (evaluatorArrays.hasOwnProperty(key)) {
          s3Startup.set(key, evaluatorArrays[key]);
        }
      }

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

// Parse.Cloud.job("importSeason3", function(request, status) {
//
//   console.log("started importSeason3");
//   var RawData = Parse.Object.extend("RawData");
//   var query = new Parse.Query(RawData);
//   query.limit(1000);
//
//   query.find().then(function(results) {
//
//     var allStartups = Array();
//
//     //iterate through all startups
//     for(var i=0, len=results.length; i < len; i++){
//
//       var startup = results[i];
//       var Season3 = Parse.Object.extend("Season3");
//       var s3Startup = new Season3();
//
// //BASIC INFO
//       var name = startup.get("Name");
//       var status = startup.get("Status");
//       var dateCreated = startup.get("DateCreated");
//       var dateFinalized = startup.get("DateFinalized");
//       var city = startup.get("City");
//       var country = startup.get("Country");
//       var tagline = startup.get("BriefDescription");
//
//       s3Startup.set("name", name);
//       s3Startup.set("status", status);
//       s3Startup.set("dateCreatedApplication", utilities.parseDate(dateCreated));
//       s3Startup.set("dateFinalizedApplication", utilities.parseDate(dateFinalized));
//       s3Startup.set("city", city);
//       s3Startup.set("country", country);
//       s3Startup.set("tagline", tagline);
//
//
//       // if (dateFinalized && dateFinalized != " "){
//       //   var dateFinalizedApplication = new Date(startup.get("DateFinalized"));
//       //   s3Startup.set("dateFinalizedApplication", dateFinalizedApplication);
//       // }
//
//
// //SKILLS AND MARKETS
//       var skillsMarketsString = startup.get("SkillsMarkets");
//       s3Startup.set("skillsAndMarkets", utilities.separateTags(skillsMarketsString));
//
// //LINKS
//       var linksString = startup.get("Links");
//       s3Startup.set("links", utilities.separateTags(linksString));
//
// //VIDEOS
//
//       var videosString = startup.get("Videos");
//       s3Startup.set("videos", utilities.separateTags(videosString));
//
//
// //
//       var isIncorporated = startup.get("isIncorporated");
//       var dateCompanyStarted = startup.get("DateCompanyStarted");
//       var longDescription = startup.get("DetailDescription");
//       var amountRaising = startup.get("AmountRaising");
//       var amountRaisingCurrency = startup.get("AmountCurrency");
//       var valuation = startup.get("Valuation");
//       var valuationCurrency = startup.get("ValuationCurrency");
//       // var = startup.get("");
//       // var = startup.get("");
//       // var = startup.get("");
//
//
//
//       s3Startup.set("isIncorporated", isIncorporated);
//       s3Startup.set("dateCompanyStarted", utilities.parseDate(dateCompanyStarted));
//       s3Startup.set("longDescription", longDescription);
//       s3Startup.set("amountRaising", parseInt(amountRaising));
//       s3Startup.set("amountRaisingCurrency", amountRaisingCurrency);
//       s3Startup.set("valuation", parseInt(valuation));
//       s3Startup.set("valuationCurrency", valuationCurrency);
//       // s3Startup.set("", );
//       // s3Startup.set("", );
//       // s3Startup.set("", );
//       // s3Startup.set("", );
//
//
//       var isRaising = startup.get("isRaising");
//       if(isRaising == "Yes") {
//         s3Startup.set("isRaising", true);
//       } else {
//         s3Startup.set("isRaising", false);
//       }
//
// //TEAM MEMBERS
//       var allMembers = Array();
//       var allMemberCities = Array();
//       var allMemberCountries = Array();
//       var allMemberBriefDesc = Array();
//       var allMemberSkillsMarkets = Array();
//       var allMemberLinks = Array();
//       var allMemberEmail = Array();
//       var allMemberRole = Array();
//       var allMemberSkypeID = Array();
//       var allMemberMobile = Array();
//       var allMemberAmazingThing = Array();
//
//       var allComments = Array();
//       for(var j=0, len=results.length; j < len; j++){
//         var member = startup.get("Person" + j);
//         var memberCity = startup.get("Person" + j + "City");
//         var memberCountry = startup.get("Person" + j + "Country");
//         var memberBriefDesc = startup.get("Person" + j + "BriefDescription");
//         var memberSkillsMarkets = startup.get("Person" + j + "SkillsorMarkets");
//         var memberLinks = startup.get("Person" + j + "Links");
//         var memberEmail = startup.get("Person" + j + "Email");
//         var memberRole = startup.get("Person" + j + "Role");
//         var memberSkypeID = startup.get("Person" + j + "SkypeID");
//         var memberMobile = startup.get("Person" + j + "Mobilenumber");
//         var memberAmazingThing = startup.get("Person" + j + "Tellussomethingamazingthatyouhavebuilt");
//
//         if (member && member != " ") {
//           allMembers.push(member);
//           allMemberCities.push(memberCity);
//           allMemberCountries.push(memberCountry);
//           allMemberBriefDesc.push(memberBriefDesc);
//           allMemberSkillsMarkets.push(memberSkillsMarkets);
//           allMemberLinks.push(utilities.separateTags(memberLinks));
//           allMemberEmail.push(memberEmail);
//           allMemberRole.push(memberRole);
//           allMemberSkypeID.push(memberSkypeID);
//           allMemberMobile.push(memberMobile);
//           allMemberAmazingThing.push(memberAmazingThing);
//         }
//       }
//
//       s3Startup.set("allMembers", allMembers);
//       s3Startup.set("allMemberCities", allMemberCities);
//       s3Startup.set("allMemberCountries", allMemberCountries);
//       s3Startup.set("allMemberBriefDesc", allMemberBriefDesc);
//       s3Startup.set("allMemberSkillsMarkets", allMemberSkillsMarkets);
//       s3Startup.set("allMemberLinks", allMemberLinks);
//       s3Startup.set("allMemberEmail", allMemberEmail);
//       s3Startup.set("allMemberRole", allMemberRole);
//       s3Startup.set("allMemberSkypeID", allMemberSkypeID);
//       s3Startup.set("allMemberMobile", allMemberMobile);
//       s3Startup.set("allMemberAmazingThing", allMemberAmazingThing);
//
//
// //EVALUTOR NOTES AND SCORES
//       var allEvaluators = Array();
//       var allRatings = Array();
//       var allComments = Array();
//       for(var j=0, len=results.length; j < len; j++){
//         var evaluator = startup.get("Evaluator" + j + "Name");
//         var comments = startup.get("Evaluator" + j + "Comments");
//         var rating = parseInt(startup.get("Evaluator" + j + "Rating"));
//         if (rating) {
//           allRatings.push(parseInt(rating));
//           allEvaluators.push(evaluator);
//           allComments.push(comments);
//         }
//       }
//
//       s3Startup.set("allEvaluators", allEvaluators);
//       s3Startup.set("allRatings", allRatings);
//       s3Startup.set("allComments", allComments);
//       allStartups.push(s3Startup);
//
//     }
//     console.log(allStartups);
//     return Parse.Object.saveAll(allStartups);
//   }).then(function() {
//       console.log("calling success");
//       status.success("importSeason3 success");
//   }, function(error) {
//       status.error("importSeason3 error : " + error);
//   });
// });

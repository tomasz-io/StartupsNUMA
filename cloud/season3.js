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
      "oneMonthGoal", "businessType", "howFoundersMet", "howChangeWorldFirst",
      "howChangeWorldSecond", "lackingCompetencies", "interestingProjectOrHack",
      "howDiscoveredNUMA", "runway", "ideaValidation", "earlyAdopters",
      "nonFounderEquityRole", "usersNumber", "clientsNumber", "threeMonthGoal",
      "needFundsAmount", "raisedFundsAmount", "whyYourStartup", "whyNUMA"];
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
      "foundersTimeAcquainted", "foundersEquityDistribution",
      "foundersRoleOnTeam", "foundersFiveWordsDescription", "foundersAge",
      "foundersWhyYou", "markets", "tech", "industrySector"];

      for (var x = 0; x < arrayColumns.length; x++) {
        var columnName = arrayColumns[x];
        var columnValue = startup.get(columnName);
        var array = utilities.separateTags(columnValue);
        if(array){
          array = utilities.trimArrayStrings(array);
          s3Startup.set(columnName, array);
        }

      }

      var booleanColumns = ["isRaising", "hasBusinessPlan", "didWorkTogether",
      "foundersNotMetInPerson", "nonFounderEquity", "needFunds", "raisedFunds"];
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

      var floatColumns = ["averageRating"];
      for (var x; x < floatColumns.length; x++) {
        var columnName = floatColumns[x];
        var columnValue = startup.get(columnName);
        s3Startup.set(columnName, parseFloat(columnValue));
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

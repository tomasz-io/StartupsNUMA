var utilities = require('cloud/utilityFunctions.js');


Parse.Cloud.job("importSeason6", function(request, status) {

  console.log("started importSeason6");
  var RawData = Parse.Object.extend("RawData");
  var query = new Parse.Query(RawData);
  query.limit(1000);

  query.find().then(function(results) {

    var allStartups = Array();

    //iterate through all startups
    console.log("results: " + results.length);
    for(var i=0, len=results.length; i < len; i++){

      var startup = results[i];
      var Season6 = Parse.Object.extend("Season6");
      var s6Startup = new Season6();

//BASIC INFO




      var stringColumns = [ "name", "city", "country", "tagline",
      "longDescription", "whatsDifferent", "howCustomersInteract",
      "fundingStage", "fourMonthGoal",
      "amountRaisingCurrency", "valuationCurrency", "status",
      "foundersTimeAcquainted", "howFoundersMet", "howChangeWorld",
      "lackingCompetencies", "foundersPreviousProject", "runway", "website",
      "teamVideo", "teamVideo2", "tweetStyleDescription", "monetisation", "competitors",
      "ideaValidation", "earlyAdopters", "productStage", "possiblePivot",
      "problemDescription", "alreadyIncorporated", "nonFounderEquityRole",
      "timeOnProject", "raisedFunds", "businessType", "whyYourStartup",
      "whyNUMA", "metrics", "sixMonthGoal", "howDiscoveredNUMA",
      "foundersRoleOnTeam", "foundersEquityDistribution",
      "foundersRoleJustification", "startupRadicalChange", "mvpDevelopmentTime",
      "technologyDetails", "competitiveAdvantage", "basedIn", "skypeID",
      "email", "phoneNumber", "fundmeProfile"];

      for (var x = 0; x < stringColumns.length; x++) {
        var columnName = stringColumns[x];
        var columnValue = startup.get(columnName);
        if(columnValue && columnValue != " "){
          s6Startup.set(columnName, columnValue);
        }
      }


      var dateColumns = ["dateCreated", "dateFinalized", "dateCompanyStarted"];
      for (var x = 0; x <dateColumns.length; x++){
        var columnName = dateColumns[x];
        var columnValue = startup.get(columnName);
        s6Startup.set(columnName, utilities.parseDate(columnValue));
      }

      var arrayColumns = ["skillsOrMarkets", "links", "videos", "foundersNames",
      "foundersAge", "foundersGenders", "foundersEmails", "foundersPhones", "foundersSkills",
      "foundersNationalities", "foundersLanguages", "foundersDiplomas", "foundersCountriesLived",
      "foundersStartupExperience", "foundersTechExperience", "foundersWhyYou",
      "markets", "tech", "industrySector", "industry", "interestingProjectOrHack", "tags"];

      for (var x = 0; x < arrayColumns.length; x++) {
        var columnName = arrayColumns[x];
        var columnValue = startup.get(columnName);
        var array = utilities.separateTags(columnValue);
        if(array){
          array = utilities.trimArrayStrings(array);
          s6Startup.set(columnName, array);
        }
      }

      var booleanColumns = ["isRaising", "isIncorporated"
      ];
      for (var x = 0; x < booleanColumns.length; x++){
        var columnName = booleanColumns[x];
        var columnValue = startup.get(columnName);
        if(columnValue && columnValue != " "){
          if(columnValue.indexOf("Yes") > -1) { //string contains 'YES'
            s6Startup.set(columnName, true);
          } else {
            s6Startup.set(columnName, false);
          }
        }
      }

      var integerColumns = ["amountRaising", "valuation", "numberOfFounders"];
      for (var x; x < integerColumns.length; x++) {
        var columnName = integerColumns[x];
        var columnValue = startup.get(columnName);
        s6Startup.set(columnName, parseInt(columnValue));
      }

      var floatColumns = ["averageRating"];
      for (var x; x < floatColumns.length; x++) {
        var columnName = floatColumns[x];
        var columnValue = startup.get(columnName);
        s6Startup.set(columnName, parseFloat(columnValue));
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
        "allRatingsGeneralFeeling" : Array(),
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

      var maxPeople = 7;
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

      s6Startup.set("allMembers", allMembers);
      for (var key in memberArrays) {
        if (memberArrays.hasOwnProperty(key)) {
          s6Startup.set(key, memberArrays[key]);
        }
      }

//EVALUATORS

      var allEvaluatorRatings = Array();

      var evaluatorArrays = {
        //Text
        "allEvaluatorNames" : Array(),
        "allEvaluatorNotes" : Array(),
        //Integer
      //"allRatingsTech" : Array(),
      //"allRatingsDetermination" : Array(),
      //"allRatingsSocialProof" : Array(),
      //"allRatingsTraction" : Array(),
      //"allRatingsProduct" : Array(),
        "allRatingsTeam" : Array(),
        "allRatingsInnovation" : Array(),
        "allRatingBusinnessOpportunity" : Array(),
        "allRatingsCompetitiveAdvantage" : Array(),
        "allRatingsGeneralFeeling" : Array(),
        //Float
        "allRatingsOverall" : Array()
      }

      var evaluatorTextFields = {
        "allEvaluatorNames" : "Name",
        "allEvaluatorNotes" : "Comments",
      }

      var evaluatorIntegerFields = {
        "allRatingsTeam" : "Teamrating",
        "allRatingsInnovation" : "LevelofInnovationrating",
        "allRatingsGeneralFeeling" : "GeneralFeelingrating",
        "allRatingBusinnessOpportunity" : "BusinessOpportunityrating",
        "allRatingsCompetitiveAdvantage" : "CompetAdvantagerating"
        //"allRatingsTech" : "Technologyrating",
        //"allRatingsTraction" : "Abilitytogaintractionrating",
        //"allRatingsDetermination" : "Teamrating",

      }

      var evaluatorFloatFields = {
        "allRatingsOverall" : "Rating"
      }

      var maxEvaluators = 81;
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

      for(var j=0; j < maxEvaluators; j++){
        var rating = parseInt(startup.get("Evaluator" + j + "Rating"));
        if (rating) {
          for (var key in evaluatorIntegerFields) {
            if (evaluatorIntegerFields.hasOwnProperty(key)) {
              var columnValue = startup.get("Evaluator" + j + evaluatorIntegerFields[key]);
              evaluatorArrays[key].push(parseInt(columnValue));
            }
          }
        }
      }

      for(var j=0; j < maxEvaluators; j++){
        var rating = parseInt(startup.get("Evaluator" + j + "Rating"));
        if (rating) {
          for (var key in evaluatorFloatFields) {
            if (evaluatorFloatFields.hasOwnProperty(key)) {
              var columnValue = startup.get("Evaluator" + j + evaluatorFloatFields[key]);
              evaluatorArrays[key].push(parseFloat(columnValue));
            }
          }
        }
      }

      s6Startup.set("allEvaluatorRatings", allEvaluatorRatings);
      for (var key in evaluatorArrays) {
        if (evaluatorArrays.hasOwnProperty(key)) {
          s6Startup.set(key, evaluatorArrays[key]);
        }
      }

      allStartups.push(s6Startup);
    }
    console.log("all startups processed: " + allStartups.length);
    return Parse.Object.saveAll(allStartups);
  }).then(function() {
      console.log("calling success");
      status.success("importSeason6 success");
  }, function(error) {
      status.error("importSeason6 error : " + error);
  });
});

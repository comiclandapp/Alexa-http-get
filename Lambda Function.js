/**
 * HTTP GET example
 * 
 * Additional Notes
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 */

// global constants
var host = 'YOUR-SERVER';
var port = YOUR-PORT;
var pass = 'pass';
var delay = 1;
var repeat = 1;

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        //if (event.session.application.applicationId !== $post->session->application->applicationId) {
        //     context.fail("Invalid Application ID");
        //}

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
                + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    
    console.log("onLaunch requestId=" + launchRequest.requestId
                + ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    
    // default is power toggle
    toggleArcamPower(callback);
}

function toggleArcamPower(callback) {
    
    var cardTitle = "Toggle Arcam Power";
    var IRCode = "40C:RC5:12"; // power toggle
    sendIRCode(cardTitle, IRCode, callback);
}

function raiseArcamVolume(callback) {

    var cardTitle = "Raise Arcam Volume";
    var IRCode = "410:RC5:12"; // raise volume
    repeat = 5;
    sendIRCode(cardTitle, IRCode, callback);
}

function lowerArcamVolume(callback) {
    
    var cardTitle = "Lower Arcam Volume";
    var IRCode = "411:RC5:12"; // lower volume
    repeat = 5;
    sendIRCode(cardTitle, IRCode, callback);
}

function muteArcam(callback) {
    
    var cardTitle = "Mute/Unmute Arcam";
    var IRCode = "40D:RC5:12"; // mute/unmute
    sendIRCode(cardTitle, IRCode, callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    
    console.log("onIntent requestId=" + intentRequest.requestId
                + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers

    if (intentName == "HelpIntent") {
        // noop
    } else if (intentName == 'PowerIntent') {
        toggleArcamPower(callback);
    } else if (intentName == 'RaiseVolumeIntent') {
        raiseArcamVolume(callback);
    } else if (intentName == 'LowerVolumeIntent') {
        lowerArcamVolume(callback);
    } else if (intentName == 'MuteIntent') {
        muteArcam(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
                + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function sendIRCode(cardTitle, IRCode, callback) {
    
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var repromptText = null;

    sendCodeToArcam(IRCode, function (response) {

        //var speechOutput = "Response status is " + response;
        var speechOutput = "OK";
        var shouldEndSession = true;

        callback(sessionAttributes,
                 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
}

function sendCodeToArcam(IRCode, response) {

    // http://YOUR-SERVER:YOUR-PORT/msg?code=40C:RC5:12&pass=pass

    var http = require('http');
    var options = {
        host: host,
        port: port,
        path: '/msg?code=' + IRCode + '&delay=' + delay + '&repeat=' + repeat + '&pass=' + pass,
        agent: false
    };

    http.get(options, function (res) {
        console.log("Response: " + res.statusCode);
        response(res.statusCode);
    }).on('error', function (e) {
        console.log("Error message: " + e.message);
    });
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            // title: "SessionSpeechlet - " + title,
            // content: "SessionSpeechlet - " + output
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}

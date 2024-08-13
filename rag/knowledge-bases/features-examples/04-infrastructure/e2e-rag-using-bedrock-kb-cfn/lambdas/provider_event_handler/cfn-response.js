"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Retry=exports.safeHandler=exports.includeStackTraces=exports.submitResponse=exports.MISSING_PHYSICAL_ID_MARKER=exports.CREATE_FAILED_PHYSICAL_ID_MARKER=void 0;const url=require("url"),outbound_1=require("./outbound"),util_1=require("./util");exports.CREATE_FAILED_PHYSICAL_ID_MARKER="AWSCDK::CustomResourceProviderFramework::CREATE_FAILED",exports.MISSING_PHYSICAL_ID_MARKER="AWSCDK::CustomResourceProviderFramework::MISSING_PHYSICAL_ID";async function submitResponse(status,event,options={}){const json={Status:status,Reason:options.reason||status,StackId:event.StackId,RequestId:event.RequestId,PhysicalResourceId:event.PhysicalResourceId||exports.MISSING_PHYSICAL_ID_MARKER,LogicalResourceId:event.LogicalResourceId,NoEcho:options.noEcho,Data:event.Data},responseBody=JSON.stringify(json),parsedUrl=url.parse(event.ResponseURL),loggingSafeUrl=`${parsedUrl.protocol}//${parsedUrl.hostname}/${parsedUrl.pathname}?***`;(0,util_1.log)("submit response to cloudformation",loggingSafeUrl,json);const retryOptions={attempts:5,sleep:1e3};await(0,util_1.withRetries)(retryOptions,outbound_1.httpRequest)({hostname:parsedUrl.hostname,path:parsedUrl.path,method:"PUT",headers:{"content-type":"","content-length":Buffer.byteLength(responseBody,"utf8")}},responseBody)}exports.submitResponse=submitResponse,exports.includeStackTraces=!0;function safeHandler(block){return async event=>{if(event.RequestType==="Delete"&&event.PhysicalResourceId===exports.CREATE_FAILED_PHYSICAL_ID_MARKER){(0,util_1.log)("ignoring DELETE event caused by a failed CREATE event"),await submitResponse("SUCCESS",event);return}try{await block(event)}catch(e){if(e instanceof Retry)throw(0,util_1.log)("retry requested by handler"),e;event.PhysicalResourceId||(event.RequestType==="Create"?((0,util_1.log)("CREATE failed, responding with a marker physical resource id so that the subsequent DELETE will be ignored"),event.PhysicalResourceId=exports.CREATE_FAILED_PHYSICAL_ID_MARKER):(0,util_1.log)(`ERROR: Malformed event. "PhysicalResourceId" is required: ${JSON.stringify({...event,ResponseURL:"..."})}`)),await submitResponse("FAILED",event,{reason:exports.includeStackTraces?e.stack:e.message})}}}exports.safeHandler=safeHandler;class Retry extends Error{}exports.Retry=Retry;

// paceOptions = {
//   document: false, // Checks for the existance of specific elements on the page
//   eventLag: false, // Checks the document readyState
//   startOnPageLoad: false
// };

function urlArg(key){
  var arg=null;
  var data=location.search.split("?");
  var data=data[1].split("&");
  for(i=0;i<data.length;i++){
    var arg=data[i].split("=");
    if(arg[0]==key){
      value=arg[1];
      return value;
      break;
    }
  }
}

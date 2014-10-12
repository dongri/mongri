// paceOptions = {
//   document: false, // Checks for the existance of specific elements on the page
//   eventLag: false, // Checks the document readyState
//   startOnPageLoad: false
// };

function urlArg(key){
  var arg=null;
  var data=location.search.split("?");
  if (data.length <= 1){
   return null;
  }
  var data=data[1].split("&");
  for(i=0;i<data.length;i++){
    var arg=data[i].split("=");
    if(arg[0]==key){
      value=arg[1];
      value = value.replace("+"," ");
      return value;
      break;
    }
  }
}

function dropCollection(collectionName){
  if (!confirm('Are you sure?')) {
    return false;
  }
  location.href='/collections/'+collectionName+'/drop';
}

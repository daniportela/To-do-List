
exports.getDate = function(){
  const today = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    day: "numeric",
    month: "long"
  };

  return today.toLocaleDateString("en-US", options);
}

exports.getDay = function(){
  const today = new Date();

  const options = {
    weekday: "long",
  };

  return today.toLocaleDateString("en-US", options);
}

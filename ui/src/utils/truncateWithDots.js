const truncateWithDots = (
  str,
  firstCharCount = 6,
  endCharCount = 4,
  dotCount = 4
) => {
  var convertedStr = "";
  convertedStr += str.substring(0, firstCharCount);
  convertedStr += ".".repeat(dotCount);
  convertedStr += str.substring(str.length - endCharCount, str.length);
  return convertedStr;
};

export default truncateWithDots;
